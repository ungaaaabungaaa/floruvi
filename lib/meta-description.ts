/** Search results show about 155–160 characters of a description. */
export const DESCRIPTION_LIMIT = 160;

/** Shortens text at a word boundary and adds "…", so a description is never cut mid-word. */
export function clampText(text: string, max = DESCRIPTION_LIMIT) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, Math.max(0, max - 1));
  const space = cut.lastIndexOf(" ");
  // Scripts without spaces (Japanese) are cut at the limit.
  const head = space > max * 0.6 ? cut.slice(0, space) : cut;
  return `${head.replace(/[\s,;:.\-–—·&]+$/u, "")}…`;
}

/**
 * Fills `template` so the result fits the limit: only `{text}` is shortened, and
 * the other parts (price, pack size, cooking time) stay complete.
 */
export function fitDescription(build: (text: string) => string, text: string) {
  const room = DESCRIPTION_LIMIT - build("").length;
  return build(clampText(text, Math.max(40, room)));
}
