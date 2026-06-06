'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { Plus, Edit, Trash2, Loader2, Save, X, Eye, Globe, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import type { LandingPage } from '@/types'
import { Link } from '@/i18n/routing'

const emptyForm = {
  slug: '', title_en: '', title_fr: '', headline_en: '', headline_fr: '',
  description_en: '', description_fr: '', features_en: '', features_fr: '',
  cta_text_en: 'Shop Now', cta_text_fr: 'Acheter Maintenant', cta_url: '/shop',
  image_url: '', bg_color: '#f9fafb', is_active: true,
}

export default function AdminLandingPage() {
  const t = useTranslations('admin.landing')
  const tc = useTranslations('common')
  const supabase = useMemo(() => createClient(), [])
  const [pages, setPages] = useState<LandingPage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [activeTab, setActiveTab] = useState<'en' | 'fr'>('fr')
  const [previewLocale, setPreviewLocale] = useState<'en' | 'fr'>('fr')

  useEffect(() => { loadPages() }, [supabase])

  const loadPages = async () => {
    const { data } = await supabase.from('landing_pages').select('*').order('created_at', { ascending: false })
    if (data) setPages(data)
    setLoading(false)
  }

  const handleEdit = (page: LandingPage) => {
    setForm({
      slug: page.slug, title_en: page.title_en, title_fr: page.title_fr,
      headline_en: page.headline_en, headline_fr: page.headline_fr,
      description_en: page.description_en, description_fr: page.description_fr,
      features_en: page.features_en || '', features_fr: page.features_fr || '',
      cta_text_en: page.cta_text_en, cta_text_fr: page.cta_text_fr,
      cta_url: page.cta_url, image_url: page.image_url || '', bg_color: page.bg_color || '#f9fafb',
      is_active: page.is_active,
    })
    setEditId(page.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.slug.trim() || !form.title_fr.trim() || !form.title_en.trim()) {
      toast.error(t('slugAndTitleRequired'))
      return
    }
    setSaving(true)
    try {
      const data = {
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title_en: form.title_en, title_fr: form.title_fr,
        headline_en: form.headline_en, headline_fr: form.headline_fr,
        description_en: form.description_en, description_fr: form.description_fr,
        features_en: form.features_en || null, features_fr: form.features_fr || null,
        cta_text_en: form.cta_text_en, cta_text_fr: form.cta_text_fr,
        cta_url: form.cta_url, image_url: form.image_url || null, bg_color: form.bg_color,
        is_active: form.is_active,
      }
      if (editId) {
        const { error } = await supabase.from('landing_pages').update(data).eq('id', editId)
        if (error) throw error
        toast.success(t('updated'))
      } else {
        const { error } = await supabase.from('landing_pages').insert(data)
        if (error) throw error
        toast.success(t('created'))
      }
      setShowForm(false)
      setEditId(null)
      setForm(emptyForm)
      loadPages()
    } catch (err: any) {
      toast.error(err.message || t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return
    const { error } = await supabase.from('landing_pages').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(t('deleted'))
    loadPages()
  }

  const toggleActive = async (page: LandingPage) => {
    const { error } = await supabase.from('landing_pages').update({ is_active: !page.is_active }).eq('id', page.id)
    if (error) { toast.error(error.message); return }
    loadPages()
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1>
        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {tc('loading')}</div>
      </div>
    )
  }

  const inputClass = (field: string) => activeTab === 'en' && field.endsWith('_en') ? '' : activeTab === 'fr' && field.endsWith('_fr') ? '' : activeTab === 'en' && !field.includes('_') ? '' : 'hidden'

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }} className="btn-primary">
          <Plus size={20} /> {t('create')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editId ? t('edit') : t('create')}</h2>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('fr')} className={`px-3 py-1 rounded text-sm font-medium ${activeTab === 'fr' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>FR</button>
              <button onClick={() => setActiveTab('en')} className={`px-3 py-1 rounded text-sm font-medium ${activeTab === 'en' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>EN</button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('slug')} *</label>
              <input type="text" className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="moroccan-berber-rugs" />
            </div>
            <div>
              <label className="label">{t('ctaUrl')}</label>
              <input type="text" className="input" value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} placeholder="/shop" />
            </div>
            <div className={activeTab === 'fr' ? '' : 'hidden'}>
              <label className="label">{t('titleFr')} *</label>
              <input type="text" className="input" value={form.title_fr} onChange={(e) => setForm({ ...form, title_fr: e.target.value })} />
            </div>
            <div className={activeTab === 'en' ? '' : 'hidden'}>
              <label className="label">{t('titleEn')} *</label>
              <input type="text" className="input" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
            </div>
            <div className={`md:col-span-2 ${activeTab === 'fr' ? '' : 'hidden'}`}>
              <label className="label">{t('headlineFr')} *</label>
              <input type="text" className="input" value={form.headline_fr} onChange={(e) => setForm({ ...form, headline_fr: e.target.value })} />
            </div>
            <div className={`md:col-span-2 ${activeTab === 'en' ? '' : 'hidden'}`}>
              <label className="label">{t('headlineEn')} *</label>
              <input type="text" className="input" value={form.headline_en} onChange={(e) => setForm({ ...form, headline_en: e.target.value })} />
            </div>
            <div className={`md:col-span-2 ${activeTab === 'fr' ? '' : 'hidden'}`}>
              <label className="label">{t('descriptionFr')} *</label>
              <textarea className="input" rows={4} value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} />
            </div>
            <div className={`md:col-span-2 ${activeTab === 'en' ? '' : 'hidden'}`}>
              <label className="label">{t('descriptionEn')} *</label>
              <textarea className="input" rows={4} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
            </div>
            <div className={`md:col-span-2 ${activeTab === 'fr' ? '' : 'hidden'}`}>
              <label className="label">{t('featuresFr')}</label>
              <textarea className="input" rows={4} value={form.features_fr} onChange={(e) => setForm({ ...form, features_fr: e.target.value })} placeholder="✓ Feature 1&#10;✓ Feature 2&#10;✓ Feature 3" />
            </div>
            <div className={`md:col-span-2 ${activeTab === 'en' ? '' : 'hidden'}`}>
              <label className="label">{t('featuresEn')}</label>
              <textarea className="input" rows={4} value={form.features_en} onChange={(e) => setForm({ ...form, features_en: e.target.value })} placeholder="✓ Feature 1&#10;✓ Feature 2&#10;✓ Feature 3" />
            </div>
            <div className={activeTab === 'fr' ? '' : 'hidden'}>
              <label className="label">{t('ctaTextFr')}</label>
              <input type="text" className="input" value={form.cta_text_fr} onChange={(e) => setForm({ ...form, cta_text_fr: e.target.value })} />
            </div>
            <div className={activeTab === 'en' ? '' : 'hidden'}>
              <label className="label">{t('ctaTextEn')}</label>
              <input type="text" className="input" value={form.cta_text_en} onChange={(e) => setForm({ ...form, cta_text_en: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('imageUrl')}</label>
              <input type="text" className="input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('bgColor')}</label>
              <input type="color" className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer" value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 py-2">
              <input type="checkbox" className="w-4 h-4" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <span>{t('active')}</span>
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <><Loader2 className="animate-spin" size={20} /> {t('saving')}</> : <><Save size={20} /> {editId ? t('update') : t('create')}</>}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }} className="btn-outline"><X size={20} /> {tc('cancel')}</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('slug')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('title')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('preview')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium whitespace-nowrap">/{page.slug}</td>
                  <td className="px-4 py-4 min-w-0 max-w-[200px]">
                    <p className="font-medium truncate">{page.title_fr}</p>
                    <p className="text-sm text-gray-500 truncate">{page.title_en}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button onClick={() => toggleActive(page)} className={page.is_active ? 'text-green-600' : 'text-gray-400'}>
                      {page.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <Link href={`/lp/${page.slug}`} target="_blank" className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 inline-flex items-center gap-1 text-xs" title="FR">
                        <Globe size={14} /><span>FR</span>
                      </Link>
                      <Link href={`/en/lp/${page.slug}`} target="_blank" className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 inline-flex items-center gap-1 text-xs" title="EN">
                        <Globe size={14} /><span>EN</span>
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(page)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(page.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">{t('noPages')}</p>
            <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }} className="mt-4 text-primary-600 hover:text-primary-700">{t('createFirst')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
