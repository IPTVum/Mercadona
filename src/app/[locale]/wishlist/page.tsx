'use client'

import { useTranslations } from 'next-intl'
import SafeImage from '@/components/ui/SafeImage'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { toast } from 'sonner'
import { Link } from '@/i18n/routing'

export default function WishlistPage() {
  const t = useTranslations('wishlist')
  const { addItem } = useCart()
  const { items, removeItem } = useWishlist()

  const addToCart = (item: typeof items[0]) => {
    addItem({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      slug: item.slug,
      stock: item.inStock ? 10 : 0,
    })
    removeItem(item.id)
    toast.success(`${item.name} moved to cart`)
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">{t('empty')}</h2>
        <p className="mt-2 text-gray-500">{t('emptyDesc')}</p>
        <Link href="/shop" className="mt-6 inline-flex items-center gap-2 btn-primary">
          {t('browseProducts')}
        </Link>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold mb-8">{t('title')} ({items.length} items)</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="card overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              {item.image ? (
                <SafeImage src={item.image} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
              )}
              <button
                onClick={() => { removeItem(item.id); toast.success('Removed from wishlist') }}
                className="absolute top-2 right-2 p-2 bg-white rounded-full hover:bg-red-50 text-red-500"
                aria-label="Remove from wishlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="p-4">
              <Link href={`/product/${item.slug}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                {item.name}
              </Link>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-bold text-primary-600">{formatPrice(item.price)}</span>
                {item.compare_price && item.compare_price > item.price && (
                  <span className="text-sm text-gray-500 line-through">{formatPrice(item.compare_price)}</span>
                )}
              </div>
              <p className={`mt-1 text-sm ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {item.inStock ? 'In Stock' : 'Out of Stock'}
              </p>
              <button
                onClick={() => addToCart(item)}
                disabled={!item.inStock}
                className="mt-3 w-full btn-primary text-sm disabled:opacity-50"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
