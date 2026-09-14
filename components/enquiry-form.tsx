"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enquirySchema } from "@/lib/enquiry";

export function EnquiryForm({
  product = "",
  message = "",
}: {
  product?: string;
  message?: string;
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
      kind: data.business ? "business" : "personal",
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
          Your message is with the farm. We’ll use your contact details to
          reply.
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
        <span className="eyebrow">LET’S TALK</span>
        <h1>
          Good food starts
          <br />
          with a conversation.
        </h1>
        <p>
          For your home, your kitchen, or your business. Tell us what you have
          in mind.
        </p>
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
        <label>
          Business name <small>(optional)</small>
          <input
            name="business"
            autoComplete="organization"
            placeholder="Restaurant, café, store…"
            minLength={2}
            maxLength={160}
          />
        </label>
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
          Produce or box
          <input
            name="interest"
            defaultValue={product.slice(0, 160)}
            placeholder="e.g. basil, lettuce, microgreens"
            maxLength={160}
          />
        </label>
        <label>
          Quantity & frequency
          <small> (optional)</small>
          <input
            name="quantity"
            placeholder="e.g. a few packs each week"
            maxLength={100}
          />
        </label>
        <label className="full-width">
          Message <span>*</span>
          <textarea
            name="message"
            defaultValue={message}
            placeholder="Ask a question or tell us about the produce you need…"
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
      <p className="form-footnote">* Required fields.</p>
    </form>
  );
}
