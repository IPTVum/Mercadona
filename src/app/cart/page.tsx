'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import SafeImage from '@/components/ui/SafeImage'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MessageCircle, Tag } from 'lucide-react'
import { useCart } from '@/stores/cart'
import { formatPrice, getWhatsAppUrl, getWhatsAppMessage } from '@/lib/utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import type { Coupon } from '@/types'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTotal, setCoupon, couponCode, discount } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [freeShippingMin, setFreeShippingMin] = useState(0)
  const supabase = useMemo(() => createClient(), [])
  const subtotal = getSubtotal()
  const shippingMin = freeShippingMin || 50
  const shipping = subtotal >= shippingMin ? 0 : 5.99
  const total = getTotal() + shipping

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'free_shipping_min').maybeSingle()
      .then(({ data }) => { if (data?.value) setFreeShippingMin(Number(data.value)) })
  }, [supabase])

  const whatsappMessage = items
    .map((item) => `${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`)
    .join('\n')

  const whatsappUrl = getWhatsAppUrl(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890',
    getWhatsAppMessage('Cart Order', total)
  )

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponInput.trim().toUpperCase())
        .eq('is_active', true)
        .single()

      if (error || !data) {
        toast.error('Invalid coupon code')
        return
      }

      const coupon = data as Coupon
      const now = new Date()
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        toast.error('This coupon is not yet valid')
        return
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        toast.error('This coupon has expired')
        return
      }
      if (coupon.max_uses && coupon.used_count && coupon.used_count >= coupon.max_uses) {
        toast.error('This coupon has reached its usage limit')
        return
      }
      if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
        toast.error(`Minimum order amount of ${formatPrice(coupon.min_order_amount)} required`)
        return
      }

      const discountAmount = coupon.discount_type === 'percentage'
        ? Math.round(subtotal * coupon.discount_value) / 100
        : coupon.discount_value

      setCoupon(coupon.code, discountAmount)
      toast.success(`Coupon applied! You save ${formatPrice(discountAmount)}`)
    } catch {
      toast.error('Failed to apply coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCoupon(null, 0)
    setCouponInput('')
    toast.success('Coupon removed')
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link href="/shop" className="mt-6 inline-flex items-center gap-2 btn-primary">
          Start Shopping <ArrowRight size={20} />
        </Link>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart ({items.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product_id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image ? (
                  <SafeImage src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                  {item.name}
                </Link>
                <p className="mt-1 text-lg font-bold text-primary-600">{formatPrice(item.price)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 rounded-l-lg"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-1 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 rounded-r-lg"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-red-500 hover:text-red-700 font-medium">
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {/* Coupon Code */}
            <div className="mb-4">
              {couponCode ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-green-600" />
                    <span className="font-medium text-green-700">{couponCode}</span>
                    <span className="text-sm text-green-600">(-{formatPrice(discount)})</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-green-600 hover:text-green-800 text-sm font-medium">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label htmlFor="coupon-code" className="sr-only">Coupon code</label>
                  <input
                    id="coupon-code"
                    name="couponCode"
                    type="text"
                    placeholder="Coupon code"
                    className="input text-sm"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="btn-secondary text-sm whitespace-nowrap"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 w-full btn-primary justify-center"
            >
              Proceed to Checkout <ArrowRight size={20} />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full btn-whatsapp justify-center gap-2"
            >
              <MessageCircle size={20} />
              Order via WhatsApp
            </a>
            {subtotal < shippingMin && (
              <p className="mt-4 text-sm text-gray-500 text-center">
                Add {formatPrice(shippingMin - subtotal)} more for free shipping!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
