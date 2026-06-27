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
  const pendingCookies: { name: string; value: string; options: any }[] = []

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
          pendingCookies.push({ name: key, value, options })
        },
        remove(key: string, options: any) {
          request.cookies.delete(key)
          supabaseResponse.cookies.delete(key)
        },
      },
    }
  )

  let user: any = null
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // Token refresh failed or other auth error — treat as logged out
  }

  const pathWithoutLocale = pathname.replace(/^\/(en|fr|ar)(\/|$)/, '$2').replace(/\/$/, '') || '/'

  const isAdminRoute = pathWithoutLocale.startsWith('/admin')
  const isAuthRoute =
    pathWithoutLocale === '/login' || pathWithoutLocale === '/register' ||
    pathWithoutLocale.startsWith('/forgot-password') || pathWithoutLocale.startsWith('/reset-password')
  const isProfileRoute = pathWithoutLocale.startsWith('/profile')
  const isCheckoutRoute = pathWithoutLocale.startsWith('/checkout')

  const locale = pathname.match(/^\/(en|fr|ar)/)?.[1] || routing.defaultLocale

  const applyPendingCookies = (res: NextResponse) => {
    pendingCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options)
    })
    return res
  }

  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}/login`
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return applyPendingCookies(NextResponse.redirect(url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}`
      return applyPendingCookies(NextResponse.redirect(url))
    }
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/profile`
    return applyPendingCookies(NextResponse.redirect(url))
  }

  if (isProfileRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return applyPendingCookies(NextResponse.redirect(url))
  }

  if (isCheckoutRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return applyPendingCookies(NextResponse.redirect(url))
  }

  const intlResponse = createMiddleware({ ...routing, localeDetection: false })(request)

  pendingCookies.forEach(({ name, value, options }) => {
    intlResponse.cookies.set(name, value, options)
  })

  return intlResponse
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|static|favicon\\.ico|images|.*\\..*).*)',
  ],
}
