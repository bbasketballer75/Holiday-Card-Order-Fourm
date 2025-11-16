import { NextRequest } from 'next/server'
import Stripe from 'stripe'

const stripeSecret = process.env.STRIPE_SECRET_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' })

    const line_items = body.items || [{ price_data: { currency: 'usd', product_data: { name: 'Holiday Card' }, unit_amount: 150 }, quantity: 1 }]

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/cancel`,
    })

    return new Response(JSON.stringify({ id: session.id }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500 })
  }
}
