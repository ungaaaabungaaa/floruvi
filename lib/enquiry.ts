import { z } from "zod";

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
      .pipe(z.email("Enter a valid email address.")),
    phone: z
      .string()
      .trim()
      .max(30)
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
