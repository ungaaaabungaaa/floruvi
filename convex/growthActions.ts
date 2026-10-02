"use node";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { z } from "zod";
import {
  research,
  testProvider,
  apolloSearch,
  apolloEnrich,
  ProviderFailure,
} from "../lib/growth-providers";
import { researchRequestSchema, type GrowthActionResult } from "../lib/growth";

export const run = internalAction({
  args: { id: v.id("growthRuns") },
  handler: async (ctx, { id }): Promise<void> => {
    const claimed = await ctx.runMutation(internal.growth.claim, { id });
    if (!claimed) return;
    try {
      const output = await research(
        researchRequestSchema.parse(claimed.request),
        claimed.profile,
        {
          checkActive: async () => {
            if (!(await ctx.runQuery(internal.growth.isActive, { id })))
              throw new Error("Research cancelled.");
          },
        },
      );
      await ctx.runMutation(internal.growth.finish, {
        id,
        result: output.result,
        costMicros: output.costMicros,
        ...(output.providerId ? { providerId: output.providerId } : {}),
      });
    } catch (error) {
      await ctx.runMutation(internal.growth.finish, {
        id,
        error:
          error instanceof ProviderFailure
            ? error.message
            : "Research stopped. Check provider access and usage before trying again.",
        ...(error instanceof ProviderFailure && !error.outcomeUnknown
          ? { costMicros: 0 }
          : {}),
      });
    }
  },
});

export const provider = internalAction({
  args: { tokenHash: v.string(), operation: v.string(), payload: v.any() },
  handler: async (
    ctx,
    { tokenHash, operation, payload },
  ): Promise<GrowthActionResult> => {
    if (!["testProvider", "apolloSearch", "apolloEnrich"].includes(operation))
      return { ok: false, error: "Unknown provider action." };
    if (
      !(await ctx.runMutation(internal.growth.authorizeProvider, {
        tokenHash,
        operation,
      }))
    )
      return { ok: false, error: "Unauthorized or rate limit reached." };
    try {
      if (operation === "testProvider") {
        const { id } = z
          .object({ id: z.enum(["openai", "exa", "apollo"]) })
          .strict()
          .parse(payload);
        const result = await testProvider(id);
        await ctx.runMutation(internal.growth.recordProvider, {
          tokenHash,
          id,
          ...result,
        });
        return {
          ok: result.ok,
          ...(!result.ok ? { error: result.message } : {}),
          data: result,
        };
      }
      if (operation === "apolloSearch") {
        const input = z
          .object({
            organization: z.string().trim().min(2).max(180),
            domain: z.string().trim().min(3).max(200),
          })
          .strict()
          .parse(payload);
        const data = await apolloSearch(input);
        if (
          !(await ctx.runMutation(internal.growth.rememberApolloSearch, {
            tokenHash,
            domain: input.domain,
            people: data.people.map(({ id, organization }) => ({
              id,
              organization,
            })),
          }))
        )
          return { ok: false, error: "Unauthorized" };
        return { ok: true, data };
      }
      const input = z
        .object({ personId: z.string().min(2).max(100) })
        .strict()
        .parse(payload);
      const reservation = await ctx.runMutation(
        internal.growth.reserveEnrichment,
        { tokenHash, ...input },
      );
      if (!reservation.ok) return reservation;
      if ("cached" in reservation)
        return { ok: true, data: reservation.cached };
      if (!("id" in reservation) || !reservation.id)
        return { ok: false, error: "Enrichment could not be reserved." };
      try {
        const data = await apolloEnrich(input);
        const matched = await ctx.runMutation(
          internal.growth.finishEnrichment,
          { id: reservation.id, data },
        );
        if (!(await ctx.runQuery(internal.growth.authorized, { tokenHash })))
          return { ok: false, error: "Unauthorized" };
        if (!matched)
          return {
            ok: false,
            error:
              "Apollo did not confirm the selected company. Contact details were withheld. Check the source and credit charge.",
          };
        return { ok: true, data };
      } catch {
        await ctx.runMutation(internal.growth.finishEnrichment, {
          id: reservation.id,
        });
        return {
          ok: false,
          error:
            "Apollo did not confirm the result. The credit reservation is kept; check provider usage before another request.",
        };
      }
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof z.ZodError
            ? (error.issues[0]?.message ?? "Check the fields.")
            : error instanceof ProviderFailure
              ? error.message
              : "The provider request failed. Check setup and try later.",
      };
    }
  },
});
