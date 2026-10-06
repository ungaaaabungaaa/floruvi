import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { enquirySchema } from "../lib/enquiry";
import * as admin from "./adminHttp";
import * as payments from "./paymentsHttp";
import * as chat from "./chatHttp";
import * as growth from "./growthHttp";
import { hasBearer, readObject } from "./httpUtils";

const http = httpRouter();
http.route({ path:"/admin/growth",method:"POST",handler:growth.adminGrowth });
http.route({ path:"/growth/mcp",method:"POST",handler:growth.mcpGrowth });
http.route({
  path: "/enquiries",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Same constant-time check as the payment and chat routes.
    if (!(await hasBearer(request, process.env.LEAD_INGEST_SECRET)))
      return new Response("Unauthorized", { status: 401 });
    const body = await readObject(request, 12_000);
    if (!body) return new Response("Invalid request", { status: 400 });
    const parsed = enquirySchema.safeParse(body.payload);
    if (
      !parsed.success ||
      typeof body.ipHash !== "string" ||
      typeof body.contactHash !== "string" ||
      !/^[a-f0-9]{64}$/.test(body.ipHash) ||
      !/^[a-f0-9]{64}$/.test(body.contactHash)
    )
      return new Response("Invalid request", { status: 400 });
    const result = await ctx.runMutation(internal.enquiries.save, {
      payload: parsed.data,
      ipHash: body.ipHash,
      contactHash: body.contactHash,
    });
    return Response.json(result, {
      status: result.ok ? 201 : result.reason === "limited" ? 429 : 400,
    });
  }),
});
http.route({ path: "/admin/login", method: "POST", handler: admin.login });
http.route({ path: "/admin/dashboard", method: "POST", handler: admin.dashboard });
http.route({ path: "/admin/stock", method: "POST", handler: admin.stock });
http.route({ path: "/admin/chat", method: "POST", handler: admin.chat });
http.route({ path: "/admin/payments", method: "POST", handler: admin.payments });
http.route({ path: "/admin/logout", method: "POST", handler: admin.logout });
http.route({ path: "/admin/renew", method: "POST", handler: admin.renew });
http.route({ path: "/payments/order", method: "POST", handler: payments.order });
http.route({ path: "/payments/confirm", method: "POST", handler: payments.confirm });
http.route({ path: "/razorpay/webhook", method: "POST", handler: payments.webhook });
http.route({ path: "/chat/turn", method: "POST", handler: chat.turn });
http.route({ path: "/chat/reply", method: "POST", handler: chat.botReply });
http.route({ path: "/chat/thread", method: "POST", handler: chat.thread });
http.route({ path: "/admin/chats", method: "POST", handler: chat.inbox });
http.route({ path: "/admin/chat-update", method: "POST", handler: chat.update });
http.route({ path: "/admin/chat-typing", method: "POST", handler: chat.typing });
export default http;
