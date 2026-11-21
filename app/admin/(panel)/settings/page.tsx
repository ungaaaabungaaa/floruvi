import type { Metadata } from "next";
import Link from "next/link";
import { costLabel } from "@/lib/chat";
import { setChat, setDiscounts, setPayments } from "../../actions";
import { ROUND_DOWN_STEPS_MINOR } from "@/lib/discounts";
import { SubmitButton } from "../client";
import { loadDashboard, rupees, Unavailable, when } from "../shared";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettings() {
  const data = await loadDashboard();
  if (!data) return <Unavailable />;
  const { payments, discounts } = data;
  return (
    <>
      <h1>Settings</h1>
      <p className="admin-muted">Signed in until {when(data.expiresAt)} IST.</p>

      <section aria-labelledby="chat-title" className="admin-setting">
        <div>
          <h2 id="chat-title">Website chat</h2>
          <p className="admin-muted">
            {data.chatEnabled
              ? "Visible to visitors. A change reaches them within a minute."
              : "Hidden from visitors. Switch it on to show the chat button."}
            {data.chatSpend &&
              ` This month: ${costLabel(data.chatSpend.costMicros)} of ${costLabel(data.chatSpend.budgetMicros)}, ${data.chatSpend.aiReplies} assistant replies${data.chatSpend.paused ? " (budget used up: paused)" : ""}.`}{" "}
            <Link className="admin-link" href="/admin/chats">
              Open chats →
            </Link>
          </p>
        </div>
        <form action={setChat}>
          <input type="hidden" name="enabled" value={String(!data.chatEnabled)} />
          <SubmitButton
            className={`admin-switch ${data.chatEnabled ? "on" : "off"}`}
            aria-label={`Website chat is ${data.chatEnabled ? "visible" : "hidden"}. Change.`}
          >
            {data.chatEnabled ? "Visible" : "Hidden"}
          </SubmitButton>
        </form>
      </section>

      <section aria-labelledby="payments-title" className="admin-setting">
        <div>
          <h2 id="payments-title">
            Online payment
            {payments.mode === "test" && <span className="admin-tag test">Test keys</span>}
          </h2>
          <p className="admin-muted">
            {!payments.keys
              ? "Add the Razorpay keys in Convex first. See docs/29-razorpay-payments.md."
              : payments.enabled
                ? "Customers in India pay by Razorpay at checkout. Export countries still send requests."
                : "Off. Checkout sends requests without payment."}
            {payments.keys && !payments.webhook && " The webhook secret is missing, so closed browser tabs cannot confirm payments."}
            {payments.mode === "test" && " Test keys take no real money."}
          </p>
        </div>
        <form action={setPayments}>
          <input type="hidden" name="enabled" value={String(!payments.enabled)} />
          <SubmitButton
            className={`admin-switch ${payments.enabled ? "on" : "off"}`}
            disabled={!payments.keys && !payments.enabled}
            aria-label={`Online payment is ${payments.enabled ? "on" : "off"}. Change.`}
          >
            {payments.enabled ? "On" : "Off"}
          </SubmitButton>
        </form>
      </section>

      <section aria-labelledby="discounts-title" className="admin-setting admin-discounts">
        <div>
          <h2 id="discounts-title">Automatic discounts</h2>
          <p className="admin-muted">
            For orders in India. Customers see each saving in the cart. Enter whole rupees; 0
            switches a rule off.
            {data.deliveryFeeMinor != null &&
              ` The standard delivery fee is ${rupees(data.deliveryFeeMinor)}.`}
          </p>
          {discounts ? (
            <form action={setDiscounts} className="admin-form admin-discount-form">
              <label>
                Round the order total down to
                <select name="roundDownStep" defaultValue={discounts.roundDownStepMinor / 100}>
                  {ROUND_DOWN_STEPS_MINOR.map((step) => (
                    <option key={step} value={step / 100}>
                      {step === 0 ? "Off" : `The nearest ${rupees(step)}`}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Lower delivery fee from an order value of (₹)
                <input
                  name="reducedDeliveryFrom"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100000}
                  step={1}
                  required
                  defaultValue={discounts.reducedDeliveryFromMinor / 100}
                />
              </label>
              <label>
                Lower delivery fee (₹)
                <input
                  name="reducedDeliveryFee"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100000}
                  step={1}
                  required
                  defaultValue={discounts.reducedDeliveryFeeMinor / 100}
                />
              </label>
              <label>
                Free delivery from an order value of (₹)
                <input
                  name="freeDeliveryFrom"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100000}
                  step={1}
                  required
                  defaultValue={discounts.freeDeliveryFromMinor / 100}
                />
              </label>
              <SubmitButton className="admin-button">Save discounts</SubmitButton>
            </form>
          ) : (
            <p className="admin-muted">
              Deploy the backend to change these values. Until then the starting values apply:
              total rounded down to ₹50, ₹49 delivery from ₹1,000, free delivery from ₹2,000.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
