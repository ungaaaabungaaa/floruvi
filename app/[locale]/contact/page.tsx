import type { Metadata } from "next";
import { EnquiryPage } from "@/components/enquiry-page";
import { boxSchedules, boxSizes } from "@/lib/boxes";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getI18n();
  return pageMetadata({
    path: "/contact",
    title: messages.meta.contact.title,
    description: messages.meta.contact.description,
  });
}

export default async function Contact({ searchParams }: PageProps<"/[locale]/contact">) {
  const [{ locale, messages }, { product, box, schedule }] = await Promise.all([
    getI18n(),
    searchParams,
  ]);
  const size = boxSizes.find((item) => item.id === box);
  const delivery = boxSchedules.find((item) => item.id === schedule);
  const labels = messages.common.boxes;
  const values = size &&
    delivery && {
      name:
        locale.language === "de"
          ? labels[size.id].name
          : labels[size.id].name.toLocaleLowerCase(locale.tag),
      people: labels[size.id].people,
      schedule: labels.schedules[delivery.id],
    };
  return (
    <EnquiryPage
      product={
        values
          ? fill(messages.contact.boxInterest, { ...values, name: labels[size!.id].name })
          : typeof product === "string"
            ? product
            : ""
      }
      message={values ? fill(messages.contact.boxMessage, values) : undefined}
      labels={messages.contact}
    />
  );
}
