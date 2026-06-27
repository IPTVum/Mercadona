'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'

export function useWhatsappNumber(): string {
  const [number, setNumber] = useState('')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setNumber(String(data.value))
      })
  }, [supabase])

  return number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
}
