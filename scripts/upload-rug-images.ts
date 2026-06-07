// Uploads rug images to Supabase Storage and updates product image URLs
import { config } from 'dotenv'; config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RUGS_DIR = path.resolve('public/images/rugs');

async function main() {
  // Sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'seed@webstore.com',
    password: 'seed123456',
  });
  if (authError) {
    console.error('Auth failed:', authError.message);
    // Try sign up in case not confirmed
    const { error: signUpErr } = await supabase.auth.signUp({ email: 'seed@webstore.com', password: 'seed123456' });
    if (signUpErr) console.error('SignUp also failed:', signUpErr.message);
    else console.log('Signed up, trying sign in again...');
    const retry = await supabase.auth.signInWithPassword({ email: 'seed@webstore.com', password: 'seed123456' });
    if (retry.error) { console.error('Still failed:', retry.error.message); process.exit(1); }
  }
  console.log('✅ Authenticated');

  // Get all products
  const { data: allProducts, error: prodError } = await supabase
    .from('products')
    .select('id, name, images')
    .limit(100);

  if (prodError) { console.error('Failed to fetch products:', prodError.message); process.exit(1); }

  // Filter to only products with local /images/rugs/ paths
  const products = (allProducts || []).filter(p => {
    const imgs = p.images as string[] || [];
    return imgs.some(u => u.startsWith('/images/rugs/'));
  });

  console.log(`Found ${products.length} products to update`);

  let updated = 0;
  for (const product of products) {
    const urls: string[] = [];
    const oldUrls = Array.isArray(product.images) ? product.images : [];

    for (const localUrl of oldUrls) {
      const filename = path.basename(localUrl);
      const filePath = path.join(RUGS_DIR, filename);

      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  File not found: ${filename}`);
        urls.push(localUrl); // keep old URL
        continue;
      }

      const storagePath = `products/rugs/${filename}`;
      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

      // Check if already uploaded
      const { data: existing } = await supabase.storage.from('media').createSignedUrl(storagePath, 60);
      if (existing?.signedUrl) {
        const { data: pubData } = supabase.storage.from('media').getPublicUrl(storagePath);
        urls.push(pubData.publicUrl);
        continue;
      }

      const { error: upErr } = await supabase.storage
        .from('media')
        .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

      if (upErr) {
        console.log(`  ❌ Upload failed for ${filename}: ${upErr.message}`);
        urls.push(localUrl);
        continue;
      }

      const { data: pubData } = supabase.storage.from('media').getPublicUrl(storagePath);
      urls.push(pubData.publicUrl);
    }

    if (urls.length > 0 && JSON.stringify(urls) !== JSON.stringify(oldUrls)) {
      const { error: updateErr } = await supabase
        .from('products')
        .update({ images: urls })
        .eq('id', product.id);

      if (updateErr) {
        console.log(`  ❌ Update failed for ${product.name}: ${updateErr.message}`);
      } else {
        updated++;
        console.log(`  ✅ ${product.name.substring(0, 60)}... [${urls.length} images]`);
      }
    }

    // Small delay
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\n🎉 Done! Updated ${updated}/${products.length} products`);
}

main().catch(console.error);
