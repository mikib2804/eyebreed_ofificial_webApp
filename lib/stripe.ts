import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const mode = process.env.STRIPE_MODE;
  if (mode !== "test" && mode !== "live") {
    throw new Error("STRIPE_MODE must be set to test or live.");
  }
  const expectedPrefix = mode === "live" ? "sk_live_" : "sk_test_";
  if (!secretKey || !secretKey.startsWith(expectedPrefix)) {
    throw new Error(`Stripe ${mode} mode is not configured.`);
  }
  stripeClient ??= new Stripe(secretKey, { appInfo: { name: "EYEBREED", version: "0.1.0" } });
  return stripeClient;
}
