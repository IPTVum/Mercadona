'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/lib/utils'
import { Search, Eye, ChevronDown, ChevronUp, Loader2, Printer, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import type { Order } from '@/types'

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
const PAYMENT_STATUSES = ['unpaid', 'paid', 'failed', 'refunded', 'partially_refunded']

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

const paymentColors: Record<string, string> = {
  unpaid: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
  partially_refunded: 'bg-orange-100 text-orange-700',
}

type SortField = 'created_at' | 'total' | 'status' | 'payment_status'
type SortDir = 'asc' | 'desc'

export default function AdminOrdersPage() {
  const supabase = useMemo(() => createClient(), [])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [siteName, setSiteName] = useState('WebStore')

  useEffect(() => { loadOrders() }, [supabase])

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'site_name').maybeSingle()
      .then(({ data }) => { if (data?.value) setSiteName(String(data.value)) })
  }, [supabase])

  const loadOrders = async () => {
    const { data } = await supabase.from('orders').select('*, profiles(full_name, email)').order('created_at', { ascending: false })
    if (data) setOrders(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, field: 'status' | 'payment_status', value: string) => {
    setUpdating(id)
    try {
      const { error } = await supabase.from('orders').update({ [field]: value }).eq('id', id)
      if (error) throw error
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)))
      toast.success(`${field.replace('_', ' ')} updated to ${value}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setUpdating(null)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-gray-400" />
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-primary-600" /> : <ArrowDown size={12} className="text-primary-600" />
  }

  const escHtml = (str: string | null | undefined): string => {
    if (!str) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const printInvoice = (order: Order) => {
    const w = window.open('', '_blank', 'width=800,height=900')
    if (!w) return
    const items = (order as any).items || []
    const addr = order.shipping_address || {}
    w.document.write(`
      <!DOCTYPE html>
      <html><head><title>Invoice #${escHtml(order.id.slice(0, 8))}</title>
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
      <div class="header">
        <div><h1>INVOICE</h1><p class="id">Order #${escHtml(order.id.slice(0, 8))}</p></div>
        <div style="text-align:right"><strong>${escHtml(siteName)}</strong><br>${new Date(order.created_at).toLocaleDateString()}</div>
      </div>
      <div class="info">
        <div class="info-box"><h3>Bill To</h3><p>${escHtml(addr.full_name || addr.name || order.email)}<br>${escHtml(addr.address || '')}<br>${escHtml(addr.city || '')}, ${escHtml(addr.state || '')} ${escHtml(addr.zip_code || addr.zip || '')}</p></div>
        <div class="info-box"><h3>Status</h3><p>Status: ${escHtml(order.status)}<br>Payment: ${escHtml(order.payment_status)}<br>Method: ${escHtml(order.payment_method || 'N/A')}</p></div>
      </div>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>
          ${items.length > 0 ? items.map((i: any) => `<tr><td>${escHtml(i.name)}</td><td>${i.quantity}</td><td>${formatPrice(i.price)}</td><td>${formatPrice(i.price * i.quantity)}</td></tr>`).join('') : `<tr><td colspan="4">Order items not loaded</td></tr>`}
        </tbody>
      </table>
      <div class="totals">
        <div class="row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
        <div class="row"><span>Shipping</span><span>${order.shipping_cost ? formatPrice(order.shipping_cost) : 'Free'}</span></div>
        ${order.tax ? `<div class="row"><span>Tax</span><span>${formatPrice(order.tax || 0)}</span></div>` : ''}
        ${order.discount ? `<div class="row"><span>Discount</span><span>-${formatPrice(order.discount)}</span></div>` : ''}
        <div class="total row"><span>Total</span><span>${formatPrice(order.total)}</span></div>
      </div>
      <div class="footer">Thank you for your order! &mdash; ${escHtml(siteName)}</div>
      <script>window.onload=function(){window.print()}</script>
      </body></html>`)
    w.document.close()
  }

  const filtered = [...orders]
    .filter((o) => {
      if (!search) return true
      const s = search.toLowerCase()
      return o.id.slice(0, 8).toLowerCase().includes(s) ||
        (o.email || '').toLowerCase().includes(s) ||
        ((o as any).profiles?.full_name || '').toLowerCase().includes(s)
    })
    .sort((a, b) => {
      let va: any, vb: any
      switch (sortField) {
        case 'created_at': va = new Date(a.created_at).getTime(); vb = new Date(b.created_at).getTime(); break
        case 'total': va = Number(a.total); vb = Number(b.total); break
        case 'status': va = a.status; vb = b.status; break
        case 'payment_status': va = a.payment_status; vb = b.payment_status; break
        default: return 0
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Orders</h1>
        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search by ID, email or name..." className="input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('created_at')}>
                  <span className="inline-flex items-center gap-1">Date {getSortIcon('created_at')}</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('total')}>
                  <span className="inline-flex items-center gap-1">Total {getSortIcon('total')}</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('status')}>
                  <span className="inline-flex items-center gap-1">Status {getSortIcon('status')}</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('payment_status')}>
                  <span className="inline-flex items-center gap-1">Payment {getSortIcon('payment_status')}</span>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((order) => (
                <>
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{(order as any).profiles?.full_name || 'Guest'}</p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 font-bold">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <select
                        className={`badge border-0 cursor-pointer ${statusColors[order.status] || ''}`}
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, 'status', e.target.value)}
                        disabled={updating === order.id}
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className={`badge border-0 cursor-pointer ${paymentColors[order.payment_status] || ''}`}
                        value={order.payment_status}
                        onChange={(e) => updateStatus(order.id, 'payment_status', e.target.value)}
                        disabled={updating === order.id}
                      >
                        {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => printInvoice(order)} className="p-2 hover:bg-gray-100 rounded-lg" title="Print Invoice">
                          <Printer size={16} />
                        </button>
                        <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className="p-2 hover:bg-gray-100 rounded-lg">
                          {expandedId === order.id ? <ChevronUp size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr key={`${order.id}-detail`}>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-500 mb-1">Order Details</p>
                            <p>Subtotal: {formatPrice(order.subtotal)}</p>
                            <p>Shipping: {order.shipping_cost ? formatPrice(order.shipping_cost) : 'Free'}</p>
                            <p>Tax: {order.tax ? formatPrice(order.tax) : '-'}</p>
                            <p>Discount: {order.discount ? formatPrice(order.discount) : '-'}</p>
                            <p>Payment: {order.payment_method || 'N/A'}</p>
                            {order.tracking_number && <p>Tracking: {order.tracking_number}</p>}
                          </div>
                          <div>
                            <p className="font-medium text-gray-500 mb-1">Shipping Address</p>
                            {order.shipping_address ? (
                              <div>
                                <p>{(order.shipping_address as any).full_name || (order.shipping_address as any).name}</p>
                                <p>{(order.shipping_address as any).address}</p>
                                {(order.shipping_address as any).address2 && <p>{(order.shipping_address as any).address2}</p>}
                                <p>{(order.shipping_address as any).city}, {(order.shipping_address as any).state} {(order.shipping_address as any).zip_code || (order.shipping_address as any).zip}</p>
                              </div>
                            ) : <p className="text-gray-400">No address</p>}
                          </div>
                          <div>
                            <p className="font-medium text-gray-500 mb-1">Notes</p>
                            <p>{order.notes || 'No notes'}</p>
                            {order.estimated_delivery && <p className="mt-2">Est. Delivery: {formatDate(order.estimated_delivery)}</p>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}
