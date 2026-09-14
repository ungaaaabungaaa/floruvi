import type { Product } from "./catalogue";
import { findProducts } from "./search";
export type GuideReply = {
  text: string;
  products?: Pick<Product, "slug" | "name" | "category">[];
  link?: { href: string; label: string };
};
export function guideReply(message: string, products: Product[]): GuideReply {
  const text = message.toLowerCase();
  if (/[\u0600-\u06ff]/.test(text))
    return {
      text: "This guide currently searches crop names in English. Live translation is not connected yet. You can send the farm an enquiry in your preferred language.",
      link: { href: "/contact", label: "Contact the farm" },
    };
  if (
    /\b(price|cost|stock|available|availability|delivery|deliver|shipping|order|buy)\b/.test(
      text,
    )
  )
    return {
      text: "Prices, harvest availability, pack sizes, and delivery areas are confirmed by the farm when you enquire. This catalogue does not show live stock.",
      link: { href: "/contact", label: "Ask about availability" },
    };
  if (/\b(business|wholesale|restaurant|cafe|bulk)\b/.test(text))
    return {
      text: "Tell the farm which crops you need, your city, and your weekly quantity. Use the business form to start the conversation.",
      link: { href: "/wholesale", label: "Send a business enquiry" },
    };
  if (/\b(human|team|contact|help|person)\b/.test(text))
    return {
      text: "I’m an automated catalogue guide. These messages are not sent to a person. Use the enquiry form to reach the farm.",
      link: { href: "/contact", label: "Contact the farm" },
    };
  const terms = text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(
      (t) =>
        t &&
        ![
          "show",
          "me",
          "find",
          "some",
          "please",
          "the",
          "your",
          "do",
          "you",
          "have",
          "looking",
          "for",
          "i",
          "want",
          "a",
          "an",
          "about",
          "tell",
        ].includes(t),
    )
    .join(" ");
  const matches = terms ? findProducts(products, terms).slice(0, 4) : [];
  return matches.length
    ? {
        text: "Here are a few matches from the growing list. Open a crop to see its details or ask about availability.",
        products: matches,
      }
    : {
        text: "Try a crop name such as basil, lettuce, or microgreens. I can also point you to the business enquiry form. I only use the public growing list.",
        link: { href: "/products", label: "Explore all produce" },
      };
}
