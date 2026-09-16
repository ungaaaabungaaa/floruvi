// ISO 4217 minor-unit exponents. Amounts are always integer minor units.
export const currencyExponent = {
  INR: 2,
  AED: 2,
  SAR: 2,
  QAR: 2,
  KWD: 3,
  OMR: 3,
  BHD: 3,
  IQD: 3,
  EUR: 2,
  JPY: 0,
  GBP: 2,
  NPR: 2,
  BDT: 2,
  MYR: 2,
  LKR: 2,
  UZS: 2,
} as const;
export type CurrencyCode = keyof typeof currencyExponent;

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === "string" && Object.hasOwn(currencyExponent, value);
}

const formatters = new Map<string, Intl.NumberFormat>();
function numberFormat(tag: string, options: Intl.NumberFormatOptions) {
  const key = `${tag}|${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(tag, { numberingSystem: "latn", ...options });
    formatters.set(key, formatter);
  }
  return formatter;
}

/** Format integer minor units. Whole amounts show no decimals, as before. */
export function formatCurrency(
  minor: number | null | undefined,
  currency: CurrencyCode,
  tag: string,
  unavailable = "Unavailable",
) {
  if (minor == null || !Number.isSafeInteger(minor)) return unavailable;
  const scale = 10 ** currencyExponent[currency];
  const displayDigits = numberFormat(tag, { style: "currency", currency })
    .resolvedOptions().maximumFractionDigits ?? 2;
  const whole = minor % scale === 0 || displayDigits === 0;
  return numberFormat(tag, {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : displayDigits,
    maximumFractionDigits: whole ? 0 : displayDigits,
  }).format(minor / scale);
}

export function formatNumber(value: number, tag: string) {
  return numberFormat(tag, {}).format(value);
}

/** Replace {name} placeholders. Unknown placeholders stay visible for tests. */
export function fill(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match,
  );
}

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string;
};
const pluralRules = new Map<string, Intl.PluralRules>();
/** Choose a CLDR plural form, then fill {count} and any other values. */
export function plural(
  tag: string,
  count: number,
  forms: PluralForms,
  values: Record<string, string | number> = {},
) {
  let rules = pluralRules.get(tag);
  if (!rules) {
    rules = new Intl.PluralRules(tag);
    pluralRules.set(tag, rules);
  }
  const template = forms[rules.select(count)] ?? forms.other;
  return fill(template, { count: formatNumber(count, tag), ...values });
}

export function formatDate(iso: string, tag: string) {
  return new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function countryName(country: string, language: string) {
  try {
    return new Intl.DisplayNames([language], { type: "region" }).of(country) ?? country;
  } catch {
    return country;
  }
}
