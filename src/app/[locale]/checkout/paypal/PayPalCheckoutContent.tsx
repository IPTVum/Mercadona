'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getClientCurrency, getPayPalCurrency } from '@/lib/utils'
import { useRouter } from '@/i18n/routing'

export default function PayPalCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [paypalClientId, setPaypalClientId] = useState('')
  const paypalRef = useRef<HTMLDivElement>(null)
  const clientCurrency = getClientCurrency()
  const paypalCurrency = getPayPalCurrency(clientCurrency)

  useEffect(() => {
    if (!orderId) {
      router.push('/checkout')
      return
    }

    const supabase = createClient()
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'paypal_client_id')
      .maybeSingle()
      .then(({ data }) => {
        const id = (data?.value as string) || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''
        setPaypalClientId(id)
        if (!id) {
          setLoading(false)
          setError('PayPal is not configured. Add your PayPal Client ID in Settings > Payments.')
        }
      }, () => {
        setLoading(false)
        setError('Failed to load PayPal configuration.')
      })
  }, [orderId, router])

  useEffect(() => {
    if (!orderId || !paypalClientId) return

    let scriptLoaded = false

    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=${paypalCurrency}`
    script.async = true

    script.onload = () => {
      scriptLoaded = true
      setLoading(false)
      if ((window as any).paypal && paypalRef.current) {
        (window as any).paypal.Buttons({
          createOrder: async () => {
            const res = await fetch('/api/checkout/paypal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, paypalCurrency }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            return data.paypalOrderId
          },
          onApprove: async (data: any) => {
            await fetch('/api/checkout/paypal/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, paypalOrderId: data.orderID }),
            })
            router.push(`/success?order=${orderId}`)
          },
          onError: () => {
            setError('Payment failed. Please try again or use another payment method.')
          },
          onCancel: () => {
            setError('Payment was cancelled.')
          },
        }).render(paypalRef.current)
      }
    }

    script.onerror = () => {
      setLoading(false)
      setError('PayPal failed to load. Please check your PayPal configuration in admin settings or try another payment method.')
    }

    document.body.appendChild(script)

    const timeout = setTimeout(() => {
      if (!scriptLoaded) {
        setLoading(false)
        setError('PayPal is taking too long to load. Please verify your PayPal Client ID in the admin panel.')
      }
    }, 15000)

    return () => {
      clearTimeout(timeout)
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [orderId, router, paypalCurrency, paypalClientId])

  if (!orderId) return null

  return (
    <div className="container-custom py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Pay with PayPal</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Payment Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          {loading && (
            <div className="flex items-center justify-center gap-3 mb-4 text-gray-500">
              <Loader2 className="animate-spin text-primary-600" size={24} />
              <span>Loading PayPal payment form...</span>
            </div>
          )}

          {paypalCurrency !== clientCurrency && !error && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
              PayPal does not support {clientCurrency}. Your payment of will be converted from {clientCurrency} to {paypalCurrency} at the current exchange rate.
            </p>
          )}

          <div ref={paypalRef} />
        </div>

        <button
          onClick={() => router.push('/checkout')}
          className="mt-4 w-full btn-secondary"
        >
          Back to Checkout
        </button>
      </div>
    </div>
  )
}
