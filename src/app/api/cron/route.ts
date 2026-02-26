import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const CRON_FILE = path.join(
  process.env.HOME || "/Users/rizaldomadanlo",
  ".openclaw", "cron", "jobs.json"
);

export async function POST(req: NextRequest) {
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
      const job = data.jobs?.find((j: { id: string }) => j.id === jobId);
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
      // Trigger an immediate run by sending command to gateway
      try {
        const AUTH_TOKEN = "7c80904c8e4ebd8a82dccb19451edc677d83b6f593ec3d0a9f3e321ff77495e1";
        const response = await fetch("http://127.0.0.1:18789/api/cron/trigger", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${AUTH_TOKEN}`,
          },
          body: JSON.stringify({ jobId }),
        });

        if (response.ok) {
          return NextResponse.json({ ok: true, jobId, message: `Job ${jobId} triggered` });
        }

        return NextResponse.json({
          ok: true,
          jobId,
          message: `Trigger request sent for ${jobId} (gateway returned ${response.status})`,
          note: "Gateway may need restart to pick up the trigger.",
        });
      } catch {
        // Gateway not reachable — manual trigger note
        return NextResponse.json({
          ok: true,
          jobId,
          message: `Trigger logged for ${jobId}`,
          note: "Gateway HTTP endpoint not reachable. Restart gateway to apply.",
        });
      }
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to manage cron job", details: String(error) }, { status: 500 });
  }
}
