// Narrow owner-AI tools exclude contact fields and redact obvious contacts in prose.
// This is not a general secret scanner. Owners must keep secrets out of research text.
export function redactGrowthContacts(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[contact removed]")
    .replace(/(?<![\w])\+?\d[\d ().-]{5,}\d(?![\w])/g, (match) =>
      match.replace(/\D/g, "").length >= 7 ? "[contact removed]" : match,
    );
}
const structuralFields = new Set([
  "_id",
  "kind",
  "group",
  "status",
  "deadline",
  "tenderReference",
]);
const linkFields = new Set(["url", "sourceUrl", "website"]);
function sourceLink(value: string) {
  try {
    const url = new URL(value);
    // Preserve public numeric notice IDs. Remove contact/token query values.
    for (const [key, item] of Array.from(url.searchParams)) {
      if (
        /email|phone|mobile|contact|token|secret|auth/i.test(key) ||
        item.includes("@")
      )
        url.searchParams.delete(key);
    }
    return url.href;
  } catch {
    return "";
  }
}
export function scopedGrowthText<T>(value: T): T {
  if (typeof value === "string") return redactGrowthContacts(value) as T;
  if (Array.isArray(value)) return value.map(scopedGrowthText) as T;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        structuralFields.has(key)
          ? item
          : linkFields.has(key) && typeof item === "string"
            ? sourceLink(item)
            : scopedGrowthText(item),
      ]),
    ) as T;
  return value;
}
