"use client";
import { useRef, useState } from "react";
import Link from "@/components/i18n/link";

import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { useCart } from "./cart-store";
import {
  BasketSummary,
  EmptyBasket,
  useBasketReview,
  useLineLabels,
} from "./basket";
import { basketEnquiry, paymentOrderRequest } from "@/lib/checkout";
import { payWithRazorpay, type PaymentOrder } from "@/lib/razorpay-checkout";
import { formatCurrency, type CurrencyCode } from "@/lib/i18n/format";
import { markets } from "@/lib/i18n/config";
import { requestErrorMessage, validationMessage } from "@/lib/i18n/validation";
import type { Messages } from "@/lib/i18n/messages";
import { useI18n } from "./i18n/provider";

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
/** An error whose message is already written for the visitor. */
class Notice extends Error {}
export function Checkout({
  labels,
  products,
}: {
  labels: Messages["checkout"];
  products: { slug: string; name: string }[];
}) {
  const cart = useCart();
  const { t, locale, fill, money } = useI18n();
  const lineLabels = useLineLabels();
  const market = markets[locale.market];
  const {
    review,
    error: reviewError,
    loading,
    refreshing,
    retry,
  } = useBasketReview(cart.items);
  const [details, setDetails] = useState(emptyDetails);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<
    | "idle"
    | "sending"
    | "success"
    | "paying"
    | "confirming"
    | "paid"
    | "unconfirmed"
  >("idle");
  const [reference, setReference] = useState("");
  // The Razorpay order for an unchanged basket & details, reused if Checkout is closed and reopened.
  const pending = useRef<{ key: string; order: PaymentOrder } | null>(null);
  const payable = !!review?.paymentEnabled;
  const set = (key: keyof typeof details, value: string) =>
    setDetails((d) => ({ ...d, [key]: value }));
  async function sendRequest(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle") return;
    setError("");
    if (!review || review.items.some((i) => !i.availableToEnquire)) {
      setError(labels.returnToBasket);
      return;
    }
    const parsed = basketEnquiry(details, review.items, consent, website, {
      country: locale.countryNameEnglish,
      total: formatCurrency(
        review.total,
        review.currency as CurrencyCode,
        "en-IN",
        "unavailable",
      ),
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
        throw new Error(
          requestErrorMessage(response.status, t.requestErrors, t.validation),
        );
      setStatus("success");
      setDetails(emptyDetails);
      cart.clear();
    } catch (error) {
      setError(error instanceof Error ? error.message : labels.notSaved);
      setStatus("idle");
    }
  }
  async function pay(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle") return;
    setError("");
    if (!review?.paymentEnabled) {
      setError(labels.returnToBasket);
      return;
    }
    const parsed = paymentOrderRequest.safeParse({
      items: cart.items,
      details,
      consent,
      website,
    });
    if (!parsed.success) {
      const [first, field] = parsed.error.issues[0].path;
      setError(
        validationMessage(
          { path: [first === "details" ? field : first] },
          t.validation,
        ),
      );
      return;
    }
    setStatus("paying");
    try {
      const key = JSON.stringify(parsed.data);
      let order = pending.current?.key === key ? pending.current.order : null;
      if (!order) {
        const response = await fetch("/api/payments/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: key,
        });
        if (response.status === 409) retry();
        if (!response.ok)
          throw new Notice(
            response.status === 409
              ? labels.basketChanged
              : response.status === 429
                ? t.requestErrors.tooMany
                : response.status === 400
                  ? t.validation.generic
                  : labels.paymentUnavailable,
          );
        order = (await response.json()) as PaymentOrder;
        pending.current = { key, order };
      }
      const result = await payWithRazorpay(order, parsed.data.details);
      if (!result) throw new Notice(labels.paymentClosed);
      setStatus("confirming");
      const confirmed = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null);
      // Razorpay reported success, so the order stands. If this check could not
      // finish, Razorpay's webhook confirms the payment on the server.
      pending.current = null;
      cart.clear();
      setReference(order.reference);
      setStatus(confirmed?.status === "paid" ? "paid" : "unconfirmed");
    } catch (error) {
      setError(
        error instanceof Notice ? error.message : labels.paymentUnavailable,
      );
      setStatus("idle");
    }
  }
  if (status === "paid" || status === "unconfirmed")
    return (
      <div className="page-width section checkout-received">
        <CheckCircle2 size={48} strokeWidth={1.2} />
        <h1>{labels.paidTitle}</h1>
        <p>
          {fill(status === "paid" ? labels.paidText : labels.confirmingText, {
            reference,
          })}
        </p>
        <Link href="/products" className="button button-primary">
          {labels.keepExploring} <ArrowRight size={17} />
        </Link>
      </div>
    );
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
        <h1>{labels.title}</h1>
      </div>
      <div className="checkout-layout checkout-single-block">
        <div className="checkout-form-panel">
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={payable ? pay : sendRequest}>
            <fieldset disabled={status !== "idle"} className="checkout-details">
              <legend>{labels.headings[1]}</legend>
              <div className="checkout-fields">
                <div className="checkout-field-pair">
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
                <label>
                  {labels.address} <small>{labels.optional}</small>
                  <input
                    name="address"
                    autoComplete="street-address"
                    maxLength={240}
                    value={details.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder={labels.addressPlaceholder}
                  />
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
              </div>
              <label className="checkout-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                <span>
                  {payable ? labels.consentPay : labels.consent}{" "}
                  <Link href="/privacy">{labels.privacy}</Link>
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
                  status !== "idle" ||
                  loading ||
                  refreshing ||
                  !!reviewError ||
                  !review ||
                  review.items.some((i) => !i.availableToEnquire)
                }
              >
                {status !== "idle" ? (
                  <>
                    <LoaderCircle className="spinner" size={17} />
                    {status === "paying"
                      ? labels.opening
                      : status === "confirming"
                        ? labels.confirming
                        : labels.sending}
                  </>
                ) : payable ? (
                  <>
                    {fill(labels.pay, { amount: money(review?.total, "INR") })}{" "}
                    <ArrowRight size={17} />
                  </>
                ) : (
                  <>
                    {labels.send} <ArrowRight size={17} />
                  </>
                )}
              </button>
              <p className="checkout-final-note">
                {payable ? labels.payNote : labels.finalNote}
              </p>
            </fieldset>
          </form>
        </div>
        <div className="checkout-order-summary">
          <div className="checkout-selection">
            {review?.items.map((item) => (
              <div key={item.slug}>
                <span>{lineLabels.name(item.slug, products, item.name)}</span>
                <span>× {item.quantity}</span>
              </div>
            ))}
          </div>
          <BasketSummary
            review={review}
            refreshing={refreshing}
            showWellness={false}
          />
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
        </div>
      </div>
    </div>
  );
}
