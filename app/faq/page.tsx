import { getCatalogue } from "@/lib/catalogue";
import { formatMoney } from "@/lib/pricing";
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Frequently asked questions",
  alternates: { canonical: "/faq" },
};
const questions = [
  [
    "How do I order?",
    "Add crops to your basket and send a request. We’ll confirm your order and delivery date.",
  ],
  [
    "Which boxes can I choose?",
    "Single for one person, Dual for two, and Family for four or more. Choose daily, weekly, or every-two-weeks delivery. See each box’s contents and price on the boxes page.",
  ],
  [
    "Do I need an account?",
    "No account is needed to browse or send a request.",
  ],
  ["Is everything in stock?", "All listed products are available."],
  ["Where do you deliver?", "Across India, with a flat delivery fee."],
  [
    "Can I pay online?",
    "Not yet. Requests do not charge you, reserve stock, or start recurring payments.",
  ],
  [
    "Do you supply businesses?",
    "Yes. Send your crop list, quantities, location, and schedule through the business form.",
  ],
  [
    "Are the images of your harvest?",
    "The images are generated illustrations. Ask us for current crop and packaging details.",
  ],
];
export default async function FAQ() {
  const { commerce } = await getCatalogue();
  const entries = [
    ...questions,
    [
      "What does delivery cost?",
      `${formatMoney(commerce?.deliveryFeeMinor)} per delivery. No free-delivery threshold.`,
    ],
  ];
  return (
    <div className="page-width section faq-layout">
      <div className="faq-intro">
        <h1>Questions?</h1>
        <Link href="/contact" className="text-link">
          Contact us →
        </Link>
      </div>
      <div className="faq-list">
        {entries.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
