import Link from 'next/link'
import { Home, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <p className="text-8xl font-bold text-primary-600 mb-4">404</p>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            <Home size={20} />
            Go Home
          </Link>
          <Link href="/shop" className="btn-secondary">
            <ShoppingBag size={20} />
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  )
}
