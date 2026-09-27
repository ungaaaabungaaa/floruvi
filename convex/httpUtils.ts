// Helpers for Convex HTTP actions (default runtime).

export async function sha256(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * True when the request carries `Bearer <secret>`. Compares digests, so the time
 * taken does not depend on how much of the secret matched.
 */
export async function hasBearer(request: Request, secret: string | undefined) {
  if (!secret || secret.length < 16) return false;
  const [given, expected] = await Promise.all([
    sha256(request.headers.get("Authorization") ?? ""),
    sha256(`Bearer ${secret}`),
  ]);
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return difference === 0;
}

/** A JSON object body of at most `maxChars` characters, or null. */
export async function readObject(
  request: Request,
  maxChars: number,
): Promise<Record<string, unknown> | null> {
  const text = await request.text();
  if (text.length > maxChars) return null;
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

export const reply = (status: number, data: object = {}) => Response.json(data, { status });
export const text = (value: unknown) => (typeof value === "string" ? value : "");
