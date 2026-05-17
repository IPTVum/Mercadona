'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { CreditCard, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, couponCode, discount, clearCart } = useCart()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'whatsapp'>('stripe')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [freeShippingMin, setFreeShippingMin] = useState(0)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    notes: '',
  })

  const subtotal = getSubtotal()
  const shippingMin = freeShippingMin || 50
  const shipping = subtotal >= shippingMin ? 0 : 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax - discount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.fullName) newErrors.fullName = 'Full name is required'
    if (!formData.phone) newErrors.phone = 'Phone is required'
    if (!formData.address) newErrors.address = 'Address is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in all required fields')
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          email: formData.email,
          status: 'pending',
          payment_status: 'unpaid',
          payment_method: paymentMethod,
          subtotal,
          shipping_cost: shipping,
          tax,
          discount,
          total,
          currency: 'MAD',
          shipping_address: {
            full_name: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            country: formData.country,
          },
          notes: formData.notes,
        })
        .select()
        .single()

      if (error) throw error

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

      if (paymentMethod === 'whatsapp') {
        const message = `New Order #${order.id.slice(0, 8)}\n\n${items.map((i) => `${i.name} x${i.quantity} - ${formatPrice(i.price * i.quantity)}`).join('\n')}\n\nTotal: ${formatPrice(total)}\n\nShipping to:\n${formData.fullName}\n${formData.address}\n${formData.city}, ${formData.state} ${formData.zipCode}`
        window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'}?text=${encodeURIComponent(message)}`, '_blank')
        clearCart()
        router.push(`/success?order=${order.id}`)
      } else if (paymentMethod === 'stripe') {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        })
        const { url } = await response.json()
        if (url) window.location.href = url
      } else if (paymentMethod === 'paypal') {
        router.push(`/checkout/paypal?order=${order.id}`)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
    supabase.from('settings').select('value').eq('key', 'free_shipping_min').maybeSingle()
      .then(({ data }) => { if (data?.value) setFreeShippingMin(Number(data.value)) })
  }, [items.length, router, supabase])

  if (items.length === 0) {
    return null
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-email" className={`label ${errors.email ? 'text-red-600' : ''}`}>Email *</label>
                <input
                  id="checkout-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="checkout-name" className={`label ${errors.fullName ? 'text-red-600' : ''}`}>Full Name *</label>
                <input
                  id="checkout-name"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  className={`input ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label htmlFor="checkout-phone" className={`label ${errors.phone ? 'text-red-600' : ''}`}>Phone *</label>
                <input
                  id="checkout-phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  className={`input ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-address" className={`label ${errors.address ? 'text-red-600' : ''}`}>Address *</label>
                <input
                  id="checkout-address"
                  name="address"
                  type="text"
                  required
                  autoComplete="street-address"
                  className={`input ${errors.address ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
              </div>
              <div>
                <label htmlFor="checkout-city" className={`label ${errors.city ? 'text-red-600' : ''}`}>City *</label>
                <input
                  id="checkout-city"
                  name="city"
                  type="text"
                  required
                  autoComplete="address-level2"
                  className={`input ${errors.city ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <label htmlFor="checkout-state" className="label">State *</label>
                <input
                  id="checkout-state"
                  name="state"
                  type="text"
                  required
                  autoComplete="address-level1"
                  className="input"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="checkout-zip" className={`label ${errors.zipCode ? 'text-red-600' : ''}`}>ZIP Code *</label>
                <input
                  id="checkout-zip"
                  name="zipCode"
                  type="text"
                  required
                  autoComplete="postal-code"
                  className={`input ${errors.zipCode ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                />
                {errors.zipCode && <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>}
              </div>
              <div>
                <label htmlFor="checkout-country" className="label">Country *</label>
                <select
                  id="checkout-country"
                  name="country"
                  className="input"
                  autoComplete="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-notes" className="label">Order Notes (Optional)</label>
                <textarea
                  id="checkout-notes"
                  name="notes"
                  className="input"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={() => setPaymentMethod('stripe')}
                  className="w-4 h-4"
                />
                <CreditCard size={20} />
                <div>
                  <p className="font-medium">Credit Card (Stripe)</p>
                  <p className="text-sm text-gray-500">Pay securely with Visa, Mastercard, etc.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                  className="w-4 h-4"
                />
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#003087">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.44-.983 5.05-4.349 6.797-8.647 6.797H9.603c-.564 0-1.04.408-1.13.964L7.076 21.337z"/>
                </svg>
                <div>
                  <p className="font-medium">PayPal</p>
                  <p className="text-sm text-gray-500">Pay with your PayPal account</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="whatsapp"
                  checked={paymentMethod === 'whatsapp'}
                  onChange={() => setPaymentMethod('whatsapp')}
                  className="w-4 h-4"
                />
                <MessageCircle size={20} className="text-green-500" />
                <div>
                  <p className="font-medium">WhatsApp Order</p>
                  <p className="text-sm text-gray-500">Send your order via WhatsApp</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} x{item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full btn-primary justify-center disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
            </button>
            <Link href="/cart" className="mt-3 w-full btn-secondary justify-center block text-center">
              Back to Cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
