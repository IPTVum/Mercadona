import { notFound } from 'next/navigation'

import { Truck, Shield, RefreshCw, Star, ChevronRight } from 'lucide-react'
import { createServerClientSSR } from '@/lib/supabase-server'
import { formatPrice, calculateDiscount, getWhatsAppUrl, getWhatsAppMessage } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'
import { getTranslations } from 'next-intl/server'
import ProductCard from '@/components/product/ProductCard'
import ProductActions from '@/components/product/ProductActions'
import ProductGallery from '@/components/product/ProductGallery'
import type { Product, Review } from '@/types'
import { Link } from '@/i18n/routing'

interface ProductPageProps {
  params: { slug: string }
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const supabase = await createServerClientSSR()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
    if (error) {
      console.error('Supabase product query error:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return null
  }
}

async function getRelatedProducts(productId: string, categoryId: string | null): Promise<Product[]> {
  try {
    const supabase = await createServerClientSSR()
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .neq('id', productId)
      .limit(4)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query
    if (error) {
      console.error('Supabase related products query error:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Failed to fetch related products:', error)
    return []
  }
}

async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const supabase = await createServerClientSSR()
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) {
      console.error('Supabase reviews query error:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Failed to fetch product reviews:', error)
    return []
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  try {
    const product = await getProduct(params.slug)
    if (!product) return { title: 'Product Not Found' }
    return {
      title: (product.meta_title || product.name).substring(0, 70),
      description: (product.meta_description || product.short_description || product.description || '').substring(0, 160),
      openGraph: {
        title: product.meta_title || product.name,
        description: product.meta_description || product.short_description || product.description || '',
        images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
      },
    }
  } catch {
    return { title: 'Product', description: '' }
  }
}

function generateStructuredData(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'MAD',
      availability: product.stock && product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const tp = await getTranslations('product')
  const tc = await getTranslations('common')
  const thf = await getTranslations('home')

  try {
    const [relatedProducts, reviews, whatsappSetting] = await Promise.all([
      getRelatedProducts(product.id, product.category_id),
      getProductReviews(product.id),
      (async () => {
        const supabase = await createServerClientSSR()
        const { data } = await supabase.from('settings').select('value').eq('key', 'whatsapp_number').maybeSingle()
        return data?.value as string || ''
      })(),
    ])

    const discount = calculateDiscount(product.price, product.compare_price)
    const whatsappUrl = getWhatsAppUrl(
      whatsappSetting || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890',
      getWhatsAppMessage(product.name, product.price)
    )
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null

    const structuredData = generateStructuredData(product)

    return (
      <div className="min-h-screen bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <div className="container-custom py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            <ProductGallery images={product.images || []} name={product.name} discount={discount} />
            <div>
              {product.category && (<p className="text-sm font-medium text-primary-600 uppercase tracking-wider mb-2">{product.category.name}</p>)}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-gray-900 leading-tight">{product.name}</h1>
              <div className="mt-3 flex items-center gap-3">{avgRating ? (<><div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-5 h-5 ${i < Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />))}</div><span className="text-sm text-gray-500">{avgRating} ({reviews.length} reviews)</span></>) : (<span className="text-sm text-gray-400">{tp('noReviews')}</span>)}</div>
              <div className="mt-6 flex items-baseline gap-3"><span className="text-3xl lg:text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>{product.compare_price && product.compare_price > product.price && (<span className="text-xl text-gray-400 line-through">{formatPrice(product.compare_price)}</span>)}{discount && (<span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-lg text-sm font-semibold bg-red-100 text-red-700">{tp('discount', { percent: discount })}</span>)}</div>
              {product.short_description && (<p className="mt-4 text-gray-600 leading-relaxed">{product.short_description}</p>)}
              {product.stock !== null && (<div className="mt-5">{product.stock > 0 ? (<span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{tp('inStock')} ({product.stock})</span>) : (<span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-50 px-3 py-1.5 rounded-lg"><span className="w-2 h-2 bg-red-500 rounded-full" />{tp('outOfStock')}</span>)}</div>)}
              <ProductActions product={{ id: product.id, name: product.name, slug: product.slug, price: product.price, compare_price: product.compare_price, images: product.images, stock: product.stock }} discount={discount} whatsappUrl={whatsappUrl} />
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[{ icon: Truck, title: tp('freeShipping'), desc: thf('features.freeShippingDesc', { amount: '50' }) }, { icon: Shield, title: tp('securePayment'), desc: thf('features.securePaymentDesc') }, { icon: RefreshCw, title: tp('easyReturns'), desc: thf('features.easyReturnsDesc') }].map((b, i) => (<div key={i} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl text-center"><div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"><b.icon className="text-primary-600" size={20} /></div><div><p className="text-xs font-semibold text-gray-900">{b.title}</p><p className="text-xs text-gray-500">{b.desc}</p></div></div>))}
              </div>
            </div>
          </div>
          {product.description && (<div className="mt-16"><div className="border-b border-gray-200"><h2 className="text-xl font-display font-bold pb-3 border-b-2 border-primary-600 inline-block">{tp('description')}</h2></div><div className="mt-6 prose max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }} /></div>)}
          {reviews.length > 0 && (<div className="mt-16"><div className="border-b border-gray-200 mb-8"><div className="flex items-center justify-between"><h2 className="text-xl font-display font-bold pb-3 border-b-2 border-primary-600 inline-block">{tp('reviews')}</h2><span className="text-sm text-gray-500">{reviews.length} reviews</span></div></div><div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl mb-8"><div className="text-center"><p className="text-4xl font-bold text-gray-900">{avgRating}</p><div className="flex items-center gap-0.5 mt-1">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-yellow-200'}`} />))}</div></div><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(Number(avgRating) / 5) * 100}%` }} /></div></div><div className="space-y-4">{reviews.map((review) => (<div key={review.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">{(review as any).profiles?.full_name?.[0] || 'A'}</div><div><p className="font-medium text-gray-900">{(review as any).profiles?.full_name || 'Anonymous'}</p><p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div></div><div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />))}</div></div>{review.title && <p className="font-semibold text-gray-900 mb-1">{review.title}</p>}{review.comment && <p className="text-gray-600 leading-relaxed">{review.comment}</p>}</div>))}</div></div>)}
          {relatedProducts.length > 0 && (<div className="mt-16"><div className="flex items-center justify-between mb-8"><h2 className="text-xl md:text-2xl font-display font-bold">{tp('relatedProducts')}</h2><Link href="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm">{tc('viewAll')} <ChevronRight size={16} /></Link></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{relatedProducts.map((product) => (<ProductCard key={product.id} product={product} />))}</div></div>)}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Product page render error:', error)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500">Please try again later.</p>
        </div>
      </div>
    )
  }
}

export const revalidate = 60
