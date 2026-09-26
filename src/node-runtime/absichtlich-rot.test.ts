// WEGWERF-COMMIT (SEO-7 Abnahme): belegt, dass ein roter Test den Image-Bau
// verhindert. Wird sofort mit git revert zurückgenommen.
import { expect, it } from "vitest";

it("ist absichtlich rot", () => {
  expect(1).toBe(2);
});
