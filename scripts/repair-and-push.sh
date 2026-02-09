#!/bin/bash

set -e

echo "🔧 Repairing Migration History"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if logged in
if ! supabase projects list &>/dev/null; then
  echo "⚠️  Not logged in. Please login first:"
  echo "   supabase login"
  exit 1
fi

echo "✅ Logged in. Proceeding with migration repair..."
echo ""

# Repair old migrations (mark as reverted)
echo "📋 Marking old remote migrations as reverted..."
supabase migration repair --status reverted 20250201000000
supabase migration repair --status reverted 20250201000001

# Mark new migration as applied (since it's already on remote)
echo ""
echo "📋 Marking new migration as applied..."
supabase migration repair --status applied 20260209092709

# Push any new migrations
echo ""
echo "📦 Pushing migrations..."
supabase db push

echo ""
echo "✅ Migration repair and push completed successfully!"
echo ""
echo "📋 Verify in Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/ybqvfctofenztytzwpwj/editor"
