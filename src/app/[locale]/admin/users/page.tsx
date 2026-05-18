'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Search, Mail, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '@/types'

const ROLES = ['customer', 'moderator', 'admin']

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  moderator: 'bg-purple-100 text-purple-700',
  customer: 'bg-blue-100 text-blue-700',
}

export default function AdminUsersPage() {
  const t = useTranslations('admin.users')
  const tc = useTranslations('common')
  const supabase = useMemo(() => createClient(), [])
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => { loadUsers() }, [supabase])

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  const updateUser = async (id: string, field: string, value: any) => {
    setUpdating(id)
    try {
      const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', id)
      if (error) throw error
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)))
      toast.success(t('updated'))
    } catch (err: any) {
      toast.error(err.message || t('updateError'))
    } finally {
      setUpdating(null)
    }
  }

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

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(t('deleteConfirm', { email }))) return
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
      toast.success(t('deleted'))
      loadUsers()
    } catch (err: any) {
      toast.error(err.message || t('deleteError'))
    }
  }

  const filtered = search
    ? users.filter((u) => (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()))
    : [...users]

  const sorted = filtered.sort((a, b) => {
    let va: any, vb: any
    switch (sortField) {
      case 'full_name': va = (a.full_name || '').toLowerCase(); vb = (b.full_name || '').toLowerCase(); break
      case 'email': va = (a.email || '').toLowerCase(); vb = (b.email || '').toLowerCase(); break
      case 'role': va = a.role; vb = b.role; break
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-500">{t('totalUsers', { count: users.length })}</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('full_name')}>
                  <span className="inline-flex items-center gap-1">{t('table.user')} {getSortIcon('full_name')}</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('role')}>
                  <span className="inline-flex items-center gap-1">{t('table.role')} {getSortIcon('role')}</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('created_at')}>
                  <span className="inline-flex items-center gap-1">{t('table.joined')} {getSortIcon('created_at')}</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('is_active')}>
                  <span className="inline-flex items-center gap-1">{t('table.status')} {getSortIcon('is_active')}</span>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sorted.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-primary-600">{user.full_name?.[0] || user.email?.[0] || 'U'}</span>
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || t('noName')}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className={`badge border-0 cursor-pointer ${roleColors[user.role] || ''}`}
                      value={user.role}
                      onChange={(e) => updateUser(user.id, 'role', e.target.value)}
                      disabled={updating === user.id}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{t(`roles.${r}`)}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => updateUser(user.id, 'is_active', !user.is_active)}
                      disabled={updating === user.id}
                      className={`badge cursor-pointer border-0 ${user.is_active ? 'badge-success' : 'badge-danger'}`}
                    >
                      {user.is_active ? tc('active') : tc('inactive')}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <a href={`mailto:${user.email}`} className="p-2 hover:bg-gray-100 rounded-lg"><Mail size={16} /></a>
                      <button onClick={() => handleDelete(user.id, user.email || '')} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" disabled={updating === user.id}>
                        <Loader2 size={16} className={updating === user.id ? 'animate-spin' : 'hidden'} />
                        <span className={updating === user.id ? 'hidden' : ''}>✕</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">{t('noUsers')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
