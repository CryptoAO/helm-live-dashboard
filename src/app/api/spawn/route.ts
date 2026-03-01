import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OPENCLAW_DIR = path.join(process.env.HOME || "/Users/rizaldomadanlo", ".openclaw");
const SHARED_KB = path.join(OPENCLAW_DIR, "workspace", "shared-kb");
const SPAWN_QUEUE = path.join(SHARED_KB, "fleet", "spawn-queue.json");
const SPAWN_COMMS = path.join(SHARED_KB, "fleet", "spawn-comms.jsonl");
const SPAWN_USAGE = path.join(SHARED_KB, "fleet", "spawn-usage.json");

function readJson(fp: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return null;
  }
}

function writeJson(fp: string, data: unknown) {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
}

function appendComms(event: Record<string, unknown>) {
  fs.mkdirSync(path.dirname(SPAWN_COMMS), { recursive: true });
  const line = JSON.stringify({ ts: new Date().toISOString(), ...event }) + "\n";
  fs.appendFileSync(SPAWN_COMMS, line);
}

function now() {
  return new Date().toISOString();
}

// Tier limits
const TIER_LIMITS: Record<string, number> = { S: 3, A: 2, B: 1 };
const AGENT_TIERS: Record<string, string> = {
  main: "S", eagle: "A", anchor: "A", beacon: "A", compass: "A", signal: "A", spark: "B",
};
const MAX_FLEET_SUBS = 10;
const DAILY_BUDGET = 2_000_000;

// ── GET: Read spawn queue + comms ──
export async function GET() {
  const queue = readJson(SPAWN_QUEUE) || { meta: {}, spawns: [] };
  const usage = readJson(SPAWN_USAGE) || { byParent: {} };

  // Read last 50 comms events
  let comms: Record<string, unknown>[] = [];
  try {
    const raw = fs.readFileSync(SPAWN_COMMS, "utf-8");
    comms = raw.trim().split("\n").map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean).slice(-50) as Record<string, unknown>[];
  } catch { /* no comms yet */ }

  return NextResponse.json({ queue, usage, comms });
}

const IS_VERCEL = !!process.env.VERCEL;

// ── POST: Spawn actions ──
export async function POST(request: NextRequest) {
  if (IS_VERCEL) {
    return NextResponse.json(
      { error: "Spawn actions require the local gateway.", cloudMode: true },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { action } = body;

  const queue = (readJson(SPAWN_QUEUE) || {
    meta: { version: "2.0", lastUpdated: now(), dailyBudget: DAILY_BUDGET, dailyUsed: 0, maxFleetSubAgents: MAX_FLEET_SUBS, activeSubAgents: 0, totalSpawnsAllTime: 0, totalTokensAllTime: 0 },
    spawns: [],
  }) as { meta: Record<string, unknown>; spawns: Record<string, unknown>[] };

  switch (action) {

    // ── REQUEST SPAWN ──
    case "request_spawn": {
      const { parentId, name, fullName, task, skillset, model, tokenBudget, deadline, parentInstructions } = body;

      if (!parentId || !name || !task) {
        return NextResponse.json({ error: "Missing required fields: parentId, name, task" }, { status: 400 });
      }

      // Validate parent can spawn
      const tier = AGENT_TIERS[parentId];
      if (!tier) return NextResponse.json({ error: `Unknown parent: ${parentId}` }, { status: 400 });

      const parentActiveSpawns = queue.spawns.filter(
        (s: Record<string, unknown>) => s.parentId === parentId && ["approved", "active", "queued", "booting"].includes(s.status as string)
      ).length;
      const maxSubs = TIER_LIMITS[tier] || 1;

      if (parentActiveSpawns >= maxSubs) {
        return NextResponse.json({ error: `${parentId} already at spawn limit (${parentActiveSpawns}/${maxSubs})` }, { status: 400 });
      }

      const fleetActive = queue.spawns.filter(
        (s: Record<string, unknown>) => ["approved", "active", "queued", "booting"].includes(s.status as string)
      ).length;
      if (fleetActive >= MAX_FLEET_SUBS) {
        return NextResponse.json({ error: `Fleet at max sub-agents (${fleetActive}/${MAX_FLEET_SUBS})` }, { status: 400 });
      }

      const dailyUsed = (queue.meta.dailyUsed as number) || 0;
      const budget = tokenBudget || 200000;
      if (dailyUsed + budget > DAILY_BUDGET) {
        return NextResponse.json({ error: `Daily budget exceeded: ${dailyUsed + budget} > ${DAILY_BUDGET}` }, { status: 400 });
      }

      // Create spawn entry
      const spawnId = `${name.toUpperCase().replace(/\s+/g, "-")}-${String(Date.now()).slice(-3)}`;
      const spawn = {
        spawnId,
        parentId,
        name,
        fullName: fullName || `${name} Sub-Agent`,
        task,
        skillset: skillset || [],
        model: model || "anthropic/claude-sonnet-4-2",
        autonomyLevel: "A1",
        tokenBudget: budget,
        tokensUsed: 0,
        deadline: deadline || null,
        status: "requested",
        progressPct: 0,
        lastProgressNote: null,
        requestedAt: now(),
        approvedAt: null,
        approvedBy: null,
        bootedAt: null,
        completedAt: null,
        recalledAt: null,
        deliverables: [],
        operation: null,
      };

      queue.spawns.push(spawn);
      queue.meta.lastUpdated = now();
      writeJson(SPAWN_QUEUE, queue);
      appendComms({ type: "SPAWN_REQUESTED", parentId, spawnId, task });

      return NextResponse.json({ ok: true, spawnId, spawn });
    }

    // ── APPROVE SPAWN ──
    case "approve_spawn": {
      const { spawnId, approvedBy } = body;
      const spawn = queue.spawns.find((s: Record<string, unknown>) => s.spawnId === spawnId);
      if (!spawn) return NextResponse.json({ error: "Spawn not found" }, { status: 404 });

      spawn.status = "approved";
      spawn.approvedAt = now();
      spawn.approvedBy = approvedBy || "helm";
      queue.meta.lastUpdated = now();
      writeJson(SPAWN_QUEUE, queue);
      appendComms({ type: "SPAWN_APPROVED", parentId: spawn.parentId, spawnId, approvedBy: spawn.approvedBy });

      return NextResponse.json({ ok: true, spawn });
    }

    // ── BOOT SPAWN (create workspace) ──
    case "boot_spawn": {
      const { spawnId } = body;
      const spawn = queue.spawns.find((s: Record<string, unknown>) => s.spawnId === spawnId);
      if (!spawn) return NextResponse.json({ error: "Spawn not found" }, { status: 404 });
      if (spawn.status !== "approved" && spawn.status !== "queued") {
        return NextResponse.json({ error: `Cannot boot spawn in status: ${spawn.status}` }, { status: 400 });
      }

      // Create workspace
      const parentId = spawn.parentId as string;
      const wsRoot = path.join(OPENCLAW_DIR, "workspaces", parentId, "subs", spawnId);
      fs.mkdirSync(path.join(wsRoot, "output"), { recursive: true });
      fs.mkdirSync(path.join(wsRoot, "logs"), { recursive: true });

      // Write .config.json
      writeJson(path.join(wsRoot, ".config.json"), {
        spawnId,
        parentId,
        name: spawn.name,
        tokenBudget: spawn.tokenBudget,
        deadline: spawn.deadline,
        autonomyLevel: spawn.autonomyLevel || "A1",
        canSpawn: false,
        canApproveT3: false,
        canContactHuman: false,
        createdAt: now(),
      });

      // Write BOOT.md
      const bootMd = `# Mission Brief — ${spawn.name}
**Spawned by:** ${(spawn.parentId as string).toUpperCase()}
**Spawn ID:** ${spawnId}
**Created:** ${now()}
**Deadline:** ${spawn.deadline || "None"}

## Your Mission
${spawn.task}

## Constraints
- Token budget: ${spawn.tokenBudget} tokens
- Deadline: ${spawn.deadline || "No hard deadline"}
- You CANNOT spawn sub-agents
- You CANNOT approve T3 decisions
- You CANNOT contact the human (Rizaldo) directly
- You CANNOT modify parent's files

## Resources Available
- Read: shared-kb/ (fleet knowledge base)
- Read: workspaces/${parentId}/ (parent's files)
- Write: Your output/ directory only
- Tools: web.search, web.fetch, code.run

## Communication
- Write progress reports to: outbox.md (every 30 min)
- Check for parent directives in: inbox.md
- If blocked, write BLOCKED tag in outbox.md

## Deliverables
Write all output to: output/
When complete, copy final deliverables to shared-kb/

## Skillset
${(spawn.skillset as string[]).map((s: string) => `- ${s}`).join("\n")}
`;

      fs.writeFileSync(path.join(wsRoot, "BOOT.md"), bootMd);
      fs.writeFileSync(path.join(wsRoot, "MEMORY.md"), `# ${spawn.name} — Working Memory\n\nInitialized: ${now()}\n`);
      fs.writeFileSync(path.join(wsRoot, "inbox.md"), `# Inbox — ${spawn.name}\n\n_Awaiting parent directives._\n`);
      fs.writeFileSync(path.join(wsRoot, "outbox.md"), `# Outbox — ${spawn.name}\n\n_No reports yet._\n`);

      spawn.status = "active";
      spawn.bootedAt = now();
      const active = queue.spawns.filter((s: Record<string, unknown>) => ["approved", "active", "queued", "booting"].includes(s.status as string)).length;
      queue.meta.activeSubAgents = active;
      queue.meta.lastUpdated = now();
      writeJson(SPAWN_QUEUE, queue);
      appendComms({ type: "SPAWN_BOOTED", parentId, spawnId });

      return NextResponse.json({ ok: true, workspace: wsRoot, spawn });
    }

    // ── UPDATE PROGRESS ──
    case "update_progress": {
      const { spawnId, progressPct, note } = body;
      const spawn = queue.spawns.find((s: Record<string, unknown>) => s.spawnId === spawnId);
      if (!spawn) return NextResponse.json({ error: "Spawn not found" }, { status: 404 });

      spawn.progressPct = progressPct ?? spawn.progressPct;
      spawn.lastProgressNote = note || spawn.lastProgressNote;
      spawn.tokensUsed = body.tokensUsed ?? spawn.tokensUsed;
      queue.meta.lastUpdated = now();
      writeJson(SPAWN_QUEUE, queue);
      appendComms({ type: "PROGRESS", parentId: spawn.parentId, spawnId, pct: progressPct, note });

      // Budget warnings
      const budget = spawn.tokenBudget as number;
      const used = spawn.tokensUsed as number;
      if (budget > 0 && used / budget >= 0.8) {
        appendComms({ type: "BUDGET_WARNING", parentId: spawn.parentId, spawnId, pct: Math.round((used / budget) * 100) });
      }

      return NextResponse.json({ ok: true, spawn });
    }

    // ── PARENT DIRECTIVE ──
    case "instruct": {
      const { spawnId, message } = body;
      const spawn = queue.spawns.find((s: Record<string, unknown>) => s.spawnId === spawnId);
      if (!spawn) return NextResponse.json({ error: "Spawn not found" }, { status: 404 });

      const parentId = spawn.parentId as string;
      const inboxPath = path.join(OPENCLAW_DIR, "workspaces", parentId, "subs", spawnId, "inbox.md");
      try {
        const existing = fs.readFileSync(inboxPath, "utf-8");
        const updated = existing + `\n---\n### [${now()}] Directive from ${parentId.toUpperCase()}\n${message}\n`;
        fs.writeFileSync(inboxPath, updated);
      } catch { /* workspace may not exist yet */ }

      appendComms({ type: "PARENT_DIRECTIVE", parentId, spawnId, message: message.slice(0, 100) });
      return NextResponse.json({ ok: true });
    }

    // ── PROMOTE/DEMOTE AUTONOMY ──
    case "set_autonomy": {
      const { spawnId, autonomyLevel } = body;
      if (!["A0", "A1", "A2", "A3"].includes(autonomyLevel)) {
        return NextResponse.json({ error: "Invalid autonomy level. Must be A0-A3." }, { status: 400 });
      }
      const spawn = queue.spawns.find((s: Record<string, unknown>) => s.spawnId === spawnId);
      if (!spawn) return NextResponse.json({ error: "Spawn not found" }, { status: 404 });

      spawn.autonomyLevel = autonomyLevel;
      queue.meta.lastUpdated = now();
      writeJson(SPAWN_QUEUE, queue);
      appendComms({ type: autonomyLevel > (spawn.autonomyLevel as string) ? "PROMOTED" : "DEMOTED", parentId: spawn.parentId, spawnId, autonomyLevel });

      return NextResponse.json({ ok: true, spawn });
    }

    // ── PAUSE / RESUME ──
    case "pause_spawn": {
      const { spawnId } = body;
      const spawn = queue.spawns.find((s: Record<string, unknown>) => s.spawnId === spawnId);
      if (!spawn) return NextResponse.json({ error: "Spawn not found" }, { status: 404 });
      spawn.status = "paused";
      queue.meta.lastUpdated = now();
      writeJson(SPAWN_QUEUE, queue);
      appendComms({ type: "SPAWN_PAUSED", parentId: spawn.parentId, spawnId });
      return NextResponse.json({ ok: true, spawn });
    }

    case "resume_spawn": {
      const { spawnId } = body;
      const spawn = queue.spawns.find((s: Record<string, unknown>) => s.spawnId === spawnId);
      if (!spawn) return NextResponse.json({ error: "Spawn not found" }, { status: 404 });
      spawn.status = "active";
      queue.meta.lastUpdated = now();
      writeJson(SPAWN_QUEUE, queue);
      appendComms({ type: "SPAWN_RESUMED", parentId: spawn.parentId, spawnId });
      return NextResponse.json({ ok: true, spawn });
    }

    // ── COMPLETE SPAWN ──
    case "complete_spawn": {
      const { spawnId, deliverables, tokensUsed } = body;
      const spawn = queue.spawns.find((s: Record<string, unknown>) => s.spawnId === spawnId);
      if (!spawn) return NextResponse.json({ error: "Spawn not found" }, { status: 404 });

      spawn.status = "completed";
      spawn.completedAt = now();
      spawn.progressPct = 100;
      spawn.tokensUsed = tokensUsed ?? spawn.tokensUsed;
      spawn.deliverables = deliverables || [];

      // Update fleet counters
      const active = queue.spawns.filter((s: Record<string, unknown>) => ["approved", "active", "queued", "booting"].includes(s.status as string)).length;
      queue.meta.activeSubAgents = active;
      queue.meta.dailyUsed = ((queue.meta.dailyUsed as number) || 0) + ((spawn.tokensUsed as number) || 0);
      (queue.meta.totalSpawnsAllTime as number) = ((queue.meta.totalSpawnsAllTime as number) || 0) + 1;
      (queue.meta.totalTokensAllTime as number) = ((queue.meta.totalTokensAllTime as number) || 0) + ((spawn.tokensUsed as number) || 0);
      queue.meta.lastUpdated = now();
      writeJson(SPAWN_QUEUE, queue);

      appendComms({ type: "SPAWN_COMPLETED", parentId: spawn.parentId, spawnId, tokensUsed: spawn.tokensUsed, deliverables });
      return NextResponse.json({ ok: true, spawn });
    }

    // ── RECALL SPAWN ──
    case "recall_spawn": {
      const { spawnId, reason } = body;
      const spawn = queue.spawns.find((s: Record<string, unknown>) => s.spawnId === spawnId);
      if (!spawn) return NextResponse.json({ error: "Spawn not found" }, { status: 404 });

      spawn.status = "recalled";
      spawn.recalledAt = now();

      const active = queue.spawns.filter((s: Record<string, unknown>) => ["approved", "active", "queued", "booting"].includes(s.status as string)).length;
      queue.meta.activeSubAgents = active;
      queue.meta.lastUpdated = now();
      writeJson(SPAWN_QUEUE, queue);

      appendComms({ type: "SPAWN_RECALLED", parentId: spawn.parentId, spawnId, reason: reason || "manual recall" });
      return NextResponse.json({ ok: true, spawn });
    }

    // ── BUDGET INCREASE ──
    case "increase_budget": {
      const { spawnId, additionalTokens } = body;
      const spawn = queue.spawns.find((s: Record<string, unknown>) => s.spawnId === spawnId);
      if (!spawn) return NextResponse.json({ error: "Spawn not found" }, { status: 404 });

      const tier = AGENT_TIERS[spawn.parentId as string];
      const maxPerSub = tier === "S" ? 500000 : tier === "A" ? 300000 : 200000;
      const newBudget = (spawn.tokenBudget as number) + (additionalTokens || 50000);

      if (newBudget > maxPerSub) {
        return NextResponse.json({ error: `Budget would exceed tier max: ${newBudget} > ${maxPerSub}` }, { status: 400 });
      }

      spawn.tokenBudget = newBudget;
      queue.meta.lastUpdated = now();
      writeJson(SPAWN_QUEUE, queue);
      appendComms({ type: "BUDGET_INCREASED", parentId: spawn.parentId, spawnId, newBudget });

      return NextResponse.json({ ok: true, spawn });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
