import { EnquiryForm } from "./enquiry-form";
import Image from "next/image";
import type { Messages } from "@/lib/i18n/messages";
import portrait from "@/src/assets/contact-portrait.webp";
export function EnquiryPage({
  product,
  message,
  labels,
}: {
  product?: string;
  message?: string;
  labels: Messages["contact"];
}) {
  return (
    <div className="page-width section contact-page">
      <div className="contact-portrait">
        <Image
          src={portrait}
          alt={labels.portraitAlt}
          fill
          sizes="(max-width: 800px) 100vw, 45vw"
          preload
        />
      </div>
      <EnquiryForm product={product} message={message} labels={labels} />
    </div>
  );
}
