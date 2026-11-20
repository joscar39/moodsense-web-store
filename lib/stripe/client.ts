import Stripe from "stripe";

/**
 * Crea el cliente de Stripe del servidor (la clave secreta nunca llega al navegador).
 * Lanza si falta STRIPE_SECRET_KEY.
 *
 * @example
 * const session = await getStripe().checkout.sessions.create({ ... });
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set — configure it in .env.");
  }
  return new Stripe(key);
}
