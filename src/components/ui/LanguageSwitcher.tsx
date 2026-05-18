'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇲🇦' },
] as const

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentLang = languages.find((l) => l.code === locale) || languages[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const switchTo = (code: string) => {
    setOpen(false)
    router.replace(pathname, { locale: code })
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded-lg text-sm"
        aria-label="Switch language"
      >
        <Globe size={18} className="text-gray-600" />
        <span className="hidden md:inline">{currentLang.flag} {currentLang.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px] z-50 animate-slide-down">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchTo(lang.code)}
              className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                lang.code === locale ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === locale && (
                <span className="ml-auto text-primary-600 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
