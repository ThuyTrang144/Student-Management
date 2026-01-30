#!/bin/bash

echo "🔧 Supabase Configuration Helper"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Supabase Configuration
SUPABASE_URL=
SUPABASE_ANON_KEY=
EOF
    echo "✅ .env file created"
fi

echo "📋 Current Configuration:"
echo "------------------------"
if [ -f .env ]; then
    if grep -q "^SUPABASE_URL=.\+" .env && grep -q "^SUPABASE_ANON_KEY=.\+" .env; then
        echo "✅ SUPABASE_URL is set"
        echo "✅ SUPABASE_ANON_KEY is set"
        echo ""
        echo "🎉 Configuration looks good!"
        echo ""
        echo "To test the connection, run:"
        echo "  npm run dev"
        echo ""
        echo "You should see: 'Using Supabase storage'"
    else
        echo "⚠️  Missing Supabase credentials"
        echo ""
        echo "📝 Steps to configure:"
        echo ""
        echo "1. Go to: https://supabase.com/dashboard"
        echo "2. Select your project (or create a new one)"
        echo "3. Go to: Settings ⚙️  → API"
        echo "4. Copy these values:"
        echo "   • Project URL"
        echo "   • anon/public key"
        echo ""
        echo "5. Open .env file and add:"
        echo "   SUPABASE_URL=https://your-project.supabase.co"
        echo "   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI..."
        echo ""
        echo "6. Save and run: npm run dev"
    fi
else
    echo "❌ Could not find .env file"
fi

echo ""
echo "📚 Need help? Check:"
echo "   • QUICK_SUPABASE_INIT.md"
echo "   • DATABASE_SETUP.md"
