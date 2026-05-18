'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import PayPalCheckoutContent from './PayPalCheckoutContent'

export default function PayPalCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container-custom py-8">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="animate-spin text-primary-600 mx-auto" size={32} />
          <p className="mt-4 text-gray-600">Loading payment...</p>
        </div>
      </div>
    }>
      <PayPalCheckoutContent />
    </Suspense>
  )
}
