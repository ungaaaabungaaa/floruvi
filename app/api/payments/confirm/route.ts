import { z } from "zod";
import { razorpayIds } from "@/lib/razorpay";
import { isSameOrigin } from "@/lib/request-origin";
import { readJson } from "@/lib/read-json";

// Passes Razorpay Checkout's result to Convex, which checks the signature and
// asks Razorpay whether the payment is captured. The browser's word is not enough.
const schema = z
  .object({
    razorpay_order_id: z.string().regex(razorpayIds.order),
    razorpay_payment_id: z.string().regex(razorpayIds.payment),
    razorpay_signature: z.string().regex(razorpayIds.signature),
  })
  .strict();

export async function POST(request: Request) {
  const secret = process.env.LEAD_INGEST_SECRET;
  const site = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!secret || !site) return Response.json({ error: "off" }, { status: 503 });
  if (!isSameOrigin(request)) return Response.json({ error: "origin" }, { status: 403 });
  const body = await readJson(request, 1000);
  if (!body.ok) return body.response;
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  try {
    const response = await fetch(`${site}/payments/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({
        razorpayOrderId: parsed.data.razorpay_order_id,
        razorpayPaymentId: parsed.data.razorpay_payment_id,
        signature: parsed.data.razorpay_signature,
      }),
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok)
      return Response.json(
        { error: typeof result?.reason === "string" ? result.reason : "provider" },
        { status: 502 },
      );
    return Response.json(
      { status: result.status, reference: result.reference },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "provider" }, { status: 503 });
  }
}
