// Generate SQL to insert rug products
// Run: npx tsx scripts/gen-rug-sql.ts > scripts/rug-seed.sql
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

const CATEGORY_IDS = [
  '803867b5-9b73-4aac-9c20-052099b271f6', // Boucherouite
  'b9e2943b-9a91-4f1d-96d5-8fbce35f678a', // Handira
  'bebd8079-02f2-47cf-bdbb-7e5c75a04b88', // Vintage
  'f3b62baa-916d-44dd-9621-67b5bcf4ac8c', // Beni Ourain
  'e3d443b9-06c7-401b-aa66-4cb2ff3de0fe', // Kilim
  '63a690ca-62e0-40ef-b733-3cd7e7fe6a2b', // Azilal
  '34d07c1c-8ae1-4993-af40-690cd6d851ae', // Home Decore
]

const RUBS = path.resolve('public/images/rugs')
const files = fs.readdirSync(RUBS).filter(f => /\.(jpeg|jpg|png)$/i.test(f)).sort()

// Group files by product
const groups: Record<string, string[]> = {}

for (const file of files) {
  let key: string
  if (/^ai_\d+_/.test(file)) {
    key = file.match(/^(ai_\d+)_/)![1]
  } else if (/^done_\d+_/.test(file)) {
    key = file.match(/^(done_\d+)_/)![1]
  } else if (/^\d+\./.test(file)) {
    key = file.match(/^(\d+)\./)![1]
  } else {
    continue
  }
  if (!groups[key]) groups[key] = []
  groups[key].push(file)
}

const ADJ = ['Handwoven', 'Authentic', 'Traditional', 'Vintage', 'Artisan', 'Premium', 'Heritage', 'Royal', 'Classic', 'Bohemian']
const PAT = ['Geometric', 'Diamond', 'Berber', 'Tribal', 'Medallion', 'Striped', 'Checkerboard', 'Zigzag', 'Abstract', 'Lattice']
const COL = ['Ivory', 'Cream', 'Beige', 'Camel', 'Terracotta', 'Rust', 'Saffron', 'Indigo', 'Sage', 'Charcoal', 'Sand', 'Burgundy', 'Olive', 'Navy', 'Copper']

const PRICES = [149, 179, 199, 229, 249, 279, 299, 329, 349, 379, 399, 429, 449, 479, 499, 549, 599, 649, 699, 749, 799, 899]

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const DESCRIPTIONS = [
  'Handwoven by skilled Berber artisans in the Atlas Mountains of Morocco, this stunning rug features intricate patterns passed down through generations. Made from 100% natural wool with vegetable-based dyes.',
  'A true masterpiece of Moroccan craftsmanship. Each knot tells a story of heritage and tradition. Woven entirely by hand over several weeks, no two pieces are ever identical.',
  'Bring the warmth and soul of Morocco into your home with this artisanal rug. Its unique patterns and rich textures add instant character to any room. Natural wool, organic dyes.',
  'Crafted with love by Moroccan women artisans, this rug combines centuries-old weaving techniques with timeless designs. Approximately 200cm × 150cm.',
  'Premium Moroccan rug featuring authentic Berber motifs. Hand-knotted from the finest Atlas Mountain wool. Each piece is one-of-a-kind — a true collector\'s item.',
]

const sqlLines: string[] = []
sqlLines.push('-- Rug product seed')
sqlLines.push('-- Generated from Tamazirt/ folders')
sqlLines.push('')

let count = 0

for (const [key, images] of Object.entries(groups)) {
  const seed = parseInt(key.replace(/\D/g, '')) || count + 100
  const rand = rng(seed)
  const adj = ADJ[Math.floor(rand() * ADJ.length)]
  const pat = PAT[Math.floor(rand() * PAT.length)]
  const c1 = COL[Math.floor(rand() * COL.length)]
  const c2 = COL[Math.floor(rand() * COL.length)]
  const name = `${adj} Moroccan ${pat} Rug — ${c1} & ${c2} (#${key.replace(/^(done_|ai_)/, '')})`
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80)
  const price = PRICES[Math.floor(rand() * PRICES.length)]
  const desc = DESCRIPTIONS[Math.floor(rand() * DESCRIPTIONS.length)]
  const catId = CATEGORY_IDS[Math.floor(rand() * CATEGORY_IDS.length)]
  const weight = Math.round((rand() * 8 + 3) * 10) / 10
  const stock = Math.floor(rand() * 3) + 1
  const isFeatured = rand() > 0.7

  // Image URLs: prefix with /images/rugs/
  const imageUrls = images.map((f) => `/images/rugs/${f}`)
    .filter(f => /\.(jpeg|jpg)$/i.test(f)) // JPEGs as primary, PNGs optional
  // Add PNGs too
  const allImages = images.map((f) => `/images/rugs/${f}`)

  const shortDesc = name.split('—')[0]?.trim() || name

  sqlLines.push(`INSERT INTO products (name, slug, short_description, description, price, compare_price, cost_price, sku, stock, is_active, is_featured, category_id, images, tags, weight)`)
  sqlLines.push(`VALUES (`)
  sqlLines.push(`  '${name.replace(/'/g, "''")}',`)
  sqlLines.push(`  '${slug}-${seed}',`)
  sqlLines.push(`  'Handmade ${shortDesc.replace(/'/g, "''")}',`)
  sqlLines.push(`  '${desc.replace(/'/g, "''")}\n\nApproximately 200cm × 150cm. Custom sizes available upon request.\n\nCare: Vacuum regularly. Spot clean with mild soap. Professional cleaning recommended.',`)
  sqlLines.push(`  ${price},`)
  sqlLines.push(`  ${Math.round(price * 1.3)},`)
  sqlLines.push(`  ${Math.round(price * 0.4)},`)
  sqlLines.push(`  'RUG-${key.toUpperCase()}-${String(seed).slice(0, 6)}',`)
  sqlLines.push(`  ${stock},`)
  sqlLines.push(`  true,`)
  sqlLines.push(`  ${isFeatured},`)
  sqlLines.push(`  '${catId}',`)
  sqlLines.push(`  ARRAY[${allImages.map(i => `'${i}'`).join(', ')}],`)
  sqlLines.push(`  ARRAY['moroccan', 'rug', 'handmade', 'berber', 'artisan', 'wool', 'handwoven'],`)
  sqlLines.push(`  ${weight}`)
  sqlLines.push(`);`)
  sqlLines.push('')
  count++
}

console.log(sqlLines.join('\n'))
console.error(`\nGenerated ${count} product INSERTs`)
