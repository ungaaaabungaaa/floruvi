import { EnquiryForm } from "./enquiry-form";
import Image from "next/image";
import type { Messages } from "@/lib/i18n/messages";
import portrait from "@/src/assets/contact-portrait.webp";
import { business } from "@/lib/site";

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
      {(business.email || business.phone || business.address) && (
        <address className="contact-details">
          <h2>{labels.detailsTitle}</h2>
          {business.name && <strong>{business.name}</strong>}
          {business.email && (
            <p>
              {labels.detailsEmail}: <a href={`mailto:${business.email}`}>{business.email}</a>
            </p>
          )}
          {business.phone && (
            <p>
              {labels.detailsPhone}:{" "}
              <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} dir="ltr">
                {business.phone}
              </a>
            </p>
          )}
          {business.address && (
            <p>
              {labels.detailsAddress}: {business.address}
            </p>
          )}
        </address>
      )}
    </div>
  );
}
