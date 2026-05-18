'use client'

import { useTranslations } from 'next-intl'
import { Home, ShoppingBag } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <p className="text-8xl font-bold text-primary-600 mb-4">404</p>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600 mb-8">{t('description')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            <Home size={20} />
            {t('goHome')}
          </Link>
          <Link href="/shop" className="btn-secondary">
            <ShoppingBag size={20} />
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  )
}
