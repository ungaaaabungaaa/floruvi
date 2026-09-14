import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getCatalogue } from "@/lib/catalogue";
import { formatMoney } from "@/lib/pricing";
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Answers about shopping, vegetable boxes, delivery, produce care, saved products & privacy at Floruvi.",
  alternates: { canonical: "/faq" },
};
export default async function FAQ() {
  const { commerce } = await getCatalogue();
  const delivery =
    commerce?.deliveryFeeMinor == null
      ? "The delivery fee is shown in your basket before you send a request."
      : `For a basket containing individual produce, delivery is ${formatMoney(commerce.deliveryFeeMinor)} per delivery.`;
  const groups = [
    {
      id: "shopping",
      title: "Shopping & your basket",
      questions: [
        [
          "How do I place an order?",
          "Choose your produce or box, add it to your basket, then review your selection at checkout. Enter your contact details & send an availability request. The farm will review the request & arrange the next steps with you.",
        ],
        [
          "Do I need an account?",
          "No. You can browse, save favourites, build a basket & send a request without an account. Customer accounts are not active yet.",
        ],
        [
          "Can I change my basket before sending a request?",
          "Yes. Open the basket to adjust quantities or remove items. Check the pack sizes, selected box frequency & total before continuing. Changes to your basket do not update a request you have already sent.",
        ],
        [
          "Will my basket be saved when I leave?",
          "Your basket is saved in the same browser when local storage is available. Clearing site data or using another browser can remove or change what you see. Your basket is not currently synchronised across devices.",
        ],
        [
          "Does adding an item reserve it?",
          "No. Adding produce to your basket saves your selection. Sending a request lets the farm review it; it does not reserve stock or confirm a delivery.",
        ],
      ],
    },
    {
      id: "boxes",
      title: "Vegetable boxes",
      questions: [
        [
          "Which box size should I choose?",
          "Single is designed for one person, Dual for two, & Family for four or more. Use these as a starting point, then review the listed contents to choose a size that suits how much you cook.",
        ],
        [
          "What delivery frequencies can I choose?",
          "Choose Once, Weekly, or Monthly on the boxes page. Once is a one-time box request. Weekly & Monthly express your preferred repeat schedule; selecting them does not start automatic billing.",
        ],
        [
          "Is the box price per delivery?",
          "Yes. The displayed amount is for one box per delivery, for the size you choose. It is not a monthly total or a charge for every day between deliveries.",
        ],
        [
          "Is delivery included with a box?",
          "Yes. There is no extra delivery charge for a basket containing only boxes. If you also add individual produce, the standard produce delivery fee applies to the basket.",
        ],
        [
          "Can I change a box or its frequency?",
          "Before sending a request, remove the box from your basket & add your preferred size or frequency. After sending it, contact the farm to discuss the change. Changes to an arranged delivery need to be agreed with the farm.",
        ],
      ],
    },
    {
      id: "delivery",
      title: "Delivery & payment",
      questions: [
        [
          "Where do you deliver?",
          "We accept delivery enquiries across India. Share your city & delivery area so the farm can review the request & arrange delivery with you.",
        ],
        [
          "What does delivery cost?",
          `${delivery} There is no extra delivery charge for a box-only basket. Check the basket total before sending your request.`,
        ],
        [
          "When will my produce or first box arrive?",
          "The farm will arrange the delivery date with you after reviewing your request. There is no date picker or guaranteed arrival date at checkout.",
        ],
        [
          "Can I pay online?",
          "Online payments are not active yet. Adding items or sending an availability request does not charge you. The current site also does not collect card details or activate recurring payments.",
        ],
        [
          "How do I change or cancel a request?",
          "Use the contact form & mention the email address used for your request, what you selected, & the change you need. If delivery has already been arranged, contact the farm to discuss what is possible.",
        ],
        [
          "What if there is a problem with my delivery?",
          "Contact the farm with your request details & a clear description of the problem. Include the affected items & when the delivery arrived. The farm will need to review the issue with you; the website does not currently offer an automatic refund or replacement process.",
        ],
      ],
    },
    {
      id: "produce",
      title: "Produce, storage & recipes",
      questions: [
        [
          "Where can I check the pack size?",
          "Each product card shows its price & pack size. Open the product page for more details, then review your selected quantities in the basket. Pack sizes differ between crops, so compare the listed weight or quantity as well as the price.",
        ],
        [
          "How should I store my produce?",
          "Open the product page & read its How to store section. Storage needs differ by crop. Follow the product-specific advice & any instructions supplied with your delivery.",
        ],
        [
          "Should I wash the produce before using it?",
          "Follow the preparation instructions on the product page & any guidance supplied with your delivery. Product pages include preparation tips to help you decide when to rinse, trim, or cook the crop.",
        ],
        [
          "Where can I find recipes for a product?",
          "Look for Ways to enjoy on its product page. Select a recipe to see its ingredients, cooking steps & preparation time. You can also browse the recipes page for more ideas.",
        ],
        [
          "Are recipe ingredients included in my purchase?",
          "A product purchase includes the listed pack, not every ingredient shown in a recipe. Recipes are meal ideas. Check the recipe’s ingredient list & the box contents before deciding what else you need.",
        ],
      ],
    },
    {
      id: "help",
      title: "Saved products, business & support",
      questions: [
        [
          "How does the wishlist work?",
          "Select the heart on a product image to save it. Open the heart in the header to view your saved products. Select the heart again to remove a product. The list is stored in your current browser without an account.",
        ],
        [
          "Why is my wishlist different on another device?",
          "Wishlist account sync is not active yet. Each browser keeps its own saved products. Clearing browser site data can also remove the list.",
        ],
        [
          "Do you supply cafés, restaurants, or other businesses?",
          "You can send a business enquiry through the Business page. Include your business name, crop list, quantities, city & preferred schedule so the farm can understand your requirements.",
        ],
        [
          "What happens to the details I submit?",
          "Your enquiry details are stored privately so the farm can review & respond to your request. Basket & wishlist preferences are stored in your browser. Read the privacy notice for the full explanation & information about access, correction, or deletion requests.",
        ],
        [
          "How can I ask something else?",
          "Use the contact form & include enough detail for the farm to understand your question. For an existing enquiry, mention the email address you used. Do not include passwords, payment card details, or other sensitive information.",
        ],
      ],
    },
  ];
  return (
    <div className="page-width section faq-layout faq-page">
      <aside className="faq-intro">
        <span className="eyebrow">A LITTLE HELP</span>
        <h1>Questions?</h1>
        <p>From your first basket to your next meal. Find the details here.</p>
        <nav className="faq-topics" aria-label="FAQ topics">
          {groups.map((group) => (
            <a key={group.id} href={`#${group.id}`}>
              {group.title}
            </a>
          ))}
        </nav>
        <Link href="/contact" className="text-link">
          Contact us →
        </Link>
      </aside>
      <div>
        <Accordion className="faq-list" type="single" defaultValue="shopping-0">
          {groups.map((group) => (
            <section
              className="faq-topic"
              key={group.id}
              id={group.id}
              aria-labelledby={`${group.id}-heading`}
            >
              <h2 id={`${group.id}-heading`}>{group.title}</h2>
              {group.questions.map(([question, answer], index) => (
                <AccordionItem key={question} value={`${group.id}-${index}`}>
                  <AccordionTrigger>{question}</AccordionTrigger>
                  <AccordionContent>
                    <p>{answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </section>
          ))}
        </Accordion>
        <section className="faq-help">
          <h2>Still have a question?</h2>
          <p>Tell us what you need. We’ll help with the next step.</p>
          <div>
            <Link className="text-link" href="/contact">
              Contact the farm →
            </Link>
            <Link className="text-link" href="/privacy">
              Privacy notice →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
