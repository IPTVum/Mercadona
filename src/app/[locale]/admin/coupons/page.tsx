'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { createClient } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Copy, ArrowLeft, Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Coupon } from '@/types'
import { Link } from '@/i18n/routing'

export default function AdminCouponsPage() {
  const t = useTranslations('admin.coupons')
  const tc = useTranslations('common')
  return (
    <Suspense fallback={<div><h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1><div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {tc('loading')}</div></div>}>
      <CouponsContent />
    </Suspense>
  )
}

const emptyCoupon = { code: '', description: '', discount_type: 'percentage' as 'percentage' | 'fixed', discount_value: 10, min_order_amount: 0, max_uses: 0, is_active: true, starts_at: '', expires_at: '' }

function CouponsContent() {
  const t = useTranslations('admin.coupons')
  const tc = useTranslations('common')
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const editId = searchParams.get('id')

  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyCoupon)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { loadCoupons() }, [supabase])

  useEffect(() => {
    if (action === 'new') { setForm(emptyCoupon); setShowForm(true) }
    else if (action === 'edit' && editId) loadCoupon(editId)
  }, [action, editId])

  const loadCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    if (data) setCoupons(data)
    setLoading(false)
  }

  const loadCoupon = async (id: string) => {
    const { data } = await supabase.from('coupons').select('*').eq('id', id).single()
    if (data) {
      setForm({
        code: data.code,
        description: data.description || '',
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        min_order_amount: data.min_order_amount ? Number(data.min_order_amount) : 0,
        max_uses: data.max_uses || 0,
        is_active: data.is_active,
        starts_at: data.starts_at ? data.starts_at.slice(0, 16) : '',
        expires_at: data.expires_at ? data.expires_at.slice(0, 16) : '',
      })
      setShowForm(true)
    }
  }

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error(t('codeRequired')); return }
    setSaving(true)
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        is_active: form.is_active,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      }

      let error
      if (editId) {
        ;({ error } = await supabase.from('coupons').update(payload).eq('id', editId))
      } else {
        ;({ error } = await supabase.from('coupons').insert(payload))
      }

      if (error) throw error
      toast.success(editId ? t('updated') : t('created'))
      setShowForm(false)
      loadCoupons()
    } catch (err: any) {
      toast.error(err.message || t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id)
      if (error) throw error
      toast.success(t('deleted'))
      loadCoupons()
    } catch (err: any) {
      toast.error(err.message || t('deleteError'))
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(t('copiedToClipboard'))
  }

  const filtered = search ? coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()) || (c.description || '').toLowerCase().includes(search.toLowerCase())) : coupons

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1>
        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {tc('loading')}</div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl md:text-3xl font-bold">{editId ? t('editCoupon') : t('newCoupon')}</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label">{t('fields.code')} *</label>
              <input type="text" className="input font-mono uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER20" />
            </div>
            <div>
              <label className="label">{t('fields.description')}</label>
              <input type="text" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.discountType')}</label>
              <select className="input" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}>
                <option value="percentage">{t('type.percentage')}</option>
                <option value="fixed">{t('type.fixed')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('fields.discountValue')}</label>
              <input type="number" step="0.01" className="input" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">{t('fields.minOrderAmount')}</label>
              <input type="number" step="0.01" className="input" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">{t('fields.maxUses')}</label>
              <input type="number" className="input" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">{t('fields.startsAt')}</label>
              <input type="datetime-local" className="input" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.expiresAt')}</label>
              <input type="datetime-local" className="input" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <span>{tc('active')}</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? <><Loader2 className="animate-spin" size={20} /> {t('saving')}</> : <><Save size={20} /> {editId ? t('updateCoupon') : t('createCoupon')}</>}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-outline"><X size={20} /> {tc('cancel')}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
        <Link href="/admin/coupons?action=new" className="btn-primary"><Plus size={20} /> {t('createCoupon')}</Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder={t('searchPlaceholder')} className="input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.code')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.discount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('fields.minOrderAmount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.usage')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.expires')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono">{coupon.code}</code>
                      <button onClick={() => copyCode(coupon.code)} className="p-1 hover:bg-gray-200 rounded" title={t('table.code')}><Copy size={14} /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatPrice(coupon.discount_value)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">{coupon.min_order_amount ? formatPrice(coupon.min_order_amount) : tc('none')}</td>
                  <td className="px-6 py-4 text-sm">{coupon.used_count ?? 0} / {coupon.max_uses || '∞'}</td>
                  <td className="px-6 py-4 text-sm">{coupon.expires_at ? formatDate(coupon.expires_at) : t('noExpiry')}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${coupon.is_active ? 'badge-success' : 'badge-danger'}`}>{coupon.is_active ? tc('active') : tc('inactive')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/coupons?action=edit&id=${coupon.id}`} className="p-2 hover:bg-gray-100 rounded-lg"><Edit size={16} /></Link>
                      <button onClick={() => handleDelete(coupon.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">{t('noCoupons')}</p>
            <Link href="/admin/coupons?action=new" className="mt-4 inline-block text-primary-600 hover:text-primary-700">{t('addFirst')}</Link>
          </div>
        )}
      </div>
    </div>
  )
}
