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

test("accepts the browser host when Next.js sees an internal upstream URL", () => {
  const localRequest = new Request("http://127.0.0.1:3000/api/account/cart", {
    method: "PUT",
    headers: {
      origin: "http://10.5.0.2:3000",
      host: "10.5.0.2:3000",
    },
  });
  const nginxRequest = new Request("http://127.0.0.1:3000/api/account/cart", {
    method: "PUT",
    headers: {
      origin: "https://shop.eyebreedofficial.com",
      host: "127.0.0.1:3000",
      "x-forwarded-host": "shop.eyebreedofficial.com",
      "x-forwarded-proto": "https",
    },
  });

  assert.equal(isSameOriginMutation(localRequest), true);
  assert.equal(isSameOriginMutation(nginxRequest), true);
});

test("rejects cross-origin and missing-origin mutations", () => {
  const crossOrigin = new Request("https://eyebreed.com/api/account/profile", {
    method: "PATCH",
    headers: { origin: "https://attacker.example" },
  });
  const missingOrigin = new Request("https://eyebreed.com/api/account/profile", { method: "PATCH" });
  const forgedForwarding = new Request("http://127.0.0.1:3000/api/account/cart", {
    method: "PUT",
    headers: {
      origin: "https://attacker.example",
      host: "shop.eyebreedofficial.com",
      "x-forwarded-proto": "https",
    },
  });

  assert.equal(isSameOriginMutation(crossOrigin), false);
  assert.equal(isSameOriginMutation(missingOrigin), false);
  assert.equal(isSameOriginMutation(forgedForwarding), false);
});
