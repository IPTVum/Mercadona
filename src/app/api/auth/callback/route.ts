import { createServerClientSSR } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')
  const rawRedirect = requestUrl.searchParams.get('redirect') || '/profile'
  const safeRedirect = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/profile'

  if (code) {
    const supabase = await createServerClientSSR()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL(safeRedirect, requestUrl.origin))
}