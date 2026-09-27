import { z } from "zod";
import { MAX_CART_LINES, MAX_QUANTITY } from "./cart";
import { enquirySchema, toAsciiDigits } from "./enquiry";

/** Basket lines as the browser sends them: slugs and quantities only, never prices. */
export const basketLines = z
  .array(
    z
      .object({
        slug: z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .max(100),
        quantity: z.number().int().min(1).max(MAX_QUANTITY),
      })
      .strict(),
  )
  .min(1)
  .max(MAX_CART_LINES)
  .refine((lines) => new Set(lines.map((l) => l.slug)).size === lines.length);
export const checkoutContact = z.object({
  name: enquirySchema.shape.name,
  email: enquirySchema.shape.email,
  phone: enquirySchema.shape.phone.refine(
    (v) => v.length > 0,
    "Enter a delivery phone number.",
  ),
});
/**
 * Details for a paid order in India. The street address stays optional (owner
 * decision); the farm calls to confirm it. A 6-digit PIN code is required.
 */
export const paidOrderDetails = z
  .object({
    name: checkoutContact.shape.name,
    email: checkoutContact.shape.email,
    phone: checkoutContact.shape.phone,
    address: z.string().trim().max(240),
    city: z.string().trim().min(2).max(100),
    region: z.string().trim().min(2).max(100),
    pincode: z
      .string()
      .transform(toAsciiDigits)
      .pipe(z.string().trim().regex(/^[1-9]\d{5}$/)),
    notes: z.string().trim().max(800),
  })
  .strict();

export const paymentOrderRequest = z
  .object({
    items: basketLines,
    details: paidOrderDetails,
    consent: z.literal(true),
    website: z.string().max(0),
  })
  .strict();
export type PaymentOrderRequest = z.infer<typeof paymentOrderRequest>;

export type CheckoutDetails = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  pincode: string;
  notes: string;
};
/** The farm reads requests in English, so item names and totals stay in English. */
export function basketEnquiry(
  details: CheckoutDetails,
  items: { name: string; quantity: number }[],
  consent: boolean,
  website = "",
  destination?: { country: string; total: string; deliveryQuoted: boolean },
) {
  return enquirySchema.safeParse({
    kind: "personal",
    name: details.name,
    email: details.email,
    phone: details.phone,
    business: "",
    city: details.city,
    interest: `Basket availability: ${items.length} crops`,
    quantity: `${items.reduce((n, i) => n + i.quantity, 0)} requested units across ${items.length} crops`,
    message: [
      "Basket availability request:",
      ...items.map((i) => `${i.name} × ${i.quantity}`),
      `Delivery area: ${[details.city, details.region, details.pincode].filter(Boolean).join(", ")}.`,
      ...(destination
        ? [
            `Country: ${destination.country}. Basket total: ${destination.total}${destination.deliveryQuoted ? " before delivery (delivery to be quoted)" : ""}.`,
          ]
        : []),
      details.notes,
    ].join("\n"),
    consent,
    website,
  });
}
