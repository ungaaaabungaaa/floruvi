import { z } from "zod";

// First code point ("0") of each decimal digit set a visitor may type: Arabic-Indic,
// Persian, Indian scripts, Sinhala, Thai and full-width (Japanese keyboards).
const digitZeros = [
  0x0660, 0x06f0, 0x0966, 0x09e6, 0x0a66, 0x0ae6, 0x0b66, 0x0be6, 0x0c66,
  0x0ce6, 0x0d66, 0x0de6, 0x0e50, 0xff10,
];

/** Converts digits from other scripts to 0–9 before phone and PIN checks. */
export function toAsciiDigits(value: string) {
  return value.replace(/\p{Nd}/gu, (digit) => {
    const code = digit.codePointAt(0)!;
    const zero = digitZeros.find((start) => code >= start && code <= start + 9);
    return zero === undefined ? digit : String(code - zero);
  });
}

export const enquirySchema = z
  .object({
    kind: z.enum(["business", "personal"]),
    name: z.string().trim().min(2, "Enter your name.").max(100),
    business: z.string().trim().max(160).default(""),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .pipe(z.union([z.email("Enter a valid email address."), z.literal("")])),
    phone: z
      .string()
      .transform(toAsciiDigits)
      .pipe(z.string().trim().max(30))
      .refine(
        (v) =>
          !v ||
          (/^\+?[\d\s()-]{7,30}$/.test(v) &&
            v.replace(/\D/g, "").length >= 7 &&
            v.replace(/\D/g, "").length <= 15),
        "Enter a valid phone number.",
      ),
    city: z.string().trim().min(2, "Enter your city.").max(100),
    interest: z.string().trim().max(160),
    quantity: z.string().trim().max(100),
    message: z
      .string()
      .trim()
      .min(10, "Please add at least 10 characters.")
      .max(2000),
    consent: z.literal(true, {
      error: "Please agree so we can respond to your request.",
    }),
    website: z.string().max(0).default(""),
  })
  .refine((v) => !!v.email || (v.kind === "personal" && !!v.phone), {
    path: ["email"],
    message: "Enter a valid email address.",
  })
  .refine((v) => v.kind !== "business" || v.business.length >= 2, {
    path: ["business"],
    message: "Enter your business name.",
  });

export type Enquiry = z.infer<typeof enquirySchema>;
export const RATE_WINDOW = 60 * 60 * 1000;
export function nextRate(
  previous: { count: number; windowStart: number } | null,
  now: number,
  limit: number,
) {
  const current =
    previous && now - previous.windowStart < RATE_WINDOW
      ? previous
      : { count: 0, windowStart: now };
  return {
    allowed: current.count < limit,
    count: current.count + 1,
    windowStart: current.windowStart,
  };
}
