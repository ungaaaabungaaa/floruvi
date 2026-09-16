import type { Metadata } from "next";
import Link from "@/components/i18n/link";
import { ArrowRight, Check } from "lucide-react";
import { Lines } from "@/components/i18n/lines";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/real-talk",
    title: messages.meta.realTalk.title,
    description: messages.meta.realTalk.description,
  });
}

export default async function RealTalk() {
  const t = (await getI18n()).messages.realTalk;
  return (
    <>
      <section className="editorial-hero page-width real-talk-hero">
        <div>
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
          <Link href="/recipes" className="button button-primary">
            {t.cta} <ArrowRight size={17} />
          </Link>
        </div>
        <div className="kitchen-paper">
          <span className="eyebrow">{t.paperEyebrow}</span>
          <h2>{t.paperTitle}</h2>
          {t.plan.map((s) => (
            <p key={s}>
              <Check size={18} />
              {s}
            </p>
          ))}
          <span className="handwritten">
            <Lines text={t.handwritten} />
          </span>
        </div>
      </section>
      <section className="section page-width nutrition-intro">
        <span className="eyebrow">{t.keepEyebrow}</span>
        <h2>{t.keepTitle}</h2>
        <p>{t.keepText}</p>
      </section>
      <section className="green-editorial page-width">
        <h2>{t.chooseTitle}</h2>

        <Link href="/products" className="button button-light">
          {t.chooseCta} <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
