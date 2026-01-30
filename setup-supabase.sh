#!/bin/bash

echo "🚀 Student Management - Supabase Setup"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Supabase Configuration
# Get these from your Supabase project settings: https://app.supabase.com
SUPABASE_URL=
SUPABASE_ANON_KEY=
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install @supabase/supabase-js dotenv

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Run the SQL migration (supabase-schema.sql) in Supabase SQL Editor"
echo "3. Add your credentials to the .env file"
echo "4. Run: npm run dev"
echo ""
echo "For detailed instructions, see SUPABASE_SETUP.md"
