import test from "node:test";
import assert from "node:assert/strict";
import { enquirySchema, nextRate, RATE_WINDOW } from "../lib/enquiry";
import { isSameOrigin } from "../lib/request-origin";

const valid = {
  kind: "business",
  name: "Sample Buyer",
  business: "Sample Kitchen",
  email: "buyer@example.com",
  phone: "+91 90000 00000",
  city: "Bengaluru",
  interest: "Basil",
  quantity: "5 kg per week",
  message: "Please confirm availability for our kitchen.",
  consent: true,
  website: "",
};
test("origin check uses the browser-facing host and rejects cross-site or absent origins", () => {
  const request = (origin: string, host = "127.0.0.1:3000") =>
    new Request("http://localhost:3000/api/enquiries", {
      headers: { origin, host },
    });
  assert.equal(isSameOrigin(request("http://127.0.0.1:3000")), true);
  assert.equal(isSameOrigin(request("http://evil.invalid")), false);
  assert.equal(isSameOrigin(request("")), false);
  assert.equal(
    isSameOrigin(
      new Request("https://floruvi.example/api/enquiries", {
        headers: {
          origin: "https://floruvi.example",
          host: "floruvi.example",
          "x-forwarded-host": "evil.invalid",
        },
      }),
    ),
    true,
  );
});
test("enquiry accepts either buyer type and normalises contact email", () => {
  assert.equal(
    enquirySchema.parse({ ...valid, email: " Buyer@EXAMPLE.com " }).email,
    "buyer@example.com",
  );
  assert.equal(
    enquirySchema.safeParse({
      ...valid,
      kind: "personal",
      business: "",
      phone: "",
    }).success,
    true,
  );
});
test("enquiry rejects missing consent, spam, malformed contacts and long payloads", () => {
  for (const patch of [
    { consent: false },
    { website: "https://spam.invalid" },
    { email: "bad" },
    { phone: "hello world" },
    { phone: "-------" },
    { message: "x".repeat(2001) },
    { name: "" },
    { city: "" },
    { business: "" },
    { kind: "admin" },
  ])
    assert.equal(
      enquirySchema.safeParse({ ...valid, ...patch }).success,
      false,
      JSON.stringify(patch),
    );
});
test("request limits block at the cap and reset at the window boundary", () => {
  const now = 10_000;
  assert.deepEqual(nextRate(null, now, 3), {
    allowed: true,
    count: 1,
    windowStart: now,
  });
  assert.equal(
    nextRate({ count: 2, windowStart: now }, now + 100, 3).allowed,
    true,
  );
  assert.equal(
    nextRate({ count: 3, windowStart: now }, now + RATE_WINDOW - 1, 3).allowed,
    false,
  );
  assert.deepEqual(
    nextRate({ count: 3, windowStart: now }, now + RATE_WINDOW, 3),
    { allowed: true, count: 1, windowStart: now + RATE_WINDOW },
  );
});
