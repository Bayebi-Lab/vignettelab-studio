#!/bin/bash

set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

PROJECT_REF="ybqvfctofenztytzwpwj"

echo "🚀 Supabase CLI Migration Runner"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if logged in
echo "🔍 Checking Supabase CLI authentication..."
if ! supabase projects list &>/dev/null; then
  echo "⚠️  Not logged in. Please login first:"
  echo ""
  echo "   supabase login"
  echo ""
  read -p "Press Enter after you've logged in, or Ctrl+C to cancel..."
fi

# Link project
echo ""
echo "🔗 Linking to project: $PROJECT_REF"
if [ -f supabase/.temp/project-ref ]; then
  CURRENT_REF=$(cat supabase/.temp/project-ref)
  if [ "$CURRENT_REF" = "$PROJECT_REF" ]; then
    echo "✅ Project already linked"
  else
    echo "⚠️  Project linked to different ref: $CURRENT_REF"
    echo "   Re-linking to $PROJECT_REF..."
    supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD" 2>/dev/null || {
      echo ""
      echo "⚠️  Need database password to link."
      echo "   Get it from: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
      echo ""
      read -sp "Enter database password: " DB_PASSWORD
      echo ""
      supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD"
    }
  fi
else
  echo "⚠️  Project not linked. Linking now..."
  if [ -z "$DB_PASSWORD" ]; then
    echo ""
    echo "⚠️  Need database password to link."
    echo "   Get it from: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
    echo ""
    read -sp "Enter database password: " DB_PASSWORD
    echo ""
  fi
  supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD"
fi

# Check for remote migrations first
echo ""
echo "🔍 Checking for remote migrations..."
if supabase db pull --dry-run &>/dev/null; then
  echo "⚠️  Remote migrations detected. Pulling to sync..."
  supabase db pull || {
    echo ""
    echo "⚠️  Could not pull remote migrations automatically."
    echo "   You may need to manually sync or reset migration history."
    echo ""
    echo "   Option 1: Pull remote migrations:"
    echo "   supabase db pull"
    echo ""
    echo "   Option 2: If remote migrations are old/unused, repair history:"
    echo "   supabase migration repair --status reverted <version>"
    echo ""
    exit 1
  }
fi

# Push migration
echo ""
echo "📦 Pushing migration..."
if supabase db push; then
  echo ""
  echo "✅ Migration completed successfully!"
  echo ""
  echo "📋 Verify in Supabase Dashboard:"
  echo "   https://supabase.com/dashboard/project/$PROJECT_REF/editor"
else
  echo ""
  echo "❌ Migration push failed."
  echo ""
  echo "💡 Try these solutions:"
  echo "   1. Pull remote migrations: supabase db pull"
  echo "   2. Check migration history: supabase migration list"
  echo "   3. Repair if needed: supabase migration repair --status reverted <version>"
  exit 1
fi
