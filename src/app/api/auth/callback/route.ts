import { createServerClientSSR } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerClientSSR()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[auth/callback] exchangeCodeForSession:', { data: !!data.session, error: error?.message })
  }

  return NextResponse.redirect(new URL('/profile', requestUrl.origin))
}