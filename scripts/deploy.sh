#!/bin/bash

# Blog Deployment Script for kumak.dev
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="devblog"

echo "🚀 Starting deployment for $ENVIRONMENT..."

# Check if we're in the right directory
if [ ! -f "deno.json" ]; then
    echo "❌ Error: Must be run from project root (no deno.json found)"
    exit 1
fi

# Check for required tools
if ! command -v deno &> /dev/null; then
    echo "❌ Error: Deno is not installed"
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Run tests
echo "🧪 Running tests..."
deno test

# Lint code
echo "🔍 Linting code..."
deno task lint

# Build the blog
echo "🔨 Building blog..."
deno task build

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - no dist directory found"
    exit 1
fi

echo "✅ Build completed successfully!"

# Count generated files
FILE_COUNT=$(find dist -type f | wc -l)
echo "📁 Generated $FILE_COUNT files"

# If Deno Deploy token is available, deploy automatically
if [ -n "$DENO_DEPLOY_TOKEN" ]; then
    echo "🚀 Deploying to Deno Deploy..."
    cd dist
    deployctl deploy --project=$PROJECT_NAME --prod
    cd ..
    echo "✅ Deployment complete!"
else
    echo "ℹ️  DENO_DEPLOY_TOKEN not set - skipping automatic deployment"
    echo "ℹ️  Manual deployment: GitHub push will trigger automatic deployment"
fi

echo "🎉 Deployment script completed!"