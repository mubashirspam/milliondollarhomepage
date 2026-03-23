// lib/stripe.ts

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});
