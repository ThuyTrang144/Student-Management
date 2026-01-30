#!/bin/bash

echo "🚀 Student Management - Deployment Helper"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - ready for deployment"
    git branch -M main
    echo "✅ Git initialized"
    echo ""
    echo "Next: Create a GitHub repository and run:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/student-management.git"
    echo "  git push -u origin main"
else
    echo "✅ Git repository already initialized"
fi

echo ""
echo "🔍 Checking build..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

echo ""
echo "📋 Deployment Options:"
echo ""
echo "1️⃣  Vercel (Recommended - Easiest)"
echo "   • Free tier with auto-deployment"
echo "   • Run: npx vercel"
echo "   • Or visit: https://vercel.com"
echo ""
echo "2️⃣  Railway"
echo "   • Install: npm i -g @railway/cli"
echo "   • Run: railway login && railway init && railway up"
echo ""
echo "3️⃣  Render"
echo "   • Visit: https://render.com"
echo "   • Connect your GitHub repo"
echo ""
echo "📝 Don't forget to add environment variables:"
echo "   SUPABASE_URL=your_supabase_url"
echo "   SUPABASE_ANON_KEY=your_supabase_key"
echo ""
echo "📚 Full guide: See DEPLOYMENT.md"
echo ""

read -p "Deploy with Vercel now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Installing Vercel CLI..."
    npm i -g vercel
    echo ""
    echo "🌐 Starting Vercel deployment..."
    vercel
fi
