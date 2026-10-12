import { Mail, Phone } from "lucide-react";
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
          <div className="contact-direct-links">
            {business.email && (
              <a href={`mailto:${business.email}`} dir="ltr">
                <Mail size={20} aria-hidden="true" />
                <span>{business.email}</span>
              </a>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone.replace(/[^\d+]/g, "")}`}
                dir="ltr"
              >
                <Phone size={20} aria-hidden="true" />
                <span>{business.phone}</span>
              </a>
            )}
          </div>
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
