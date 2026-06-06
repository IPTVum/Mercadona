'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Link } from '@/i18n/routing'

export default function ContactPage() {
  const t = useTranslations('contact')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contactInfo, setContactInfo] = useState({
    email: 'hello@webstore.com',
    phone: '+1 (234) 567-890',
    address: '123 Commerce St, City, State 12345',
  })
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const fetchContactInfo = async () => {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['contact_email', 'contact_phone', 'address'])

      if (data) {
        const map: Record<string, string> = {}
        data.forEach((s: any) => { map[s.key] = String(s.value ?? '') })
        setContactInfo({
          email: map.contact_email || 'hello@webstore.com',
          phone: map.contact_phone || '+1 (234) 567-890',
          address: map.address || '123 Commerce St, City, State 12345',
        })
      }
    }
    fetchContactInfo()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = t('nameRequired')
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('emailInvalid')
    if (!formData.subject.trim()) newErrors.subject = t('subjectRequired')
    if (!formData.message.trim() || formData.message.trim().length < 10) newErrors.message = t('messageTooShort')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error(t('fillAllFields'))
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      })

      if (error) throw error

      setSubmitted(true)
      toast.success(t('success'))
    } catch (err: any) {
      toast.error(err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-custom py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold">{t('title')}</h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-xl border border-gray-200">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t('success')}</h2>
                <p className="text-gray-600">{t('subtitle')}</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 btn-secondary">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className={`label ${errors.name ? 'text-red-600' : ''}`}>{t('name')} *</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder={t('namePlaceholder')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className={`label ${errors.email ? 'text-red-600' : ''}`}>{t('email')} *</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder={t('emailPlaceholder')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className={`label ${errors.subject ? 'text-red-600' : ''}`}>{t('subject')} *</label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    required
                    className={`input ${errors.subject ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder={t('subjectPlaceholder')}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                  {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
                </div>
                <div>
                  <label htmlFor="contact-message" className={`label ${errors.message ? 'text-red-600' : ''}`}>{t('message')} *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    className={`input ${errors.message ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder={t('messagePlaceholder')}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                  {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  <Send size={20} />
                  {loading ? t('loading') : t('submit')}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-lg mb-4">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-primary-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">{contactInfo.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-primary-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">{t('phone')}</p>
                  <a href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`} className="text-primary-600 hover:text-primary-700">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="text-primary-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">{t('email')}</p>
                  <a href={`mailto:${contactInfo.email}`} className="text-primary-600 hover:text-primary-700">
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-lg mb-4">Business Hours</h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span>9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span>10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
