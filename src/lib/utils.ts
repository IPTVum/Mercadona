import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string, currency: string = 'MAD', locale?: string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(numPrice)) return '—'
  return new Intl.NumberFormat(locale || 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice)
}

export function getCurrencySymbol(currency: string): string {
  return (0).toLocaleString('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/[\d.,\s]/g, '')
}

export function detectCurrency(locale?: string | null): string {
  const lang = (locale || '').toLowerCase()
  if (lang.startsWith('ar-ma') || lang.startsWith('fr-ma') || lang.startsWith('ber') || lang.startsWith('tzm')) {
    return 'MAD'
  }
  return 'USD'
}

export function getClientCurrency(): string {
  if (typeof window === 'undefined') return 'MAD'
  return detectCurrency(navigator.language)
}

const paypalSupportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'HKD', 'SGD', 'SEK', 'DKK', 'PLN', 'NOK', 'HUF', 'CZK', 'ILS', 'MXN', 'BRL', 'MYR', 'PHP', 'TWD', 'THB', 'TRY', 'RUB', 'INR']

export function getPayPalCurrency(clientCurrency: string): string {
  return paypalSupportedCurrencies.includes(clientCurrency) ? clientCurrency : 'USD'
}

// Exchange rates relative to MAD (1 MAD = X in target currency)
// Admin can update these in settings later
const EXCHANGE_RATES: Record<string, number> = {
  MAD: 1,
  USD: 0.1,     // 1 MAD ≈ 0.10 USD
  EUR: 0.092,   // 1 MAD ≈ 0.092 EUR
  GBP: 0.08,    // 1 MAD ≈ 0.08 GBP
}

export function convertCurrency(amount: number | string, from: string, to: string): number {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (from === to) return numAmount
  if (!EXCHANGE_RATES[from] || !EXCHANGE_RATES[to]) {
    console.warn(`Unsupported currency pair: ${from} -> ${to}`)
    return numAmount
  }
  const amountInMAD = from === 'MAD' ? numAmount : numAmount / EXCHANGE_RATES[from]
  const converted = amountInMAD * EXCHANGE_RATES[to]
  return Math.round(converted * 100) / 100
}

export function formatConvertedPrice(price: number | string, fromCurrency: string, toCurrency: string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  const converted = convertCurrency(numPrice, fromCurrency, toCurrency)
  return formatPrice(converted, toCurrency)
}

export function formatDate(date: string | Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

const RELATIVE_TIME_MESSAGES: Record<string, { justNow: string; minutesAgo: string; hoursAgo: string; daysAgo: string }> = {
  en: { justNow: 'just now', minutesAgo: '{n}m ago', hoursAgo: '{n}h ago', daysAgo: '{n}d ago' },
  fr: { justNow: "à l'instant", minutesAgo: 'il y a {n} min', hoursAgo: 'il y a {n} h', daysAgo: 'il y a {n} j' },
  ar: { justNow: 'الآن', minutesAgo: 'قبل {n} د', hoursAgo: 'قبل {n} س', daysAgo: 'قبل {n} ي' },
}

export function formatRelativeDate(date: string | Date, locale?: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  const lang = (locale || 'en').split('-')[0]
  const msgs = RELATIVE_TIME_MESSAGES[lang] || RELATIVE_TIME_MESSAGES.en

  if (diffInSeconds < 60) return msgs.justNow
  if (diffInSeconds < 3600) return msgs.minutesAgo.replace('{n}', String(Math.floor(diffInSeconds / 60)))
  if (diffInSeconds < 86400) return msgs.hoursAgo.replace('{n}', String(Math.floor(diffInSeconds / 3600)))
  if (diffInSeconds < 604800) return msgs.daysAgo.replace('{n}', String(Math.floor(diffInSeconds / 86400)))
  return formatDate(date, locale)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

const WHATSAPP_TEMPLATES: Record<string, { greeting: string; product: string; quantity: string; price: string; total: string; confirm: string }> = {
  en: {
    greeting: "Hello! I'd like to order:",
    product: 'Product',
    quantity: 'Quantity',
    price: 'Price',
    total: 'Total',
    confirm: 'Please confirm my order.',
  },
  fr: {
    greeting: 'Bonjour ! Je souhaite commander :',
    product: 'Produit',
    quantity: 'Quantité',
    price: 'Prix',
    total: 'Total',
    confirm: 'Veuillez confirmer ma commande.',
  },
  ar: {
    greeting: 'مرحبًا! أرغب في طلب:',
    product: 'المنتج',
    quantity: 'الكمية',
    price: 'السعر',
    total: 'المجموع',
    confirm: 'يرجى تأكيد طلبي.',
  },
}

export function getWhatsAppMessage(productName: string, productPrice: number | string, quantity: number = 1, locale?: string): string {
  const numPrice = typeof productPrice === 'string' ? parseFloat(productPrice) : productPrice
  const lang = (locale || 'en').split('-')[0]
  const m = WHATSAPP_TEMPLATES[lang] || WHATSAPP_TEMPLATES.en
  const priceStr = formatPrice(numPrice, 'MAD')
  const totalStr = formatPrice(numPrice * quantity, 'MAD')
  const message = `${m.greeting}\n\n${m.product}: ${productName}\n${m.quantity}: ${quantity}\n${m.price}: ${priceStr}\n${m.total}: ${totalStr}\n\n${m.confirm}`
  return encodeURIComponent(message)
}

export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
  return `https://wa.me/${cleanNumber}?text=${message}`
}

export function calculateDiscount(price: number | string, comparePrice: number | string | null): number | null {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  const numCompare = comparePrice != null ? (typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice) : null
  if (!numCompare || numCompare <= numPrice) return null
  return Math.round(((numCompare - numPrice) / numCompare) * 100)
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePhone(phone: string): boolean {
  const re = /^\+?[\d\s-()]{10,}$/
  return re.test(phone)
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
