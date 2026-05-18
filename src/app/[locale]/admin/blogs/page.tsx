'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { createClient } from '@/lib/supabase'
import { formatDate, slugify } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Eye, ArrowLeft, Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Blog } from '@/types'
import { Link } from '@/i18n/routing'

export default function AdminBlogsPage() {
  const t = useTranslations('admin.blogs')
  const tc = useTranslations('common')
  return (
    <Suspense fallback={<div><h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1><div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {tc('loading')}</div></div>}>
      <BlogsContent />
    </Suspense>
  )
}

const emptyBlog = { title: '', slug: '', excerpt: '', content: '', image: '', tags: '', is_published: false, meta_title: '', meta_description: '' }

function BlogsContent() {
  const t = useTranslations('admin.blogs')
  const tc = useTranslations('common')
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const editId = searchParams.get('id')

  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyBlog)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { loadBlogs() }, [supabase])

  useEffect(() => {
    if (action === 'new') { setForm(emptyBlog); setShowForm(true) }
    else if (action === 'edit' && editId) loadBlog(editId)
  }, [action, editId])

  const loadBlogs = async () => {
    const { data } = await supabase.from('blogs').select('*, profiles(full_name)').order('created_at', { ascending: false })
    if (data) setBlogs(data)
    setLoading(false)
  }

  const loadBlog = async (id: string) => {
    const { data } = await supabase.from('blogs').select('*').eq('id', id).single()
    if (data) {
      setForm({
        title: data.title, slug: data.slug, excerpt: data.excerpt || '',
        content: data.content || '', image: data.image || '',
        tags: (data.tags || []).join(', '), is_published: data.is_published,
        meta_title: data.meta_title || '', meta_description: data.meta_description || '',
      })
      setShowForm(true)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error(t('titleRequired')); return }
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt || null,
        content: form.content || null,
        image: form.image || null,
        tags: form.tags ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
        is_published: form.is_published,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      }

      let error
      if (editId) {
        ;({ error } = await supabase.from('blogs').update(payload).eq('id', editId))
      } else {
        ;({ error } = await supabase.from('blogs').insert({ ...payload, author_id: null }))
      }

      if (error) throw error
      toast.success(editId ? t('updated') : t('created'))
      setShowForm(false)
      loadBlogs()
    } catch (err: any) {
      toast.error(err.message || t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id)
      if (error) throw error
      toast.success(t('deleted'))
      loadBlogs()
    } catch (err: any) {
      toast.error(err.message || t('deleteError'))
    }
  }

  const filtered = search ? blogs.filter((b) => b.title.toLowerCase().includes(search.toLowerCase())) : blogs

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
          <h1 className="text-2xl md:text-3xl font-bold">{editId ? t('editPost') : t('newPost')}</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label">{t('fields.title')} *</label>
              <input type="text" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('fields.slug')}</label>
              <input type="text" className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('fields.excerpt')}</label>
              <textarea className="input" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('fields.content')}</label>
              <textarea className="input" rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.image')}</label>
              <input type="text" className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="label">{t('fields.tags')}</label>
              <input type="text" className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="news,tips" />
            </div>
            <div>
              <label className="label">{t('fields.metaTitle')}</label>
              <input type="text" className="input" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('fields.metaDescription')}</label>
              <input type="text" className="input" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                <span>{t('fields.publish')}</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? <><Loader2 className="animate-spin" size={20} /> {t('saving')}</> : <><Save size={20} /> {editId ? t('updatePost') : t('createPost')}</>}
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
        <Link href="/admin/blogs?action=new" className="btn-primary"><Plus size={20} /> {t('newPost')}</Link>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.title')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.author')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('table.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><p className="font-medium">{blog.title}</p></td>
                  <td className="px-6 py-4 text-sm">{(blog as any).profiles?.full_name || 'Admin'}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(blog.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${blog.is_published ? 'badge-success' : 'badge-warning'}`}>{blog.is_published ? t('published') : t('draft')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/blog/${blog.slug}`} target="_blank" className="p-2 hover:bg-gray-100 rounded-lg"><Eye size={16} /></Link>
                      <Link href={`/admin/blogs?action=edit&id=${blog.id}`} className="p-2 hover:bg-gray-100 rounded-lg"><Edit size={16} /></Link>
                      <button onClick={() => handleDelete(blog.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">{t('noPosts')}</p>
            <Link href="/admin/blogs?action=new" className="mt-4 inline-block text-primary-600 hover:text-primary-700">{t('addFirst')}</Link>
          </div>
        )}
      </div>
    </div>
  )
}
