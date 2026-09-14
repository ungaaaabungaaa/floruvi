/** Format catalogue prose for display without changing stored records or links. */
export function storefrontCopy<T>(value: T): T {
  if (typeof value === "string") {
    if (/^(?:https?:|\/)/.test(value)) return value;
    return value.replace(/(?<![\w/-])and(?![\w/-])/gi, "&") as T;
  }
  if (Array.isArray(value)) return value.map(storefrontCopy) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        /(?:id|slug|key|url|category|status|method|suitability)$/i.test(key)
          ? item
          : storefrontCopy(item),
      ]),
    ) as T;
  }
  return value;
}
