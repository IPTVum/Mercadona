'use client'


import SafeImage from '@/components/ui/SafeImage'
import { ShoppingCart, Heart, Eye, MessageCircle } from 'lucide-react'
import { formatPrice, calculateDiscount, getWhatsAppUrl, getWhatsAppMessage } from '@/lib/utils'
import type { Product } from '@/types'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { useHasMounted } from '@/lib/useHasMounted'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Link } from '@/i18n/routing'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('product')
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  const discount = calculateDiscount(product.price, product.compare_price)

  const wishlistItem = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compare_price: product.compare_price,
    image: product.images?.[0] || null,
    inStock: (product.stock ?? 0) > 0,
  }

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || null,
      slug: product.slug,
      stock: product.stock || 0,
    })
    toast.success(`${product.name} added to cart`)
  }

  const handleWishlist = () => {
    toggleItem(wishlistItem)
    toast.success(isInWishlist(product.id) ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const hasMounted = useHasMounted()
  const isWishlisted = hasMounted ? isInWishlist(product.id) : false
  const inStock = (product.stock ?? 0) > 0

  return (
    <div className="group/card bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <Link href={`/product/${product.slug}`} className="block h-full" tabIndex={-1}>
          {product.images?.[0] ? (
            <SafeImage
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover/card:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
              <ShoppingCart size={32} strokeWidth={1.5} />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {discount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
              -{discount}%
            </span>
          )}
          {!product.is_active && (
            <span className="bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
              {t('outOfStock')}
            </span>
          )}
          {product.is_active && product.stock !== null && product.stock <= 5 && product.stock > 0 && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
              {t('lowStock', { count: product.stock })}
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
          title={isWishlisted ? t('removeFromWishlist') : t('addToWishlist')}
        >
          <Heart size={16} className={isWishlisted ? 'fill-white' : ''} />
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-900 shadow-lg pointer-events-auto">
            Quick View
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {product.category && (
          <p className="text-xs font-medium text-primary-600 uppercase tracking-wider mb-1">
            {product.category.name}
          </p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-medium text-gray-900 hover:text-primary-600 transition-colors duration-200 line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
          )}
        </div>
      </div>

      {/* Action buttons - outside all links */}
      <div className="px-4 pb-4 space-y-2">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
          {inStock ? t('addToCart') : t('outOfStock')}
        </button>
        <div className="flex items-center gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
          >
            <Eye size={14} />
            {t('details')}
          </Link>
          <button
            onClick={handleWishlist}
            className={`p-2 border rounded-lg transition-colors ${
              isWishlisted
                ? 'border-red-500 text-red-500 bg-red-50'
                : 'border-gray-200 text-gray-500 hover:border-red-500 hover:text-red-500'
            }`}
            title={isWishlisted ? t('removeFromWishlist') : t('addToWishlist')}
          >
            <Heart size={16} className={isWishlisted ? 'fill-red-500' : ''} />
          </button>
        </div>
        <a
          href={getWhatsAppUrl(
            process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890',
            getWhatsAppMessage(product.name, product.price)
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#25D366] hover:text-[#20BD5A] transition-colors py-1"
        >
          <MessageCircle size={14} />
          {t('whatsapp')}
        </a>
      </div>
    </div>
  )
}