import Link from 'next/link'
import SafeImage from '@/components/ui/SafeImage'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Star, ChevronRight, Tag, Sparkles } from 'lucide-react'
import { createServerClientSSR } from '@/lib/supabase-server'
import ProductCard from '@/components/product/ProductCard'
import NewsletterForm from '@/components/ui/NewsletterForm'
import { formatDate } from '@/lib/utils'
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
  } catch (error) {
    console.error('Failed to fetch featured products:', error)
    return []
  }
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
  } catch (error) {
    console.error('Failed to fetch latest products:', error)
    return []
  }
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
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }
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
  } catch (error) {
    console.error('Failed to fetch latest blogs:', error)
    return []
  }
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
  } catch (error) {
    console.error('Failed to fetch coupons:', error)
    return []
  }
}

async function getFreeShippingMin(): Promise<number> {
  try {
    const supabase = await createServerClientSSR()
    const { data } = await supabase.from('settings').select('value').eq('key', 'free_shipping_min').maybeSingle()
    if (data?.value) {
      const val = Number(data.value)
      return val > 0 ? val : 0
    }
    return 0
  } catch (error) {
    console.error('Failed to fetch shipping settings:', error)
    return 0
  }
}

export default async function HomePage() {
  const [featuredProducts, latestProducts, categories, blogs, coupons, freeShippingMin] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
    getCategories(),
    getLatestBlogs(),
    getActiveCoupons(),
    getFreeShippingMin(),
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
        {/* HD Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed scale-105"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop")',
          }}
        />
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />

        <div className="container-custom py-20 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-primary-100 mb-6 border border-white/10">
              <Sparkles size={14} className="text-yellow-400" />
              New Collection Available
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              Discover Amazing Products<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-white">
                at Unbeatable Prices
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-200 leading-relaxed">
              Shop the latest trends with premium quality products{freeShippingMin > 0 ? ` and free shipping on orders over ${freeShippingMin} DH` : ''}. Your satisfaction guaranteed.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className="px-8 py-3.5 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 active:scale-[0.98]">
                Shop Now <ArrowRight size={20} />
              </Link>
              <Link href="/blog" className="px-8 py-3.5 border-2 border-white/40 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-white/60 transition-all duration-200 backdrop-blur-sm">
                Read Blog
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
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
              { icon: Truck, title: 'Free Shipping', desc: freeShippingMin > 0 ? `On orders over ${freeShippingMin} DH` : 'On qualifying orders' },
              { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support' },
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
              <h2 className="text-2xl md:text-3xl font-display font-bold">Shop by Category</h2>
              <Link href="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group p-6 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <span className="text-2xl font-bold text-primary-600">{category.name[0]}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-700">{category.name}</h3>
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
              <h2 className="text-2xl md:text-3xl font-display font-bold">Featured Products</h2>
              <Link href="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ChevronRight size={16} />
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

      {/* Special Offer / Active Coupons */}
      {coupons.length > 0 ? (
        <section className="py-16">
          <div className="container-custom">
            <div className="bg-gradient-to-r from-accent-600 to-primary-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10">
                <Tag size={200} />
              </div>
              <div className="max-w-xl relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-white/20 text-xs font-medium rounded-full">Limited Offer</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold">
                  {coupons[0].discount_type === 'percentage'
                    ? `Get ${coupons[0].discount_value}% Off!`
                    : `Save $${coupons[0].discount_value}!`}
                </h2>
                <p className="mt-4 text-lg text-accent-100">
                  {coupons[0].description || 'Use this coupon at checkout to save on your order.'}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-mono font-bold text-lg tracking-wider border border-dashed border-white/40">
                    {coupons[0].code}
                  </span>
                  <span className="text-sm text-accent-200">
                    {coupons[0].expires_at ? `Expires ${formatDate(coupons[0].expires_at)}` : 'No expiration'}
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-accent-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Shop Now <ArrowRight size={20} />
                  </Link>
                  {coupons.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-accent-200">More codes:</span>
                      {coupons.slice(1).map((c) => (
                        <span key={c.id} className="px-2 py-1 bg-white/10 text-xs font-mono rounded border border-dashed border-white/20">
                          {c.code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="container-custom">
            <div className="bg-gradient-to-r from-accent-600 to-primary-600 rounded-2xl p-8 md:p-12 text-white">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-display font-bold">Special Offer</h2>
                <p className="mt-4 text-lg text-accent-100">
                  Check back soon for exclusive discounts and promotions!
                </p>
                <Link href="/shop" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-accent-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Browse Products <ArrowRight size={20} />
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
              <h2 className="text-2xl md:text-3xl font-display font-bold">New Arrivals</h2>
              <Link href="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ChevronRight size={16} />
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
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah J.', text: 'Amazing quality and fast shipping! Will definitely order again.', rating: 5 },
              { name: 'Mike T.', text: 'Great customer service and the products exceeded my expectations.', rating: 5 },
              { name: 'Emily R.', text: 'Best online shopping experience. The prices are unbeatable!', rating: 5 },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
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

      {/* Latest Blog Posts */}
      {blogs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold">From Our Blog</h2>
              <Link href="/blog" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="group block">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      {blog.image ? (
                        <SafeImage
                          src={blog.image}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
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
                          <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-md">
                            {blog.tags[0]}
                          </span>
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">{blog.excerpt}</p>
                      )}
                      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-400">{blog.published_at ? formatDate(blog.published_at) : ''}</span>
                        <span className="text-xs font-medium text-primary-600 flex items-center gap-0.5">
                          Read more <ArrowRight size={12} />
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
          <h2 className="text-2xl md:text-3xl font-display font-bold">Subscribe to Our Newsletter</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Get the latest updates on new products and upcoming sales.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}

export const revalidate = 60
