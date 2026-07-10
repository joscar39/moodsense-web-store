import Stripe from "stripe";

/** Server-side Stripe client. The secret key never reaches the browser. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set — configure it in .env.");
  }
  return new Stripe(key);
}
