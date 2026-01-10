#!/bin/bash

# Build script for Quartz Control Center
# Usage: ./scripts/build.sh [api|web|all]

set -e

TARGET=${1:-all}

echo "🚀 Building Quartz Control Center..."

if [ "$TARGET" = "all" ] || [ "$TARGET" = "api" ]; then
  echo "📦 Building API..."
  npm run build -w apps/api
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "web" ]; then
  echo "🌐 Building Web..."
  npm run build -w apps/web
fi

echo "✅ Build complete!"
