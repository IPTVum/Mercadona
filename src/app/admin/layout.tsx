import type { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { createServerClientSSR } from '@/lib/supabase-server'

export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'WebStore'
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase.from('settings').select('value').eq('key', 'site_name').maybeSingle()
    if (data?.value) siteName = String(data.value)
  } catch {}

  return {
    title: {
      default: `Admin Dashboard | ${siteName}`,
      template: `%s | Admin | ${siteName}`,
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
