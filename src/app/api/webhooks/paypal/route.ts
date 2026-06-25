import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 30

async function getPayPalSettings() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['paypal_client_id', 'paypal_secret', 'paypal_mode', 'paypal_webhook_id'])

  const map: Record<string, string> = {}
  if (data) {
    data.forEach((s: any) => { map[s.key] = String(s.value ?? '') })
  }

  return {
    clientId: map.paypal_client_id || process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: map.paypal_secret || process.env.PAYPAL_CLIENT_SECRET || '',
    mode: map.paypal_mode || process.env.PAYPAL_MODE || 'sandbox',
    webhookId: map.paypal_webhook_id || process.env.PAYPAL_WEBHOOK_ID || '',
  }
}

async function verifyPayPalWebhook(
  req: NextRequest,
  body: string,
  webhookId: string,
  clientId: string,
  clientSecret: string,
  mode: string
): Promise<boolean> {
  const authAlgo = req.headers.get('paypal-auth-algo')
  const certUrl = req.headers.get('paypal-cert-url')
  const transmissionId = req.headers.get('paypal-transmission-id')
  const transmissionSig = req.headers.get('paypal-transmission-sig')
  const transmissionTime = req.headers.get('paypal-transmission-time')

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return false
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

  if (!auth.access_token) {
    console.error('PayPal webhook: auth failed')
    return false
  }

  const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.access_token}`,
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  })

  const verify = await verifyRes.json()
  return verify.verification_status === 'SUCCESS'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    const { clientId, clientSecret, mode, webhookId } = await getPayPalSettings()

    if (!webhookId) {
      console.error('PayPal webhook: webhook ID not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const isVerified = await verifyPayPalWebhook(req, body, webhookId, clientId, clientSecret, mode)

    if (!isVerified) {
      console.error('PayPal webhook: signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const event = JSON.parse(body)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const customId = event.resource?.custom_id
        const purchaseUnit = event.resource?.purchase_units?.[0]
        const orderId = customId || purchaseUnit?.payments?.captures?.[0]?.custom_id
        const paypalId = event.resource.id

        if (orderId) {
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              payment_id: paypalId,
              payment_method: 'paypal',
            })
            .eq('id', orderId)
          if (error) console.error('Failed to update order on PayPal success:', error)
        }
        break
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        const orderId = event.resource?.custom_id
          || event.resource?.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id

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

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const orderId = event.resource?.custom_id
          || event.resource?.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'refunded',
              status: 'refunded',
            })
            .eq('id', orderId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
