"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { productImages } from "@/lib/product-images";
import { getCartBox } from "@/lib/boxes";
import { Botanical } from "./botanical";
import singleBox from "@/src/assets/boxes/single.webp";
import dualBox from "@/src/assets/boxes/dual.webp";
import familyBox from "@/src/assets/boxes/family.webp";
import { indiaStates, citiesForState } from "@/lib/india-locations";
import { toAsciiDigits } from "@/lib/enquiry";
import Link from "@/components/i18n/link";

import {
  ChevronDown,
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
  cartLabels,
  products,
}: {
  labels: Messages["checkout"];
  cartLabels: Pick<Messages["cart"], "headQuantity" | "packOnRequest">;
  products: {
    slug: string;
    name: string;
    description: string;
    imageUrl?: string | null;
    category: string;
    packLabel?: string;
  }[];
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
  const [cityChoice, setCityChoice] = useState("");
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
  const cities = citiesForState(details.region);
  const submissionDetails = {
    ...details,
    phone: locale.domestic ? `+91${details.phone}` : details.phone,
  };
  async function sendRequest(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle") return;
    setError("");
    if (!review || review.items.some((i) => !i.availableToEnquire)) {
      setError(labels.returnToBasket);
      return;
    }
    const parsed = basketEnquiry(
      submissionDetails,
      review.items,
      true,
      website,
      {
        country: locale.countryNameEnglish,
        total: formatCurrency(
          review.total,
          review.currency as CurrencyCode,
          "en-IN",
          "unavailable",
        ),
        deliveryQuoted: review.deliveryQuoted,
      },
    );
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
      details: submissionDetails,
      consent: true,
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
              <legend>{labels.headings[0]}</legend>
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
                    <div className="checkout-phone-input">
                      {locale.domestic && <span aria-hidden="true">+91</span>}
                      <input
                        type="tel"
                        inputMode="tel"
                        name="phone"
                        autoComplete={locale.domestic ? "tel-national" : "tel"}
                        required
                        minLength={locale.domestic ? 10 : 7}
                        maxLength={locale.domestic ? 17 : 25}
                        pattern={locale.domestic ? "[6-9][0-9]{9}" : undefined}
                        title={
                          locale.domestic ? labels.indiaPhoneHint : undefined
                        }
                        aria-describedby={
                          locale.domestic ? "checkout-phone-hint" : undefined
                        }
                        dir="ltr"
                        value={details.phone}
                        onChange={(e) => {
                          let value = toAsciiDigits(e.target.value);
                          if (locale.domestic) {
                            value = value.replace(/[^0-9]/g, "");
                            if (value.length === 12 && value.startsWith("91"))
                              value = value.slice(2);
                          }
                          set("phone", value);
                        }}
                        placeholder={
                          locale.domestic
                            ? "98765 43210"
                            : `${market.dial} · ${labels.phonePlaceholder}`
                        }
                      />
                    </div>
                    {locale.domestic && (
                      <small id="checkout-phone-hint">
                        {labels.indiaPhoneHint}
                      </small>
                    )}
                  </label>
                </div>
              </div>
            </fieldset>
            <fieldset
              disabled={status !== "idle"}
              className="checkout-details checkout-delivery-fields"
            >
              <legend>{labels.headings[1]}</legend>
              <div className="checkout-fields">
                <label>
                  <span className="checkout-field-label">{labels.address}</span>
                  <input
                    name="address"
                    autoComplete="street-address"
                    required
                    maxLength={240}
                    value={details.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder={labels.addressPlaceholder}
                  />
                </label>
                <div className="checkout-field-pair">
                  <label>
                    <span className="checkout-field-label">
                      {labels.region}
                    </span>
                    {locale.domestic ? (
                      <div className="checkout-select">
                        <select
                          name="region"
                          autoComplete="address-level1"
                          required
                          value={details.region}
                          onChange={(e) => {
                            set("region", e.target.value);
                            set("city", "");
                            setCityChoice("");
                          }}
                        >
                          <option value="" disabled>
                            {labels.regionPlaceholder}
                          </option>
                          {indiaStates.map((state) => (
                            <option key={state.code} value={state.name}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} aria-hidden="true" />
                      </div>
                    ) : (
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
                    )}
                  </label>
                  <label>
                    <span className="checkout-field-label">{labels.city}</span>
                    {locale.domestic ? (
                      <div className="checkout-select">
                        <select
                          name="city-choice"
                          autoComplete={
                            cityChoice === "other" ? "off" : "address-level2"
                          }
                          required
                          disabled={!details.region}
                          value={cityChoice}
                          onChange={(e) => {
                            setCityChoice(e.target.value);
                            set(
                              "city",
                              e.target.value === "other" ? "" : e.target.value,
                            );
                          }}
                        >
                          <option value="" disabled>
                            {details.region
                              ? labels.cityPlaceholder
                              : labels.chooseStateFirst}
                          </option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                          <option value="other">{labels.otherCity}</option>
                        </select>
                        <ChevronDown size={16} aria-hidden="true" />
                      </div>
                    ) : (
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
                    )}
                  </label>
                </div>
                {locale.domestic && cityChoice === "other" && (
                  <label>
                    {labels.customCity}
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
                )}
                <label>
                  {locale.domestic ? labels.indiaPostal : labels.postal}
                  {!market.postalCode && <small> {labels.optional}</small>}
                  <input
                    name="pincode"
                    autoComplete="postal-code"
                    required={market.postalCode}
                    inputMode={locale.domestic ? "numeric" : "text"}
                    pattern={locale.domestic ? "[1-9][0-9]{5}" : undefined}
                    minLength={locale.domestic ? 6 : 2}
                    maxLength={locale.domestic ? 6 : 12}
                    dir="ltr"
                    value={details.pincode}
                    onChange={(e) =>
                      set("pincode", toAsciiDigits(e.target.value))
                    }
                    placeholder={
                      locale.domestic ? "560001" : labels.postalPlaceholder
                    }
                  />
                </label>
              </div>
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
              <p className="checkout-privacy-note">
                {labels.submitPrivacy}{" "}
                <Link href="/privacy">{labels.privacy}</Link>
              </p>
              <p className="checkout-final-note">
                {payable ? labels.payNote : labels.finalNote}
              </p>
            </fieldset>
          </form>
        </div>
        <div className="checkout-order-summary">
          <div className="checkout-basket-heading">
            <h2>{t.basket.summary}</h2>
            <Link href="/cart" className="text-link">
              {labels.review}
            </Link>
          </div>
          <div
            className="checkout-product-list"
            role="region"
            aria-label={t.basket.summary}
            tabIndex={0}
          >
            {cart.items.map((item) => {
              const product = products.find(
                (product) => product.slug === item.slug,
              );
              const box = getCartBox(item.slug);
              const checked = review?.items.find(
                (line) => line.slug === item.slug,
              );
              const name = lineLabels.name(item.slug, products, checked?.name);
              const src = box
                ? { single: singleBox, dual: dualBox, family: familyBox }[
                    box.id
                  ]
                : product?.imageUrl || productImages[item.slug];
              return (
                <article className="checkout-product-row" key={item.slug}>
                  <Link
                    className="basket-image"
                    href={box ? "/boxes" : `/products/${item.slug}`}
                    aria-label={name}
                  >
                    {src ? (
                      <Image
                        src={src}
                        alt={name}
                        fill
                        sizes="76px"
                        unoptimized={!!product?.imageUrl}
                      />
                    ) : (
                      <Botanical category={product?.category} />
                    )}
                  </Link>
                  <div className="checkout-product-copy">
                    <Link href={box ? "/boxes" : `/products/${item.slug}`}>
                      <h3>{name}</h3>
                    </Link>
                    <p>
                      {box
                        ? `${t.boxes[box.id].people} · ${lineLabels.schedule(item.slug)}`
                        : (product?.packLabel ??
                          checked?.packLabel ??
                          cartLabels.packOnRequest)}
                    </p>
                    {product?.description && (
                      <p className="checkout-product-description">
                        {product.description.split(/(?<=[.!?])\s/)[0]}
                      </p>
                    )}
                    <span className="checkout-product-quantity">
                      {cartLabels.headQuantity}: {item.quantity}
                    </span>
                  </div>
                  <span className="checkout-product-price">
                    {checked
                      ? money(
                          checked.lineTotal,
                          review!.currency as CurrencyCode,
                        )
                      : "—"}
                  </span>
                </article>
              );
            })}
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
          {locale.domestic && (
            <a
              className="checkout-location-source"
              href="https://github.com/dr5hn/countries-states-cities-database"
              target="_blank"
              rel="noreferrer"
            >
              {labels.locationData}: CSC · ODbL
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
