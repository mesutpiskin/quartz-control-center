#!/bin/bash

# GitHub Release Script
# Creates a new release and uploads desktop app installers

set -e

VERSION=${1:-v1.0.0}
RELEASE_NOTES=${2:-"Desktop application release"}

echo "🚀 Creating GitHub Release $VERSION..."

# Build desktop apps for macOS
echo "📦 Building macOS app..."
./scripts/build-desktop.sh mac

# Check if release already exists
if gh release view "$VERSION" &>/dev/null; then
  echo "⚠️  Release $VERSION already exists. Deleting..."
  gh release delete "$VERSION" -y
fi

# Create release
echo "✨ Creating release $VERSION..."
gh release create "$VERSION" \
  --title "Quartz Control Center $VERSION" \
  --notes "$RELEASE_NOTES" \
  --draft \
  apps/desktop/dist/*.dmg \
  apps/desktop/dist/*.zip

echo "✅ Release created successfully!"
echo "🔗 View at: https://github.com/mesutpiskin/quartz-control-center/releases"
echo ""
echo "📝 Next steps:"
echo "1. Go to GitHub releases page"
echo "2. Review the draft release"
echo "3. Publish when ready"
