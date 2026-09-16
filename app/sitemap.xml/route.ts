import { sitemapIndex } from "@/lib/sitemap";

export function GET() {
  return new Response(sitemapIndex(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
