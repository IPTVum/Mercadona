import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ChevronRight, FileText, Shield, HelpCircle, Truck, RotateCcw } from 'lucide-react'
import { createServerClientSSR } from '@/lib/supabase-server'
import { sanitizeHtml } from '@/lib/sanitize'
import { Link } from '@/i18n/routing'

interface StaticPageProps {
  params: { slug: string }
}

async function getPage(slug: string) {
  const supabase = await createServerClientSSR()
  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  return data
}

const pageIcons: Record<string, React.ElementType> = {
  terms: FileText,
  privacy: Shield,
  faq: HelpCircle,
  shipping: Truck,
  returns: RotateCcw,
}

const defaultContent: Record<string, { title: string; content: string; description: string }> = {
  terms: {
    title: 'Terms & Conditions',
    description: 'By using our website and services, you agree to these terms. Please read them carefully.',
    content: `
      <h2>1. Introduction</h2>
      <p>Welcome to our store. By accessing or using our website, you agree to be bound by these Terms and Conditions.</p>
      
      <h2>2. Use of Website</h2>
      <p>You may use our website for lawful purposes only. You must not use our website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.</p>
      
      <h2>3. Products and Pricing</h2>
      <p>All product prices are listed in the store&apos;s default currency. We reserve the right to change prices at any time. Product images are for illustrative purposes only.</p>
      
      <h2>4. Orders and Payment</h2>
      <p>When you place an order, you are making an offer to purchase. We reserve the right to accept or decline any order. Payment must be made in full before orders are processed.</p>
      
      <h2>5. Shipping and Delivery</h2>
      <p>Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers.</p>
      
      <h2>6. Returns and Refunds</h2>
      <p>We accept returns within 30 days of delivery. Items must be in original condition. Shipping costs for returns are the responsibility of the customer unless the item is defective.</p>
      
      <h2>7. Limitation of Liability</h2>
      <p>Our store shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our website or products.</p>
      
      <h2>8. Changes to Terms</h2>
      <p>We reserve the right to modify these terms at any time. Continued use of the website constitutes acceptance of modified terms.</p>
    `,
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'We take your privacy seriously. Learn how we collect, use, and protect your personal information.',
    content: `
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly, such as when you create an account, make a purchase, or contact us. This includes your name, email, address, and payment information.</p>
      
      <h2>2. How We Use Your Information</h2>
      <p>We use your information to process orders, communicate with you, improve our services, and comply with legal obligations.</p>
      
      <h2>3. Information Sharing</h2>
      <p>We do not sell your personal information. We may share your information with service providers who assist in operating our website and processing payments.</p>
      
      <h2>4. Data Security</h2>
      <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
      
      <h2>5. Cookies</h2>
      <p>We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. You can control cookies through your browser settings.</p>
      
      <h2>6. Your Rights</h2>
      <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>
      
      <h2>7. Children&apos;s Privacy</h2>
      <p>Our website is not intended for children under 13. We do not knowingly collect information from children under 13.</p>
      
      <h2>8. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please contact us at privacy@webstore.com.</p>
    `,
  },
  faq: {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about shipping, returns, payments, and more.',
    content: `
      <h2>Shipping</h2>
      <h3>How long does shipping take?</h3>
      <p>Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days.</p>
      
      <h3>Do you offer free shipping?</h3>
      <p>Yes, we offer free standard shipping on qualifying orders. The minimum order amount for free shipping can be found on our website.</p>
      
      <h2>Orders</h2>
      <h3>Can I cancel my order?</h3>
      <p>You can cancel your order within 24 hours of placing it. After that, the order may already be processing.</p>
      
      <h3>How can I track my order?</h3>
      <p>Once your order ships, you&apos;ll receive a tracking number via email.</p>
      
      <h2>Returns</h2>
      <h3>What is your return policy?</h3>
      <p>We accept returns within 30 days of delivery. Items must be unused and in original packaging.</p>
      
      <h3>How do I initiate a return?</h3>
      <p>Contact our support team with your order number and we&apos;ll provide return instructions.</p>
      
      <h2>Payments</h2>
      <h3>What payment methods do you accept?</h3>
      <p>We accept credit cards (Visa, Mastercard, American Express), PayPal, and WhatsApp orders.</p>
      
      <h3>Is my payment information secure?</h3>
      <p>Yes, we use industry-standard encryption to protect your payment information.</p>
    `,
  },
  shipping: {
    title: 'Shipping Information',
    description: 'Learn about our shipping options, delivery times, and tracking information.',
    content: `
      <h2>Shipping Methods</h2>
      <p>We offer the following shipping options:</p>
      <ul>
        <li><strong>Standard Shipping:</strong> 5-7 business days - $5.99 (Free on orders over $50)</li>
        <li><strong>Express Shipping:</strong> 2-3 business days - $14.99</li>
        <li><strong>Overnight Shipping:</strong> Next business day - $24.99</li>
      </ul>
      
      <h2>International Shipping</h2>
      <p>We currently ship to the United States, Canada, United Kingdom, Germany, and France. International shipping rates vary by destination.</p>
      
      <h2>Order Processing</h2>
      <p>Orders are processed within 1-2 business days. Orders placed after 2 PM EST will be processed the next business day.</p>
      
      <h2>Tracking Your Order</h2>
      <p>Once your order ships, you will receive a confirmation email with a tracking number. You can use this number to track your package on the carrier&apos;s website.</p>
      
      <h2>Delivery Issues</h2>
      <p>If your package is lost or damaged, please contact us within 7 days of the expected delivery date.</p>
    `,
  },
  returns: {
    title: 'Returns & Exchanges',
    description: 'Our hassle-free return policy makes it easy to return or exchange your purchase.',
    content: `
      <h2>Return Policy</h2>
      <p>We accept returns within 30 days of delivery. Items must be unused, in original packaging, and in the same condition as received.</p>
      
      <h2>How to Return</h2>
      <ol>
        <li>Contact our support team with your order number</li>
        <li>We&apos;ll provide a return shipping label (if applicable)</li>
        <li>Pack the item securely and attach the label</li>
        <li>Drop off at the nearest shipping location</li>
      </ol>
      
      <h2>Refunds</h2>
      <p>Refunds are processed within 5-7 business days of receiving the returned item. The refund will be issued to the original payment method.</p>
      
      <h2>Exchanges</h2>
      <p>If you need a different size or color, please place a new order and return the original item for a refund.</p>
      
      <h2>Non-Returnable Items</h2>
      <p>The following items cannot be returned:
        <ul>
          <li>Gift cards</li>
          <li>Personalized items</li>
          <li>Items marked as final sale</li>
        </ul>
      </p>
    `,
  },
}

export async function generateMetadata({ params }: StaticPageProps) {
  const page = await getPage(params.slug)
  const defaultPage = defaultContent[params.slug]
  return {
    title: page?.meta_title || defaultPage?.title || 'Page',
    description: page?.meta_description || defaultPage?.description || '',
  }
}

export default async function StaticPage({ params }: StaticPageProps) {
  const t = await getTranslations('staticPages')
  const th = await getTranslations('header')
  const page = await getPage(params.slug)
  const defaultPage = defaultContent[params.slug]

  if (!page && !defaultPage) {
    notFound()
  }

  const translatedTitle = defaultPage ? t(`${params.slug}.title` as keyof typeof defaultContent) : ''

  const title = page?.title || translatedTitle || defaultPage?.title || ''
  const description = page?.meta_description || defaultPage?.description || ''
  const rawContent = page?.content || defaultPage?.content || ''
  const content = sanitizeHtml(rawContent)
  const Icon = pageIcons[params.slug] || FileText

  const quickLinkSlugs = Object.keys(defaultContent).filter((slug) => slug !== params.slug)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container-custom py-12 md:py-16">
          <nav className="flex items-center gap-1.5 text-sm text-primary-200 mb-6">
            <Link href="/" className="hover:text-white transition-colors">{th('home')}</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">{title}</span>
          </nav>
          <div className="max-w-2xl">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4">
              <Icon size={28} />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">{title}</h1>
            {description && (
              <p className="mt-3 text-primary-100 text-lg">{description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="container-custom pb-14">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinkSlugs.map((slug) => {
              const PageIcon = pageIcons[slug] || FileText
              const linkTitle = t(`${slug}.title` as keyof typeof defaultContent) || defaultContent[slug].title
              return (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200"
                >
                  <PageIcon size={24} className="text-primary-600" />
                  <span className="text-sm font-medium text-gray-700 text-center">{linkTitle}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export const revalidate = 3600
