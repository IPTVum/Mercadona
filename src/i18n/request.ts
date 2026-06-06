import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getDefaultLocale(): Promise<string> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(key: string) {
            return cookieStore.get(key)?.value
          },
        },
      }
    )

    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'default_language')
      .maybeSingle()

    if (data?.value && routing.locales.includes(data.value as any)) {
      return String(data.value)
    }
  } catch {}

  return routing.defaultLocale
}

let cachedDefaultLocale: string | null = null
let cacheTimestamp = 0

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as any)) {
    const now = Date.now()
    if (cachedDefaultLocale && now - cacheTimestamp < 60000) {
      locale = cachedDefaultLocale
    } else {
      locale = await getDefaultLocale()
      cachedDefaultLocale = locale
      cacheTimestamp = now
    }
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  }
})
