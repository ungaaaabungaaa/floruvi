import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { hasBearer, readObject, reply, sha256, text } from "./httpUtils";

export const adminGrowth = httpAction(async (ctx, request) => {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret || secret.length < 32 || !(await hasBearer(request, secret)))
    return reply(401);
  const body = await readObject(request, 20_000),
    token = text(body?.token),
    operation = text(body?.operation);
  if (!body || !/^[A-Za-z0-9_-]{43}$/.test(token)) return reply(401);
  const tokenHash = await sha256(token),
    payload = body.payload ?? {};
  if (operation === "dashboard") {
    const data = await ctx.runQuery(internal.growth.dashboard, { tokenHash });
    return data
      ? reply(200, { ok: true, data })
      : reply(401, { ok: false, error: "Unauthorized" });
  }
  if (!(await ctx.runQuery(internal.growth.authorized, { tokenHash })))
    return reply(401, { ok: false, error: "Unauthorized" });
  let result;
  if (operation === "startResearch")
    result = await ctx.runMutation(internal.growth.start, {
      tokenHash,
      payload,
    });
  else if (operation === "cancelResearch") {
    const id =
      typeof payload === "object" && payload !== null && "id" in payload
        ? text(payload.id)
        : "";
    result = await ctx.runMutation(internal.growth.cancel, { tokenHash, id });
  } else if (
    ["testProvider", "apolloSearch", "apolloEnrich"].includes(operation)
  )
    result = await ctx.runAction(internal.growthActions.provider, {
      tokenHash,
      operation,
      payload,
    });
  else
    result = await ctx.runMutation(internal.growth.update, {
      tokenHash,
      operation,
      payload,
    });
  return reply(
    result.ok ? 200 : result.error === "Unauthorized" ? 401 : 400,
    result,
  );
});

export const mcpGrowth = httpAction(async (ctx, request) => {
  const secret = process.env.GROWTH_MCP_TOKEN;
  if (
    !secret ||
    secret.length < 32 ||
    secret === process.env.ADMIN_API_SECRET ||
    !(await hasBearer(request, secret))
  )
    return reply(401, { ok: false, error: "Unauthorized" });
  const body = await readObject(request, 32_768);
  if (!body) return reply(400, { ok: false, error: "Invalid tool request." });
  const result = await ctx.runMutation(internal.growth.mcp, {
    tokenHash: await sha256(secret),
    operation: text(body.operation),
    payload: body.payload ?? {},
  });
  return reply(result.ok ? 200 : 400, result);
});
