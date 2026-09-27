/** A page's `searchParams` as a query string for client components. */
export function queryString(params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    for (const item of [value].flat()) if (item !== undefined) search.append(key, item);
  return search.toString();
}
