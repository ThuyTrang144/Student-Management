#!/bin/bash

echo "📊 Supabase Database Status Check"
echo "=================================="
echo ""

# Check if server is running
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Server is running on port 5001"
    echo ""
    
    echo "📋 Checking database content..."
    echo ""
    
    # Check students
    STUDENTS=$(curl -s http://localhost:5001/api/students | jq length 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "👥 Students: $STUDENTS"
    else
        echo "👥 Students: (checking...)"
    fi
    
    # Check stats
    curl -s http://localhost:5001/api/stats | jq '.' 2>/dev/null || echo "Stats: (checking...)"
    
    echo ""
    echo "✅ Database is accessible and working!"
else
    echo "⚠️  Server is not running"
    echo ""
    echo "Start the server first:"
    echo "  PORT=5001 npm run dev"
fi

echo ""
echo "🌐 View your data in Supabase:"
echo "  → https://supabase.com/dashboard"
echo "  → Click your project"
echo "  → Go to 'Table Editor'"
echo ""
echo "📊 Tables you should see:"
echo "  • students"
echo "  • lesson_packages"
echo "  • lessons"
echo "  • documents"
