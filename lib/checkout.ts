import { z } from "zod";
import { enquirySchema } from "./enquiry";
export const checkoutContact = z.object({
  name: enquirySchema.shape.name,
  email: enquirySchema.shape.email,
  phone: enquirySchema.shape.phone.refine(
    (v) => v.length > 0,
    "Enter a delivery phone number.",
  ),
});
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
export function basketEnquiry(
  details: CheckoutDetails,
  items: { name: string; quantity: number }[],
  consent: boolean,
  website = "",
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
      `Delivery area: ${details.city}, ${details.region}, ${details.pincode}.`,
      details.notes,
    ].join("\n"),
    consent,
    website,
  });
}
