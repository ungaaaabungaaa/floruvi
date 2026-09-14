import { getCatalogue } from "@/lib/catalogue";
export async function GET() {
  try {
    return Response.json(await getCatalogue(), {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch {
    return Response.json({ error: "Catalogue unavailable" }, { status: 503 });
  }
}
