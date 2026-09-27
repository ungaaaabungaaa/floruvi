import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

// Whether the owner has switched the website chat on. Cached briefly at the edge,
// so a change in the admin panel reaches visitors within about a minute.
export async function GET() {
  try {
    const { enabled } = await fetchQuery(api.storefront.chat, {});
    return Response.json(
      { enabled },
      {
        headers: {
          // Browsers always ask again; only Vercel's edge keeps the answer briefly.
          "Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "max-age=30, stale-while-revalidate=30",
        },
      },
    );
  } catch {
    return Response.json({ enabled: false }, { headers: { "Cache-Control": "no-store" } });
  }
}
