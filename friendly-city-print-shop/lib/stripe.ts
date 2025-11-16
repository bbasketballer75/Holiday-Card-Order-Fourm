import Stripe from 'stripe'

const stripeSecret = process.env.STRIPE_SECRET_KEY

if (!stripeSecret) {
  // In dev, you can still mock or use test key
}

export const stripe = new Stripe(stripeSecret || '', { apiVersion: '2022-11-15' })

export default stripe
