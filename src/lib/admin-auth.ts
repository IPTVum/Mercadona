import { createServerClientSSR } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

export async function requireAdmin() {
  const supabase = await createServerClientSSR()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const locale = await getLocale()
    redirect(`/${locale}/login`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    const locale = await getLocale()
    redirect(`/${locale}`)
  }

  return user
}
