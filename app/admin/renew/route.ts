import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminApi, adminToken, cookieOptions } from "@/lib/admin";

// Keeps the owner signed in while the panel is in use. A route handler, not a
// Server Action, because a cookie set in a Server Action re-renders the page.

const done = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  // Only the panel's own fetch may call this. The SameSite=Lax cookie also stays off cross-site posts.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return done(403);
  const token = await adminToken();
  if (!token) return done(401);
  const response = await adminApi("renew", { token }).catch(() => null);
  if (response?.status === 401) return done(401);
  if (!response?.ok) return done(502);
  const { renewed } = (await response.json()) as {
    renewed: { remembered: boolean; maxAgeSeconds: number } | null;
  };
  // A browser-only session keeps a cookie that ends with the browser.
  if (renewed)
    (await cookies()).set(ADMIN_COOKIE, token, {
      ...cookieOptions,
      ...(renewed.remembered ? { maxAge: renewed.maxAgeSeconds } : {}),
    });
  return done(204);
}
