import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Frequently asked questions",
  alternates: { canonical: "/faq" },
};
const questions = [
  [
    "How do I buy from Floruvi?",
    "Browse the crops, add your choices to the basket, and send an availability request at checkout. The farm can then confirm the produce, pack sizes, price, and delivery. The request is not a confirmed order.",
  ],
  [
    "Do I need an account to browse?",
    "No. You can browse, use the basket, and send an enquiry without an account. Email and phone verification will be offered at the final checkout step when purchasing is enabled.",
  ],
  [
    "Are all listed crops available now?",
    "No. The catalogue includes common and specialist crops that can suit hydroponic or aeroponic growing. Each crop has growing notes. The farm must confirm availability for your request.",
  ],
  [
    "Where do you deliver?",
    "Delivery areas and charges are being finalised. Send your city and postcode with your enquiry. We will check your location before confirming delivery.",
  ],
  [
    "Can I pay online?",
    "Online payment is not active yet. The current checkout sends an availability request. It does not charge you, reserve stock, or create a paid order.",
  ],
  [
    "Can my business request a regular supply?",
    "Yes. Use the business enquiry form to share your crop list, quantities, location, and preferred schedule. Supply arrangements must be confirmed by the farm.",
  ],
  [
    "Are the pictures photos of your current harvest?",
    "The current site uses generated crop and food illustrations. They help you explore the catalogue. Appearance, size, and packaging can vary; request current harvest details from the farm.",
  ],
  [
    "How does the basket remember my choices?",
    "Your browser stores crop identifiers and quantities on your device. It does not store checkout contact or address details in the basket. You can remove items or clear the basket at any time.",
  ],
];
export default function FAQ() {
  return (
    <div className="page-width section faq-layout">
      <div className="faq-intro">
        <span className="eyebrow">A FEW THINGS TO KNOW</span>
        <h1>
          Good questions.
          <br />
          <em>Simple answers.</em>
        </h1>
        <p>From choosing your greens to planning your first delivery.</p>
        <Link href="/contact" className="text-link">
          Ask us something else →
        </Link>
      </div>
      <div className="faq-list">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
