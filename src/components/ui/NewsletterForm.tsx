'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ email: email.trim() }, { onConflict: 'email' })

      if (error) throw error
      toast.success('Subscribed successfully!')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Enter your email"
        required
        className="flex-1 px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-primary-600 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2 justify-center"
      >
        {loading ? 'Sending...' : <><Send size={16} /> Subscribe</>}
      </button>
    </form>
  )
}
