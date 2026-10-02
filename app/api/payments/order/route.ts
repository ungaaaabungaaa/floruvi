import { paymentOrderRequest } from "@/lib/checkout";
import { isSameOrigin } from "@/lib/request-origin";
import { callerHash, keyedHash, readJson } from "@/lib/read-json";

const statusFor: Record<string, number> = {
  invalid: 400,
  changed: 409,
  limited: 429,
};

// Starts a Razorpay payment. The browser sends slugs, quantities and contact
// details only; Convex prices the basket and creates the Razorpay order.
export async function POST(request: Request) {
  const secret = process.env.LEAD_INGEST_SECRET;
  const site = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!secret || !site) return Response.json({ error: "off" }, { status: 503 });
  if (!isSameOrigin(request))
    return Response.json({ error: "origin" }, { status: 403 });
  const body = await readJson(request, 12_000);
  if (!body.ok) return body.response;
  const parsed = paymentOrderRequest.safeParse(body.value);
  if (!parsed.success)
    return Response.json({ error: "invalid" }, { status: 400 });
  try {
    const response = await fetch(`${site}/payments/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        request: parsed.data,
        ipHash: callerHash(request, secret),
        contactHash: keyedHash(
          parsed.data.details.phone.replace(/\D/g, ""),
          secret,
        ),
      }),
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });
    const result = await response.json().catch(() => null);
    // The browser acts on 400 (details), 409 (basket changed) and 429 (limit).
    // Anything else, such as a backend without payments yet (404), means "not available".
    if (!response.ok || !result?.ok) {
      const reason = typeof result?.reason === "string" ? result.reason : "off";
      return Response.json(
        { error: reason },
        { status: statusFor[reason] ?? 503 },
      );
    }
    const { keyId, razorpayOrderId, amountMinor, reference } = result;
    return Response.json(
      { keyId, razorpayOrderId, amountMinor, currency: "INR", reference },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "provider" }, { status: 503 });
  }
}
