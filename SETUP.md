# VignetteLab Studio - Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Stripe account
- Resend account
- Vercel account (for deployment)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the migration files in order:
   - `supabase/migrations/20260209092709_initial_schema.sql`
   - `supabase/migrations/20260209123901_create_storage_buckets.sql`
   - The storage buckets (`uploaded-images` and `final-images`) are created automatically by the migration
3. Get your Supabase credentials:
   - Project URL
   - Publishable key (starts with `sb_publishable_`)
   - Secret key (starts with `sb_secret_`, keep this secret!)

### 3. Set Up Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard:
   - Publishable key (starts with `pk_`)
   - Secret key (starts with `sk_`)
3. Set up a webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen for: `checkout.session.completed`
   - Copy the webhook signing secret (starts with `whsec_`)

### 4. Set Up Resend

1. Create a Resend account at https://resend.com
2. Verify your domain (or use the default domain for testing)
3. Get your API key from the dashboard
4. Set your admin email address

### 5. Create Admin User

**Option A: Using the automated script (Recommended)**

Run the create-admin script:
```bash
npm run create-admin
```

Or with email and password as arguments:
```bash
npm run create-admin -- admin@example.com your-password
```

The script will:
- Create the user in Supabase Auth
- Add them to the `admin_users` table
- Handle existing users gracefully

**Option B: Manual setup via Supabase Dashboard**

1. In Supabase Dashboard, go to Authentication > Users
2. Create a new user with email/password
3. Copy the user ID
4. In SQL Editor, run:
   ```sql
   INSERT INTO admin_users (id, email) 
   VALUES ('<user-id>', 'your-admin@email.com');
   ```

### 6. Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in all the required values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Resend Email Configuration
RESEND_API_KEY=re_your_resend_api_key

# Admin Configuration
ADMIN_EMAIL=admin@example.com

# Application URLs
VITE_APP_URL=http://localhost:8080
```

### 7. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:8080

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables in Vercel project settings
4. Deploy!

### Important: Update Webhook URL

After deployment, update your Stripe webhook URL to:
```
https://your-vercel-domain.vercel.app/api/webhooks/stripe
```

## Testing the Flow

1. **Customer Flow:**
   - Go to `/pricing` and select a package
   - Upload 1-3 images (max 10MB each)
   - Complete checkout with Stripe test card: `4242 4242 4242 4242`
   - Check email for order confirmation

2. **Admin Flow:**
   - Go to `/admin/login`
   - Sign in with admin credentials
   - View orders in `/admin/orders`
   - Process an order: upload final images
   - Customer receives download email automatically

## Storage Bucket Configuration

Storage buckets are automatically created by the migration `20260209123901_create_storage_buckets.sql`.

### uploaded-images (Private)
- Set to private (`public = false`)
- Used for customer-uploaded source images
- Allows anonymous uploads (for checkout flow)
- Public read access (paths are not easily guessable)
- 50MB file size limit
- Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

### final-images (Public)
- Set to public (`public = true`)
- Used for final processed portraits
- Anyone can view/download final images
- Only admins can upload/delete
- 50MB file size limit
- Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

## Troubleshooting

### Images not uploading
- Check Supabase storage bucket permissions
- Verify bucket names match exactly: `uploaded-images` and `final-images`

### Stripe webhook not working
- Verify webhook URL is correct
- Check webhook secret matches
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:8080/api/webhooks/stripe`

### Emails not sending
- Verify Resend API key is correct
- Check domain verification in Resend dashboard
- Check spam folder

### Admin login not working
- Verify admin user exists in `admin_users` table
- Check Supabase Auth user matches admin_users record

## Production Checklist

- [ ] Use production Stripe keys
- [ ] Use production Supabase project
- [ ] Verify domain in Resend
- [ ] Set up proper CORS policies
- [ ] Enable Supabase RLS policies
- [ ] Set up monitoring/error tracking
- [ ] Configure backup strategy
- [ ] Test complete order flow end-to-end
