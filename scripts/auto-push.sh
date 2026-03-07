#!/bin/bash
# HELM Dashboard — Auto Push Snapshot to Vercel
# Generates a fresh snapshot and re-deploys to Vercel

set -e

# Ensure npx and vercel are in PATH for cron
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

cd "$(dirname "$0")/.."

echo "[$(date)] Generating snapshot..."
npx tsx scripts/snapshot.ts

echo "[$(date)] Deploying to Vercel..."
npx vercel --prod --yes 2>&1 | tail -3

echo "[$(date)] Done ✅"
