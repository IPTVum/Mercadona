# WebStore

A full-stack multilingual e-commerce platform built with Next.js 14, Supabase, Stripe, and PayPal.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage)
- **Payments:** Stripe, PayPal, WhatsApp
- **i18n:** next-intl (French, English, Arabic with RTL support)
- **State Management:** Zustand

## Features

- Product catalog with categories, filtering, search, and pagination
- Product detail pages with image galleries, reviews, and JSON-LD SEO
- Persistent shopping cart with coupon/discount support
- Multi-method checkout: Stripe, PayPal, WhatsApp
- User authentication (login, register, password reset)
- User profile with order history, wishlist, and address management
- Blog with comments and social sharing
- Contact form with admin message inbox
- Newsletter subscriptions
- Comprehensive admin panel (products, orders, categories, coupons, users, settings)
- Full RTL support for Arabic
- Static pages (terms, privacy, FAQ, shipping, returns)

## Prerequisites

- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) project
- [Stripe](https://stripe.com) account (for payments)
- [PayPal Developer](https://developer.paypal.com) account (optional)

## Setup

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_...) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `PAYPAL_CLIENT_ID` | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID (public) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp business number |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (http://localhost:3000 for dev) |
| `NEXT_PUBLIC_SITE_NAME` | Your store name |

3. **Set up Supabase database:**

Create the following tables in your Supabase project:

- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Line items for orders
- `profiles` - User profiles (linked to auth.users)
- `coupons` - Discount coupons
- `blogs` - Blog posts
- `blog_comments` - Blog comments
- `contact_messages` - Contact form submissions
- `pages` - Static pages (terms, privacy, etc.)
- `reviews` - Product reviews
- `settings` - Site settings (key-value store)
- `newsletter_subscribers` - Newsletter emails
- `wishlists` - User wishlists
- `refund_logs` - Payment refund records

4. **Run the development server:**

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Panel

Access the admin panel at `/admin`. The default admin credentials can be set by updating the `role` field to `admin` in the `profiles` table for your user.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/           # Localized routes (fr/ar/en)
│   │   ├── admin/          # Admin panel
│   │   ├── shop/           # Product listing
│   │   ├── product/        # Product detail
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout flow
│   │   ├── blog/           # Blog
│   │   ├── profile/        # User profile
│   │   └── contact/        # Contact page
│   └── api/                # API routes (checkout, webhooks)
├── components/             # Reusable components
├── lib/                    # Utilities, Supabase clients
├── messages/               # i18n translation files
├── stores/                 # Zustand stores (cart, wishlist)
├── types/                  # TypeScript interfaces
└── styles/                 # Global styles
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

Private - All rights reserved.
