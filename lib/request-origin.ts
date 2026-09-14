export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const url = new URL(request.url);
  // Next.js may use its bound hostname in request.url. Host retains the address
  // the browser used. Do not trust caller-provided X-Forwarded-Host instead.
  const host = request.headers.get("host") || url.host;
  return origin === `${url.protocol}//${host}`;
}
