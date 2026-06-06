export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  billing_address: Record<string, any> | null
  shipping_address: Record<string, any> | null
  role: 'customer' | 'admin' | 'moderator'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_price: number | null
  cost_price: number | null
  sku: string | null
  barcode: string | null
  stock: number | null
  is_active: boolean
  is_featured: boolean
  category_id: string | null
  images: string[]
  tags: string[]
  weight: number | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  category?: Category
  variants?: ProductVariant[]
  reviews?: Review[]
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string | null
  price: number | null
  stock: number | null
  attributes: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parent_id: string | null
  sort_order: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  parent?: Category
  children?: Category[]
}

export interface Order {
  id: string
  user_id: string | null
  email: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  payment_method: string | null
  payment_id: string | null
  subtotal: number
  shipping_cost: number | null
  tax: number | null
  discount: number | null
  total: number
  currency: string | null
  shipping_address: Record<string, any> | null
  billing_address: Record<string, any> | null
  notes: string | null
  tracking_number: string | null
  estimated_delivery: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  user?: Profile
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  name: string
  sku: string | null
  price: number
  quantity: number
  total: number
  image: string | null
  created_at: string
  product?: Product
}

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  image: string | null
  author_id: string | null
  tags: string[]
  is_published: boolean
  meta_title: string | null
  meta_description: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number | null
  max_uses: number | null
  used_count: number | null
  is_active: boolean
  starts_at: string | null
  expires_at: string | null
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string | null
  rating: number
  title: string | null
  comment: string | null
  is_approved: boolean
  created_at: string
  user?: Profile
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image: string | null
  slug: string
  stock?: number
}

export interface Setting {
  id: string
  key: string
  value: any
  type: string
  created_at: string
  updated_at: string
}

export interface ShippingZone {
  id: string
  name: string
  countries: string[]
  rate: number
  free_shipping_min: number | null
  estimated_days: string | null
  is_active: boolean
  created_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  is_active: boolean
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export interface EmailTemplate {
  subject: string
  body: string
}

export interface Page {
  id: string
  title: string
  slug: string
  content: string | null
  meta_title: string | null
  meta_description: string | null
  is_published: boolean
  sort_order: number | null
  created_at: string
  updated_at: string
}

export interface LandingPage {
  id: string
  slug: string
  title_en: string
  title_fr: string
  headline_en: string
  headline_fr: string
  description_en: string
  description_fr: string
  features_en: string | null
  features_fr: string | null
  cta_text_en: string
  cta_text_fr: string
  cta_url: string
  image_url: string | null
  bg_color: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
