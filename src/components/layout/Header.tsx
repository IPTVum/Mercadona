'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  User,
  Heart,
  ChevronDown,
  Sparkles,
  Tag,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Category } from '@/types'
import { useHasMounted } from '@/lib/useHasMounted'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

export default function Header() {
  const t = useTranslations('header')
  const hasMounted = useHasMounted()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [user, setUser] = useState<any>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [freeShippingMin, setFreeShippingMin] = useState<number>(0)
  const [siteName, setSiteName] = useState('WebStore')
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; description: string | null; discount_type: string; discount_value: number } | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const { getItemCount } = useCart()
  const { items: wishlistItems } = useWishlist()
  const itemCount = getItemCount()
  const wishlistCount = wishlistItems.length
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('sort_order')
      if (data) setCategories(data)
    }
    fetchCategories()

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch {
        setUser(null)
      }
    }
    getUser()

    const fetchSettings = async () => {
      const [settingRes, couponRes, nameRes] = await Promise.all([
        supabase.from('settings').select('value').eq('key', 'free_shipping_min').maybeSingle(),
        supabase
          .from('coupons')
          .select('code, description, discount_type, discount_value')
          .eq('is_active', true)
          .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
          .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase.from('settings').select('value').eq('key', 'site_name').maybeSingle(),
      ])
      if (settingRes.data?.value) setFreeShippingMin(Number(settingRes.data.value))
      if (couponRes.data && couponRes.data.length > 0) setActiveCoupon(couponRes.data[0])
      if (nameRes.data?.value) setSiteName(String(nameRes.data.value))
      setSettingsLoaded(true)
    }
    fetchSettings()
  }, [supabase])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }, [searchQuery, router])

  const isActive = (path: string) => pathname === path

  const couponBanner = activeCoupon && (
    <div className="bg-gradient-to-r from-accent-600 via-primary-600 to-primary-700 text-white py-2">
      <div className="container-custom flex justify-between items-center text-sm">
        <p className="flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-300 animate-pulse" />
          <span className="font-medium">
            {activeCoupon.discount_type === 'percentage'
              ? t('percentOff', { value: activeCoupon.discount_value })
              : t('amountOff', { value: activeCoupon.discount_value })}
          </span>
          <span className="hidden sm:inline">{t('withCode')}</span>
          <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded text-xs font-mono font-bold tracking-wider border border-dashed border-white/30">
            {activeCoupon.code}
          </span>
          {activeCoupon.description && (
            <span className="hidden md:inline text-primary-100">— {activeCoupon.description}</span>
          )}
        </p>
        <div className="hidden md:flex gap-4">
          <Link href="/shop" className="hover:text-primary-200">{t('shopNow')}</Link>
          <Link href="/blog" className="hover:text-primary-200">{t('blog')}</Link>
        </div>
      </div>
    </div>
  )

  const shippingBanner = !activeCoupon && freeShippingMin > 0 && (
    <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 text-white py-2">
      <div className="container-custom flex justify-between items-center text-sm">
        <p className="flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-300" />
          {t('freeShippingBanner', { amount: freeShippingMin })}
        </p>
        <div className="hidden md:flex gap-4">
          <Link href="/contact" className="hover:text-primary-200">{t('contact')}</Link>
          <Link href="/blog" className="hover:text-primary-200">{t('blog')}</Link>
        </div>
      </div>
    </div>
  )

  const defaultBanner = !activeCoupon && freeShippingMin <= 0 && (
    <div className="bg-gray-900 text-gray-300 py-2">
      <div className="container-custom flex justify-between items-center text-sm">
        <p>{t('welcomeBanner', { name: siteName })}</p>
        <div className="hidden md:flex gap-4">
          <Link href="/contact" className="hover:text-white">{t('contact')}</Link>
          <Link href="/blog" className="hover:text-white">{t('blog')}</Link>
        </div>
      </div>
    </div>
  )

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {hasMounted && settingsLoaded && couponBanner}
      {hasMounted && settingsLoaded && shippingBanner}
      {hasMounted && settingsLoaded && defaultBanner}
      {hasMounted && !settingsLoaded && (
        <div className="bg-gray-100 py-2">
          <div className="container-custom">
            <div className="h-5 w-48 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      )}

      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="text-2xl font-display font-bold text-gradient">
              {siteName}
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`font-medium transition-colors ${isActive('/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
              {t('home')}
            </Link>

            <div className="relative group">
              <Link href="/shop" className={`flex items-center gap-1 font-medium transition-colors ${pathname.startsWith('/shop') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'} group-hover:text-primary-600`}>
                {t('shop')} <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180" />
              </Link>

              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[520px] z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t('categories')}</h3>
                      <Link href="/shop" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                        {t('allProducts')} <ChevronDown size={12} className="-rotate-90" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/shop"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors col-span-2"
                      >
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Sparkles size={20} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-primary-700">{t('allProducts')}</p>
                          <p className="text-xs text-primary-500">{t('browseEverything')}</p>
                        </div>
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop?category=${cat.slug}`}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group/cat"
                        >
                          <div className="w-10 h-10 bg-gray-100 group-hover/cat:bg-primary-50 rounded-lg flex items-center justify-center transition-colors">
                            <Tag size={18} className="text-gray-500 group-hover/cat:text-primary-600 transition-colors" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm group-hover/cat:text-primary-700 transition-colors">{cat.name}</p>
                            <p className="text-xs text-gray-400">
                              {cat.description ? cat.description.slice(0, 30) + (cat.description.length > 30 ? '...' : '') : t('shopNow')}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/blog" className={`font-medium transition-colors ${pathname.startsWith('/blog') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
              {t('blog')}
            </Link>
            <Link href="/contact" className={`font-medium transition-colors ${isActive('/contact') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
              {t('contact')}
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSwitcher />

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg hidden sm:block"
              aria-label="Toggle search"
            >
              <Search size={20} className="text-gray-700" />
            </button>

            <Link href="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-lg hidden sm:block" aria-label={t('wishlist')}>
              <Heart size={20} className={`text-gray-700 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {hasMounted && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg" aria-label={t('cart')}>
              <ShoppingCart size={20} className="text-gray-700" />
              {hasMounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href={user ? '/profile' : '/login'} className="p-2 hover:bg-gray-100 rounded-lg" aria-label={user ? t('myAccount') : t('login')}>
              <User size={20} className="text-gray-700" />
            </Link>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-4 animate-slide-down">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="input pr-12"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
                <Search size={18} className="text-primary-600" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-200 bg-white animate-slide-down">
          <div className="container-custom py-4 space-y-2">
            <Link href="/" className={`block px-4 py-2 rounded-lg ${isActive('/') ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>
              {t('home')}
            </Link>
            <Link href="/shop" className={`block px-4 py-2 rounded-lg ${pathname.startsWith('/shop') ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>
              {t('allProducts')}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="block px-4 py-2 pl-8 hover:bg-gray-50 rounded-lg text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/blog" className={`block px-4 py-2 rounded-lg ${pathname.startsWith('/blog') ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>
              {t('blog')}
            </Link>
            <Link href="/contact" className={`block px-4 py-2 rounded-lg ${isActive('/contact') ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>
              {t('contact')}
            </Link>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                <Heart size={16} />
                {t('wishlist')}
                {wishlistCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">{wishlistCount}</span>
                )}
              </Link>
              <Link href={user ? '/profile' : '/login'} className="block px-4 py-2 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                {user ? t('myAccount') : t('login')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
