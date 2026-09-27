// Razorpay Checkout in the browser. The script loads only when a visitor pays,
// so it stays out of the first page load.

export type CheckoutSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type PaymentOrder = {
  keyId: string;
  razorpayOrderId: string;
  amountMinor: number;
  currency: "INR";
  reference: string;
};

type Options = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  notes: Record<string, string>;
  theme: { color: string };
  handler: (response: CheckoutSuccess) => void;
  modal: { ondismiss: () => void; confirm_close: boolean };
};

declare global {
  interface Window {
    Razorpay?: new (options: Options) => { open(): void };
  }
}

let loading: Promise<void> | null = null;

export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Razorpay Checkout did not load"));
    };
    document.head.append(script);
  });
  return loading;
}

/** Opens Checkout. Resolves with the signed result, or null if the visitor closes it. */
export async function payWithRazorpay(
  order: PaymentOrder,
  contact: { name: string; email: string; phone: string },
) {
  await loadRazorpay();
  return new Promise<CheckoutSuccess | null>((resolve) => {
    new window.Razorpay!({
      key: order.keyId,
      order_id: order.razorpayOrderId,
      amount: order.amountMinor,
      currency: order.currency,
      name: "Floruvi",
      description: order.reference,
      prefill: { name: contact.name, email: contact.email, contact: contact.phone },
      notes: { reference: order.reference },
      theme: { color: "#294b35" },
      handler: resolve,
      modal: { ondismiss: () => resolve(null), confirm_close: true },
    }).open();
  });
}
