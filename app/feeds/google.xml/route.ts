import { getCatalog } from "@/lib/catalog";
import { buildGoogleFeed, feedOrigin } from "@/lib/merchant-feed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const catalog = await getCatalog();
  const body = buildGoogleFeed(catalog, feedOrigin(request));
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
