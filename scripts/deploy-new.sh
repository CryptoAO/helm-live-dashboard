#!/bin/bash
# HELM Dashboard — Deploy to NEW Vercel Project
# Run this from helm-live-dashboard/ directory on your Mac
#
# Usage:
#   chmod +x scripts/deploy-new.sh
#   ./scripts/deploy-new.sh

set -e

echo "⚓ HELM Dashboard — New Vercel Deployment"
echo "=========================================="

# Step 1: Remove old project link if present
if [ -f ".vercel/project.json" ]; then
  echo ""
  echo "[1/5] Removing old Vercel project link..."
  rm .vercel/project.json
  echo "  ✓ Old project link removed"
else
  echo ""
  echo "[1/5] No old project link found ✓"
fi

# Step 2: Generate data snapshot
echo ""
echo "[2/5] Generating data snapshot from local files..."
npx tsx scripts/snapshot.ts
echo "  ✓ Snapshot created"

# Step 3: Install deps if needed
if [ ! -d "node_modules" ]; then
  echo ""
  echo "[3/5] Installing dependencies..."
  npm install
else
  echo ""
  echo "[3/5] Dependencies already installed ✓"
fi

# Step 4: Deploy to Vercel (new project)
echo ""
echo "[4/5] Deploying to Vercel as new project..."
echo "  → When prompted:"
echo "    - Set up and deploy? YES"
echo "    - Which scope? Select your account"
echo "    - Link to existing project? NO"
echo "    - Project name: helm-ops-mobile (or your choice)"
echo "    - Directory: ./"
echo "    - Override settings? NO"
echo ""
npx vercel --prod

# Step 5: Done
echo ""
echo "[5/5] ✅ Deployment complete!"
echo ""
echo "📱 Open the Vercel URL on your phone"
echo "💡 Tip: Add to Home Screen for app-like experience"
echo ""
echo "To update data later, run:"
echo "  npm run deploy"
