import Link from 'next/link'
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react'

export default function CancelPage() {
  return (
    <div className="container-custom py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-600" size={48} />
        </div>
        <h1 className="text-3xl font-display font-bold mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          Your payment was cancelled. No charges have been made. Your cart items are still saved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/cart" className="btn-primary">
            <ShoppingCart size={20} />
            Return to Cart
          </Link>
          <Link href="/shop" className="btn-secondary">
            <ArrowLeft size={20} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
