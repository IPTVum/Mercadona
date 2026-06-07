import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createServerClientSSR } from '@/lib/supabase-server'
import { Link } from '@/i18n/routing'
import { ArrowRight, Check, Star, Shield, Truck, Play, ChevronLeft, ChevronRight, Sparkles, Award } from 'lucide-react'
import { LandingGallery } from './gallery'

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
  return {
    title,
    description: desc?.substring(0, 160),
    openGraph: page.image_url ? { images: [page.image_url] } : undefined,
  }
}

function AnimatedSection({ children, enabled, className = '' }: { children: React.ReactNode; enabled: boolean; className?: string }) {
  if (!enabled) return <>{children}</>
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  )
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
  const galleryImages: string[] = page.gallery_images || []
  const imageAnimation = page.image_animation
  const heroLayout = page.hero_layout || 'image-right'
  const videoUrl: string | null = page.video_url || null
  const secondaryCtaText = isEn ? page.secondary_cta_text_en : page.secondary_cta_text_fr
  const secondaryCtaUrl = page.secondary_cta_url
  const enableAnimations = page.enable_animations !== undefined ? page.enable_animations : true
  const badgeText = isEn ? page.badge_text_en : page.badge_text_fr
  const galleryAutoplay = page.gallery_autoplay || 4
  const featuresList: string[] = features ? features.split('\n').filter(Boolean) : []

  const allImages = galleryImages.length > 0 ? galleryImages : (imageUrl ? [imageUrl] : [])
  const hasImages = allImages.length > 0

  const animClass = enableAnimations ? 'animate-slide-in-left' : ''
  const animRight = enableAnimations ? 'animate-slide-in-right' : ''
  const animZoom = enableAnimations ? 'animate-zoom-in' : ''
  const animFade = enableAnimations ? 'animate-fade-in' : ''

  const heroImageAnimationClass = imageAnimation === 'float' ? 'animate-float-slow' :
    imageAnimation === 'zoom' ? 'animate-zoom-in' :
    imageAnimation === 'slide-in' ? 'animate-slide-in-right' :
    imageAnimation === 'fade' ? 'animate-fade-in' : ''

  const isSplit = heroLayout === 'split'
  const isImageLeft = heroLayout === 'image-left'
  const isStacked = heroLayout === 'stacked'

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* Top badge banner (optional sparkle) */}
      {badgeText && (
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 text-white py-2 text-center text-sm font-medium animate-fade-in">
          <Sparkles size={14} className="inline mr-1.5" /> {badgeText}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 relative z-10">
          <div className={`grid lg:grid-cols-2 gap-12 items-center ${isStacked ? 'lg:grid-cols-1 text-center' : isImageLeft ? 'lg:flex-row-reverse' : ''}`}
               style={{ direction: isImageLeft && !isStacked ? 'rtl' : 'ltr' }}>
            {/* Text column */}
            <div style={{ direction: 'ltr' }}>
              {/* Rating badge */}
              <div className={`inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6 ${animFade} stagger-1`}>
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <span className="ml-1">{isEn ? '5.0 Rated' : 'Noté 5.0'}</span>
              </div>

              {/* Headline with optional gradient */}
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight ${animClass} stagger-2`}>
                {headline}
              </h1>

              {/* Description */}
              <p className={`mt-6 text-lg text-gray-600 leading-relaxed max-w-xl ${isStacked ? 'mx-auto' : ''} ${animClass} stagger-3`}>
                {description}
              </p>

              {/* Features list */}
              {featuresList.length > 0 && (
                <ul className={`mt-8 space-y-3 ${isStacked ? 'max-w-md mx-auto text-left' : ''} ${animFade} stagger-4`}>
                  {featuresList.map((feature, i) => (
                    <li key={i} className={`flex items-start gap-3 ${animClass} stagger-${Math.min(i + 3, 6)}`}>
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature.replace(/^[✓✔•\-]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* CTAs */}
              <div className={`mt-10 flex flex-col sm:flex-row gap-4 ${isStacked ? 'justify-center' : ''} ${animFade} stagger-5`}>
                <Link href={ctaUrl} className="group btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5">
                  {ctaText}
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                {secondaryCtaText && secondaryCtaUrl && (
                  <Link href={secondaryCtaUrl} className="btn-outline text-lg px-8 py-4">
                    {secondaryCtaText}
                  </Link>
                )}
              </div>

              {/* Trust badges */}
              <div className={`mt-8 flex items-center gap-6 text-sm text-gray-500 ${isStacked ? 'justify-center' : ''} ${animFade} stagger-6`}>
                <div className="flex items-center gap-1.5">
                  <Truck size={16} className="text-primary-600" />
                  <span>{isEn ? 'Free Worldwide Shipping' : 'Livraison Gratuite Mondiale'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={16} className="text-primary-600" />
                  <span>{isEn ? '30-Day Guarantee' : 'Garantie 30 Jours'}</span>
                </div>
              </div>
            </div>

            {/* Image/Media column */}
            <div className={`relative ${isStacked ? 'max-w-2xl mx-auto w-full' : ''}`}>
              {/* Gallery */}
              {hasImages && allImages.length > 1 ? (
                <LandingGallery
                  images={allImages}
                  animationClass={heroImageAnimationClass}
                  autoplayInterval={galleryAutoplay}
                />
              ) : hasImages ? (
                <div className={`relative group overflow-hidden rounded-2xl shadow-2xl ${heroImageAnimationClass}`}>
                  {/* Shimmer overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
                  <img
                    src={allImages[0]}
                    alt={title}
                    className="w-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Glow ring on hover */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-500/20 pointer-events-none" />
                </div>
              ) : (
                <div className={`w-full aspect-square bg-gradient-to-br from-amber-100 via-orange-200 to-amber-300 rounded-2xl flex items-center justify-center shadow-2xl animate-gradient ${animZoom}`}>
                  <div className="text-center p-8">
                    <div className="text-7xl mb-4 animate-float">🕌</div>
                    <h2 className="text-2xl font-bold text-amber-900">{title}</h2>
                  </div>
                </div>
              )}

              {/* Video play button if video exists */}
              {videoUrl && (
                <div className="absolute bottom-4 right-4 z-20">
                  <a href={videoUrl} target="_blank" rel="noopener"
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full shadow-lg hover:bg-white transition-all hover:scale-105 text-sm font-medium animate-pulse-glow">
                    <Play size={16} className="fill-primary-600 text-primary-600" />
                    {isEn ? 'Watch Video' : 'Voir la Vidéo'}
                  </a>
                </div>
              )}

              {/* Decorative floating elements */}
              {enableAnimations && (
                <>
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-amber-200/40 rounded-full blur-xl animate-float hidden lg:block" />
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-orange-200/30 rounded-full blur-2xl animate-float-slow hidden lg:block" style={{ animationDelay: '2s' }} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
      </section>

      {/* Trust / Quality Section */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection enabled={enableAnimations}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { icon: '🧶', title: isEn ? '100% Natural Wool' : '100% Laine Naturelle', desc: isEn ? 'Premium quality fibers' : 'Fibres de qualité premium' },
                { icon: '🤲', title: isEn ? 'Handwoven by Artisans' : 'Tissé Main', desc: isEn ? 'Centuries of tradition' : 'Des siècles de tradition' },
                { icon: '🌿', title: isEn ? 'Organic Dyes Only' : 'Teintures Bio', desc: isEn ? 'Eco-friendly process' : 'Procédé écologique' },
                { icon: '💎', title: isEn ? 'One-of-a-Kind' : 'Pièce Unique', desc: isEn ? 'No two rugs are alike' : 'Aucun tapis identique' },
              ].map((item, i) => (
                <div key={item.title} className={`group ${animZoom} stagger-${i + 1}`}>
                  <div className="text-5xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats bar (animated numbers) */}
      {enableAnimations && (
        <section className="py-12 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '200+', labelEn: 'Happy Customers', labelFr: 'Clients Satisfaits' },
                { value: '15+', labelEn: 'Years of Heritage', labelFr: 'Ans d\'Héritage' },
                { value: '50+', labelEn: 'Unique Designs', labelFr: 'Designs Uniques' },
                { value: '100%', labelEn: 'Handmade', labelFr: 'Fait Main' },
              ].map((stat, i) => (
                <div key={i} className={`animate-slide-up stagger-${i + 1}`}>
                  <div className="text-3xl md:text-4xl font-display font-bold text-amber-700">{stat.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{isEn ? stat.labelEn : stat.labelFr}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <AnimatedSection enabled={enableAnimations}>
            <h2 className={`text-3xl md:text-4xl font-display font-bold text-gray-900 ${animZoom}`}>
              {isEn ? 'Ready to transform your space?' : 'Prêt à transformer votre intérieur ?'}
            </h2>
            <p className={`mt-4 text-lg text-gray-600 ${animFade}`}>
              {isEn
                ? 'Each rug carries centuries of tradition. Bring authentic Moroccan craftsmanship into your home today.'
                : 'Chaque tapis porte des siècles de tradition. Apportez l\'artisanat marocain authentique dans votre maison dès aujourd\'hui.'}
            </p>
            <div className={`mt-8 flex flex-col sm:flex-row gap-4 justify-center ${animFade}`}>
              <Link href={ctaUrl} className="group btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                {ctaText}
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              {secondaryCtaText && secondaryCtaUrl && (
                <Link href={secondaryCtaUrl} className="btn-outline text-lg px-8 py-4">
                  {secondaryCtaText}
                </Link>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200" style={{ backgroundColor: bgColor }}>
        <p>{isEn ? '© 2024 WebStore — Authentic Moroccan Berber Rugs' : '© 2024 WebStore — Tapis Berbères Marocains Authentiques'}</p>
      </footer>
    </div>
  )
}
