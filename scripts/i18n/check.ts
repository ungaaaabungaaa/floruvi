// Check translated dictionaries and catalogue text against the English source.
// Usage: node --import tsx scripts/i18n/check.ts [language ...] [--content-only | --messages-only]
import { readFileSync, existsSync } from "node:fs";
import { languages } from "../../lib/i18n/config";

const PLURAL_KEYS = new Set(["zero", "one", "two", "few", "many", "other"]);
const REQUIRED_PLURALS: Record<string, string[]> = {
  ar: ["zero", "one", "two", "few", "many", "other"],
  de: ["one", "other"],
  nl: ["one", "other"],
  ne: ["one", "other"],
  bn: ["one", "other"],
  si: ["one", "other"],
  uz: ["one", "other"],
  ja: ["other"],
  ms: ["other"],
};

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}|%s/g)].map((m) => m[1] ?? "%s").sort().join(",");
const isPlural = (value: unknown): value is Record<string, string> =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  "other" in value &&
  Object.keys(value).every((key) => PLURAL_KEYS.has(key));

function compare(
  english: unknown,
  translated: unknown,
  path: string,
  language: string,
  errors: string[],
  options: { allowSame?: (path: string) => boolean } = {},
) {
  if (isPlural(english)) {
    if (!isPlural(translated)) return errors.push(`${path}: expected plural forms`);
    for (const key of REQUIRED_PLURALS[language] ?? ["other"])
      if (typeof translated[key] !== "string" || !translated[key].trim())
        errors.push(`${path}.${key}: missing plural form`);
    for (const [key, text] of Object.entries(translated))
      if (placeholders(text) !== placeholders(english.other))
        errors.push(`${path}.${key}: placeholders differ`);
    return;
  }
  if (Array.isArray(english)) {
    if (!Array.isArray(translated) || translated.length !== english.length)
      return errors.push(`${path}: array length differs`);
    english.forEach((item, i) => compare(item, translated[i], `${path}[${i}]`, language, errors, options));
    return;
  }
  if (english && typeof english === "object") {
    if (!translated || typeof translated !== "object" || Array.isArray(translated))
      return errors.push(`${path}: expected object`);
    const a = Object.keys(english).sort().join("|");
    const b = Object.keys(translated).sort().join("|");
    if (a !== b) errors.push(`${path}: keys differ`);
    for (const key of Object.keys(english))
      compare(
        (english as Record<string, unknown>)[key],
        (translated as Record<string, unknown>)[key],
        path ? `${path}.${key}` : key,
        language,
        errors,
        options,
      );
    return;
  }
  if (typeof english === "string") {
    if (typeof translated !== "string" || !translated.trim())
      return errors.push(`${path}: missing text`);
    if (placeholders(english) !== placeholders(translated))
      errors.push(`${path}: placeholders differ`);
    if (path.endsWith(".id") && translated !== english)
      errors.push(`${path}: identifiers must stay unchanged`);
    const skip =
      path.endsWith(".source") ||
      path.endsWith(".id") ||
      /Floruvi Farm|@example\.com/.test(english) ||
      options.allowSame?.(path);
    if (!skip && english.length > 24 && english === translated)
      errors.push(`${path}: still English`);
    return;
  }
  if (english !== translated) errors.push(`${path}: value differs`);
}

const args = process.argv.slice(2);
const only = args.filter((a) => !a.startsWith("--"));
const targets = (only.length ? only : Object.keys(languages).filter((l) => l !== "en"));
let failed = false;
for (const language of targets) {
  const errors: string[] = [];
  if (!args.includes("--content-only")) {
    compare(read("messages/en.json"), read(`messages/${language}.json`), "", language, errors, {
      allowSame: (p) => p.startsWith("packLabels.") || p.endsWith("emailPlaceholder"),
    });
  }
  if (!args.includes("--messages-only")) {
    for (const file of ["products", "recipes"]) {
      const path = `content/i18n/${language}/${file}.json`;
      if (!existsSync(path)) {
        errors.push(`${path}: missing file`);
        continue;
      }
      const english = read(`content/i18n/en/${file}.json`);
      const translated = read(path);
      for (const slug of Object.keys(english)) {
        if (!translated[slug]) {
          errors.push(`${file}.${slug}: missing`);
          continue;
        }
        compare(english[slug], translated[slug], `${file}.${slug}`, language, errors);
        if (translated[slug].source !== english[slug].source)
          errors.push(`${file}.${slug}.source: changed`);
      }
      for (const slug of Object.keys(translated))
        if (!english[slug]) errors.push(`${file}.${slug}: unknown slug`);
    }
  }
  if (errors.length) {
    failed = true;
    console.log(`✗ ${language}: ${errors.length} problem(s)`);
    for (const error of errors.slice(0, 40)) console.log(`  - ${error}`);
  } else console.log(`✓ ${language}`);
}
process.exit(failed ? 1 : 0);
