'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { Link, usePathname } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Tag,
  Settings,
  Home,
  Menu,
  X,
  MessageSquare,
  FolderTree,
  Mail,
  Inbox,
} from 'lucide-react'

export default function AdminSidebar() {
  const t = useTranslations('admin.sidebar')
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [siteName, setSiteName] = useState('WebStore')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'site_name').maybeSingle()
      .then(({ data }) => { if (data?.value) setSiteName(String(data.value)) })
  }, [supabase])

  const navItems = [
    { href: '/admin/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/admin/categories', label: t('categories'), icon: FolderTree },
    { href: '/admin/products', label: t('products'), icon: Package },
    { href: '/admin/orders', label: t('orders'), icon: ShoppingCart },
    { href: '/admin/users', label: t('users'), icon: Users },
    { href: '/admin/blogs', label: t('blogs'), icon: FileText },
    { href: '/admin/coupons', label: t('coupons'), icon: Tag },
    { href: '/admin/messages', label: t('messages'), icon: MessageSquare },
    { href: '/admin/emails', label: t('emails'), icon: Mail },
    { href: '/admin/settings', label: t('settings'), icon: Settings },
  ]

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin/dashboard" className="text-2xl font-bold" onClick={() => setMobileOpen(false)}>
          {siteName} <span className="text-primary-400">{t('adminPanel')}</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
          <Home size={20} />
          {t('backToSite')}
        </Link>
        <a href="/contact" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <Inbox size={20} />
          {t('viewContactPage')}
        </a>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 flex items-center justify-between">
        <Link href="/admin/dashboard" className="text-xl font-bold">
          {siteName} <span className="text-primary-400">{t('adminPanel')}</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-200 md:transform-none ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile spacer for fixed header */}
      <div className="md:hidden h-16" />
    </>
  )
}
