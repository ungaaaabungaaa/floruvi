import { EnquiryForm } from "./enquiry-form";
import Image from "next/image";
import kitchen from "@/src/assets/business-kitchen.png";
import delivery from "@/src/assets/delivery-greens.png";
export function EnquiryPage({
  business,
  product,
  message,
}: {
  business: boolean;
  product?: string;
  message?: string;
}) {
  return (
    <div className="page-width section enquiry-layout">
      <div className="enquiry-intro">
        <h1>
          {business
            ? "Business enquiries."
            : message
              ? "Request your box."
              : "Contact us."}
        </h1>
        <div className="enquiry-photo">
          <Image
            src={business ? kitchen : delivery}
            alt={
              business
                ? "Illustrative fresh produce arriving in a professional kitchen"
                : "Illustrative box of fresh greens"
            }
            fill
            sizes="(max-width: 800px) 100vw, 45vw"
          />
        </div>
      </div>
      <EnquiryForm
        kind={business ? "business" : "personal"}
        product={product}
        message={message}
      />
    </div>
  );
}
