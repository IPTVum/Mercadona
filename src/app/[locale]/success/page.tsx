'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/routing'

interface SuccessPageProps {
  searchParams: { order?: string }
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const t = useTranslations('success')
  const orderId = searchParams.order

  return (
    <div className="container-custom py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={48} />
        </div>
        <h1 className="text-3xl font-display font-bold mb-4">{t('title')}</h1>
        <p className="text-gray-600 mb-8">{t('subtitle')}</p>

        {orderId && (
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <p className="text-sm text-gray-500">{t('orderNumber')}</p>
            <p className="font-mono font-bold">#{orderId.slice(0, 8)}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl border border-gray-200 text-left mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Package size={20} />
            What happens next?
          </h3>
          <ol className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold flex-shrink-0">1</span>
              <span>You&apos;ll receive a confirmation email shortly</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold flex-shrink-0">2</span>
              <span>We&apos;ll process and prepare your order</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold flex-shrink-0">3</span>
              <span>You&apos;ll receive tracking info once shipped</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/profile?tab=orders" className="btn-primary">
            {t('viewOrder')} <ArrowRight size={20} />
          </Link>
          <Link href="/shop" className="btn-secondary">
            {t('backToShop')}
          </Link>
        </div>
      </div>
    </div>
  )
}
