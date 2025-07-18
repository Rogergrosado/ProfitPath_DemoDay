#!/bin/bash

# ProfitPath Deployment Script
# Make this file executable: chmod +x deploy.sh

echo "🚀 Starting ProfitPath deployment preparation..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running type checks..."
npm run check

# Push database schema
echo "🗄️ Pushing database schema..."
npm run db:push

# Build the application
echo "🏗️ Building application..."
npm run build

# Run a quick test
echo "🧪 Testing build..."
timeout 10s npm start &
SERVER_PID=$!
sleep 5

# Check if server is responding
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Stop test server
kill $SERVER_PID 2>/dev/null

echo "✅ ProfitPath is ready for deployment!"
echo ""
echo "Deployment options:"
echo "1. Replit: Click the Deploy button"
echo "2. Vercel: Run 'vercel --prod'"
echo "3. Railway: Run 'railway up'"
echo "4. Docker: Run 'docker build -t profitpath .'"
echo ""
echo "Don't forget to set environment variables on your deployment platform!"