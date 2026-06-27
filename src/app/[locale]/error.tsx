'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Home } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')

  useEffect(() => {
    console.error('[admin] error boundary:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h2>
        <p className="text-gray-600 mb-6">{t('description')}</p>

        {(error?.message || error?.digest) && (
          <div className="mb-6 text-left bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
            {error?.message && (
              <p className="text-sm text-red-600 font-mono break-all">{error.message}</p>
            )}
            {error?.digest && (
              <p className="text-xs text-gray-400 font-mono mt-2">digest: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={reset} className="btn-primary">
            {t('retry')}
          </button>
          <Link href="/" className="btn-secondary">
            <Home size={20} />
            {t('goHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
