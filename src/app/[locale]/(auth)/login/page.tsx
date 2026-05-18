'use client'

import { useState, useMemo, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function LoginPage() {
  const t = useTranslations('auth.login')

  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-200px)] flex items-center justify-center"><p>{t('loading')}</p></div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/profile'
  const t = useTranslations('auth.login')
  const supabase = useMemo(() => createClient(), [])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebugInfo('Step 1: Sending credentials to Supabase...')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setDebugInfo(`Auth error: ${error.message}`)
        throw error
      }

      if (!data.user) {
        setDebugInfo('No user in response')
        throw new Error('Login failed - no user returned')
      }

      if (!data.session) {
        setDebugInfo('No session in response')
        throw new Error('Login failed - no session returned')
      }

      setDebugInfo('Step 2: Login successful! Verifying session...')

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setDebugInfo('Session not found after login. Retrying...')
        throw new Error('Session was not persisted. Please try again.')
      }

      setDebugInfo('Step 3: Session confirmed. Redirecting...')
      setTimeout(() => {
        window.location.href = redirectTo
      }, 500)
    } catch (err: any) {
      console.error('[LOGIN] Error:', err)
      setError(err.message || t('errors.genericError'))
      setDebugInfo((prev) => prev + '\nError: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {debugInfo && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-mono whitespace-pre-wrap">
              {debugInfo}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="label">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="label">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="input pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                {t('forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? t('loading') : t('submit')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                {t('signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
