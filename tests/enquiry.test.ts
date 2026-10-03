import test from "node:test";
import assert from "node:assert/strict";
import {
  enquirySchema,
  nextRate,
  RATE_WINDOW,
  toAsciiDigits,
} from "../lib/enquiry";
import { paidOrderDetails } from "../lib/checkout";
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

test("phone numbers and PIN codes typed in other scripts' digits are accepted as 0-9", () => {
  assert.equal(toAsciiDigits("+٩٧١ ٥٠ ١٢٣ ٤٥٦٧"), "+971 50 123 4567");
  assert.equal(toAsciiDigits("९८७६५४३२१०"), "9876543210");
  assert.equal(toAsciiDigits("৯৮৭৬৫"), "98765");
  assert.equal(toAsciiDigits("０９０‐１２３４"), "090‐1234");
  assert.equal(toAsciiDigits("abc 123"), "abc 123");
  const phone = enquirySchema.shape.phone.safeParse("९८७६५ ४३२१०");
  assert.equal(phone.success && phone.data, "98765 43210");
  const details = paidOrderDetails.safeParse({
    name: "Test Buyer",
    email: "buyer@example.com",
    phone: "+٩١ ٩٨٧٦٥ ٤٣٢١٠",
    address: "12 Farm Road",
    city: "Pune",
    region: "Maharashtra",
    pincode: "४११००१",
    notes: "",
  });
  assert.equal(details.success, true);
  assert.equal(details.data?.pincode, "411001");
  assert.equal(details.data?.phone, "+919876543210");
});

test("paid checkout accepts an empty email and still requires a valid phone and PIN", () => {
  const details = {
    name: "Test Buyer",
    email: "",
    phone: "+919876543210",
    address: "12 Farm Road",
    city: "Pune",
    region: "Maharashtra",
    pincode: "411001",
    notes: "",
  };
  assert.equal(paidOrderDetails.safeParse(details).success, true);
  assert.equal(
    paidOrderDetails.safeParse({ ...details, phone: "" }).success,
    false,
  );
  assert.equal(
    paidOrderDetails.safeParse({ ...details, pincode: "41100" }).success,
    false,
  );
  assert.equal(enquirySchema.safeParse({ ...valid, email: "" }).success, false);
});

test("India checkout normalises national digits and rejects invalid mobile lengths", () => {
  const base = {
    name: "Test Buyer",
    email: "",
    address: "12 Farm Road",
    city: "Pune",
    region: "Maharashtra",
    pincode: "411001",
    notes: "",
  };
  for (const phone of ["9876543210", "+91 98765 43210", "९८७६५४३२१०"]) {
    assert.equal(
      paidOrderDetails.parse({ ...base, phone }).phone,
      "+919876543210",
    );
  }
  for (const phone of [
    "987654321",
    "98765432101",
    "+44 9876543210",
    "1234567890",
  ]) {
    assert.equal(paidOrderDetails.safeParse({ ...base, phone }).success, false);
  }
});

test("paid checkout rejects missing or blank delivery addresses", () => {
  const details = {
    name: "Test Buyer",
    email: "",
    phone: "+919876543210",
    city: "Pune",
    region: "Maharashtra",
    pincode: "411001",
    notes: "",
  };
  for (const address of [undefined, "", "   "]) {
    assert.equal(
      paidOrderDetails.safeParse({ ...details, address }).success,
      false,
    );
  }
  assert.equal(
    paidOrderDetails.parse({ ...details, address: "  12 Farm Road  " }).address,
    "12 Farm Road",
  );
});
