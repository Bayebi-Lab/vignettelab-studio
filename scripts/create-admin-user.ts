#!/usr/bin/env tsx
/**
 * Script to create an admin user in Supabase
 * 
 * Usage:
 *   npm run create-admin -- <email> <password>
 *   or
 *   tsx scripts/create-admin-user.ts <email> <password>
 * 
 * If email/password are not provided, they will be prompted interactively.
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';
import * as process from 'process';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables (try .env.local first, then .env)
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SECRET_KEY');
  console.error('Make sure you have a .env.local file with these values.');
  process.exit(1);
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface CreateAdminUserOptions {
  email: string;
  password: string;
}

async function promptForInput(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function promptForPassword(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function createAdminUser({ email, password }: CreateAdminUserOptions) {
  console.log('\n🔐 Creating admin user...\n');

  // Step 1: Create user in Supabase Auth
  console.log('1️⃣ Creating user in Supabase Auth...');
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
  });

  if (authError) {
    console.error('❌ Error creating user in Auth:', authError.message);
    
    // Check if user already exists
    if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
      console.log('\n⚠️  User already exists in Auth. Checking if they are already an admin...');
      
      // Try to get the existing user by email
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('❌ Error fetching users:', listError.message);
        process.exit(1);
      }
      
      const user = users?.find(u => u.email === email);
      
      if (!user) {
        console.error('❌ Could not find existing user.');
        process.exit(1);
      }

      // Check if already in admin_users table
      const { data: existingAdmin } = await supabaseAdmin
        .from('admin_users')
        .select('id, email')
        .eq('id', user.id)
        .single();

      if (existingAdmin) {
        console.log('✅ User is already an admin!');
        console.log(`   User ID: ${existingAdmin.id}`);
        console.log(`   Email: ${existingAdmin.email}`);
        process.exit(0);
      }

      // Add to admin_users table
      console.log('2️⃣ Adding user to admin_users table...');
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('admin_users')
        .insert({
          id: user.id,
          email: user.email!,
        })
        .select()
        .single();

      if (adminError) {
        console.error('❌ Error adding user to admin_users:', adminError.message);
        process.exit(1);
      }

      console.log('✅ Successfully added existing user to admin_users table!');
      console.log(`   User ID: ${adminData.id}`);
      console.log(`   Email: ${adminData.email}`);
      return;
    }
    
    process.exit(1);
  }

  if (!authData.user) {
    console.error('❌ No user data returned from Auth');
    process.exit(1);
  }

  console.log('✅ User created in Auth');
  console.log(`   User ID: ${authData.user.id}`);

  // Step 2: Add user to admin_users table
  console.log('\n2️⃣ Adding user to admin_users table...');
  const { data: adminData, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .insert({
      id: authData.user.id,
      email: authData.user.email!,
    })
    .select()
    .single();

  if (adminError) {
    console.error('❌ Error adding user to admin_users:', adminError.message);
    
    // Cleanup: try to delete the auth user if admin_users insert failed
    console.log('\n🧹 Cleaning up: removing user from Auth...');
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    
    process.exit(1);
  }

  console.log('✅ User added to admin_users table');
  console.log(`   Admin ID: ${adminData.id}`);
  console.log(`   Email: ${adminData.email}`);

  console.log('\n🎉 Admin user created successfully!');
  console.log(`\n📧 Email: ${email}`);
  console.log(`🔑 Password: ${'*'.repeat(password.length)}`);
  console.log('\n💡 You can now log in at /admin/login');
}

async function main() {
  let email: string;
  let password: string;

  // Get email and password from command line arguments or prompt
  const args = process.argv.slice(2);

  if (args.length >= 2) {
    email = args[0];
    password = args[1];
  } else if (args.length === 1) {
    email = args[0];
    password = await promptForPassword('Enter password: ');
  } else {
    email = await promptForInput('Enter admin email: ');
    password = await promptForPassword('Enter password: ');
  }

  // Validate inputs
  if (!email || !email.includes('@')) {
    console.error('❌ Invalid email address');
    process.exit(1);
  }

  if (!password || password.length < 6) {
    console.error('❌ Password must be at least 6 characters');
    process.exit(1);
  }

  await createAdminUser({ email, password });
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
