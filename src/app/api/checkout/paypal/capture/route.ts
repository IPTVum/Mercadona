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

    const { orderId, paypalOrderId } = await req.json()

    if (!orderId || typeof orderId !== 'string' || !paypalOrderId || typeof paypalOrderId !== 'string') {
      return NextResponse.json({ error: 'Invalid order ID or PayPal order ID' }, { status: 400 })
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
      return NextResponse.json({ error: 'PayPal is not configured' }, { status: 400 })
    }

    const baseUrl = mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    const authRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    })
    const auth = await authRes.json()

    // First, fetch the PayPal order to verify the amount
    const orderDetailsRes = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}`, {
      headers: { Authorization: `Bearer ${auth.access_token}` },
    })
    const orderDetails = await orderDetailsRes.json()

    if (orderDetails.status === 'APPROVED') {
      const purchaseUnit = orderDetails.purchase_units?.[0]
      const paypalAmount = purchaseUnit?.amount?.value
      const paypalCurrency = purchaseUnit?.amount?.currency_code

      const expectedAmount = order.currency !== (paypalCurrency || '').toUpperCase()
        ? convertCurrency(Number(order.total), order.currency || 'MAD', paypalCurrency || 'USD')
        : Number(order.total)

      if (paypalAmount && Math.abs(Number(paypalAmount) - expectedAmount) > 0.01) {
        console.error('PayPal amount mismatch:', { paypalAmount, expectedAmount })
        return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
      }
    }

    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.access_token}`,
      },
    })
    const capture = await captureRes.json()

    if (capture.status === 'COMPLETED') {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          payment_id: paypalOrderId,
        })
        .eq('id', orderId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json({ error: 'Failed to capture PayPal payment' }, { status: 500 })
  }
}
