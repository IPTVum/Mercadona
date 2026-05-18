'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { createClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, ArrowLeft, Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/types'
import { Link } from '@/i18n/routing'

export default function AdminCategoriesPage() {
  const t = useTranslations('admin.categories')
  const tc = useTranslations('common')
  return (
    <Suspense fallback={<div><h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1><div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {tc('loading')}</div></div>}>
      <CategoriesContent />
    </Suspense>
  )
}

const emptyCategory = { name: '', slug: '', description: '', image: '', parent_id: '', is_active: true, sort_order: 0 }

function CategoriesContent() {
  const t = useTranslations('admin.categories')
  const tc = useTranslations('common')
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const editId = searchParams.get('id')

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyCategory)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { loadCategories() }, [supabase])

  useEffect(() => {
    if (action === 'new') { setForm(emptyCategory); setShowForm(true) }
    else if (action === 'edit' && editId) loadCategory(editId)
  }, [action, editId])

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*, parent:parent_id(name)').order('sort_order')
    if (data) setCategories(data)
    setLoading(false)
  }

  const loadCategory = async (id: string) => {
    const { data } = await supabase.from('categories').select('*').eq('id', id).single()
    if (data) {
      setForm({
        name: data.name, slug: data.slug, description: data.description || '',
        image: data.image || '', parent_id: data.parent_id || '', is_active: data.is_active,
        sort_order: data.sort_order ?? 0,
      })
      setShowForm(true)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(t('nameRequired')); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || null,
        image: form.image || null,
        parent_id: form.parent_id || null,
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
      }

      let error
      if (editId) {
        ;({ error } = await supabase.from('categories').update(payload).eq('id', editId))
      } else {
        ;({ error } = await supabase.from('categories').insert(payload))
      }

      if (error) throw error
      toast.success(editId ? t('updated') : t('created'))
      setShowForm(false)
      loadCategories()
    } catch (err: any) {
      toast.error(err.message || t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('deleteConfirm'))) return
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      toast.success(t('deleted'))
      loadCategories()
    } catch (err: any) {
      toast.error(err.message || t('deleteError'))
    }
  }

  const filtered = search
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories

  const parentCategories = categories.filter((c) => c.id !== editId)

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
          <h1 className="text-2xl md:text-3xl font-bold">{editId ? t('editCategory') : t('newCategory')}</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label">{t('fields.name')} *</label>
              <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('fields.slug')}</label>
              <input type="text" className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('fields.description')}</label>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.parent')}</label>
              <select className="input" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
                <option value="">{t('noneTopLevel')}</option>
                {parentCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('fields.sortOrder')}</label>
              <input type="number" className="input" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">{t('fields.image')}</label>
              <input type="text" className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
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
              {saving ? <><Loader2 className="animate-spin" size={20} /> {t('updateCategory')}</> : <><Save size={20} /> {editId ? t('updateCategory') : t('createCategory')}</>}
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
        <Link href="/admin/categories?action=new" className="btn-primary"><Plus size={20} /> {t('addCategory')}</Link>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.slug')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.parent')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.order')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{cat.slug}</td>
                  <td className="px-6 py-4 text-sm">{(cat as any).parent?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm">{cat.sort_order || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${cat.is_active ? 'badge-success' : 'badge-danger'}`}>{cat.is_active ? tc('active') : tc('inactive')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/categories?action=edit&id=${cat.id}`} className="p-2 hover:bg-gray-100 rounded-lg"><Edit size={16} /></Link>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">{t('noCategories')}</p>
            <Link href="/admin/categories?action=new" className="mt-4 inline-block text-primary-600 hover:text-primary-700">{t('addFirst')}</Link>
          </div>
        )}
      </div>
    </div>
  )
}
