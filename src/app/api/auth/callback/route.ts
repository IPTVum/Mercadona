import { createServerClientSSR } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect') || '/profile'

  if (code) {
    const supabase = await createServerClientSSR()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[auth/callback] exchangeCodeForSession:', { data: !!data.session, error: error?.message, redirectTo })
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
}