'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const supabase = useMemo(() => createClient(), [])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebugInfo('Step 1: Creating account...')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (error) {
        setDebugInfo(`Auth error: ${error.message}`)
        throw error
      }

      if (!data.user) {
        setDebugInfo('No user in response')
        throw new Error('Registration failed - no user returned')
      }

      setDebugInfo('Step 2: User created. Creating profile...')

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: formData.email,
        full_name: formData.fullName,
        role: 'customer',
      })

      if (profileError) {
        setDebugInfo((prev) => prev + `\nProfile warning: ${profileError.message}`)
        console.warn('[REGISTER] Profile insert error:', profileError)
      } else {
        setDebugInfo((prev) => prev + '\nProfile created.')
      }

      if (data.session) {
        setDebugInfo((prev) => prev + '\nStep 3: Session active. Redirecting...')
        setTimeout(() => {
          window.location.href = '/profile'
        }, 500)
      } else {
        setDebugInfo((prev) => prev + '\nNo active session - email verification may be required. Check your email.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('[REGISTER] Error:', err)
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
              <label htmlFor="register-name" className="label">{t('fullName')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="register-name"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  className="input pl-10"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t('fullNamePlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="label">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="register-email"
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
              <label htmlFor="register-password" className="label">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
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
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
