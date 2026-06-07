'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { MessageCircle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function FloatingWhatsApp() {
  const t = useTranslations('common')
  const supabase = useMemo(() => createClient(), [])
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [visible, setVisible] = useState(false)
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setWhatsappNumber(String(data.value))
      })
  }, [supabase])

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => {
      setBounce(true)
      setTimeout(() => setBounce(false), 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [visible])

  const number = whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  const cleanNumber = number.replace(/[^0-9]/g, '')
  const href = cleanNumber ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(t('whatsappGreeting'))}` : '#'

  if (!cleanNumber) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 group transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Label tooltip */}
      <span className="bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap -translate-x-1 group-hover:translate-x-0 transform pointer-events-none">
        {t('chatWithUs')}
      </span>

      {/* Button */}
      <span
        className={`relative flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer ${
          bounce ? 'animate-bounce' : ''
        }`}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse opacity-30" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />

        <MessageCircle size={26} className="text-white relative z-10" />
      </span>
    </a>
  )
}
