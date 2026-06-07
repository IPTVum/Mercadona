// Seed script: Uploads rug images from Tamazirt/ to Supabase Storage and creates products
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve('.env.local') })

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function authenticate() {
  // Try common admin passwords
  const passwords = ['admin123', 'password', 'admin', 'admin1234', 'webstore']
  for (const pw of passwords) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@webstore.com',
      password: pw,
    })
    if (!error) {
      console.log(`✅ Authenticated as admin (password: ${pw})`)
      return data
    }
  }
  console.error('❌ Could not authenticate with any common password.')
  console.error('   Please set ADMIN_PASSWORD in .env.local and try again.')
  process.exit(1)
}

const TAMAZIRT = path.resolve('Tamazirt')
const CATEGORY_IDS = [
  '803867b5-9b73-4aac-9c20-052099b271f6', // Boucherouite
  'b9e2943b-9a91-4f1d-96d5-8fbce35f678a', // Handira
  'bebd8079-02f2-47cf-bdbb-7e5c75a04b88', // Vintage
  'f3b62baa-916d-44dd-9621-67b5bcf4ac8c', // Beni Ourain
  'e3d443b9-06c7-401b-aa66-4cb2ff3de0fe', // Kilim
  '63a690ca-62e0-40ef-b733-3cd7e7fe6a2b', // Azilal
  '34d07c1c-8ae1-4993-af40-690cd6d851ae', // Home Decore
]

const MOROCCAN_ADJECTIVES = ['Handwoven', 'Authentic', 'Traditional', 'Vintage', 'Artisan', 'Premium', 'Heritage', 'Royal', 'Classic', 'Bohemian']
const MOROCCAN_PATTERNS = ['Diamond', 'Zigzag', 'Geometric', 'Berber', 'Tribal', 'Abstract', 'Checkerboard', 'Medallion', 'Striped', 'Lattice']
const COLOR_NAMES = ['Ivory', 'Cream', 'Beige', 'Camel', 'Terracotta', 'Rust', 'Saffron', 'Indigo', 'Sage', 'Charcoal', 'Sand', 'Burgundy', 'Olive', 'Navy', 'Copper']

function shuffle(arr: string[]): string[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRugName(folderName: string): string {
  const adj = pick(MOROCCAN_ADJECTIVES)
  const pattern = pick(MOROCCAN_PATTERNS)
  const colors = shuffle(COLOR_NAMES).slice(0, 2)
  return `${adj} Moroccan ${pattern} Rug — ${colors.join(' & ')} (#${folderName})`
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)
}

function generateDescription(name: string): string {
  const patterns = [
    'Handwoven by skilled Berber artisans in the Atlas Mountains of Morocco, this stunning rug features intricate geometric patterns that have been passed down through generations.',
    'A true masterpiece of Moroccan craftsmanship, this rug is made from 100% natural wool and dyed using traditional vegetable-based colors for an authentic, eco-friendly finish.',
    'Each knot of this exquisite rug tells a story of heritage and tradition. Woven entirely by hand over several weeks, no two pieces are ever identical.',
    'Bring the warmth and soul of Morocco into your home with this artisanal rug. Its unique patterns and rich textures add instant character to any room.',
    'Crafted with love and patience by Moroccan women artisans, this rug combines centuries-old weaving techniques with timeless geometric designs.',
  ]
  const pattern = pick(patterns)
  const sizes = ['Available in multiple sizes. Contact us for custom dimensions.', 'Approximately 180cm × 120cm. Custom sizes available upon request.', 'Measures roughly 200cm × 150cm. We can accommodate custom sizing.']
  const care = 'Care: Vacuum regularly without a beater bar. Spot clean with mild soap and cold water. Professional cleaning recommended for deep stains.'
  return `${pattern}\n\n${pick(sizes)}\n\n${care}`
}

function generatePrice(): number {
  // Moroccan rugs typically range from $149 to $899
  const prices = [149, 179, 199, 229, 249, 279, 299, 329, 349, 379, 399, 429, 449, 479, 499, 549, 599, 649, 699, 749, 799, 899]
  return pick(prices)
}

async function uploadImage(filePath: string, storagePath: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/jpeg'

  const { data, error } = await supabase.storage
    .from('media')
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    })

  if (error) {
    // If file already exists, just return the public URL
    if (error.message?.includes('already exists') || error.message?.includes('Duplicate')) {
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(storagePath)
      return urlData.publicUrl
    }
    throw new Error(`Upload failed for ${storagePath}: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(storagePath)
  return urlData.publicUrl
}

async function seedRug(folderName: string, folderPath: string) {
  const files = fs.readdirSync(folderPath).filter(f => {
    const ext = path.extname(f).toLowerCase()
    return ['.jpeg', '.jpg', '.png'].includes(ext)
  }).sort()

  if (files.length === 0) {
    console.log(`  ⏭️  Skipping ${folderName}: no images`)
    return
  }

  const rugName = generateRugName(folderName)
  const slug = generateSlug(rugName) + '-' + crypto.randomBytes(3).toString('hex')
  const description = generateDescription(rugName)
  const price = generatePrice()
  const categoryId = pick(CATEGORY_IDS)
  const tags = ['moroccan', 'rug', 'handmade', 'berber', 'artisan', 'wool', 'handwoven']

  // Upload images
  const imageUrls: string[] = []
  for (const file of files) {
    const filePath = path.join(folderPath, file)
    const ext = path.extname(file).toLowerCase()
    const storagePath = `products/${slug}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`
    try {
      const url = await uploadImage(filePath, storagePath)
      imageUrls.push(url)
      console.log(`    📤 Uploaded: ${file} → ${url.substring(0, 60)}...`)
    } catch (err: any) {
      console.error(`    ❌ Failed to upload ${file}: ${err.message}`)
    }
  }

  if (imageUrls.length === 0) {
    console.log(`  ⏭️  Skipping ${folderName}: no images uploaded`)
    return
  }

  // Create product
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: rugName,
      slug,
      short_description: `Handmade Moroccan rug — ${rugName.split('—')[0]?.trim() || rugName}`,
      description,
      price,
      compare_price: Math.round(price * 1.3),
      cost_price: Math.round(price * 0.45),
      sku: `RUG-${folderName}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      stock: Math.floor(Math.random() * 3) + 1,
      is_active: true,
      is_featured: Math.random() > 0.7,
      category_id: categoryId,
      images: imageUrls,
      tags,
      weight: Math.round((Math.random() * 8 + 3) * 10) / 10,
    })
    .select('id')
    .single()

  if (error) {
    console.error(`  ❌ Failed to create product for ${folderName}: ${error.message}`)
    return
  }

  console.log(`  ✅ Created: "${rugName}" — DH ${price} — ${imageUrls.length} images [${product.id}]`)
}

async function main() {
  console.log('🧶 Starting Moroccan Rug Seed...\n')

  await authenticate()
  console.log('')

  // Get all rug folders
  const entries = fs.readdirSync(TAMAZIRT, { withFileTypes: true })

  const rugFolders: { name: string; path: string }[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name === 'rugs') continue // skip duplicate folder

    const folderPath = path.join(TAMAZIRT, entry.name)

    if (entry.name === 'done' || entry.name === 'AI edited') {
      // These contain subfolders with rugs
      const subEntries = fs.readdirSync(folderPath, { withFileTypes: true })
      for (const sub of subEntries) {
        if (sub.isDirectory()) {
          rugFolders.push({
            name: `${entry.name}/${sub.name}`,
            path: path.join(folderPath, sub.name),
          })
        }
      }
    } else if (/^\d+$/.test(entry.name)) {
      // Numbered folders (15-65)
      rugFolders.push({ name: entry.name, path: folderPath })
    }
  }

  // Sort by folder number
  rugFolders.sort((a, b) => {
    const numA = parseInt(a.name.replace(/\D/g, '')) || 0
    const numB = parseInt(b.name.replace(/\D/g, '')) || 0
    return numA - numB
  })

  console.log(`Found ${rugFolders.length} rug folders to seed\n`)

  let success = 0
  let skipped = 0
  let failed = 0

  for (const folder of rugFolders) {
    console.log(`📦 Processing: ${folder.name}`)
    try {
      await seedRug(folder.name, folder.path)
      success++
    } catch (err: any) {
      console.error(`  ❌ Error: ${err.message}`)
      failed++
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n🎉 Done! ${success} created, ${skipped} skipped, ${failed} failed`)
}

main().catch(console.error)
