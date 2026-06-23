'use client'

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { createClient } from '@/lib/supabase'
import { formatPrice, slugify } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Eye, ArrowLeft, Loader2, Save, X, Upload, ImageIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import type { Product, Category } from '@/types'
import { Link } from '@/i18n/routing'

export default function AdminProductsPage() {
  const t = useTranslations('admin.products')
  const tc = useTranslations('common')
  return (
    <Suspense fallback={<div><h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1><div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {tc('loading')}</div></div>}>
      <ProductsContent />
    </Suspense>
  )
}

const emptyProduct = {
  name: '', slug: '', description: '', short_description: '',
  price: '', compare_price: '', cost_price: '', sku: '', barcode: '',
  stock: '', is_active: true, is_featured: false, category_id: '',
  images: '', tags: '', weight: '', meta_title: '', meta_description: '',
}

function ProductsContent() {
  const t = useTranslations('admin.products')
  const tc = useTranslations('common')
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const editId = searchParams.get('id')

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyProduct)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-gray-400" />
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-primary-600" /> : <ArrowDown size={12} className="text-primary-600" />
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error(t('imageSizeError')); return }
    setUploading(true)
    try {
      const filename = `product-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const { error } = await supabase.storage.from('media').upload(filename, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filename)
      const currentImages = form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : []
      currentImages.push(publicUrl)
      setForm({ ...form, images: currentImages.join(', ') })
      toast.success(t('imageUploaded'))
    } catch (err: any) {
      toast.error(err.message || t('imageUploadError'))
    } finally {
      setUploading(false)
    }
  }

  const loadData = useCallback(async () => {
    setError(null)
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])
    if (prodRes.error) {
      setError(prodRes.error.message)
    } else if (prodRes.data) {
      setProducts(prodRes.data)
    }
    if (catRes.data) setCategories(catRes.data)
    setLoading(false)
  }, [supabase])

  const loadProduct = useCallback(async (id: string) => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    if (data) {
      setForm({
        name: data.name, slug: data.slug, description: data.description || '',
        short_description: data.short_description || '', price: String(data.price ?? ''),
        compare_price: data.compare_price ? String(data.compare_price) : '', cost_price: data.cost_price ? String(data.cost_price) : '',
        sku: data.sku || '', barcode: data.barcode || '', stock: data.stock != null ? String(data.stock) : '',
        is_active: data.is_active, is_featured: data.is_featured,
        category_id: data.category_id || '',
        images: (data.images || []).join(', '),
        tags: (data.tags || []).join(', '), weight: data.weight ? String(data.weight) : '',
        meta_title: data.meta_title || '', meta_description: data.meta_description || '',
      })
      setShowForm(true)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (action === 'new') {
      setForm(emptyProduct)
      setShowForm(true)
    } else if (action === 'edit' && editId) {
      loadProduct(editId)
    }
  }, [action, editId, loadProduct])

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(t('nameRequired')); return }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) { toast.error(t('priceRequired')); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || null,
        short_description: form.short_description || null,
        price: Number(form.price),
        compare_price: form.compare_price !== '' ? Number(form.compare_price) : null,
        cost_price: form.cost_price !== '' ? Number(form.cost_price) : null,
        sku: form.sku || null,
        barcode: form.barcode || null,
        stock: form.stock !== '' ? Number(form.stock) : null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        category_id: form.category_id || null,
        images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
        weight: form.weight !== '' ? Number(form.weight) : null,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      }

      let error
      if (editId) {
        ;({ error } = await supabase.from('products').update(payload).eq('id', editId))
      } else {
        ;({ error } = await supabase.from('products').insert(payload))
      }

      if (error) throw error
      toast.success(editId ? t('updated') : t('created'))
      setShowForm(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message || t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      toast.success(t('deleted'))
      loadData()
    } catch (err: any) {
      toast.error(err.message || t('deleteError'))
    }
  }

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase()))
    : [...products]

  const sorted = filtered.sort((a, b) => {
    let va: any, vb: any
    switch (sortField) {
      case 'name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break
      case 'price': va = Number(a.price); vb = Number(b.price); break
      case 'stock': va = a.stock ?? 0; vb = b.stock ?? 0; break
      case 'is_active': va = a.is_active ? 1 : 0; vb = b.is_active ? 1 : 0; break
      default: va = new Date(a.created_at).getTime(); vb = new Date(b.created_at).getTime(); break
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1
    if (va > vb) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1>
        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {tc('loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium mb-2">{tc('error.title')}</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button onClick={loadData} className="btn-primary">{tc('error.retry')}</button>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl md:text-3xl font-bold">{editId ? t('editProduct') : t('newProduct')}</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <div>
              <label className="label">{t('fields.name')} *</label>
              <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} />
            </div>
            <div>
              <label className="label">{t('fields.slug')}</label>
              <input type="text" className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('fields.shortDescription')}</label>
              <textarea className="input" rows={2} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('fields.fullDescription')}</label>
              <textarea className="input" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.price')} *</label>
              <input type="number" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.comparePrice')}</label>
              <input type="number" step="0.01" className="input" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.costPrice')}</label>
              <input type="number" step="0.01" className="input" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.category')}</label>
              <select className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">{tc('none')}</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('fields.sku')}</label>
              <input type="text" className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.barcode')}</label>
              <input type="text" className="input" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.stock')}</label>
              <input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.weight')}</label>
              <input type="number" step="0.01" className="input" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('fields.images')}</label>
              <div className="flex gap-2 mb-2">
                <label className="btn-outline cursor-pointer inline-flex items-center gap-2 text-sm">
                  <Upload size={16} />
                  {uploading ? t('fields.uploading') : t('fields.uploadImage')}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                <span className="text-sm text-gray-500 self-center">{t('fields.maxSize')}</span>
              </div>
              <textarea className="input" rows={3} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder={t('fields.pasteUrls')} />
              {form.images && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.images.split(',').map((url, i) => {
                    const trimmed = url.trim()
                    return trimmed ? (
                      <Image key={i} src={trimmed} alt="" width={64} height={64} className="w-16 h-16 object-cover rounded-lg border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : null
                  })}
                </div>
              )}
            </div>
            <div>
              <label className="label">{t('fields.tags')}</label>
              <textarea className="input" rows={2} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="new,trending,sale" />
            </div>
            <div>
              <label className="label">{t('fields.metaTitle')}</label>
              <input type="text" className="input" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.metaDescription')}</label>
              <input type="text" className="input" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <span>{tc('active')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                <span>{tc('active')}</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? <><Loader2 className="animate-spin" size={20} /> {t('saving')}</> : <><Save size={20} /> {editId ? t('updateProduct') : t('createProduct')}</>}
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
        <Link href="/admin/products?action=new" className="btn-primary">
          <Plus size={20} />
          {t('addProduct')}
        </Link>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('name')}>
                  <span className="inline-flex items-center gap-1">{t('table.product')} {getSortIcon('name')}</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">{t('table.category')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('price')}>
                  <span className="inline-flex items-center gap-1">{t('table.price')} {getSortIcon('price')}</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('stock')}>
                  <span className="inline-flex items-center gap-1">{t('table.stock')} {getSortIcon('stock')}</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('is_active')}>
                  <span className="inline-flex items-center gap-1">{t('table.status')} {getSortIcon('is_active')}</span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sorted.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 max-w-xs">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? <Image src={product.images[0]} alt="" width={40} height={40} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-gray-500 truncate">{product.sku || t('table.noSku')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm hidden md:table-cell">{(product as any).categories?.name || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-medium">{formatPrice(product.price)}</span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">{formatPrice(product.compare_price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm ${product.stock != null && product.stock <= 5 ? 'text-red-600' : ''}`}>{product.stock ?? 0}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'}`}>{product.is_active ? tc('active') : tc('inactive')}</span>
                  </td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Link href={`/product/${product.slug}`} target="_blank" className="p-2 hover:bg-gray-100 rounded-lg"><Eye size={16} /></Link>
                      <Link href={`/admin/products?action=edit&id=${product.id}`} className="p-2 hover:bg-gray-100 rounded-lg"><Edit size={16} /></Link>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">{t('noProducts')}</p>
            <Link href="/admin/products?action=new" className="mt-4 inline-block text-primary-600 hover:text-primary-700">{t('addFirstProduct')}</Link>
          </div>
        )}
      </div>
    </div>
  )
}
