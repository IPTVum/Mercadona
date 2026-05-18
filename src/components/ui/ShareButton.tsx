'use client'

import { Share2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

export default function ShareButton({ title }: { title: string }) {
  const t = useTranslations('share')
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(t('copied'))
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(t('copied'))
      } catch {
        toast.error('Could not copy link')
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
    >
      <Share2 size={16} />
      Share
    </button>
  )
}