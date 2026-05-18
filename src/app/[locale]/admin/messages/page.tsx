'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { Search, Loader2, Trash2, Eye, Mail, MailOpen, X, ArrowLeft, Clock, User } from 'lucide-react'
import { toast } from 'sonner'
import type { ContactMessage } from '@/types'

export default function AdminMessagesPage() {
  const t = useTranslations('admin.messages')
  const tc = useTranslations('common')
  const supabase = useMemo(() => createClient(), [])

  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    loadMessages()
  }, [supabase])

  const loadMessages = async () => {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setMessages(data as ContactMessage[])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id)
      if (error) throw error
      toast.success(t('deleted'))
      if (selected?.id === id) setSelected(null)
      loadMessages()
    } catch (err: any) {
      toast.error(err.message || t('deleted'))
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id)
      if (error) throw error
      loadMessages()
    } catch (err: any) {
      toast.error(err.message || t('deleted'))
    }
  }

  const handleMarkUnread = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: false })
        .eq('id', id)
      if (error) throw error
      loadMessages()
    } catch (err: any) {
      toast.error(err.message || t('deleted'))
    }
  }

  const filtered = messages.filter((m) => {
    const matchesSearch = search
      ? m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase())
      : true

    if (filter === 'unread') return matchesSearch && !m.is_read
    if (filter === 'read') return matchesSearch && m.is_read
    return matchesSearch
  })

  const unreadCount = messages.filter((m) => !m.is_read).length

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {t('description')}
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                {t('unreadCount', { count: unreadCount })}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={tc('search') + '...'}
                  className="input pl-10 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* Filter tabs */}
              <div className="flex gap-2 mt-3">
                {(['all', 'unread', 'read'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      filter === f
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {f === 'all' ? tc('all') : f === 'unread' ? `${t('unread')} (${unreadCount})` : t('read')}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="divide-y divide-gray-50 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Mail size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{t('noMessages')}</p>
                </div>
              ) : (
                filtered.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => {
                      setSelected(msg)
                      if (!msg.is_read) handleMarkRead(msg.id)
                    }}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selected?.id === msg.id ? 'bg-primary-50 border-l-2 border-primary-500' : ''
                    } ${!msg.is_read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !msg.is_read ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <User size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-medium text-sm truncate ${!msg.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {msg.name}
                          </p>
                          {!msg.is_read && (
                            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{msg.subject}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                          <Clock size={10} />
                          <span>{formatRelativeDate(msg.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{selected.subject}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {selected.name[0]?.toUpperCase()}
                        </div>
                        {selected.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} />
                        <a href={`mailto:${selected.email}`} className="text-primary-600 hover:underline">
                          {selected.email}
                        </a>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {formatDate(selected.created_at)}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${selected.is_read ? 'badge-success' : 'badge-info'}`}>
                    {selected.is_read ? t('read') : t('new')}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => selected.is_read ? handleMarkUnread(selected.id) : handleMarkRead(selected.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-primary-700 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    {selected.is_read ? <Mail size={16} /> : <MailOpen size={16} />}
                    {selected.is_read ? t('markUnread') : t('markRead')}
                  </button>
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    <Mail size={16} />
                    {t('reply')}
                  </a>
                </div>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  {t('delete')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center py-20">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-gray-300" />
                </div>
                <p className="font-medium text-gray-500">{t('selectMessage')}</p>
                <p className="text-sm mt-1">{t('selectHint')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
