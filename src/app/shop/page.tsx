import { createServerClientSSR } from '@/lib/supabase-server'
import ProductCard from '@/components/product/ProductCard'
import SortSelect from '@/components/product/SortSelect'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Product, Category } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ShopPageProps {
  searchParams: {
    category?: string
    search?: string
    sort?: string
    page?: string
  }
}

async function getProducts(searchParams: ShopPageProps['searchParams']): Promise<{ products: Product[]; total: number }> {
  try {
    const supabase = await createServerClientSSR()

    let categoryId: string | null = null
    if (searchParams.category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', searchParams.category)
        .maybeSingle()
      categoryId = cat?.id || null
    }

    let query = supabase
      .from('products')
      .select('*, categories(*)', { count: 'exact' })
      .eq('is_active', true)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (searchParams.search) {
      query = query.ilike('name', `%${searchParams.search}%`)
    }

    switch (searchParams.sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const pageNum = parseInt(searchParams.page || '1')
    const limit = 12
    const from = Math.max(0, (isNaN(pageNum) ? 0 : pageNum - 1)) * limit
    const to = from + limit - 1

    const { data, count } = await query.range(from, to)

    return { products: data || [], total: count || 0 }
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return { products: [], total: 0 }
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    return data || []
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }
}

function buildSearchParams(
  existing: Record<string, string | string[] | undefined>,
  overrides: Record<string, string>
): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(existing)) {
    if (value !== undefined && typeof value === 'string') {
      params.set(key, value)
    }
  }
  for (const [key, value] of Object.entries(overrides)) {
    params.set(key, value)
  }
  return params.toString()
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { products, total } = await getProducts(searchParams)
  const categories = await getCategories()

  const page = parseInt(searchParams.page || '1')
  const limit = 12
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold">Shop</h1>
        <p className="mt-2 text-gray-600">{total} products found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/shop"
                  className={`block px-3 py-2 rounded-lg ${!searchParams.category ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}`}
                >
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className={`block px-3 py-2 rounded-lg ${searchParams.category === cat.slug ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Suspense fallback={<div className="input w-auto h-10 bg-gray-100 animate-pulse" />}>
                <SortSelect />
              </Suspense>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/shop?${buildSearchParams(searchParams, { page: String(page - 1) })}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/shop?${buildSearchParams(searchParams, { page: String(p) })}`}
                      className={`px-4 py-2 rounded-lg ${p === page ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                    >
                      {p}
                    </Link>
                  ))}
                  {page < totalPages && (
                    <Link
                      href={`/shop?${buildSearchParams(searchParams, { page: String(page + 1) })}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">No products found</p>
              <Link href="/shop" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
                View all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const revalidate = 60
