"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Mail,
  Smartphone,
  LockKeyhole,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { useCart } from "./cart-store";
import { BasketSummary, EmptyBasket, useBasketReview } from "./basket";
import { basketEnquiry, checkoutContact } from "@/lib/checkout";
import delivery from "@/src/assets/delivery-greens.png";
const emptyDetails = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  pincode: "",
  notes: "",
};
export function Checkout() {
  const cart = useCart();
  const {
    review,
    error: reviewError,
    loading,
    retry,
  } = useBasketReview(cart.items);
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState(emptyDetails);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const heading = useRef<HTMLHeadingElement>(null);
  const set = (key: keyof typeof details, value: string) =>
    setDetails((d) => ({ ...d, [key]: value }));
  const move = (next: number) => {
    setStep(next);
    setError("");
    requestAnimationFrame(() => heading.current?.focus());
  };
  async function sendRequest(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setError("");
    if (!review || review.items.some((i) => !i.availableToEnquire)) {
      setError("Please return to your basket & check the selected crops.");
      return;
    }
    const parsed = basketEnquiry(details, review.items, consent, website);
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
      if (!response.ok)
        throw new Error(result.error || "Your request was not saved.");
      setStatus("success");
      setDetails(emptyDetails);
      cart.clear();
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
      <div className="page-width section checkout-received">
        <CheckCircle2 size={48} strokeWidth={1.2} />
        <h1>Request received.</h1>
        <p>We’ve saved your request. We’ll confirm availability.</p>
        <div className="checkout-notice">
          This is an availability request. No order, account, or payment has
          been created.
        </div>
        <Link href="/products" className="button button-primary">
          Keep Exploring <ArrowRight size={17} />
        </Link>
      </div>
    );
  if (!cart.items.length)
    return (
      <div className="page-width section">
        <EmptyBasket />
      </div>
    );
  return (
    <div className="page-width section checkout-page">
      <Link className="text-link" href="/cart">
        <ArrowLeft size={15} />
        Back to basket
      </Link>
      <div className="checkout-heading">
        <span className="eyebrow">FRESHNESS WORTH GROWING</span>
        <h1>Checkout.</h1>
      </div>
      <ol className="checkout-progress" aria-label="Checkout progress">
        {["Your details", "Delivery", "Review & checkout"].map(
          (label, index) => (
            <li key={label} aria-current={step === index ? "step" : undefined}>
              <span>{step > index ? <Check size={15} /> : index + 1}</span>
              {label}
            </li>
          ),
        )}
      </ol>
      <div className="checkout-layout">
        <div className="checkout-form-panel">
          <h2 ref={heading} tabIndex={-1}>
            {["Your details", "Delivery area", "Review"][step]}
          </h2>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {step === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const parsed = checkoutContact.safeParse(details);
                if (!parsed.success) {
                  setError(parsed.error.issues[0].message);
                  return;
                }
                move(1);
              }}
            >
              <p>Browse & build your basket without an account.</p>
              <div className="checkout-fields">
                <label>
                  Full name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={details.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Your full name"
                  />
                </label>
                <label>
                  Email address
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={200}
                    value={details.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                  <small>
                    We use this address to reply to your availability request.
                  </small>
                </label>
                <label>
                  Delivery phone
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    required
                    minLength={7}
                    maxLength={25}
                    value={details.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="Phone number with country code"
                  />
                </label>
              </div>
              <button className="button button-primary" type="submit">
                Continue to Delivery <ArrowRight size={17} />
              </button>
            </form>
          )}
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                move(2);
              }}
            >
              <p>
                We deliver across India.
              </p>
              <div className="checkout-fields">
                <label>
                  Address <small>Optional at the enquiry stage</small>
                  <input
                    name="address"
                    autoComplete="street-address"
                    maxLength={240}
                    value={details.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="House, street, & area"
                  />
                  <small>
                    Your street address stays in this page & is not sent with
                    this enquiry.
                  </small>
                </label>
                <div className="checkout-field-pair">
                  <label>
                    City
                    <input
                      name="city"
                      autoComplete="address-level2"
                      required
                      minLength={2}
                      maxLength={100}
                      value={details.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="City"
                    />
                  </label>
                  <label>
                    State / region
                    <input
                      name="region"
                      autoComplete="address-level1"
                      required
                      minLength={2}
                      maxLength={100}
                      value={details.region}
                      onChange={(e) => set("region", e.target.value)}
                      placeholder="State or region"
                    />
                  </label>
                </div>
                <label>
                  Postal code
                  <input
                    name="pincode"
                    autoComplete="postal-code"
                    required
                    minLength={2}
                    maxLength={12}
                    value={details.pincode}
                    onChange={(e) => set("pincode", e.target.value)}
                    placeholder="Postal code"
                  />
                </label>
                <label>
                  Anything we should know? <small>Optional</small>
                  <textarea
                    name="notes"
                    rows={3}
                    maxLength={800}
                    value={details.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Preferred delivery days, quantity notes, or questions"
                  />
                </label>
              </div>
              <div className="checkout-notice">
                Delivery dates, fees, & minimum orders will be confirmed with
                the farm.
              </div>
              <div className="button-row">
                <button
                  type="button"
                  className="text-link"
                  onClick={() => move(0)}
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
                <button className="button button-primary" type="submit">
                  Review My Basket <ArrowRight size={17} />
                </button>
              </div>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={sendRequest}>
              <div className="review-detail">
                <div>
                  <span className="eyebrow">CONTACT</span>
                  <strong>{details.name}</strong>
                  <p>
                    {details.email}
                    <br />
                    {details.phone}
                  </p>
                </div>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => move(0)}
                >
                  Edit contact
                </button>
              </div>
              <div className="review-detail">
                <div>
                  <span className="eyebrow">DELIVERY AREA</span>
                  <p>
                    {details.city}, {details.region}
                    <br />
                    {details.pincode}
                  </p>
                </div>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => move(1)}
                >
                  Edit delivery
                </button>
              </div>
              <div className="checkout-selection">
                {review?.items.map((i) => (
                  <div key={i.slug}>
                    <span>{i.name}</span>
                    <span>× {i.quantity}</span>
                  </div>
                ))}
              </div>
              <fieldset className="verification-choice">
                <legend>
                  <LockKeyhole size={18} />
                  Account verification at payment
                </legend>
                <p>
                  When ordering opens, choose one code method at this final
                  step. Verifying a code will create or open your account.
                </p>
                <div>
                  {(["email", "phone"] as const).map((value) => (
                    <label
                      key={value}
                      className={method === value ? "selected" : ""}
                    >
                      <input
                        type="radio"
                        name="verification"
                        checked={method === value}
                        onChange={() => setMethod(value)}
                      />
                      {value === "email" ? (
                        <Mail size={20} />
                      ) : (
                        <Smartphone size={20} />
                      )}
                      <span>
                        {value === "email" ? "Email code" : "Phone code"}
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="button button-outline"
                  disabled
                >
                  Send {method === "email" ? "Email" : "Phone"} Code
                </button>
                <small>
                  Code delivery is not active yet. No account is created for an
                  enquiry.
                </small>
              </fieldset>
              <div className="payment-preview">
                <span className="eyebrow">PAYMENT</span>
                <h3>Pay securely with Razorpay</h3>
                <p>Online payment is not active yet.</p>
                <button
                  type="button"
                  className="button button-primary"
                  disabled
                >
                  <LockKeyhole size={16} />
                  Payment not yet available
                </button>
              </div>
              <label className="checkout-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                <span>
                  I agree that Floruvi can use my contact details & delivery
                  area to respond to this availability request.{" "}
                  <Link href="/privacy">Privacy notice</Link>
                </span>
              </label>
              <div className="honeypot" aria-hidden="true">
                <label>
                  Website
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </label>
              </div>
              <button
                className="button button-primary"
                type="submit"
                disabled={
                  status === "sending" ||
                  loading ||
                  !!reviewError ||
                  !review ||
                  review.items.some((i) => !i.availableToEnquire)
                }
              >
                {status === "sending" ? (
                  <>
                    <LoaderCircle className="spinner" size={17} />
                    Sending Request…
                  </>
                ) : (
                  <>
                    Request Availability <ArrowRight size={17} />
                  </>
                )}
              </button>
              <p className="checkout-final-note">
                This sends an enquiry. It does not place or charge an order.
              </p>
            </form>
          )}
        </div>
        <div>
          <BasketSummary review={review} />
          {loading && (
            <p role="status" className="checkout-notice">
              Checking your basket…
            </p>
          )}
          {reviewError && (
            <div role="alert" className="checkout-notice">
              {reviewError}
              <button className="text-link" onClick={retry}>
                Try again
              </button>
            </div>
          )}
          {review?.items.some((i) => !i.availableToEnquire) && (
            <div role="alert" className="checkout-notice">
              A crop is no longer listed.{" "}
              <Link href="/cart">Return to the basket to remove it.</Link>
            </div>
          )}
          <div className="checkout-photo">
            <Image
              src={delivery}
              alt="box of fresh produce"
              fill
              sizes="(max-width:800px) 100vw, 35vw"
            />
            <span className="handwritten">Freshness worth growing.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
