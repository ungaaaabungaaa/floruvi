import { localeSitemap } from "@/lib/sitemap";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/sitemaps/[file]">,
) {
  const { file } = await params;
  try {
    const xml = await localeSitemap(file);
    if (!xml) return new Response("Not found", { status: 404 });
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Sitemap unavailable", { status: 503 });
  }
}
