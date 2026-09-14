import type { Metadata } from "next";
import { EnquiryPage } from "@/components/enquiry-page";
export const metadata: Metadata = {
  title: "Contact the farm",
  description:
    "Ask about crops, availability, and produce for your home. No account needed.",
  alternates: { canonical: "/contact" },
};
export default async function Contact({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  return (
    <EnquiryPage
      business={false}
      product={typeof product === "string" ? product : ""}
    />
  );
}
