import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

async function getStripeKeys(): Promise<{ secretKey: string; webhookSecret: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const limited = rateLimit(ip)
  if (limited) return limited

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  const { secretKey, webhookSecret } = await getStripeKeys()

  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret || process.env.STRIPE_WEBHOOK_SECRET!
    )
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
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            payment_id: session.id,
          })
          .eq('id', orderId)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata?.orderId

      if (orderId) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
          })
          .eq('id', orderId)
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const orderId = charge.metadata?.orderId

      if (orderId) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'refunded',
            status: 'refunded',
          })
          .eq('id', orderId)

        await supabase.from('refund_logs').insert({
          order_id: orderId,
          amount: charge.amount_refunded / 100,
          reason: 'Customer refund',
          stripe_refund_id: charge.id,
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
