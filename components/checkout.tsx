"use client";
import { useRef, useState } from "react";
import Link from "@/components/i18n/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { useCart } from "./cart-store";
import { BasketSummary, EmptyBasket, useBasketReview, useLineLabels } from "./basket";
import { basketEnquiry, checkoutContact } from "@/lib/checkout";
import { formatCurrency, type CurrencyCode } from "@/lib/i18n/format";
import { markets } from "@/lib/i18n/config";
import { requestErrorMessage, validationMessage } from "@/lib/i18n/validation";
import type { Messages } from "@/lib/i18n/messages";
import { useI18n } from "./i18n/provider";
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
export function Checkout({
  labels,
  products,
}: {
  labels: Messages["checkout"];
  products: { slug: string; name: string }[];
}) {
  const cart = useCart();
  const { t, locale, fill } = useI18n();
  const lineLabels = useLineLabels();
  const market = markets[locale.market];
  const {
    review,
    error: reviewError,
    loading,
    retry,
  } = useBasketReview(cart.items);
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState(emptyDetails);
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
      setError(labels.returnToBasket);
      return;
    }
    const parsed = basketEnquiry(details, review.items, consent, website, {
      country: locale.countryNameEnglish,
      total: formatCurrency(review.total, review.currency as CurrencyCode, "en-IN", "unavailable"),
      deliveryQuoted: review.deliveryQuoted,
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
      setDetails(emptyDetails);
      cart.clear();
    } catch (error) {
      setError(error instanceof Error ? error.message : labels.notSaved);
      setStatus("idle");
    }
  }
  if (status === "success")
    return (
      <div className="page-width section checkout-received">
        <CheckCircle2 size={48} strokeWidth={1.2} />
        <h1>{labels.receivedTitle}</h1>
        <p>{labels.receivedText}</p>
        <div className="checkout-notice">{labels.noPayment}</div>
        <Link href="/products" className="button button-primary">
          {labels.keepExploring} <ArrowRight size={17} />
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
        {labels.back}
      </Link>
      <div className="checkout-heading">
        <span className="eyebrow">{labels.eyebrow}</span>
        <h1>{labels.title}</h1>
      </div>
      <ol className="checkout-progress" aria-label={labels.progress}>
        {labels.steps.map((label, index) => (
          <li key={label} aria-current={step === index ? "step" : undefined}>
            <span>{step > index ? <Check size={15} /> : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <div className="checkout-layout">
        <div className="checkout-form-panel">
          <h2 ref={heading} tabIndex={-1}>
            {labels.headings[step]}
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
                  const issue = parsed.error.issues[0];
                  setError(
                    validationMessage(
                      issue,
                      t.validation,
                      issue.path[0] === "phone" && !details.phone.trim()
                        ? "deliveryPhone"
                        : undefined,
                    ),
                  );
                  return;
                }
                move(1);
              }}
            >
              <p>{labels.intro}</p>
              <div className="checkout-fields">
                <label>
                  {labels.name}
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={details.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder={labels.namePlaceholder}
                  />
                </label>
                <label>
                  {labels.email}
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={200}
                    dir="ltr"
                    value={details.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder={labels.emailPlaceholder}
                  />
                </label>
                <label>
                  {labels.phone}
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    required
                    minLength={7}
                    maxLength={25}
                    dir="ltr"
                    value={details.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder={
                      locale.domestic
                        ? labels.phonePlaceholder
                        : `${market.dial} · ${labels.phonePlaceholder}`
                    }
                  />
                </label>
              </div>
              <button className="button button-primary" type="submit">
                {labels.continue} <ArrowRight size={17} />
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
                {locale.domestic
                  ? labels.deliveryDomestic
                  : fill(labels.deliveryExport, { country: locale.countryName })}
              </p>
              <div className="checkout-fields">
                <label>
                  {labels.address} <small>{labels.addressOptional}</small>
                  <input
                    name="address"
                    autoComplete="street-address"
                    maxLength={240}
                    value={details.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder={labels.addressPlaceholder}
                  />
                  <small>{labels.addressNote}</small>
                </label>
                <div className="checkout-field-pair">
                  <label>
                    {labels.city}
                    <input
                      name="city"
                      autoComplete="address-level2"
                      required
                      minLength={2}
                      maxLength={100}
                      value={details.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder={labels.cityPlaceholder}
                    />
                  </label>
                  <label>
                    {labels.region}
                    <input
                      name="region"
                      autoComplete="address-level1"
                      required
                      minLength={2}
                      maxLength={100}
                      value={details.region}
                      onChange={(e) => set("region", e.target.value)}
                      placeholder={labels.regionPlaceholder}
                    />
                  </label>
                </div>
                <label>
                  {labels.postal}
                  {!market.postalCode && <small> {labels.optional}</small>}
                  <input
                    name="pincode"
                    autoComplete="postal-code"
                    required={market.postalCode}
                    minLength={2}
                    maxLength={12}
                    dir="ltr"
                    value={details.pincode}
                    onChange={(e) => set("pincode", e.target.value)}
                    placeholder={labels.postalPlaceholder}
                  />
                </label>
                <label>
                  {labels.notes} <small>{labels.optional}</small>
                  <textarea
                    name="notes"
                    rows={3}
                    maxLength={800}
                    value={details.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder={labels.notesPlaceholder}
                  />
                </label>
              </div>
              <div className="checkout-notice">{labels.confirmDelivery}</div>
              <div className="button-row">
                <button
                  type="button"
                  className="text-link"
                  onClick={() => move(0)}
                >
                  <ArrowLeft size={15} />
                  {labels.backStep}
                </button>
                <button className="button button-primary" type="submit">
                  {labels.review} <ArrowRight size={17} />
                </button>
              </div>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={sendRequest}>
              <div className="review-detail">
                <div>
                  <span className="eyebrow">{labels.contact}</span>
                  <strong>{details.name}</strong>
                  <p>
                    <bdi>{details.email}</bdi>
                    <br />
                    <bdi>{details.phone}</bdi>
                  </p>
                </div>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => move(0)}
                >
                  {labels.editContact}
                </button>
              </div>
              <div className="review-detail">
                <div>
                  <span className="eyebrow">{labels.deliveryArea}</span>
                  <p>
                    {details.city}, {details.region}
                    <br />
                    {details.pincode}
                    {!locale.domestic && (
                      <>
                        <br />
                        {locale.countryName}
                      </>
                    )}
                  </p>
                </div>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => move(1)}
                >
                  {labels.editDelivery}
                </button>
              </div>
              <div className="checkout-selection">
                {review?.items.map((i) => (
                  <div key={i.slug}>
                    <span>{lineLabels.name(i.slug, products, i.name)}</span>
                    <span>× {i.quantity}</span>
                  </div>
                ))}
              </div>
              <label className="checkout-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                <span>
                  {labels.consent} <Link href="/privacy">{labels.privacy}</Link>
                </span>
              </label>
              <div className="honeypot" aria-hidden="true">
                <label>
                  {labels.honeypot}
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
                    {labels.sending}
                  </>
                ) : (
                  <>
                    {labels.send} <ArrowRight size={17} />
                  </>
                )}
              </button>
              <p className="checkout-final-note">{labels.finalNote}</p>
            </form>
          )}
        </div>
        <div>
          <BasketSummary review={review} />
          {loading && (
            <p role="status" className="checkout-notice">
              {labels.checkingBasket}
            </p>
          )}
          {reviewError && (
            <div role="alert" className="checkout-notice">
              {reviewError}
              <button className="text-link" onClick={retry}>
                {labels.tryAgain}
              </button>
            </div>
          )}
          {review?.items.some((i) => !i.availableToEnquire) && (
            <div role="alert" className="checkout-notice">
              {labels.unlisted}{" "}
              <Link href="/cart">{labels.returnToRemove}</Link>
            </div>
          )}
          <div className="checkout-photo">
            <Image
              src={delivery}
              alt={labels.photoAlt}
              fill
              sizes="(max-width:800px) 100vw, 35vw"
            />
            <span className="handwritten">{labels.handwritten}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
