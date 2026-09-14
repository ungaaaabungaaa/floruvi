import { createHmac } from "node:crypto";
import { enquirySchema } from "@/lib/enquiry";
import { isSameOrigin } from "@/lib/request-origin";

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
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json({ error: "Use JSON." }, { status: 415 });
  // Stream with a cap; do not trust the caller's Content-Length.
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json({ error: "Empty request." }, { status: 400 });
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > 12_000) {
      await reader.cancel();
      return Response.json({ error: "Request too large." }, { status: 413 });
    }
    chunks.push(value);
  }
  let input;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Check your details." },
      { status: 400 },
    );
  // Vercel overwrites this header. Never use a caller-controlled forwarded header elsewhere.
  const ip =
    process.env.VERCEL === "1"
      ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
      : "local";
  const hash = (value: string) =>
    createHmac("sha256", secret).update(value).digest("hex");
  try {
    const response = await fetch(`${site}/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        payload: parsed.data,
        ipHash: hash(ip || "unknown"),
        contactHash: hash(parsed.data.email),
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
