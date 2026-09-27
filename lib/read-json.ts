import { createHmac } from "node:crypto";

type Read = { ok: true; value: unknown } | { ok: false; response: Response };
const fail = (status: number, error: string): Read => ({
  ok: false,
  response: Response.json({ error }, { status }),
});

/** Reads a JSON request body with a byte cap. The caller's Content-Length is not trusted. */
export async function readJson(request: Request, maxBytes: number): Promise<Read> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    return fail(415, "Use JSON.");
  const reader = request.body?.getReader();
  if (!reader) return fail(400, "Empty request.");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > maxBytes) {
      await reader.cancel();
      return fail(413, "Request too large.");
    }
    chunks.push(value);
  }
  try {
    return { ok: true, value: JSON.parse(Buffer.concat(chunks).toString("utf8")) };
  } catch {
    return fail(400, "Invalid request.");
  }
}

export const keyedHash = (value: string, secret: string) =>
  createHmac("sha256", secret).update(value).digest("hex");

/** The caller's address as a keyed hash for rate limits; the address itself is never sent on. */
export function callerHash(request: Request, secret: string) {
  // Vercel overwrites this header. Never use a caller-controlled forwarded header.
  const ip =
    process.env.VERCEL === "1"
      ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
      : "local";
  return keyedHash(ip || "unknown", secret);
}
