'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export default function SortSelect() {
  const t = useTranslations('shop')
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'newest'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <select
      className="input w-auto"
      value={currentSort}
      onChange={handleChange}
    >
      <option value="newest">{t('sort.newest')}</option>
      <option value="price_asc">{t('sort.priceLowHigh')}</option>
      <option value="price_desc">{t('sort.priceHighLow')}</option>
      <option value="name_asc">{t('sort.nameAZ')}</option>
    </select>
  )
}
