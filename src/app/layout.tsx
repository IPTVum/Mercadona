import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import '@/styles/globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ToastProvider from '@/components/ui/ToastProvider'
import BackToTop from '@/components/ui/BackToTop'
import { createServerClientSSR } from '@/lib/supabase-server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta' })

export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'WebStore'
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase.from('settings').select('value').eq('key', 'site_name').maybeSingle()
    if (data?.value) siteName = String(data.value)
  } catch {}

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} - Your One-Stop Online Shop`,
      template: `%s | ${siteName}`,
    },
    description: 'Shop the latest products at unbeatable prices. Quality guaranteed.',
    keywords: ['ecommerce', 'online shopping', 'deals', 'products'],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@webstore',
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0284c7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastProvider />
        <BackToTop />
      </body>
    </html>
  )
}
