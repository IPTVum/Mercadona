'use client'

import { ShoppingCart, Heart, Share2, MessageCircle, Minus, Plus } from 'lucide-react'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { useHasMounted } from '@/lib/useHasMounted'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

interface ProductActionsProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    compare_price: number | null
    images: string[]
    stock: number | null
  }
  discount: number | null
  whatsappUrl: string
}

export default function ProductActions({ product, discount, whatsappUrl }: ProductActionsProps) {
  const t = useTranslations('product')
  const hasMounted = useHasMounted()
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  const inWishlist = hasMounted ? isInWishlist(product.id) : false
  const [quantity, setQuantity] = useState(1)

  const wishlistItem = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compare_price: product.compare_price,
    image: product.images?.[0] || null,
    inStock: (product.stock ?? 0) > 0,
  }

  const inStock = (product.stock ?? 0) > 0

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0] || null,
      slug: product.slug,
      stock: product.stock || 0,
    })
    toast.success(`${product.name} added to cart`)
  }

  const handleToggleWishlist = () => {
    const isNowInWishlist = isInWishlist(product.id)
    toggleItem(wishlistItem)
    toast.success(isNowInWishlist ? t('removeFromWishlist') : t('addToWishlist'))
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        url: window.location.href,
      })
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(t('linkCopied'))
      } catch {
        toast.error(t('copyLink'))
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      {inStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">{t('quantity')}:</span>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="px-5 py-2 font-medium text-center min-w-[3rem] border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex-1 btn-primary text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={20} />
          {inStock ? t('addToCart') : t('outOfStock')}
        </button>
        <button
          onClick={handleToggleWishlist}
          className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
            inWishlist
              ? 'border-red-500 text-red-500 bg-red-50'
              : 'border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600'
          }`}
          title={inWishlist ? t('removeFromWishlist') : t('addToWishlist')}
        >
          <Heart size={20} className={inWishlist ? 'fill-red-500' : ''} />
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-all duration-200"
          title={t('shareProduct')}
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* WhatsApp Order */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full btn-whatsapp justify-center gap-2 py-3 text-base"
      >
        <MessageCircle size={20} />
        {t('whatsapp')}
      </a>
    </div>
  )
}
