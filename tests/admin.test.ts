import test from "node:test";
import assert from "node:assert/strict";
import {
  adminLoginSchema,
  hashAdminCredentials,
  verifyAdminCredentials,
} from "../lib/admin-credentials";
import { renewedSession } from "../lib/admin-session";
import { orderAlert } from "../lib/order-notification";
import { reviewBasket } from "../lib/pricing";

const owner = {
  email: "owner@example.com",
  aadhaar: "123456789012",
  dob: "2001-01-01",
  phone: "9876543210",
  password: "a long test passphrase",
};
const parse = (value: object) => adminLoginSchema.parse(value);

test("sign-in details normalise spacing, case and the +91 prefix before hashing", () => {
  assert.deepEqual(
    parse({ ...owner, email: " Owner@Example.COM ", aadhaar: "1234 5678 9012", phone: "+91 98765-43210" }),
    parse(owner),
  );
  for (const bad of [
    { aadhaar: "12345678901" },
    { aadhaar: "1234567890123" },
    { phone: "98765" },
    { dob: "01-01-2001" },
    { email: "not-an-email" },
    { password: "" },
  ])
    assert.equal(adminLoginSchema.safeParse({ ...owner, ...bad }).success, false, JSON.stringify(bad));
});

test("the combined hash accepts only all five matching details", async () => {
  const stored = await hashAdminCredentials(parse(owner));
  assert.match(stored, /^scrypt\$131072\$8\$1\$[\w-]{22}\$[\w-]{43}$/);
  assert.equal(await verifyAdminCredentials(parse(owner), stored), true);
  for (const change of [
    { email: "other@example.com" },
    { aadhaar: "123456789013" },
    { dob: "2001-01-02" },
    { phone: "9876543211" },
    { password: "a long test passphrasf" },
  ])
    assert.equal(await verifyAdminCredentials(parse({ ...owner, ...change }), stored), false);
  // Same details, new salt: hashes differ but both verify.
  const again = await hashAdminCredentials(parse(owner));
  assert.notEqual(again, stored);
  assert.equal(await verifyAdminCredentials(parse(owner), again), true);
});

test("malformed, tampered or weakened hashes never verify", async () => {
  const stored = await hashAdminCredentials(parse(owner));
  const parts = stored.split("$");
  const tampered = [...parts.slice(0, 5), `${parts[5].slice(0, -2)}AA`].join("$");
  for (const bad of [
    "",
    "plain-text-password",
    tampered,
    stored.replace("scrypt$131072", "scrypt$1024"),
    stored.replace("scrypt$", "bcrypt$"),
    `${stored}$extra`,
  ])
    assert.equal(await verifyAdminCredentials(parse(owner), bad), false, bad.slice(0, 20));
});

test("owner alerts escape customer text for Telegram and stay under its limit", () => {
  const alert = orderAlert(
    {
      kind: "personal",
      name: "Asha <script>",
      business: "",
      email: "asha@example.com",
      phone: "+91 98765 43210",
      city: "Pune, India",
      interest: "Basket availability: 2 crops",
      quantity: "3 requested units across 2 crops",
      message: `Basket availability request:\nSpinach × 2\n${"<&>".repeat(3000)}`,
      receivedAt: Date.UTC(2026, 8, 28, 4, 30),
    },
    "https://floruvi.vercel.app/admin",
  );
  assert.match(alert, /^<b>New order request<\/b>/);
  assert.ok(alert.length <= 4096);
  assert.doesNotMatch(alert, /<script>|<&>/);
  assert.match(alert, /Asha &lt;script&gt;/);
  assert.doesNotMatch(alert, /&[a-z]*…/, "never cut inside an entity");
  assert.match(alert, /Received 28 Sept 2026, 10:00 am IST|Received 28 Sep 2026, 10:00 am IST/i);
  assert.match(alert, /<a href="https:\/\/floruvi\.vercel\.app\/admin">Open the admin panel<\/a>/);
});

test("out-of-stock products cannot be requested; boxes and older records stay available", () => {
  const products = [
    { slug: "spinach", name: "Spinach", price: { amountMinor: 10500, currency: "INR", packLabel: "250 g" }, inStock: false },
    { slug: "mint", name: "Mint", price: { amountMinor: 5000, currency: "INR", packLabel: "1 bunch" } },
  ];
  const review = reviewBasket(
    [
      { slug: "spinach", quantity: 1 },
      { slug: "mint", quantity: 1 },
    ],
    products,
    { currency: "INR", deliveryFeeMinor: 9900 },
  );
  const [spinach, mint] = review.items;
  assert.equal(spinach.availableToEnquire, false);
  assert.equal(spinach.outOfStock, true);
  assert.equal(mint.availableToEnquire, true);
  assert.equal(mint.outOfStock, false);
});

const H = 60 * 60 * 1000;
const D = 24 * H;

test("an admin session in use moves its end a full period ahead, at most once an hour", () => {
  const signIn = 0;
  const remembered = { createdAt: signIn, expiresAt: signIn + 14 * D, remembered: true };
  // Used 3 days later: 14 days from now again.
  assert.deepEqual(renewedSession(remembered, 3 * D), {
    remembered: true,
    expiresAt: 17 * D,
    maxAgeSeconds: 14 * 24 * 60 * 60,
  });
  // Used again 10 minutes after a renewal: nothing to write.
  assert.equal(renewedSession({ ...remembered, expiresAt: 17 * D }, 3 * D + 10 * 60 * 1000), null);
  // A browser-only session slides by 12 hours, never by 14 days.
  const browser = { createdAt: signIn, expiresAt: signIn + 12 * H, remembered: false };
  assert.equal(renewedSession(browser, 5 * H)?.expiresAt, 17 * H);
  // Sessions from before the flag existed are told apart by their length.
  assert.equal(renewedSession({ createdAt: 0, expiresAt: 14 * D }, 2 * D)?.remembered, true);
  assert.equal(renewedSession({ createdAt: 0, expiresAt: 12 * H }, 2 * H)?.remembered, false);
});

test("an admin session never outlives 90 days after sign-in, and an ended one is not renewed", () => {
  const late = { createdAt: 0, expiresAt: 85 * D, remembered: true };
  assert.equal(renewedSession(late, 80 * D)?.expiresAt, 90 * D);
  assert.equal(renewedSession({ ...late, expiresAt: 90 * D }, 89 * D), null);
  assert.equal(renewedSession({ createdAt: 0, expiresAt: 14 * D, remembered: true }, 15 * D), null);
});
