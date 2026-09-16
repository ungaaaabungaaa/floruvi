"use client";
import { useState } from "react";
import Link from "@/components/i18n/link";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enquirySchema } from "@/lib/enquiry";
import { markets } from "@/lib/i18n/config";
import { requestErrorMessage, validationMessage } from "@/lib/i18n/validation";
import type { Messages } from "@/lib/i18n/messages";
import { Lines } from "./i18n/lines";
import { useI18n } from "./i18n/provider";

export function EnquiryForm({
  product = "",
  message = "",
  labels,
}: {
  product?: string;
  message?: string;
  labels: Messages["contact"];
}) {
  const { t, locale } = useI18n();
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState("");
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = enquirySchema.safeParse({
      ...data,
      kind: data.business ? "business" : "personal",
      business: data.business ?? "",
      consent: data.consent === "on",
    });
    if (!parsed.success) {
      setError(validationMessage(parsed.error.issues[0], t.validation));
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, market: locale.market }),
      });
      if (!response.ok)
        throw new Error(requestErrorMessage(response.status, t.requestErrors, t.validation));
      setStatus("success");
    } catch (error) {
      setError(error instanceof Error ? error.message : t.requestErrors.notSaved);
      setStatus("idle");
    }
  }
  if (status === "success")
    return (
      <div className="form-success" role="status">
        <Button disabled>
          <Check size={18} /> {labels.sent}
        </Button>
        <p>{labels.inTouch}</p>
      </div>
    );
  return (
    <form onSubmit={submit} className="enquiry-form">
      <div className="form-heading">
        <span className="eyebrow">{labels.eyebrow}</span>
        <h1>
          <Lines text={labels.title} />
        </h1>
        <p>{labels.intro}</p>
      </div>
      <div className="form-grid">
        <label>
          {labels.name} <span>*</span>
          <input
            name="name"
            autoComplete="name"
            placeholder={labels.namePlaceholder}
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        <label>
          {labels.business} <small>{labels.optional}</small>
          <input
            name="business"
            autoComplete="organization"
            placeholder={labels.businessPlaceholder}
            minLength={2}
            maxLength={160}
          />
        </label>
        <label>
          {labels.email} <span>*</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={labels.emailPlaceholder}
            required
            maxLength={254}
            dir="ltr"
          />
        </label>
        <label>
          {labels.phone} <small>{labels.optional}</small>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder={markets[locale.market].dial}
            maxLength={30}
            dir="ltr"
          />
        </label>
        <label>
          {labels.city} <span>*</span>
          <input
            name="city"
            autoComplete="address-level2"
            placeholder={labels.cityPlaceholder}
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        <label>
          {labels.interest}
          <input
            name="interest"
            defaultValue={product.slice(0, 160)}
            placeholder={labels.interestPlaceholder}
            maxLength={160}
          />
        </label>
        <label>
          {labels.quantity}
          <small> {labels.optional}</small>
          <input
            name="quantity"
            placeholder={labels.quantityPlaceholder}
            maxLength={100}
          />
        </label>
        <label className="full-width">
          {labels.message} <span>*</span>
          <textarea
            name="message"
            defaultValue={message}
            placeholder={labels.messagePlaceholder}
            required
            minLength={10}
            maxLength={2000}
            rows={4}
          />
        </label>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          {labels.honeypot}
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent-field">
        <input type="checkbox" name="consent" required />
        <span>
          {labels.consent} <Link href="/privacy">{labels.privacy}</Link>
        </span>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <LoaderCircle className="spinner" size={18} /> {labels.sending}
          </>
        ) : (
          <>
            {labels.send} <ArrowUpRight size={18} />
          </>
        )}
      </Button>
      <p className="form-footnote">{labels.required}</p>
    </form>
  );
}
