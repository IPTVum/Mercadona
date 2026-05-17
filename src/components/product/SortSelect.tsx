'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function SortSelect() {
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
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="name_asc">Name: A-Z</option>
    </select>
  )
}
