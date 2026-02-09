# Running Migration with Supabase CLI

## Quick Start

1. **Login to Supabase CLI** (if not already logged in):
   ```bash
   supabase login
   ```

2. **Link your project** (you'll need your database password):
   ```bash
   supabase link --project-ref ybqvfctofenztytzwpwj
   ```
   
   Get your database password from: https://supabase.com/dashboard/project/ybqvfctofenztytzwpwj/settings/database

3. **Push the migration**:
   ```bash
   supabase db push
   ```

## Alternative: Run Migration Script

Or use the automated script:
```bash
npm run migrate:cli
```

This will guide you through the process step by step.

## Verify Migration

After running the migration, verify in Supabase Dashboard:
- Tables: https://supabase.com/dashboard/project/ybqvfctofenztytzwpwj/editor
- You should see: `packages`, `orders`, `order_images`, `admin_users` tables

## Troubleshooting

### Authentication Errors
If you get authentication errors:
```bash
supabase login
```

### Migration History Mismatch
If you see "Remote migration versions not found in local migrations directory":
```bash
npm run migrate:repair
```

This will:
1. Mark old remote migrations as reverted
2. Mark your new migration as applied
3. Push any pending migrations

### Linking Issues
If linking fails, make sure you have the correct database password from your Supabase project settings:
https://supabase.com/dashboard/project/ybqvfctofenztytzwpwj/settings/database

## Available Scripts

- `npm run migrate` - Display migration SQL and SQL Editor link
- `npm run migrate:cli` - Automated CLI migration workflow
- `npm run migrate:repair` - Repair migration history conflicts
