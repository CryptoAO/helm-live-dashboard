#!/bin/bash

# HELM Dashboard Snapshot Refresh and Deploy Script
# Captures fresh data and deploys to production if snapshot succeeds

set -e

# Configuration
LOG_DIR="${HOME}/.openclaw/logs"
LOG_FILE="${LOG_DIR}/snapshot-deploy.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Ensure log directory exists
mkdir -p "${LOG_DIR}"

# Logging function with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "${LOG_FILE}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log "=========================================="
log "Starting snapshot refresh and deploy"
log "=========================================="

# Run snapshot
log "Running snapshot capture..."
if cd "${SCRIPT_DIR}" && npx tsx scripts/snapshot.ts >> "${LOG_FILE}" 2>&1; then
    log "Snapshot capture succeeded"

    # Deploy if snapshot succeeded
    log "Starting deployment to production..."
    if npx vercel --prod --yes >> "${LOG_FILE}" 2>&1; then
        log "Deployment succeeded"
        log "=========================================="
        log "Snapshot refresh and deploy completed successfully"
        log "=========================================="
        exit 0
    else
        log "ERROR: Deployment failed"
        log "=========================================="
        log "Snapshot was captured but deployment failed"
        log "=========================================="
        exit 1
    fi
else
    log "ERROR: Snapshot capture failed"
    log "=========================================="
    log "Snapshot capture failed - skipping deployment"
    log "=========================================="
    exit 1
fi
