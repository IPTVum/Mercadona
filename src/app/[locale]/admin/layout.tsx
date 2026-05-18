import type { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { createServerClientSSR } from '@/lib/supabase-server'
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 md:ml-0 min-w-0">
        {children}
      </main>
    </div>
  )
}
