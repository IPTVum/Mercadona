import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'MAD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'MAD' ? 2 : 2,
    maximumFractionDigits: 2,
  }).format(price)
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

export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount
  // Convert to MAD first (if not already), then to target currency
  const amountInMAD = from === 'MAD' ? amount : amount / (EXCHANGE_RATES[from] || 1)
  const converted = amountInMAD * (EXCHANGE_RATES[to] || 1)
  return Math.round(converted * 100) / 100
}

export function formatConvertedPrice(price: number, fromCurrency: string, toCurrency: string): string {
  const converted = convertCurrency(price, fromCurrency, toCurrency)
  return formatPrice(converted, toCurrency)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(date)
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

export function getWhatsAppMessage(productName: string, productPrice: number, quantity: number = 1): string {
  const message = `Hello! I'd like to order:\n\nProduct: ${productName}\nQuantity: ${quantity}\nPrice: $${productPrice}\nTotal: $${productPrice * quantity}\n\nPlease confirm my order.`
  return encodeURIComponent(message)
}

export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
  return `https://wa.me/${cleanNumber}?text=${message}`
}

export function calculateDiscount(price: number, comparePrice: number | null): number | null {
  if (!comparePrice || comparePrice <= price) return null
  return Math.round(((comparePrice - price) / comparePrice) * 100)
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
