import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

const UPDATED = "2026-09-17";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/refunds",
    title: messages.meta.refunds.title,
    description: messages.meta.refunds.description,
  });
}

export default async function Refunds() {
  const { locale, messages } = await getI18n();
  return <LegalPage locale={locale} t={messages.refunds} updatedDate={UPDATED} />;
}
