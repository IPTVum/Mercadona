import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isApiRoute = pathname.startsWith('/api/')
  const isStaticFile =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.') ||
    pathname.startsWith('/images/')

  if (isApiRoute || isStaticFile) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key: string) {
          return request.cookies.get(key)?.value
        },
        set(key: string, value: string, options: any) {
          request.cookies.set(key, value)
          supabaseResponse.cookies.set(key, value, options)
        },
        remove(key: string, options: any) {
          request.cookies.delete(key)
          supabaseResponse.cookies.delete(key)
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathWithoutLocale = pathname.replace(/^\/(en|fr|ar)(\/|$)/, '/$2').replace(/\/$/, '') || '/'

  const isAdminRoute = pathWithoutLocale.startsWith('/admin')
  const isAuthRoute =
    pathWithoutLocale === '/login' || pathWithoutLocale === '/register' ||
    pathWithoutLocale.startsWith('/forgot-password') || pathWithoutLocale.startsWith('/reset-password')
  const isProfileRoute = pathWithoutLocale.startsWith('/profile')
  const isCheckoutRoute = pathWithoutLocale.startsWith('/checkout')

  const locale = pathname.match(/^\/(en|fr|ar)/)?.[1] || routing.defaultLocale

  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}/login`
      url.searchParams.set('redirect', request.nextUrl.pathname)
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}`
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/profile`
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  if (isProfileRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    url.searchParams.set('redirect', request.nextUrl.pathname)
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  if (isCheckoutRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    url.searchParams.set('redirect', request.nextUrl.pathname)
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  let defaultLocale = routing.defaultLocale
  try {
    const { data: langSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'default_language')
      .maybeSingle()
    if (langSetting?.value && routing.locales.includes(langSetting.value as any)) {
      defaultLocale = langSetting.value as typeof routing.defaultLocale
    }
  } catch {}

  const dynamicIntlMiddleware = createMiddleware({
    ...routing,
    defaultLocale,
    localeDetection: false,
  })

  return dynamicIntlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|static|favicon\\.ico|images|.*\\..*).*)',
  ],
}
