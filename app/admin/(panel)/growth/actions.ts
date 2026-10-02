"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminApi, adminToken } from "@/lib/admin";
import {
  channelStatuses,
  channels,
  draftSchema,
  opportunitySchema,
  opportunityStatuses,
  researchRequestSchema,
  supplyProfileSchema,
  type GrowthActionResult,
} from "@/lib/growth";

export type GrowthFormState =
  (GrowthActionResult & { message?: string }) | null;
export type GrowthOperation =
  | "saveProfile"
  | "saveOpportunity"
  | "updateOpportunity"
  | "saveChannel"
  | "saveDraft"
  | "deleteDraft"
  | "startResearch"
  | "cancelResearch"
  | "testProvider"
  | "apolloSearch"
  | "apolloEnrich";

const idSchema = z.string().trim().min(1).max(100);
const text = (form: FormData, name: string) => String(form.get(name) ?? "");
const fields = (form: FormData, names: string[]) =>
  Object.fromEntries(names.map((name) => [name, text(form, name)]));

function parsePayload(operation: GrowthOperation, form: FormData) {
  switch (operation) {
    case "saveProfile":
      return supplyProfileSchema.parse(
        fields(form, [
          "origin",
          "products",
          "capacity",
          "delivery",
          "certifications",
          "terms",
        ]),
      );
    case "saveOpportunity":
      return opportunitySchema.parse(
        fields(form, [
          "kind",
          "name",
          "group",
          "location",
          "website",
          "contact",
          "role",
          "summary",
          "productFit",
          "sourceUrl",
          "sourceTitle",
          "nextStep",
          "tenderReference",
          "deadline",
          "requirements",
        ]),
      );
    case "updateOpportunity":
      return z
        .object({
          id: idSchema,
          status: z.enum(opportunityStatuses),
          notes: z.string().trim().max(2000),
        })
        .parse(fields(form, ["id", "status", "notes"]));
    case "saveChannel":
      return z
        .object({
          id: z
            .string()
            .refine((id) => channels.some((channel) => channel.id === id)),
          status: z.enum(channelStatuses),
          notes: z.string().trim().max(1500),
        })
        .parse(fields(form, ["id", "status", "notes"]));
    case "saveDraft": {
      const draft = draftSchema.parse(
        fields(form, ["title", "body", "opportunityId"]),
      );
      const id = text(form, "id");
      return id ? { ...draft, id: idSchema.parse(id) } : draft;
    }
    case "deleteDraft":
    case "cancelResearch":
      return { id: idSchema.parse(text(form, "id")) };
    case "startResearch":
      return researchRequestSchema.parse({
        kind: text(form, "kind"),
        groups: form.getAll("groups"),
        region: text(form, "region"),
        products: text(form, "products"),
        limit: Number(text(form, "limit")),
        useExa: form.get("useExa") === "on",
      });
    case "testProvider":
      return {
        id: z.enum(["openai", "exa", "apollo"]).parse(text(form, "id")),
      };
    case "apolloSearch":
      return z
        .object({
          organization: z.string().trim().min(2).max(180),
          domain: z.string().trim().min(3).max(200),
        })
        .parse(fields(form, ["organization", "domain"]));
    case "apolloEnrich":
      if (form.get("confirm") !== "on")
        throw new Error(
          "Confirm the selected contact and possible credit charge first.",
        );
      return { personId: idSchema.parse(text(form, "personId")) };
  }
}

const messages: Record<GrowthOperation, string> = {
  saveProfile: "Supply profile saved.",
  saveOpportunity: "Opportunity saved.",
  updateOpportunity: "Review saved.",
  saveChannel: "Channel notes saved. This does not test API access.",
  saveDraft: "Draft saved. Nothing was sent.",
  deleteDraft: "Draft deleted.",
  startResearch: "Research queued.",
  cancelResearch:
    "Cancellation requested. Calls already in progress may incur a charge.",
  testProvider: "Access test finished. See the provider result.",
  apolloSearch: "Search finished. Review each company match.",
  apolloEnrich:
    "Contact check finished. Contact details do not show consent to marketing.",
};

export async function growthAction(
  operation: GrowthOperation,
  _previous: GrowthFormState,
  form: FormData,
): Promise<GrowthFormState> {
  const token = await adminToken();
  if (!token) redirect("/admin/login");
  if (!Object.hasOwn(messages, operation))
    return { ok: false, error: "Choose a valid Growth action." };
  let payload;
  try {
    payload = parsePayload(operation, form);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof z.ZodError
          ? error.issues
              .map((issue) => `${issue.path.join(" ")}: ${issue.message}`)
              .join(" ")
          : error instanceof Error
            ? error.message
            : "Check the form fields.",
    };
  }
  const response = await adminApi("growth", {
    token,
    operation,
    payload,
  }).catch(() => null);
  if (response?.status === 401) redirect("/admin/login");
  const result = (await response
    ?.json()
    .catch(() => null)) as GrowthActionResult | null;
  // Failed provider calls can still update access state or reserve credits.
  if (response) revalidatePath("/admin/growth");
  if (!response?.ok || !result?.ok)
    return {
      ok: false,
      error:
        result?.error ||
        "The Growth service did not confirm this action. Check the saved state before trying again.",
    };
  return { ...result, message: messages[operation] };
}
