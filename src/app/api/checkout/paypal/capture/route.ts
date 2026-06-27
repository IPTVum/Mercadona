import { NextRequest, NextResponse } from 'next/server'
import { createServerClientSSR } from '@/lib/supabase-server'
import { convertCurrency } from '@/lib/utils'
import { rateLimit } from '@/lib/rate-limit'

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
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const limited = rateLimit(ip)
  if (limited) return limited

  try {
    const supabase = await createServerClientSSR()

    let userId: string | null = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    } catch {
      // Guest checkout or expired session — allow if order exists
    }

    const { orderId, paypalOrderId } = await req.json()

    if (!orderId || typeof orderId !== 'string' || !paypalOrderId || typeof paypalOrderId !== 'string') {
      return NextResponse.json({ error: 'Invalid order ID or PayPal order ID' }, { status: 400 })
    }

    let orderQuery = supabase
      .from('orders')
      .select('total, currency')
      .eq('id', orderId)

    if (userId) {
      orderQuery = orderQuery.eq('user_id', userId)
    }

    const { data: order, error: orderError } = await orderQuery.single()

    if (!order || orderError) {
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

    if (!captureRes.ok || capture.status !== 'COMPLETED') {
      console.error('PayPal capture failed:', capture)
      const errorMsg = capture?.message || capture?.error_description || 'Payment capture failed'
      return NextResponse.json({ error: errorMsg, status: capture.status || 'UNKNOWN' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        payment_id: paypalOrderId,
        payment_method: 'paypal',
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order after PayPal capture:', updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json({ error: 'Failed to capture PayPal payment' }, { status: 500 })
  }
}
