import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createServerClientSSR } from '@/lib/supabase-server'
import { Link } from '@/i18n/routing'
import { ArrowRight, Check, Star, Shield, Truck } from 'lucide-react'

interface LandingPageProps {
  params: { slug: string; locale: string }
}

async function getLandingPage(slug: string) {
  const supabase = await createServerClientSSR()
  const { data } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  return data
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const page = await getLandingPage(params.slug)
  if (!page) return { title: 'Page Not Found' }
  const title = params.locale === 'ar' ? page.title_fr : params.locale === 'en' ? page.title_en : page.title_fr
  const desc = params.locale === 'ar' ? page.description_fr : params.locale === 'en' ? page.description_en : page.description_fr
  return { title, description: desc?.substring(0, 160) }
}

export default async function LandingPage({ params }: LandingPageProps) {
  const page = await getLandingPage(params.slug)
  if (!page) notFound()

  const locale = params.locale
  const isEn = locale === 'en'

  const title = isEn ? page.title_en : page.title_fr
  const headline = isEn ? page.headline_en : page.headline_fr
  const description = isEn ? page.description_en : page.description_fr
  const features = isEn ? page.features_en : page.features_fr
  const ctaText = isEn ? page.cta_text_en : page.cta_text_fr
  const ctaUrl = page.cta_url
  const imageUrl = page.image_url
  const bgColor = page.bg_color || '#f9fafb'
  const featuresList: string[] = features ? features.split('\n').filter(Boolean) : []

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <span className="ml-1">{isEn ? '5.0 Rated' : 'Noté 5.0'}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
                {headline}
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
                {description}
              </p>

              {featuresList.length > 0 && (
                <ul className="mt-8 space-y-3">
                  {featuresList.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature.replace(/^[✓✔•\-]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href={ctaUrl} className="btn-primary text-lg px-8 py-4 shadow-xl">
                  {ctaText} <ArrowRight size={20} className="ml-2" />
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Truck size={16} />
                  <span>{isEn ? 'Free Worldwide Shipping' : 'Livraison Gratuite Mondiale'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={16} />
                  <span>{isEn ? '30-Day Guarantee' : 'Garantie 30 Jours'}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full rounded-2xl shadow-2xl" />
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-2xl">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🕌</div>
                    <h2 className="text-2xl font-bold text-amber-900">{title}</h2>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: '🧶', title: isEn ? '100% Wool' : '100% Laine', desc: isEn ? 'Natural fibers' : 'Fibres naturelles' },
              { icon: '🤲', title: isEn ? 'Handwoven' : 'Tissé Main', desc: isEn ? 'By artisans' : 'Par des artisans' },
              { icon: '🌿', title: isEn ? 'Organic Dyes' : 'Teintures Bio', desc: isEn ? 'Eco-friendly' : 'Écologique' },
              { icon: '💎', title: isEn ? 'Unique Piece' : 'Pièce Unique', desc: isEn ? 'One of a kind' : 'Unique au monde' },
            ].map((item) => (
              <div key={item.title}>
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            {isEn ? 'Ready to transform your space?' : 'Prêt à transformer votre intérieur ?'}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {isEn ? 'Each rug carries centuries of tradition. Bring authentic Moroccan craftsmanship into your home today.' : 'Chaque tapis porte des siècles de tradition. Apportez l\'artisanat marocain authentique dans votre maison dès aujourd\'hui.'}
          </p>
          <Link href={ctaUrl} className="mt-8 btn-primary text-lg px-8 py-4 inline-flex shadow-xl">
            {ctaText} <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200" style={{ backgroundColor: bgColor }}>
        <p>{isEn ? '© 2024 WebStore — Authentic Moroccan Berber Rugs' : '© 2024 WebStore — Tapis Berbères Marocains Authentiques'}</p>
      </footer>
    </div>
  )
}
