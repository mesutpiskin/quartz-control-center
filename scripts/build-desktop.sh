#!/bin/bash

# Electron Desktop App Builder
# Usage: ./scripts/build-desktop.sh [mac|win|linux|all]

set -e

TARGET=${1:-all}

echo "🎯 Building Quartz Control Center Desktop App..."

# Build API and Web first
echo "📦 Building API..."
npm run build -w apps/api

echo "🌐 Building Web..."
npm run build -w apps/web

# Install desktop dependencies
echo "📥 Installing desktop dependencies..."
cd apps/desktop
npm install

# Build for target platform(s)
if [ "$TARGET" = "all" ]; then
  echo "🏗️  Building for all platforms..."
  npm run build
elif [ "$TARGET" = "mac" ]; then
  echo "🍎 Building for macOS..."
  npm run build:mac
elif [ "$TARGET" = "win" ]; then
  echo "🪟 Building for Windows..."
  npm run build:win
elif [ "$TARGET" = "linux" ]; then
  echo "🐧 Building for Linux..."
  npm run build:linux
else
  echo "❌ Unknown target: $TARGET"
  echo "Usage: ./scripts/build-desktop.sh [mac|win|linux|all]"
  exit 1
fi

cd ../..

echo "✅ Desktop build complete!"
echo "📦 Output: apps/desktop/dist/"
