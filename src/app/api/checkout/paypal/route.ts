import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSSR } from '@/lib/supabase-server'
import { convertCurrency } from '@/lib/utils'

async function getPayPalCredentials(): Promise<{ clientId: string; clientSecret: string; mode: string }> {
  const supabase = await createServerClientSSR()
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['paypal_client_id', 'paypal_secret', 'paypal_mode'])

  const map: Record<string, string> = {}
  if (data) {
    data.forEach((s: any) => { map[s.key] = String(s.value ?? '') })
  }

  return {
    clientId: map.paypal_client_id || process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: map.paypal_secret || process.env.PAYPAL_CLIENT_SECRET || '',
    mode: map.paypal_mode || process.env.PAYPAL_MODE || 'sandbox',
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClientSSR()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { orderId, paypalCurrency } = await req.json()

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const { data: order } = await supabase
      .from('orders')
      .select('total, currency')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { clientId, clientSecret, mode } = await getPayPalCredentials()

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'PayPal is not configured. Please add your PayPal credentials in admin settings.' }, { status: 400 })
    }

    const baseUrl = mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    const currency = paypalCurrency || order.currency || 'USD'

    const authRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    })
    const auth = await authRes.json()

    if (!auth.access_token) {
      console.error('PayPal auth error:', auth)
      return NextResponse.json({ error: 'PayPal authentication failed. Check your credentials in admin settings.' }, { status: 400 })
    }

    const paymentAmount = order.currency !== currency
      ? convertCurrency(Number(order.total), order.currency || 'MAD', currency)
      : String(order.total)

    const paypalRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.access_token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: String(paymentAmount),
          },
          custom_id: orderId,
        }],
      }),
    })
    const paypalOrder = await paypalRes.json()

    if (!paypalOrder.id) {
      console.error('PayPal order creation failed:', paypalOrder)
      return NextResponse.json({ error: paypalOrder.message || 'Failed to create PayPal order' }, { status: 400 })
    }

    await supabase
      .from('orders')
      .update({ payment_id: paypalOrder.id })
      .eq('id', orderId)

    return NextResponse.json({ paypalOrderId: paypalOrder.id })
  } catch (error) {
    console.error('PayPal create order error:', error)
    return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 })
  }
}
