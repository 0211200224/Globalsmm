import "server-only";
import Stripe from "stripe";

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
};

/**
 * Lazy on purpose: constructing `new Stripe(...)` at module scope makes
 * `next build`'s page-data collection crash on any environment where
 * STRIPE_SECRET_KEY isn't set yet (it imports route modules to inspect
 * their exports without ever calling the handlers) — this defers
 * construction to the first actual request.
 */
export function getStripe(): Stripe {
  if (!globalForStripe.stripe) {
    globalForStripe.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return globalForStripe.stripe;
}
