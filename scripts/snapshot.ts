#!/usr/bin/env npx tsx
/**
 * HELM Dashboard — Data Snapshot Generator
 *
 * Captures a full snapshot of getDashboardData() and writes it to
 * public/data-snapshot.json so Vercel can serve it without local file access.
 *
 * Usage:
 *   npx tsx scripts/snapshot.ts
 *   npm run snapshot
 *
 * This should be run:
 *   1. Before every Vercel deploy (via pre-deploy hook or manually)
 *   2. By a local cron job to keep data fresh (e.g., every 5 minutes)
 *   3. By any agent that modifies shared-kb data
 */

import { getDashboardData } from "../src/lib/data";
import fs from "fs";
import path from "path";

const SNAPSHOT_PATH = path.join(__dirname, "..", "public", "data-snapshot.json");

try {
  console.log("[snapshot] Capturing dashboard data...");
  const data = getDashboardData();

  const snapshot = {
    ...data,
    _snapshot: {
      generatedAt: new Date().toISOString(),
      hostname: require("os").hostname(),
      version: "1.0",
    },
  };

  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));

  const sizeKB = (fs.statSync(SNAPSHOT_PATH).size / 1024).toFixed(1);
  console.log(`[snapshot] Written ${sizeKB}KB to public/data-snapshot.json`);
  console.log(`[snapshot] Timestamp: ${snapshot._snapshot.generatedAt}`);
  console.log(`[snapshot] Agents: ${data.agents.length}, Crons: ${data.cronJobs.length}, Flywheel: ${data.flywheel.totalActive}`);
} catch (error) {
  console.error("[snapshot] Failed:", error);
  process.exit(1);
}
