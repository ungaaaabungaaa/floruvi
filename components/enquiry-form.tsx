"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enquirySchema } from "@/lib/enquiry";

export function EnquiryForm({
  kind,
  product = "",
}: {
  kind: "business" | "personal";
  product?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState("");
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = enquirySchema.safeParse({
      ...data,
      kind,
      business: data.business ?? "",
      consent: data.consent === "on",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Please try again.");
      setStatus("success");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Your request was not saved. Please try again.",
      );
      setStatus("idle");
    }
  }
  if (status === "success")
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={44} strokeWidth={1.4} />
        <span className="eyebrow">REQUEST RECEIVED</span>
        <h2>Thanks for reaching out.</h2>
        <p>
          Your enquiry is saved with Floruvi. Keep exploring while the farm
          reviews your request.
        </p>
        <p className="muted">
          This is an enquiry, not a confirmed order. No payment has been taken.
        </p>
        <Button asChild>
          <Link href="/products">
            Explore more produce <ArrowUpRight size={17} />
          </Link>
        </Button>
      </div>
    );
  return (
    <form onSubmit={submit} className="enquiry-form">
      <div className="form-heading">
        <h2>
          {kind === "business"
            ? "Tell us about your kitchen."
            : "What’s on your mind?"}
        </h2>
        <p>A few details will help us understand what you need.</p>
      </div>
      <div className="form-grid">
        <label>
          Your name <span>*</span>
          <input
            name="name"
            autoComplete="name"
            placeholder="Full name"
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        {kind === "business" && (
          <label>
            Business name <span>*</span>
            <input
              name="business"
              autoComplete="organization"
              placeholder="Restaurant, café, store…"
              required
              minLength={2}
              maxLength={160}
            />
          </label>
        )}
        <label>
          Email address <span>*</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            maxLength={254}
          />
        </label>
        <label>
          Phone number <small>(optional)</small>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder="+91"
            maxLength={30}
          />
        </label>
        <label>
          Your city <span>*</span>
          <input
            name="city"
            autoComplete="address-level2"
            placeholder="Where do you need produce?"
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        <label>
          Produce you’re interested in
          <input
            name="interest"
            defaultValue={product.slice(0, 160)}
            placeholder="e.g. basil, lettuce, microgreens"
            maxLength={160}
          />
        </label>
        <label>
          {kind === "business"
            ? "Quantity & frequency"
            : "Approximate quantity"}
          <small> (optional)</small>
          <input
            name="quantity"
            placeholder={
              kind === "business"
                ? "e.g. 5 kg of basil each week"
                : "e.g. a few packs each week"
            }
            maxLength={100}
          />
        </label>
        <label className="full-width">
          A little more detail <span>*</span>
          <textarea
            name="message"
            placeholder="Tell us about your needs, preferred timing, or any questions."
            required
            minLength={10}
            maxLength={2000}
            rows={4}
          />
        </label>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          Leave this field empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent-field">
        <input type="checkbox" name="consent" required />
        <span>
          I agree that Floruvi can use these details to respond to my enquiry.{" "}
          <Link href="/privacy">Privacy notice</Link>
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
            <LoaderCircle className="spinner" size={18} /> Sending your request…
          </>
        ) : (
          <>
            Send enquiry <ArrowUpRight size={18} />
          </>
        )}
      </Button>
      <p className="form-footnote">
        No account needed. Fields marked * are required.
      </p>
    </form>
  );
}
