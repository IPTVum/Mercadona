'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Send, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface SocialLinks {
  facebook: string
  twitter: string
  instagram: string
  youtube: string
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
  })
  const [storeEmail, setStoreEmail] = useState('hello@webstore.com')
  const [storePhone, setStorePhone] = useState('+1 (234) 567-890')
  const [storeAddress, setStoreAddress] = useState('123 Commerce St, City, State 12345')
  const [siteName, setSiteName] = useState('WebStore')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'social_facebook',
          'social_twitter',
          'social_instagram',
          'social_youtube',
          'contact_email',
          'contact_phone',
          'address',
          'site_name',
        ])

      if (data) {
        const map: Record<string, string> = {}
        data.forEach((s: any) => {
          map[s.key] = String(s.value ?? '')
        })
        setSocialLinks({
          facebook: map.social_facebook || '',
          twitter: map.social_twitter || '',
          instagram: map.social_instagram || '',
          youtube: map.social_youtube || '',
        })
        if (map.contact_email) setStoreEmail(map.contact_email)
        if (map.contact_phone) setStorePhone(map.contact_phone)
        if (map.address) setStoreAddress(map.address)
        if (map.site_name) setSiteName(map.site_name)
      }
    }
    fetchSettings()
  }, [supabase])

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ email: email.trim() }, { onConflict: 'email' })

      if (error) throw error
      toast.success('Subscribed to newsletter!')
      setEmail('')
    } catch (err: any) {
      if (err?.code === '23505') {
        toast.success('You\'re already subscribed!')
      } else {
        toast.error('Failed to subscribe. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const hasAnySocial = socialLinks.facebook || socialLinks.twitter || socialLinks.instagram || socialLinks.youtube

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
          <Link href="/" className="text-2xl font-display font-bold text-white">
            {siteName}
          </Link>
            <p className="mt-4 text-gray-400">
              Your one-stop shop for everything you need. Quality products, great prices, and exceptional service.
            </p>

            {hasAnySocial && (
              <div className="flex gap-3 mt-6">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-800 rounded-lg hover:bg-[#1877F2] transition-colors group" aria-label="Facebook">
                    <Facebook size={18} className="group-hover:text-white transition-colors" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-800 rounded-lg hover:bg-[#1DA1F2] transition-colors group" aria-label="Twitter">
                    <Twitter size={18} className="group-hover:text-white transition-colors" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-800 rounded-lg hover:bg-[#E4405F] transition-colors group" aria-label="Instagram">
                    <Instagram size={18} className="group-hover:text-white transition-colors" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-800 rounded-lg hover:bg-[#FF0000] transition-colors group" aria-label="YouTube">
                    <Youtube size={18} className="group-hover:text-white transition-colors" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/profile" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link href="/profile?tab=orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="mt-0.5 text-primary-400 flex-shrink-0" />
                <span>{storeAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-primary-400 flex-shrink-0" />
                <a href={`tel:${storePhone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors">{storePhone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-primary-400 flex-shrink-0" />
                <a href={`mailto:${storeEmail}`} className="hover:text-white transition-colors">{storeEmail}</a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">Newsletter</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex gap-4 items-center">
            <span className="text-gray-400 text-sm">We accept:</span>
            <span className="text-gray-500 text-xs">Visa</span>
            <span className="text-gray-500 text-xs">Mastercard</span>
            <span className="text-gray-500 text-xs">PayPal</span>
            <span className="text-gray-500 text-xs">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
