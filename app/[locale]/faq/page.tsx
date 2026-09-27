import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Link from "@/components/i18n/link";
import type { Metadata } from "next";
import { getShop } from "@/lib/storefront";
import { getI18n } from "@/lib/i18n/server";
import { faqGroups } from "@/lib/faq";
import { jsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/faq",
    title: messages.meta.faq.title,
    description: messages.meta.faq.description,
  });
}

export default async function FAQ() {
  const [{ locale, messages }, { commerce }] = await Promise.all([getI18n(), getShop()]);
  const t = messages.faq;
  const groups = faqGroups(t, {
    domestic: locale.domestic,
    countryName: locale.countryName,
    tag: locale.tag,
    deliveryFeeMinor: commerce?.deliveryFeeMinor,
  });
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale.tag,
    mainEntity: groups.flatMap((group) =>
      group.questions.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    ),
  };
  return (
    <div className="page-width section faq-layout faq-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <aside className="faq-intro">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
        <nav className="faq-topics" aria-label={t.topics}>
          {groups.map((group) => (
            <a key={group.id} href={`#${group.id}`}>
              {group.title}
            </a>
          ))}
        </nav>
        <Link href="/contact" className="text-link">
          {t.contactLink}
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
                <AccordionItem key={index} value={`${group.id}-${index}`}>
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
          <h2>{t.helpTitle}</h2>
          <p>{t.helpText}</p>
          <div>
            <Link className="text-link" href="/contact">
              {t.helpContact}
            </Link>
            <Link className="text-link" href="/privacy">
              {t.helpPrivacy}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
