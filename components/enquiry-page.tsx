import { EnquiryForm } from "./enquiry-form";
import Image from "next/image";
import portrait from "@/src/assets/contact-portrait.webp";
export function EnquiryPage({
  product,
  message,
}: {
  product?: string;
  message?: string;
}) {
  return (
    <div className="page-width section contact-page">
      <div className="contact-portrait">
        <Image
          src={portrait}
          alt="Fresh vegetables gathered in a wooden crate"
          fill
          sizes="(max-width: 800px) 100vw, 45vw"
          preload
        />
      </div>
      <EnquiryForm product={product} message={message} />
    </div>
  );
}
