#!/usr/bin/env tsx
/**
 * Add an existing Supabase Auth user to admin_users table by email.
 * Use when the user can log in but gets "Access denied. Admin privileges required."
 *
 * Usage:
 *   npm run add-existing-admin -- <email>
 *
 * For production (use production Supabase URL and secret):
 *   VITE_SUPABASE_URL=https://xxx.supabase.co SUPABASE_SECRET_KEY=xxx npm run add-existing-admin -- your@email.com
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env.production') });
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('❌ Missing VITE_SUPABASE_URL and SUPABASE_SECRET_KEY');
  process.exit(1);
}

const email = process.argv[2];
if (!email || !email.includes('@')) {
  console.error('Usage: npx tsx scripts/add-existing-admin.ts <email>');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\n🔐 Adding ${email} to admin_users...\n`);

  // List users (paginate if needed)
  let user: { id: string; email?: string } | null = null;
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      console.error('❌ Error listing users:', error.message);
      process.exit(1);
    }

    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) {
      user = found;
      break;
    }

    if (data.users.length < perPage) break;
    page++;
  }

  if (!user) {
    console.error('❌ User not found in Supabase Auth. Create the account first via sign-up or create-admin.');
    process.exit(1);
  }

  const { data: existing } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existing) {
    console.log('✅ User is already an admin!');
    process.exit(0);
  }

  const { data: adminData, error } = await supabaseAdmin
    .from('admin_users')
    .insert({ id: user.id, email: user.email! })
    .select()
    .single();

  if (error) {
    console.error('❌ Error adding to admin_users:', error.message);
    process.exit(1);
  }

  console.log('✅ Successfully added to admin_users!');
  console.log(`   ID: ${adminData.id}`);
  console.log(`   Email: ${adminData.email}`);
  console.log('\n💡 You can now log in at /admin/login\n');
}

main();
