import { createServerClientSSR } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

export async function requireAdmin() {
  const supabase = await createServerClientSSR()

  let user
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    const locale = await getLocale()
    redirect(`/${locale}/login`)
  }

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
