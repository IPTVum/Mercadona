import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 30

async function getStripeKeys(): Promise<{ secretKey: string; webhookSecret: string }> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['stripe_secret_key', 'stripe_webhook_secret'])

  const map: Record<string, string> = {}
  if (data) {
    data.forEach((s: any) => { map[s.key] = String(s.value ?? '') })
  }

  return {
    secretKey: map.stripe_secret_key || process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: map.stripe_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || '',
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const { secretKey, webhookSecret } = await getStripeKeys()

  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook secret not configured' }, { status: 500 })
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId) {
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            payment_id: session.id,
            payment_method: 'stripe',
          })
          .eq('id', orderId)
        if (error) console.error('Failed to update order on Stripe success:', error)
      }
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId) {
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            status: 'cancelled',
          })
          .eq('id', orderId)
        if (error) console.error('Failed to update order on Stripe expiry:', error)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata?.orderId

      if (orderId) {
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
          })
          .eq('id', orderId)
        if (error) console.error('Failed to update order on payment failure:', error)
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const orderId = charge.metadata?.orderId

      if (orderId) {
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'refunded',
            status: 'refunded',
          })
          .eq('id', orderId)
        if (error) console.error('Failed to update order on refund:', error)

        await supabase.from('refund_logs').insert({
          order_id: orderId,
          amount: charge.amount_refunded / 100,
          reason: 'Customer refund',
          stripe_refund_id: charge.refunds?.data?.[0]?.id ?? charge.id,
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
