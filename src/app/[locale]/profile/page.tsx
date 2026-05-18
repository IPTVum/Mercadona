'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { User, Package, Heart, Settings, LogOut, MapPin, Loader2, Trash2, ShoppingCart, Printer, ChevronDown, ChevronUp } from 'lucide-react'
import type { Profile, Order } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { useWishlist } from '@/stores/wishlist'
import { useHasMounted } from '@/lib/useHasMounted'
import { toast } from 'sonner'
import { Link, useRouter } from '@/i18n/routing'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const hasMounted = useHasMounted()
  const tc = useTranslations('common')
  const tp = useTranslations('profile')
  const tw = useTranslations('wishlist')
  const { items: wishlistItems, removeItem } = useWishlist()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [shippingAddress, setShippingAddress] = useState<Record<string, any>>({})
  const [billingAddress, setBillingAddress] = useState<Record<string, any>>({})
  const [showShippingForm, setShowShippingForm] = useState(false)
  const [showBillingForm, setShowBillingForm] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({})
  const [siteName, setSiteName] = useState('WebStore')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const [
        { data: profileData },
        { data: ordersData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])

      if (profileData) {
        setProfile(profileData)
        setProfileForm({ fullName: profileData.full_name || '', phone: profileData.phone || '' })
        setShippingAddress(profileData.shipping_address || {})
        setBillingAddress(profileData.billing_address || {})
      }
      if (ordersData) setOrders(ordersData)

      supabase.from('settings').select('value').eq('key', 'site_name').maybeSingle()
        .then(({ data }) => { if (data?.value) setSiteName(String(data.value)) })

      setLoading(false)
    }
    fetchData()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from('profiles').update({
        full_name: profileForm.fullName,
        phone: profileForm.phone,
      }).eq('id', user.id)
      if (error) throw error
      toast.success(tp('settings.saved'))
      setProfile({ ...profile!, full_name: profileForm.fullName, phone: profileForm.phone })
    } catch {
      toast.error(tp('settings.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAddress = async (type: 'shipping' | 'billing') => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const field = type === 'shipping' ? 'shipping_address' : 'billing_address'
      const data = type === 'shipping' ? shippingAddress : billingAddress
      const { error } = await supabase.from('profiles').update({ [field]: data }).eq('id', user.id)
      if (error) throw error
      toast.success(tp('settings.saved'))
      if (type === 'shipping') setShowShippingForm(false)
      else setShowBillingForm(false)
    } catch {
      toast.error(tp('settings.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return }
    if (passwordForm.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword })
      if (error) throw error
      toast.success('Password updated!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const updateAddress = (type: 'shipping' | 'billing', field: string, value: string) => {
    if (type === 'shipping') setShippingAddress((prev) => ({ ...prev, [field]: value }))
    else setBillingAddress((prev) => ({ ...prev, [field]: value }))
  }

  const toggleOrderDetail = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
      return
    }
    setExpandedOrder(orderId)
    if (!orderItems[orderId]) {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId)
      if (data) setOrderItems((prev) => ({ ...prev, [orderId]: data }))
    }
  }

  const printInvoice = (order: Order) => {
    const w = window.open('', '_blank', 'width=800,height=900')
    if (!w) return
    const items = orderItems[order.id] || []
    const addr = order.shipping_address || {}
    w.document.write(`<!DOCTYPE html>
<html><head><title>Invoice #${order.id.slice(0, 8)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;color:#1a1a1a;padding:40px;max-width:700px;margin:0 auto}
.header{display:flex;justify-content:space-between;align-items:start;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #0284c7}
.header h1{font-size:24px;color:#0284c7}
.header .id{font-size:14px;color:#666}
.info{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px}
.info-box h3{font-size:12px;text-transform:uppercase;color:#888;margin-bottom:6px}
.info-box p{font-size:14px;line-height:1.5}
table{width:100%;border-collapse:collapse;margin:20px 0}
table th{text-align:left;font-size:12px;text-transform:uppercase;color:#888;padding:10px 8px;border-bottom:1px solid #ddd}
table td{font-size:14px;padding:10px 8px;border-bottom:1px solid #eee}
.totals{width:300px;margin-left:auto;margin-top:20px}
.totals .row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}
.totals .total{font-size:18px;font-weight:bold;border-top:2px solid #0284c7;padding-top:10px;margin-top:5px;color:#0284c7}
.footer{text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#888}
@media print{body{padding:20px}}
</style></head><body>
<div class="header"><div><h1>INVOICE</h1><p class="id">Order #${order.id.slice(0, 8)}</p></div><div style="text-align:right"><strong>${siteName}</strong><br>${new Date(order.created_at).toLocaleDateString()}</div></div>
<div class="info"><div class="info-box"><h3>Bill To</h3><p>${addr.full_name || addr.name || order.email}<br>${addr.address || ''}<br>${addr.city || ''} ${addr.state || ''} ${addr.zip_code || ''}</p></div><div class="info-box"><h3>Status</h3><p>Status: ${order.status}<br>Payment: ${order.payment_status}<br>Method: ${order.payment_method || 'N/A'}</p></div></div>
<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${items.length > 0 ? items.map((i: any) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${formatPrice(i.price)}</td><td>${formatPrice(i.price * i.quantity)}</td></tr>`).join('') : `<tr><td colspan="4">No items</td></tr>`}</tbody></table>
<div class="totals"><div class="row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div><div class="row"><span>Shipping</span><span>${order.shipping_cost ? formatPrice(order.shipping_cost) : 'Free'}</span></div>${order.tax ? `<div class="row"><span>Tax</span><span>${formatPrice(order.tax || 0)}</span></div>` : ''}${order.discount ? `<div class="row"><span>Discount</span><span>-${formatPrice(order.discount)}</span></div>` : ''}<div class="total row"><span>Total</span><span>${formatPrice(order.total)}</span></div></div>
<div class="footer">Thank you for your order! &mdash; ${siteName}</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`)
    w.document.close()
  }

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <Loader2 className="animate-spin mx-auto" size={32} />
        <p className="text-gray-500 mt-2">{tc('loading')}</p>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: tp('tabs.orders'), icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: tp('tabs.addresses'), icon: MapPin },
    { id: 'settings', label: tp('tabs.settings'), icon: Settings },
  ]

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary-600">{profile?.full_name?.[0] || profile?.email?.[0] || 'U'}</span>
              </div>
              <div>
                <p className="font-semibold">{profile?.full_name || 'User'}</p>
                <p className="text-sm text-gray-500">{profile?.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}`}>
                  <tab.icon size={20} />{tab.label}
                </button>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={20} />{tp('logout')}
              </button>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold mb-6">Profile Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">{tp('settings.fullName')}</label>
                  <input type="text" className="input" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="label">{tp('settings.email')}</label>
                  <input type="email" className="input bg-gray-50" value={profile?.email || ''} disabled readOnly />
                </div>
                <div>
                  <label className="label">{tp('settings.phone')}</label>
                  <input type="tel" className="input" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="mt-6 btn-primary disabled:opacity-50">
                {saving ? <><Loader2 className="animate-spin" size={20} /> {tp('settings.saving')}</> : tp('settings.save')}
              </button>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold mb-6">{tp('orders.title')}</h2>
              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id}>
                      <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <button
                            onClick={() => toggleOrderDetail(order.id)}
                            className="flex-1 text-left"
                          >
                            <p className="font-medium">{tp('orders.orderNumber')}{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                          </button>
                          <div className="text-right">
                            <p className="font-bold">{formatPrice(order.total)}</p>
                            <span className={`badge ${order.status === 'delivered' ? 'badge-success' : order.status === 'cancelled' ? 'badge-danger' : order.status === 'pending' ? 'badge-warning' : 'badge-info'}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => printInvoice(order)}
                              className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg"
                              title="Print Invoice"
                            >
                              <Printer size={18} />
                            </button>
                            <button
                              onClick={() => toggleOrderDetail(order.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>
                        </div>

                        {expandedOrder === order.id && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            {orderItems[order.id] ? (
                              <div>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-gray-500">
                                      <th className="pb-2">Item</th>
                                      <th className="pb-2">Qty</th>
                                      <th className="pb-2 text-right">Price</th>
                                      <th className="pb-2 text-right">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {orderItems[order.id].map((item: any) => (
                                      <tr key={item.id} className="border-t border-gray-50">
                                        <td className="py-2">{item.name}</td>
                                        <td className="py-2">{item.quantity}</td>
                                        <td className="py-2 text-right">{formatPrice(item.price)}</td>
                                        <td className="py-2 text-right font-medium">{formatPrice(item.price * item.quantity)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-gray-500">
                                    <p>Subtotal</p>
                                    <p>Shipping</p>
                                    {order.tax ? <p>Tax</p> : null}
                                    {order.discount ? <p>Discount</p> : null}
                                  </div>
                                  <div className="text-right font-medium">
                                    <p>{formatPrice(order.subtotal)}</p>
                                    <p>{order.shipping_cost ? formatPrice(order.shipping_cost) : 'Free'}</p>
                                    {order.tax ? <p>{formatPrice(order.tax)}</p> : null}
                                    {order.discount ? <p className="text-green-600">-{formatPrice(order.discount)}</p> : null}
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between font-bold">
                                  <span>{tp('orders.total')}</span>
                                  <span>{formatPrice(order.total)}</span>
                                </div>
                                {order.shipping_address && (
                                  <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                                    <p className="font-medium text-gray-700 mb-1">Shipping to:</p>
                                    <p>{(order.shipping_address as any).full_name || (order.shipping_address as any).name}</p>
                                    <p>{(order.shipping_address as any).address}</p>
                                    <p>{(order.shipping_address as any).city}, {(order.shipping_address as any).state} {(order.shipping_address as any).zip_code || (order.shipping_address as any).zip}</p>
                                  </div>
                                )}
                                {order.tracking_number && (
                                  <p className="mt-2 text-sm">
                                    <span className="text-gray-500">{tp('orders.tracking')}:</span> <span className="font-medium">{order.tracking_number}</span>
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-400 py-4 justify-center">
                                <Loader2 className="animate-spin" size={16} /> {tc('loading')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">{tp('orders.noOrders')}</p>
                  <Link href="/shop" className="mt-4 inline-block text-primary-600 hover:text-primary-700">{tp('orders.startShopping')}</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold mb-6">{tw('title')}</h2>
              {hasMounted && wishlistItems.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <ShoppingCart className="m-4 text-gray-400" size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.slug}`} className="font-medium hover:text-primary-600 truncate block">{item.name}</Link>
                        <p className="text-sm text-primary-600 font-semibold">{formatPrice(item.price)}</p>
                      </div>
                      <button onClick={() => { removeItem(item.id); toast.success('Removed from wishlist') }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">{tw('empty')}</p>
                  <Link href="/shop" className="mt-4 inline-block text-primary-600 hover:text-primary-700">{tw('browseProducts')}</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold mb-6">{tp('addresses.title')}</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium mb-3">{tp('addresses.shipping')}</h3>
                  {!showShippingForm ? (
                    shippingAddress.name ? (
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-gray-800">{shippingAddress.name}</p>
                        <p>{shippingAddress.address}</p>
                        {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                        <p>{shippingAddress.country}</p>
                        <button onClick={() => setShowShippingForm(true)} className="mt-2 text-primary-600 hover:text-primary-700 text-sm">{tp('addresses.edit')}</button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <MapPin size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500 text-sm">{tp('addresses.noAddresses')}</p>
                        <button onClick={() => setShowShippingForm(true)} className="mt-2 text-primary-600 hover:text-primary-700 text-sm">{tp('addresses.add')}</button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      <input type="text" className="input" placeholder="Full Name" value={shippingAddress.name || ''} onChange={(e) => updateAddress('shipping', 'name', e.target.value)} />
                      <input type="text" className="input" placeholder="Address" value={shippingAddress.address || ''} onChange={(e) => updateAddress('shipping', 'address', e.target.value)} />
                      <input type="text" className="input" placeholder="Apartment, suite, etc." value={shippingAddress.address2 || ''} onChange={(e) => updateAddress('shipping', 'address2', e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" className="input" placeholder="City" value={shippingAddress.city || ''} onChange={(e) => updateAddress('shipping', 'city', e.target.value)} />
                        <input type="text" className="input" placeholder="State" value={shippingAddress.state || ''} onChange={(e) => updateAddress('shipping', 'state', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" className="input" placeholder="ZIP Code" value={shippingAddress.zip || ''} onChange={(e) => updateAddress('shipping', 'zip', e.target.value)} />
                        <input type="text" className="input" placeholder="Country" value={shippingAddress.country || ''} onChange={(e) => updateAddress('shipping', 'country', e.target.value)} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveAddress('shipping')} disabled={saving} className="btn-primary text-sm disabled:opacity-50">{tc('save')}</button>
                        <button onClick={() => setShowShippingForm(false)} className="btn-outline text-sm">{tc('cancel')}</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium mb-3">{tp('addresses.billing')}</h3>
                  {!showBillingForm ? (
                    billingAddress.name ? (
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-gray-800">{billingAddress.name}</p>
                        <p>{billingAddress.address}</p>
                        {billingAddress.address2 && <p>{billingAddress.address2}</p>}
                        <p>{billingAddress.city}, {billingAddress.state} {billingAddress.zip}</p>
                        <p>{billingAddress.country}</p>
                        <button onClick={() => setShowBillingForm(true)} className="mt-2 text-primary-600 hover:text-primary-700 text-sm">{tp('addresses.edit')}</button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <MapPin size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500 text-sm">{tp('addresses.noAddresses')}</p>
                        <button onClick={() => setShowBillingForm(true)} className="mt-2 text-primary-600 hover:text-primary-700 text-sm">{tp('addresses.add')}</button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      <input type="text" className="input" placeholder="Full Name" value={billingAddress.name || ''} onChange={(e) => updateAddress('billing', 'name', e.target.value)} />
                      <input type="text" className="input" placeholder="Address" value={billingAddress.address || ''} onChange={(e) => updateAddress('billing', 'address', e.target.value)} />
                      <input type="text" className="input" placeholder="Apartment, suite, etc." value={billingAddress.address2 || ''} onChange={(e) => updateAddress('billing', 'address2', e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" className="input" placeholder="City" value={billingAddress.city || ''} onChange={(e) => updateAddress('billing', 'city', e.target.value)} />
                        <input type="text" className="input" placeholder="State" value={billingAddress.state || ''} onChange={(e) => updateAddress('billing', 'state', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" className="input" placeholder="ZIP Code" value={billingAddress.zip || ''} onChange={(e) => updateAddress('billing', 'zip', e.target.value)} />
                        <input type="text" className="input" placeholder="Country" value={billingAddress.country || ''} onChange={(e) => updateAddress('billing', 'country', e.target.value)} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveAddress('billing')} disabled={saving} className="btn-primary text-sm disabled:opacity-50">{tc('save')}</button>
                        <button onClick={() => setShowBillingForm(false)} className="btn-outline text-sm">{tc('cancel')}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold mb-6">{tp('settings.title')}</h2>
              <div className="space-y-6 max-w-md">
                <div>
                  <h3 className="font-medium mb-3">Change Password</h3>
                  <div className="space-y-3">
                    <input type="password" className="input" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                    <input type="password" className="input" placeholder="New password (min 8 chars)" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                    <input type="password" className="input" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                    <button onClick={handleChangePassword} disabled={saving} className="btn-primary disabled:opacity-50">
                      {saving ? <><Loader2 className="animate-spin" size={20} /> {tc('loading')}</> : 'Update Password'}
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                      <span>Email notifications for orders</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                      <span>Marketing emails</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
