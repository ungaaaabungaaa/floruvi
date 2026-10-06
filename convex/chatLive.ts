import { v } from "convex/values";
import { query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { ApiFromModules, FunctionReturnType } from "convex/server";
type ChatApi = ApiFromModules<{ chat: typeof import("./chat") }>["chat"];
import { hasBearer } from "./httpUtils";

// Only the Next.js server subscribes. These secrets and cookie hashes never
// enter browser code. Storage queries remain internal. The inbox also checks
// the admin session on every update, not just on the initial HTTP request.
export const customer = query({
  args: { secret: v.string(), tokenHash: v.string(), sessionId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<FunctionReturnType<ChatApi["customerThread"]> | null> => {
    if (!(await hasBearer(new Request("https://server.invalid", { headers: { Authorization: `Bearer ${args.secret}` } }), process.env.LEAD_INGEST_SECRET))) return null;
    return ctx.runQuery(internal.chat.customerThread, { tokenHash: args.tokenHash, sessionId: args.sessionId });
  },
});

export const inbox = query({
  args: { secret: v.string(), tokenHash: v.string(), threadId: v.optional(v.string()), sort: v.optional(v.literal("cost")) },
  handler: async (ctx, args): Promise<FunctionReturnType<ChatApi["inbox"]>> => {
    if (!(await hasBearer(new Request("https://server.invalid", { headers: { Authorization: `Bearer ${args.secret}` } }), process.env.ADMIN_API_SECRET))) return null;
    return ctx.runQuery(internal.chat.inbox, { tokenHash: args.tokenHash, threadId: args.threadId, sort: args.sort });
  },
});
