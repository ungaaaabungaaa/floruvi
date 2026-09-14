import test from "node:test";
import assert from "node:assert/strict";
import { boxSizes, boxSchedules, getBoxRequest } from "../lib/boxes";
import { enquirySchema } from "../lib/enquiry";
test("all nine box choices preserve household and cadence in a valid enquiry", () => {
  for (const size of boxSizes)
    for (const schedule of boxSchedules) {
      const request = getBoxRequest(size.id, schedule.id)!;
      assert.ok(request.interest.includes(size.people));
      assert.ok(request.interest.includes(schedule.name));
      assert.equal(
        enquirySchema.safeParse({
          kind: "personal",
          name: "Test Buyer",
          business: "",
          email: "box@example.com",
          phone: "",
          city: "Test City",
          quantity: "",
          consent: true,
          website: "",
          ...request,
        }).success,
        true,
      );
    }
  assert.equal(getBoxRequest("unknown", "daily"), undefined);
  assert.equal(getBoxRequest("single", ["daily"]), undefined);
});
