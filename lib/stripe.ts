import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !secretKey.startsWith("sk_test_")) {
    throw new Error("Stripe test mode is not configured.");
  }
  stripeClient ??= new Stripe(secretKey, { appInfo: { name: "EYEBREED", version: "0.1.0" } });
  return stripeClient;
}
