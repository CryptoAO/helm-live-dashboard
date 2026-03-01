import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const IS_VERCEL = !!process.env.VERCEL;
const SNAPSHOT_PATH = path.join(process.cwd(), "public", "data-snapshot.json");

const OPENCLAW_DIR = path.join(
  process.env.HOME || "/Users/rizaldomadanlo",
  ".openclaw"
);
const CONFIG_FILE = path.join(OPENCLAW_DIR, "openclaw.json");
const FAILOVER_CONFIG = path.join(OPENCLAW_DIR, "failover-config.json");
const FAILOVER_LOG = path.join(OPENCLAW_DIR, "logs", "failover.jsonl");

function readJsonOrDefault(fp: string, def: Record<string, unknown>) {
  try { return JSON.parse(fs.readFileSync(fp, "utf-8")); } catch { return def; }
}

function appendLog(entry: Record<string, unknown>) {
  try {
    const dir = path.dirname(FAILOVER_LOG);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(FAILOVER_LOG, JSON.stringify(entry) + "\n");
  } catch { /* best effort */ }
}

// GET — return failover config
export async function GET() {
  if (IS_VERCEL) {
    // On Vercel: return config from snapshot
    try {
      const raw = fs.readFileSync(SNAPSHOT_PATH, "utf-8");
      const snap = JSON.parse(raw);
      return NextResponse.json({
        autoFailoverEnabled: snap.redundancy?.autoFailoverEnabled ?? true,
        maxRetries: 3,
        cooldownMs: 60000,
        _source: "snapshot",
      });
    } catch {
      return NextResponse.json({ autoFailoverEnabled: true, maxRetries: 3, cooldownMs: 60000, _source: "default" });
    }
  }
  const config = readJsonOrDefault(FAILOVER_CONFIG, { autoFailoverEnabled: true, maxRetries: 3, cooldownMs: 60000 });
  return NextResponse.json(config);
}

// POST — actions: toggle auto-failover, manual failover, restore primary
export async function POST(req: NextRequest) {
  // On Vercel: write operations are not available (no local filesystem)
  if (IS_VERCEL) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failover actions are read-only on cloud deployment. Use the local dashboard (127.0.0.1:3000) with the gateway running to perform live failover operations.",
        cloudMode: true,
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "toggle_auto_failover") {
      const config = readJsonOrDefault(FAILOVER_CONFIG, { autoFailoverEnabled: true, maxRetries: 3, cooldownMs: 60000 });
      config.autoFailoverEnabled = !config.autoFailoverEnabled;
      config.lastToggled = new Date().toISOString();
      fs.writeFileSync(FAILOVER_CONFIG, JSON.stringify(config, null, 2));
      return NextResponse.json({ ok: true, autoFailoverEnabled: config.autoFailoverEnabled });
    }

    if (action === "manual_failover") {
      const { agentId, toModel } = body;
      if (!agentId || !toModel) {
        return NextResponse.json({ ok: false, error: "agentId and toModel required" }, { status: 400 });
      }

      const config = readJsonOrDefault(CONFIG_FILE, {});
      const agentList = config?.agents?.list || [];
      const agent = agentList.find((a: { id: string }) => a.id === agentId);
      if (!agent) {
        return NextResponse.json({ ok: false, error: `Agent ${agentId} not found` }, { status: 404 });
      }

      const fromModel = agent.model?.primary || config?.agents?.defaults?.model?.primary || "unknown";
      if (!agent.model) agent.model = {};
      agent.model.primary = toModel;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

      appendLog({
        timestamp: new Date().toISOString(),
        agentId,
        agentName: agent.name || agentId.toUpperCase(),
        fromModel,
        toModel,
        reason: "manual_failover",
        automatic: false,
      });

      return NextResponse.json({ ok: true, fromModel, toModel, agentId });
    }

    if (action === "restore_primary") {
      const { agentId } = body;
      if (!agentId) {
        return NextResponse.json({ ok: false, error: "agentId required" }, { status: 400 });
      }

      const config = readJsonOrDefault(CONFIG_FILE, {});
      const agentList = config?.agents?.list || [];
      const agent = agentList.find((a: { id: string }) => a.id === agentId);
      if (!agent) {
        return NextResponse.json({ ok: false, error: `Agent ${agentId} not found` }, { status: 404 });
      }

      const defaultPrimary = config?.agents?.defaults?.model?.primary || "anthropic/claude-opus-4-6";
      const fromModel = agent.model?.primary || defaultPrimary;

      // Read intended primary from config (not hardcoded — models change)
      const agentConfig = agentList.find((a: { id: string }) => a.id === agentId);
      const configuredPrimary = agentConfig?.model?.primary;
      const toModel = configuredPrimary || defaultPrimary;
      if (!agent.model) agent.model = {};
      agent.model.primary = toModel;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

      appendLog({
        timestamp: new Date().toISOString(),
        agentId,
        agentName: agent.name || agentId.toUpperCase(),
        fromModel,
        toModel,
        reason: "restore_primary",
        automatic: false,
      });

      return NextResponse.json({ ok: true, fromModel, toModel, agentId });
    }

    if (action === "update_fallbacks") {
      const { agentId, fallbacks } = body;
      if (!agentId || !Array.isArray(fallbacks)) {
        return NextResponse.json({ ok: false, error: "agentId and fallbacks[] required" }, { status: 400 });
      }

      const config = readJsonOrDefault(CONFIG_FILE, {});
      const agentList = config?.agents?.list || [];
      const agent = agentList.find((a: { id: string }) => a.id === agentId);
      if (!agent) {
        return NextResponse.json({ ok: false, error: `Agent ${agentId} not found` }, { status: 404 });
      }

      if (!agent.model) agent.model = {};
      agent.model.fallbacks = fallbacks;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

      return NextResponse.json({ ok: true, agentId, fallbacks });
    }

    return NextResponse.json({ ok: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
