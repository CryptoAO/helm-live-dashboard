import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const CRON_FILE = path.join(
  process.env.HOME || "/Users/rizaldomadanlo",
  ".openclaw", "cron", "jobs.json"
);

const IS_VERCEL = !!process.env.VERCEL;

export async function POST(req: NextRequest) {
  if (IS_VERCEL) {
    return NextResponse.json(
      { error: "Cron controls are read-only on cloud deployment.", cloudMode: true },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { action, jobId, enabled } = body;

    if (!action || !jobId) {
      return NextResponse.json({ error: "Missing action or jobId" }, { status: 400 });
    }

    if (action === "toggle") {
      // Read jobs.json
      let raw: string;
      try {
        raw = fs.readFileSync(CRON_FILE, "utf-8");
      } catch {
        return NextResponse.json({ error: "Jobs file not found" }, { status: 404 });
      }

      const data = JSON.parse(raw);
      const job = data.jobs?.find((j: { jobId?: string; id?: string }) => j.jobId === jobId || j.id === jobId);
      if (!job) {
        return NextResponse.json({ error: `Job ${jobId} not found` }, { status: 404 });
      }

      // Toggle enabled state
      job.enabled = typeof enabled === "boolean" ? enabled : !job.enabled;

      // Write back
      fs.writeFileSync(CRON_FILE, JSON.stringify(data, null, 2), "utf-8");

      return NextResponse.json({
        ok: true,
        jobId,
        enabled: job.enabled,
        message: `Job ${jobId} ${job.enabled ? "enabled" : "disabled"}`,
      });
    }

    if (action === "trigger") {
      // Reset errors and re-enable the job so it runs on next cron cycle
      // Also attempt to trigger via gateway JSON-RPC
      let raw: string;
      try {
        raw = fs.readFileSync(CRON_FILE, "utf-8");
      } catch {
        return NextResponse.json({ error: "Jobs file not found" }, { status: 404 });
      }

      const data = JSON.parse(raw);
      const job = data.jobs?.find((j: { jobId: string }) => j.jobId === jobId);
      if (job) {
        // Reset error state so it runs cleanly on next cycle
        if (job.state) {
          job.state.consecutiveErrors = 0;
          job.state.lastStatus = "retry_pending";
          // Set nextRunAtMs to now so it runs on next gateway tick
          job.state.nextRunAtMs = Date.now();
        }
        job.enabled = true;
        fs.writeFileSync(CRON_FILE, JSON.stringify(data, null, 2), "utf-8");
      }

      // Also try gateway JSON-RPC trigger (best-effort)
      try {
        const authToken = process.env.NEXT_PUBLIC_GATEWAY_TOKEN || "";
        await fetch("http://127.0.0.1:18789", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
          body: JSON.stringify({ jsonrpc: "2.0", method: "cron.trigger", params: { jobId }, id: Date.now() }),
          signal: AbortSignal.timeout(3000),
        });
      } catch { /* gateway may not support this — job will run on next cycle */ }

      return NextResponse.json({
        ok: true,
        jobId,
        message: `Job ${jobId} reset and scheduled for immediate re-run on next gateway cycle.`,
      });
    }

    if (action === "reset_errors") {
      // Reset consecutive error counter for a job — HELM T2 authority (AGENTS.md)
      let raw: string;
      try {
        raw = fs.readFileSync(CRON_FILE, "utf-8");
      } catch {
        return NextResponse.json({ error: "Jobs file not found" }, { status: 404 });
      }

      const data = JSON.parse(raw);
      const job = data.jobs?.find((j: { jobId: string }) => j.jobId === jobId);
      if (!job) {
        return NextResponse.json({ error: `Job ${jobId} not found` }, { status: 404 });
      }

      // Reset error state
      if (job.state) {
        job.state.consecutiveErrors = 0;
        job.state.lastStatus = "reset";
      }
      // Ensure job is enabled
      job.enabled = true;

      fs.writeFileSync(CRON_FILE, JSON.stringify(data, null, 2), "utf-8");

      return NextResponse.json({
        ok: true,
        jobId,
        message: `Error counter reset for ${jobId}. Job re-enabled.`,
      });
    }

    if (action === "delegate_helm") {
      // Write a remediation task to HELM's inbox (SOUL.md delegation protocol)
      const HELM_INBOX = path.join(
        process.env.HOME || "/Users/rizaldomadanlo",
        ".openclaw", "workspace", "shared-kb", "taskboard", "helm-inbox.md"
      );

      const now = new Date();
      const timestamp = `${now.toISOString().split("T")[0]} ${now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Manila" })}`;

      // Read current jobs to summarize errors
      let errorSummary = "Cron job failures detected.";
      try {
        const raw = fs.readFileSync(CRON_FILE, "utf-8");
        const data = JSON.parse(raw);
        const failing = (data.jobs || []).filter((j: { state?: { consecutiveErrors?: number } }) =>
          j.state?.consecutiveErrors && j.state.consecutiveErrors > 0
        );
        errorSummary = failing.map((j: { jobId: string; name: string; agentId: string; state: { consecutiveErrors: number } }) =>
          `- **${j.name}** (${j.agentId}): ${j.state.consecutiveErrors} consecutive errors`
        ).join("\n");
      } catch { /* use default summary */ }

      const taskEntry = `
### [${timestamp}] CRON-REMEDIATION — Dashboard Auto-Escalation
**From:** Dashboard (Auto)
**Priority:** P1
**Status:** PENDING
**Type:** CRON_ERROR_REMEDIATION

The following cron jobs have consecutive errors and require HELM triage:

${errorSummary}

**Recommended Actions (per Fleet Captain Authority):**
1. Check gateway logs for root cause: \`~/.openclaw/logs/gateway.log\`
2. Retry failed jobs via dashboard or \`/api/cron\` trigger
3. If persistent, restart gateway: \`launchctl kickstart -k gui/$(id -u)/ai.openclaw.gateway\`
4. If agent-specific, check agent workspace for errors
5. Escalate to Rizaldo if P0 operations are impacted

`;

      try {
        let existing = "";
        try {
          existing = fs.readFileSync(HELM_INBOX, "utf-8");
        } catch { /* file doesn't exist yet */ }

        if (existing && existing.includes("## Pending Tasks")) {
          // Insert after "## Pending Tasks" header
          const updated = existing.replace(
            /^(## Pending Tasks\n)/m,
            `$1${taskEntry}`
          );
          fs.writeFileSync(HELM_INBOX, updated, "utf-8");
        } else if (existing) {
          // File exists but doesn't have Pending Tasks header — append to end
          fs.writeFileSync(HELM_INBOX, existing + "\n" + taskEntry, "utf-8");
        } else {
          // Create new inbox
          // Ensure directory exists
          const dir = path.dirname(HELM_INBOX);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(HELM_INBOX, `# HELM Inbox — Task Board\n\n## Pending Tasks\n${taskEntry}\n## Completed Tasks\n`, "utf-8");
        }
      } catch (writeErr) {
        return NextResponse.json({ error: "Failed to write to HELM inbox", details: String(writeErr) }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        message: `Cron remediation task delegated to HELM inbox. HELM will triage on next cycle.`,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to manage cron job", details: String(error) }, { status: 500 });
  }
}
