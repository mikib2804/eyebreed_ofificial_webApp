import assert from "node:assert/strict";
import test from "node:test";
import { isSameOriginMutation } from "../lib/request-security";

test("accepts same-origin authenticated mutations", () => {
  const request = new Request("https://eyebreed.com/api/account/profile", {
    method: "PATCH",
    headers: { origin: "https://eyebreed.com" },
  });
  assert.equal(isSameOriginMutation(request), true);
});

test("rejects cross-origin and missing-origin mutations", () => {
  const crossOrigin = new Request("https://eyebreed.com/api/account/profile", {
    method: "PATCH",
    headers: { origin: "https://attacker.example" },
  });
  const missingOrigin = new Request("https://eyebreed.com/api/account/profile", { method: "PATCH" });

  assert.equal(isSameOriginMutation(crossOrigin), false);
  assert.equal(isSameOriginMutation(missingOrigin), false);
});
