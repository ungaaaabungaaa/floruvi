import type { Metadata } from "next";
import { EnquiryPage } from "@/components/enquiry-page";
import { getBoxRequest } from "@/lib/boxes";
export const metadata: Metadata = {
  title: "Contact the farm",
  description:
    "Ask about crops, availability, and produce for your home. No account needed.",
  alternates: { canonical: "/contact" },
};
export default async function Contact({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; box?: string; schedule?: string }>;
}) {
  const { product, box, schedule } = await searchParams;
  const request = getBoxRequest(box, schedule);
  return (
    <EnquiryPage
      business={false}
      product={
        request?.interest ?? (typeof product === "string" ? product : "")
      }
      message={request?.message}
    />
  );
}
