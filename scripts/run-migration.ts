#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and SUPABASE_SECRET_KEY are set in your .env file');
  process.exit(1);
}

// TypeScript assertion: after the check above, these are guaranteed to be strings
const url = supabaseUrl as string;
const secretKey = supabaseSecretKey as string;

// Extract project ref for dashboard link
const projectRef = url.split('//')[1]?.split('.')[0] || '';

console.log('📦 Supabase Migration Runner');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`Project URL: ${url}`);
console.log(`Project Ref: ${projectRef}\n`);

async function runMigration() {
  try {
    console.log('📖 Reading migration file...');
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('✅ Migration file loaded\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Supabase does not support executing DDL statements');
    console.log('   (CREATE TABLE, CREATE INDEX, etc.) via the JavaScript client.\n');
    console.log('📋 Please run this migration in the Supabase Dashboard:\n');
    console.log(`   🔗 https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Migration SQL:\n');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log('\n💡 Copy the SQL above and paste it into the Supabase SQL Editor\n');

    // Verify connection
    const supabase = createClient(url, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('🔍 Verifying Supabase connection...');
    const { data, error } = await supabase.from('packages').select('count').limit(1);

    if (error && error.code === 'PGRST116') {
      console.log('✅ Connection successful (tables not created yet - expected)\n');
    } else if (error) {
      console.log(`⚠️  Connection check: ${error.message}\n`);
    } else {
      console.log('✅ Connection successful (tables already exist)\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📌 Next Steps:');
    console.log('   1. Open the Supabase SQL Editor link above');
    console.log('   2. Copy and paste the migration SQL');
    console.log('   3. Click "Run" to execute');
    console.log('   4. Verify tables were created in the Table Editor\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

runMigration();
