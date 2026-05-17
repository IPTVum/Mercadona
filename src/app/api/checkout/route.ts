import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClientSSR } from '@/lib/supabase-server'
import { convertCurrency } from '@/lib/utils'

async function getStripeSecretKey(): Promise<string> {
  const supabase = await createServerClientSSR()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'stripe_secret_key')
    .maybeSingle()
  return (data?.value as string) || process.env.STRIPE_SECRET_KEY || ''
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClientSSR()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { orderId } = await req.json()

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: 'Order has no items' }, { status: 400 })
    }

    const orderCurrency = (order.currency || 'MAD').toLowerCase()
    const currency = 'usd'
    const needsConversion = orderCurrency !== currency
    const secretKey = await getStripeSecretKey()

    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe is not configured. Please add your Stripe secret key in admin settings.' }, { status: 400 })
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16' as any,
    })

    const lineItems = orderItems.map((item: any) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round((needsConversion ? convertCurrency(item.price, orderCurrency, currency) : item.price) * 100),
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel?order=${orderId}`,
      metadata: { orderId },
    })

    await supabase
      .from('orders')
      .update({ payment_id: session.id })
      .eq('id', orderId)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
