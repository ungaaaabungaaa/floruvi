import { enquirySchema } from "@/lib/enquiry";
import { isSameOrigin } from "@/lib/request-origin";
import { callerHash, keyedHash, readJson } from "@/lib/read-json";
import { withCountry } from "@/lib/i18n/country";

export async function POST(request: Request) {
  const secret = process.env.LEAD_INGEST_SECRET;
  const site = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!secret || !site)
    return Response.json(
      { error: "Enquiries are not connected yet. Please try again later." },
      { status: 503 },
    );
  if (!isSameOrigin(request))
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await readJson(request, 12_000);
  if (!body.ok) return body.response;
  const input = body.value;
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Check your details." },
      { status: 400 },
    );
  try {
    const response = await fetch(`${site}/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        payload: {
          ...parsed.data,
          city: withCountry(parsed.data.city, (input as { market?: unknown }).market),
        },
        ipHash: callerHash(request, secret),
        contactHash: keyedHash(parsed.data.email, secret),
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (response.status === 429)
      return Response.json(
        { error: "Too many requests. Please try again in one hour." },
        { status: 429 },
      );
    if (!response.ok) throw new Error("Ingestion failed");
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Your request was not saved. Please try again shortly." },
      { status: 503 },
    );
  }
}
