import { ConvexHttpClient } from "convex/browser";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";

/** Cache tag for public catalogue and recipe reads. Admin stock changes update it. */
export const CATALOGUE_TAG = "catalogue";
/** Public pages show catalogue edits within five minutes, or at once after an admin stock change. */
const REVALIDATE_SECONDS = 300;

/**
 * Reads public catalogue and recipe data through the Next.js data cache, so product,
 * recipe and policy pages can be served from the CDN instead of rendering per request.
 * `fetchQuery` from convex/nextjs always sends `cache: "no-store"`. Use it, not this,
 * for prices at checkout, payments, chat and anything private: those must stay live.
 */
export function cachedPublicQuery<Query extends FunctionReference<"query", "public">>(
  query: Query,
  args: FunctionArgs<Query>,
): Promise<FunctionReturnType<Query>> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set.");
  const client = new ConvexHttpClient(url, {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        cache: "force-cache",
        next: { revalidate: REVALIDATE_SECONDS, tags: [CATALOGUE_TAG] },
      }),
  });
  return client.query(query, args);
}
