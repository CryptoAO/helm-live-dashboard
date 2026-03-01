#!/bin/bash
# HELM Dashboard — Auto Push Snapshot to Vercel
# Generates a fresh snapshot and re-deploys to Vercel
#
# Set this up as a cron job for continuous monitoring:
#   crontab -e
#   */5 * * * * cd ~/helm-live-dashboard && ./scripts/auto-push.sh >> /tmp/helm-push.log 2>&1
#
# This will update your Vercel dashboard every 5 minutes

set -e

cd "$(dirname "$0")/.."

echo "[$(date)] Generating snapshot..."
npx tsx scripts/snapshot.ts

echo "[$(date)] Deploying to Vercel..."
npx vercel --prod --yes 2>&1 | tail -3

echo "[$(date)] Done ✅"
