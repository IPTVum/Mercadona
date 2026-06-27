import SafeImage from '@/components/ui/SafeImage'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Star, ChevronRight, Tag, Sparkles } from 'lucide-react'
import { createServerClientSSR } from '@/lib/supabase-server'
import ProductCard from '@/components/product/ProductCard'
import NewsletterForm from '@/components/ui/NewsletterForm'
import { formatDate } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import type { Product, Blog, Category, Coupon } from '@/types'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(8)
    return data || []
  } catch { return [] }
}

async function getLatestProducts(): Promise<Product[]> {
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8)
    return data || []
  } catch { return [] }
}

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .is('parent_id', null)
      .order('sort_order')
      .limit(6)
    return data || []
  } catch { return [] }
}

async function getLatestBlogs() {
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase
      .from('blogs')
      .select('*, profiles(full_name, avatar_url)')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3)
    return data || []
  } catch { return [] }
}

async function getActiveCoupons(): Promise<Coupon[]> {
  try {
    const supabase = await createServerClientSSR()
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(3)
    return data || []
  } catch { return [] }
}

async function getFreeShippingMin(): Promise<number> {
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase.from('settings').select('value').eq('key', 'free_shipping_min').maybeSingle()
    if (data?.value) { const val = Number(data.value); return val > 0 ? val : 0 }
    return 0
  } catch { return 0 }
}

export default async function HomePage() {
  const t = await getTranslations('home')
  const [featuredProducts, latestProducts, categories, blogs, coupons, freeShippingMin] = await Promise.all([
    getFeaturedProducts(), getLatestProducts(), getCategories(), getLatestBlogs(), getActiveCoupons(), getFreeShippingMin(),
  ])

  const shippingText = freeShippingMin > 0 ? t('hero.freeShippingPart', { amount: freeShippingMin }) : ''

  return (
    <div>
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed scale-105"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />

        <div className="container-custom py-20 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-primary-100 mb-6 border border-white/10">
              <Sparkles size={14} className="text-yellow-400" />
              {t('hero.newCollection')}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              {t('hero.title')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-white">
                {t('hero.subtitle')}
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-200 leading-relaxed">
              {t('hero.description', { shipping: shippingText })}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className="px-8 py-3.5 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 active:scale-[0.98]">
                {t('hero.shopNow')} <ArrowRight size={20} />
              </Link>
              <Link href="/blog" className="px-8 py-3.5 border-2 border-white/40 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-white/60 transition-all duration-200 backdrop-blur-sm">
                {t('hero.readBlog')}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: t('features.freeShipping'), desc: freeShippingMin > 0 ? t('features.freeShippingDesc', { amount: freeShippingMin }) : t('features.freeShippingDefault') },
              { icon: Shield, title: t('features.securePayment'), desc: t('features.securePaymentDesc') },
              { icon: RefreshCw, title: t('features.easyReturns'), desc: t('features.easyReturnsDesc') },
              { icon: Headphones, title: t('features.support'), desc: t('features.supportDesc') },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <feature.icon className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold">{t('categories.title')}</h2>
              <Link href="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                {t('hero.shopNow')} <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:shadow-md transition-all duration-300 text-center"
                >
                  <div className="w-full aspect-square mx-auto mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {category.name.toLowerCase().includes('rug') || category.name.toLowerCase().includes('tapis') || category.name.toLowerCase().includes('carpet')
                          ? '🧶'
                          : category.name.toLowerCase().includes('pillow') || category.name.toLowerCase().includes('cushion')
                          ? '🛋️'
                          : category.name.toLowerCase().includes('lamp') || category.name.toLowerCase().includes('light')
                          ? '🏮'
                          : category.name.toLowerCase().includes('table') || category.name.toLowerCase().includes('furniture')
                          ? '🪑'
                          : category.name.toLowerCase().includes('ceramic') || category.name.toLowerCase().includes('pottery')
                          ? '🏺'
                          : '🧶'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 group-hover:text-primary-700 line-clamp-2">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold">{t('featuredProducts.title')}</h2>
              <Link href="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                {t('hero.shopNow')} <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coupons */}
      {coupons.length > 0 ? (
        <section className="py-16">
          <div className="container-custom">
            <div className="relative bg-gradient-to-br from-accent-600 via-primary-600 to-primary-700 animate-gradient rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/20">
              {/* Decorative background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full animate-float-slow" />
                <div className="absolute -bottom-32 -left-10 w-96 h-96 bg-white/5 rounded-full animate-float" />
                <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                {/* Sparkle decorations */}
                <Sparkles size={24} className="absolute top-8 right-1/4 text-white/20 animate-pulse" />
                <Sparkles size={16} className="absolute bottom-12 right-1/3 text-white/15 animate-pulse" style={{ animationDelay: '0.5s' } as any} />
                <Sparkles size={20} className="absolute top-1/2 right-10 text-white/10 animate-pulse" style={{ animationDelay: '1s' } as any} />
              </div>

              <div className="grid md:grid-cols-2 items-center relative z-10">
                {/* Left: Offer details */}
                <div className="p-8 md:p-12 lg:p-14 animate-slide-in-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider border border-white/20">
                    <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                    {t('coupons.limitedOffer')}
                  </div>

                  <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-display font-black text-white leading-[1.05]">
                    {coupons[0].discount_type === 'percentage'
                      ? t('coupons.getPercentOff', { value: coupons[0].discount_value })
                      : t('coupons.saveAmount', { value: coupons[0].discount_value })}
                  </h2>

                  <p className="mt-4 text-lg text-white/80 max-w-md">
                    {coupons[0].description || t('coupons.useCoupon')}
                  </p>

                  {/* Coupon code + expiry */}
                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <div className="group relative">
                      <div className="absolute inset-0 bg-white/10 rounded-xl blur-md group-hover:bg-white/20 transition-colors" />
                      <div className="relative px-5 py-3 bg-white/15 backdrop-blur-md rounded-xl border-2 border-dashed border-white/40">
                        <p className="text-[10px] uppercase tracking-widest text-white/60 font-medium">Coupon Code</p>
                        <p className="font-mono font-black text-2xl tracking-[0.2em] text-white">
                          {coupons[0].code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-white/70">
                      <Tag size={14} />
                      {coupons[0].expires_at
                        ? t('coupons.expires', { date: formatDate(coupons[0].expires_at) })
                        : t('coupons.noExpiration')}
                    </div>
                  </div>

                  {/* CTA + more codes */}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href="/shop"
                      className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-accent-700 rounded-xl font-bold text-lg hover:bg-yellow-50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20"
                    >
                      {t('hero.shopNow')}
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    {coupons.length > 1 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-white/60">{t('coupons.moreCodes')}</span>
                        {coupons.slice(1).map((c, i) => (
                          <span
                            key={c.id}
                            className="px-2.5 py-1 bg-white/10 backdrop-blur-sm text-xs font-mono font-semibold rounded-lg border border-dashed border-white/25 hover:bg-white/15 transition-colors"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            {c.code}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Giant discount visual */}
                <div className="relative h-full min-h-[280px] flex items-center justify-center p-8 md:p-12 animate-slide-in-right">
                  {/* Rotating ring decoration */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 md:w-72 md:h-72 border-2 border-dashed border-white/15 rounded-full animate-spin" style={{ animationDuration: '30s' }} />
                    <div className="absolute w-80 h-80 md:w-96 md:h-96 border border-white/5 rounded-full" />
                  </div>

                  {/* Giant discount badge */}
                  <div className="relative animate-float">
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-48 h-48 md:w-56 md:h-56 bg-white rounded-full flex flex-col items-center justify-center shadow-2xl">
                      <div className="absolute inset-2 border-2 border-dashed border-accent-300/40 rounded-full" />
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                        <Tag size={18} className="text-accent-700" />
                      </div>
                      {coupons[0].discount_type === 'percentage' ? (
                        <>
                          <span className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-accent-600 to-primary-600 leading-none">
                            {coupons[0].discount_value}
                          </span>
                          <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-accent-600 to-primary-600 -mt-1">%</span>
                          <span className="mt-1 text-sm font-bold uppercase tracking-wider text-gray-500">OFF</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-accent-600 to-primary-600 leading-none">
                            {coupons[0].discount_value}
                          </span>
                          <span className="text-lg font-bold text-gray-500">DH OFF</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom shimmer bar */}
              <div className="h-1 bg-white/10 overflow-hidden">
                <div className="h-full w-1/3 bg-white/40 animate-shimmer" />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="container-custom">
            <div className="relative bg-gradient-to-br from-accent-600 via-primary-600 to-primary-700 animate-gradient rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/20">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full animate-float-slow" />
              <div className="absolute -bottom-32 -left-10 w-96 h-96 bg-white/5 rounded-full animate-float" />
              <div className="relative z-10 p-8 md:p-12 lg:p-14 max-w-xl animate-slide-in-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider border border-white/20">
                  <Sparkles size={14} className="text-yellow-300" />
                  {t('coupons.specialOffer')}
                </div>
                <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white">{t('coupons.specialOffer')}</h2>
                <p className="mt-4 text-lg text-white/80">{t('coupons.checkBack')}</p>
                <Link href="/shop" className="mt-6 group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-accent-700 rounded-xl font-bold text-lg hover:bg-yellow-50 transition-all hover:scale-105">
                  {t('hero.shopNow')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold">{t('newArrivals.title')}</h2>
              <Link href="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                {t('hero.shopNow')} <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-12">{t('testimonials.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {t.raw('testimonials.reviews').map((testimonial: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="text-yellow-400 fill-yellow-400" size={20} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      {blogs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold">{t('blog.title')}</h2>
              <Link href="/blog" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                {t('hero.shopNow')} <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="group block">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      {blog.image ? (
                        <SafeImage src={blog.image} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-50 to-accent-50 text-primary-300">
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="mb-2">
                          <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-md">{blog.tags[0]}</span>
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">{blog.title}</h3>
                      {blog.excerpt && <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">{blog.excerpt}</p>}
                      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-400">{blog.published_at ? formatDate(blog.published_at) : ''}</span>
                        <span className="text-xs font-medium text-primary-600 flex items-center gap-0.5">
                          {t('hero.shopNow')} <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold">{t('newsletter.title')}</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">{t('newsletter.description')}</p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}

export const revalidate = 60
