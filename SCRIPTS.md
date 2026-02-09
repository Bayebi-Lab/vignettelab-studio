# Migration Scripts Documentation

## Kept Scripts

### `scripts/run-migration.ts`
**Purpose:** Displays migration SQL and provides direct link to Supabase SQL Editor  
**Usage:** `npm run migrate`  
**Why kept:** Useful for viewing migration SQL and getting quick access to SQL Editor. Since Supabase doesn't allow executing DDL via API, this provides the SQL ready to copy-paste.

### `scripts/migrate-with-cli.sh`
**Purpose:** Automated Supabase CLI migration workflow  
**Usage:** `npm run migrate:cli`  
**Why kept:** Main script for running migrations via Supabase CLI. Handles login check, project linking, and migration push. This is the primary way to run migrations programmatically.

### `scripts/repair-and-push.sh`
**Purpose:** Repairs migration history when there's a mismatch  
**Usage:** `npm run migrate:repair`  
**Why kept:** Essential for fixing migration history conflicts. When remote migrations don't match local files, this script repairs the history and pushes migrations.

### `scripts/create-admin-user.ts`
**Purpose:** Creates an admin user in Supabase Auth and adds them to the admin_users table  
**Usage:** `npm run create-admin` or `npm run create-admin -- <email> <password>`  
**Why kept:** Automates the admin user creation process. Handles both new user creation and adding existing users to the admin_users table. Requires `VITE_SUPABASE_URL` and `SUPABASE_SECRET_KEY` environment variables.

## Removed Scripts (and why)

- `execute-migration.ts` - Tried to use Supabase Management API, doesn't work for DDL statements
- `run-migration-direct.ts` - Same issue, Management API approach failed
- `run-migration-psql.sh` - Alternative psql approach, not needed since CLI works
- `run-migration.js` - Old JavaScript version, TypeScript version (`run-migration.ts`) is better
- `fix-migration.sh` - Redundant troubleshooting script, functionality merged into `repair-and-push.sh`
- `apply-migration.sh` - Redundant, similar functionality to `migrate-with-cli.sh`

## Removed Documentation (and why)

- `MIGRATION-FIX.md` - Temporary troubleshooting doc, information consolidated into `MIGRATION.md`
- `QUICK-FIX.md` - Temporary troubleshooting doc, no longer needed

## Recommended Workflow

1. **First time setup:** Use `npm run migrate` to view SQL and run in Supabase Dashboard
2. **Regular migrations:** Use `npm run migrate:cli` for automated CLI workflow
3. **If migration history conflicts:** Use `npm run migrate:repair` to fix and push
