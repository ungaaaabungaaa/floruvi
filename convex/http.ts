import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { enquirySchema } from "../lib/enquiry";

const http = httpRouter();
http.route({
  path: "/enquiries",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.LEAD_INGEST_SECRET;
    if (!secret || request.headers.get("Authorization") !== `Bearer ${secret}`)
      return new Response("Unauthorized", { status: 401 });
    const text = await request.text();
    if (text.length > 12_000) return new Response("Too large", { status: 413 });
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return new Response("Invalid request", { status: 400 });
    }
    const parsed = enquirySchema.safeParse(body.payload);
    if (
      !parsed.success ||
      !/^[a-f0-9]{64}$/.test(body.ipHash ?? "") ||
      !/^[a-f0-9]{64}$/.test(body.contactHash ?? "")
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
export default http;
