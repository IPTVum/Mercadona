import type { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { createServerClientSSR } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'WebStore'
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase.from('settings').select('value').eq('key', 'site_name').maybeSingle()
    if (data?.value) siteName = String(data.value)
  } catch {}

  const t = await getTranslations('admin.dashboard')

  return {
    title: {
      default: `${t('title')} | ${siteName}`,
      template: `%s | ${t('title')} | ${siteName}`,
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
