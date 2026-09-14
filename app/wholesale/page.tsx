import type { Metadata } from "next";
import { EnquiryPage } from "@/components/enquiry-page";
export const metadata: Metadata = {
  title: "Business enquiries",
  description:
    "Ask Floruvi about produce for restaurants, cafés, retailers, & professional kitchens.",
  alternates: { canonical: "/wholesale" },
};
export default async function Wholesale({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  return (
    <EnquiryPage
      business
      product={typeof product === "string" ? product : ""}
    />
  );
}
