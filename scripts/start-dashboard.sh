#!/bin/bash
# HELM Dashboard Auto-Start Script
# Called by macOS LaunchAgent on boot
# Builds and starts the production server on port 3000

set -e

DASHBOARD_DIR="$HOME/helm-live-dashboard"
LOG_DIR="$HOME/.openclaw/logs"
LOG_FILE="$LOG_DIR/dashboard.log"
ERR_FILE="$LOG_DIR/dashboard.err.log"

mkdir -p "$LOG_DIR"

cd "$DASHBOARD_DIR"

# Ensure node_modules exist
if [ ! -d "node_modules" ]; then
  echo "[dashboard] Installing dependencies..." >> "$LOG_FILE"
  npm install >> "$LOG_FILE" 2>> "$ERR_FILE"
fi

# Build production bundle (faster startup, less memory than dev mode)
echo "[dashboard] Building production bundle..." >> "$LOG_FILE"
npm run build >> "$LOG_FILE" 2>> "$ERR_FILE"

# Start production server
echo "[dashboard] Starting production server on port 3000..." >> "$LOG_FILE"
exec npm start
