import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const SHARED_KB = path.join(process.env.HOME || "/Users/rizaldomadanlo", ".openclaw", "workspace", "shared-kb");
const PIPELINE_FILE = path.join(SHARED_KB, "income", "pipeline.md");
const LOCK_FILE = PIPELINE_FILE + ".lock";

// Simple file-based lock to prevent concurrent writes
function acquireLock(maxWaitMs = 5000): boolean {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: "wx" });
      return true;
    } catch {
      // Lock exists — check if stale (> 30s)
      try {
        const stat = fs.statSync(LOCK_FILE);
        if (Date.now() - stat.mtimeMs > 30_000) {
          fs.unlinkSync(LOCK_FILE); // stale lock, remove
          continue;
        }
      } catch { /* lock was released between check */ }
      // Wait 50ms and retry
      const end = Date.now() + 50;
      while (Date.now() < end) { /* busy wait */ }
    }
  }
  return false;
}

function releaseLock() {
  try { fs.unlinkSync(LOCK_FILE); } catch { /* already released */ }
}

const REVIEW_STAGES = [
  "HELM_REVIEW", "COMPASS_CHECK", "ANCHOR_RISK", "SIGNAL_MARKET",
  "BEACON_PLAN", "SPARK_GTM", "HELM_FINAL"
];

const STAGE_HOLDER: Record<string, string> = {
  HELM_REVIEW: "HELM", COMPASS_CHECK: "COMPASS", ANCHOR_RISK: "ANCHOR",
  SIGNAL_MARKET: "SIGNAL", BEACON_PLAN: "BEACON", SPARK_GTM: "SPARK", HELM_FINAL: "HELM"
};

const IS_VERCEL = !!process.env.VERCEL;

export async function POST(req: NextRequest) {
  if (IS_VERCEL) {
    return NextResponse.json(
      { error: "Pipeline controls are read-only on cloud deployment.", cloudMode: true },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { ideaId, action, assessment } = body;

    if (!ideaId || !action) {
      return NextResponse.json({ error: "Missing ideaId or action" }, { status: 400 });
    }

    if (action !== "advance" && action !== "bounce") {
      return NextResponse.json({ error: "Action must be 'advance' or 'bounce'" }, { status: 400 });
    }

    // Acquire lock before reading/writing pipeline file
    if (!acquireLock()) {
      return NextResponse.json({ error: "Pipeline file is locked by another operation" }, { status: 409 });
    }

    try {
    // Read pipeline.md
    let content: string;
    try {
      content = fs.readFileSync(PIPELINE_FILE, "utf-8");
    } catch {
      releaseLock();
      return NextResponse.json({ error: "Pipeline file not found" }, { status: 404 });
    }

    // Find the idea block
    const ideaPattern = new RegExp(
      `(### ${ideaId}:[\\s\\S]+?)(?=\\n### IDEA-|\\n## |\\n---\\s*\\n## |$)`
    );
    const match = content.match(ideaPattern);
    if (!match) {
      return NextResponse.json({ error: `Idea ${ideaId} not found` }, { status: 404 });
    }

    let block = match[1];

    // Parse current review stage
    const stageMatch = block.match(/\*\*Review Stage:\*\*\s*(\d+)\/7\s*(?:—|–|-)\s*(\w+)/);
    const currentStage = stageMatch ? parseInt(stageMatch[1]) : 0;
    const currentStageName = stageMatch ? stageMatch[2] : REVIEW_STAGES[0];

    const now = new Date();
    const timestamp = `${now.toISOString().split("T")[0]} ${now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Manila" })}`;

    if (action === "advance") {
      const nextStageNum = Math.min(currentStage + 1, 7);
      const nextStageName = REVIEW_STAGES[nextStageNum - 1] || "HELM_FINAL";
      const nextHolder = STAGE_HOLDER[nextStageName] || "HELM";

      // Update stage number
      if (stageMatch) {
        block = block.replace(
          /\*\*Review Stage:\*\*\s*\d+\/7\s*(?:—|–|-)\s*\w+/,
          `**Review Stage:** ${nextStageNum}/7 — ${nextStageName}`
        );
      } else {
        // Add review stage if not present
        block = block.replace(
          /(\*\*Status:\*\*\s*\w+)/,
          `$1\n**Review Stage:** ${nextStageNum}/7 — ${nextStageName}`
        );
      }

      // Update holder
      if (block.includes("**Current Holder:**")) {
        block = block.replace(/\*\*Current Holder:\*\*\s*\w+/, `**Current Holder:** ${nextHolder}`);
      } else {
        block = block.replace(
          /(\*\*Review Stage:\*\*.+)/,
          `$1\n**Current Holder:** ${nextHolder}`
        );
      }

      // Ensure status is REVIEW
      block = block.replace(/\*\*Status:\*\*\s*\w+/, "**Status:** REVIEW");

      // Add review history entry
      const historyEntry = `- [${timestamp}] DASHBOARD — Advanced ${currentStageName || "PROPOSED"} → ${nextStageName}${assessment ? ". " + assessment : ""}`;
      if (block.includes("**Review History:**")) {
        block = block.replace(
          /(\*\*Review History:\*\*\n)/,
          `$1${historyEntry}\n`
        );
      } else {
        block += `\n**Review History:**\n${historyEntry}\n`;
      }

      // If stage 7 completed, mark as APPROVED
      if (nextStageNum >= 7) {
        block = block.replace(/\*\*Status:\*\*\s*\w+/, "**Status:** APPROVED");
      }
    } else if (action === "bounce") {
      const prevStageNum = Math.max(currentStage - 1, 1);
      const prevStageName = REVIEW_STAGES[prevStageNum - 1] || "HELM_REVIEW";
      const prevHolder = STAGE_HOLDER[prevStageName] || "HELM";

      // Update stage
      if (stageMatch) {
        block = block.replace(
          /\*\*Review Stage:\*\*\s*\d+\/7\s*(?:—|–|-)\s*\w+/,
          `**Review Stage:** ${prevStageNum}/7 — ${prevStageName}`
        );
      }

      // Update holder
      if (block.includes("**Current Holder:**")) {
        block = block.replace(/\*\*Current Holder:\*\*\s*\w+/, `**Current Holder:** ${prevHolder}`);
      }

      // Add review history entry
      const historyEntry = `- [${timestamp}] DASHBOARD — Bounced from ${currentStageName} back to ${prevStageName}${assessment ? ". Reason: " + assessment : ""}`;
      if (block.includes("**Review History:**")) {
        block = block.replace(
          /(\*\*Review History:\*\*\n)/,
          `$1${historyEntry}\n`
        );
      } else {
        block += `\n**Review History:**\n${historyEntry}\n`;
      }
    }

    // Replace the block in the content
    content = content.replace(match[1], block);

    // Write back
    fs.writeFileSync(PIPELINE_FILE, content, "utf-8");
    releaseLock();

    return NextResponse.json({ ok: true, ideaId, action, message: `${ideaId} ${action}d successfully` });
    } finally {
      releaseLock();
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update pipeline", details: String(error) }, { status: 500 });
  }
}
