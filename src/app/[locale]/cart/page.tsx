'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import SafeImage from '@/components/ui/SafeImage'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MessageCircle, Tag } from 'lucide-react'
import { useCart } from '@/stores/cart'
import { formatPrice, getWhatsAppUrl, getWhatsAppMessage } from '@/lib/utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { useWhatsappNumber } from '@/lib/useWhatsappNumber'
import type { Coupon } from '@/types'
import { Link } from '@/i18n/routing'

export default function CartPage() {
  const t = useTranslations('cart')
  const locale = useLocale()
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTotal, setCoupon, couponCode, discount } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [freeShippingMin, setFreeShippingMin] = useState(0)
  const [shippingCost, setShippingCost] = useState(5.99)
  const supabase = useMemo(() => createClient(), [])
  const whatsappNumber = useWhatsappNumber()
  const subtotal = getSubtotal()
  const shippingMin = freeShippingMin || 50
  const shipping = subtotal >= shippingMin ? 0 : shippingCost
  const total = getTotal() + shipping

  useEffect(() => {
    supabase.from('settings').select('key, value').in('key', ['free_shipping_min', 'shipping_cost'])
      .then(({ data }) => {
        if (data) {
          data.forEach((s: any) => {
            if (s.key === 'free_shipping_min' && s.value) setFreeShippingMin(Number(s.value))
            if (s.key === 'shipping_cost' && s.value) setShippingCost(Number(s.value))
          })
        }
      })
  }, [supabase])

  const whatsappMessage = items
    .map((item) => `${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity, 'MAD', locale)}`)
    .join('\n')

  const whatsappUrl = getWhatsAppUrl(
    whatsappNumber || '+1234567890',
    getWhatsAppMessage('Cart Order', total, 1, locale)
  )

  const [whatsappLoading, setWhatsappLoading] = useState(false)

  const handleWhatsAppOrder = async () => {
    setWhatsappLoading(true)
    try {
      let userId: string | null = null
      try {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id || null
      } catch {}

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          email: '',
          status: 'pending',
          payment_status: 'unpaid',
          payment_method: 'whatsapp',
          subtotal,
          shipping_cost: shipping,
          tax: 0,
          discount,
          total,
          currency: 'MAD',
        })
        .select()
        .single()

      if (orderError || !order) throw orderError

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        image: item.image,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) {
        await supabase.from('orders').delete().eq('id', order.id)
        throw itemsError
      }

      const message = `New Order #${order.id.slice(0, 8)}\n\n${items.map((i) => `${i.name} x${i.quantity} - ${formatPrice(i.price * i.quantity, 'MAD', locale)}`).join('\n')}\n\nTotal: ${formatPrice(total, 'MAD', locale)}`
      const url = `https://wa.me/${(whatsappNumber || '1234567890').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
      window.open(url, '_blank')
      clearCart()
      toast.success('Order placed via WhatsApp!')
    } catch (err: any) {
      toast.error('Failed to create order. Please try again.')
    } finally {
      setWhatsappLoading(false)
    }
  }

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
        toast.error(t('couponInvalid'))
        return
      }

      const coupon = data as Coupon
      const now = new Date()
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        toast.error(t('couponInvalid'))
        return
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        toast.error(t('couponInvalid'))
        return
      }
      if (coupon.max_uses && coupon.used_count && coupon.used_count >= coupon.max_uses) {
        toast.error(t('couponInvalid'))
        return
      }
      if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
        toast.error(`${t('couponInvalid')} — ${formatPrice(coupon.min_order_amount, 'MAD', locale)} min`)
        return
      }

      const discountAmount = coupon.discount_type === 'percentage'
        ? Math.round(subtotal * coupon.discount_value) / 100
        : coupon.discount_value

      setCoupon(coupon.code, discountAmount)
      toast.success(`${t('couponApplied')} — ${formatPrice(discountAmount, 'MAD', locale)}`)
    } catch {
      toast.error(t('couponInvalid'))
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCoupon(null, 0)
    setCouponInput('')
    toast.success(t('couponRemoved'))
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">{t('empty')}</h2>
        <p className="mt-2 text-gray-500">{t('emptyDesc')}</p>
        <Link href="/shop" className="mt-6 inline-flex items-center gap-2 btn-primary">
          {t('startShopping')} <ArrowRight size={20} />
        </Link>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold mb-8">
        {t('title')} ({items.length})
      </h1>

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
                <p className="mt-1 text-lg font-bold text-primary-600">{formatPrice(item.price, 'MAD', locale)}</p>
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
                <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity, 'MAD', locale)}</p>
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
            <h2 className="text-xl font-bold mb-4">{t('orderSummary')}</h2>

            {/* Coupon Code */}
            <div className="mb-4">
              {couponCode ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-green-600" />
                    <span className="font-medium text-green-700">{couponCode}</span>
                    <span className="text-sm text-green-600">(-{formatPrice(discount, 'MAD', locale)})</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-green-600 hover:text-green-800 text-sm font-medium">
                    {t('couponRemoved')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label htmlFor="coupon-code" className="sr-only">{t('couponPlaceholder')}</label>
                  <input
                    id="coupon-code"
                    name="couponCode"
                    type="text"
                    placeholder={t('couponPlaceholder')}
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
                    {couponLoading ? t('processing') : t('couponApply')}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>{t('subtotal')}</span>
                <span>{formatPrice(subtotal, 'MAD', locale)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('shipping')}</span>
                <span>{shipping === 0 ? t('freeShipping') : formatPrice(shipping, 'MAD', locale)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('discount')}</span>
                  <span>-{formatPrice(discount, 'MAD', locale)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                <span>{t('total')}</span>
                <span>{formatPrice(total, 'MAD', locale)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 w-full btn-primary justify-center"
            >
              {t('checkout')} <ArrowRight size={20} />
            </Link>
            <button
              onClick={handleWhatsAppOrder}
              disabled={whatsappLoading}
              className="mt-3 w-full btn-whatsapp justify-center gap-2 disabled:opacity-50"
            >
              {whatsappLoading ? (
                <><span className="animate-spin">⏳</span> Creating order...</>
              ) : (
                <><MessageCircle size={20} /> {t('whatsappOrder')}</>
              )}
            </button>
            {subtotal < shippingMin && (
              <p className="mt-4 text-sm text-gray-500 text-center">
                {t('freeShippingProgress', { amount: formatPrice(shippingMin - subtotal, 'MAD', locale) })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
