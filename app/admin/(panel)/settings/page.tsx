import type { Metadata } from "next";
import Link from "next/link";
import { costLabel } from "@/lib/chat";
import { setChat, setPayments } from "../../actions";
import { SubmitButton } from "../client";
import { loadDashboard, Unavailable, when } from "../shared";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettings() {
  const data = await loadDashboard();
  if (!data) return <Unavailable />;
  const { payments } = data;
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
    </>
  );
}
