import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const WORKSPACE = path.join(process.env.HOME || "/Users/rizaldomadanlo", ".openclaw", "workspace");
const SHARED_KB = path.join(WORKSPACE, "shared-kb");

export interface Decision {
  id: string;
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2" | "P3";
  category: "LEGAL" | "COMMS" | "CREW" | "INCOME" | "TECH" | "STRATEGIC";
  options: { label: string; value: string; style: "primary" | "danger" | "warning" | "default" }[];
  context: string | null;       // Brief context / risk statement
  deadline: string | null;
  daysUntil: number | null;
  sourceFile: string;           // Which file to update when decision made
  sourceLine: string | null;    // Marker to find in file
  status: "PENDING" | "APPROVED" | "REJECTED" | "DEFERRED";
  createdAt: string | null;
  agentSource: string;          // Which agent surfaced this
  documentPath: string | null;  // Optional: full doc path for preview
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.ceil((d.getTime() - Date.now()) / 86400000);
  } catch { return null; }
}

function readFile(p: string): string | null {
  try { return fs.readFileSync(p, "utf8"); } catch { return null; }
}

function parseT3Queue(): Decision[] {
  const decisions: Decision[] = [];
  const content = readFile(path.join(SHARED_KB, "taskboard", "SIGNAL-T3-APPROVAL-QUEUE.md"));
  if (!content) return decisions;

  const categoryMap: Record<string, Decision["category"]> = {
    "FLASH ALERT": "COMMS", "Principal Advisory": "COMMS", "Advisory": "COMMS",
    "INCOME": "INCOME", "MaritimeHub": "INCOME",
    "Content": "INCOME", "Hormuz": "LEGAL", "MARINA": "LEGAL",
    "Crew": "CREW", "Bypass": "STRATEGIC",
  };

  const priorityMap: Record<string, Decision["priority"]> = {
    "P0": "P0", "EMERGENCY": "P0", "FLASH": "P0",
    "P1": "P1", "URGENT": "P1",
    "P2": "P2", "P3": "P3",
  };

  // Parse each item block: ### N. Title
  const blocks = content.split(/(?=^### \d+\.)/m).filter(b => b.trim().startsWith("###"));
  for (const block of blocks) {
    const titleMatch = block.match(/^###\s+\d+\.\s+(.+)/m);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();

    const priorityMatch = block.match(/\*\*Priority:\*\*\s*([^\n(]+)/);
    const deliverableMatch = block.match(/\*\*Deliverable:\*\*\s*`([^`]+)`/);
    const dateMatch = block.match(/\*\*Date Completed:\*\*\s*([^\n]+)/);
    const notesMatch = block.match(/\*\*Notes:\*\*\s*([^\n]+)/);
    const statusMatch = block.match(/\*\*Approval Status:\*\*\s*\[([x ])\]\s*(APPROVED|REJECTED)?/);

    // Skip already decided
    const statusVal = statusMatch ? statusMatch[1].trim() : " ";
    const statusLabel = statusMatch ? statusMatch[2] : null;
    if (statusVal === "x" && statusLabel) continue;

    const priorityRaw = priorityMatch ? priorityMatch[1].trim() : "P2";
    let priority: Decision["priority"] = "P2";
    for (const [k, v] of Object.entries(priorityMap)) {
      if (priorityRaw.toUpperCase().includes(k)) { priority = v; break; }
    }

    let category: Decision["category"] = "COMMS";
    for (const [k, v] of Object.entries(categoryMap)) {
      if (title.includes(k)) { category = v; break; }
    }

    // Generate stable ID from title
    const id = "T3-" + title.replace(/[^a-z0-9]/gi, "-").toLowerCase().substring(0, 30);

    decisions.push({
      id,
      title: title.replace(/^(FLASH ALERT:|FLASH:|URGENT:|EMERGENCY:)\s*/i, "").trim(),
      description: notesMatch ? notesMatch[1].trim() : `${priorityRaw} item requiring DOO approval`,
      priority,
      category,
      options: [
        { label: "✅ Approve", value: "APPROVED", style: "primary" },
        { label: "✏️ Revise", value: "REVISE", style: "warning" },
        { label: "❌ Reject", value: "REJECTED", style: "danger" },
      ],
      context: notesMatch ? notesMatch[1].trim() : null,
      deadline: null,
      daysUntil: null,
      sourceFile: path.join(SHARED_KB, "taskboard", "SIGNAL-T3-APPROVAL-QUEUE.md"),
      sourceLine: title,
      status: "PENDING",
      createdAt: dateMatch ? dateMatch[1].trim() : null,
      agentSource: "SIGNAL",
      documentPath: deliverableMatch ? deliverableMatch[1] : null,
    });
  }

  return decisions;
}

function parseCaseDecisions(): Decision[] {
  const decisions: Decision[] = [];

  // Dionson appeal decision
  const defenseBrief = readFile(path.join(SHARED_KB, "cases", "dionson-appeal-defense-brief.md"));
  if (defenseBrief) {
    decisions.push({
      id: "LEGAL-DIONSON-FIGHT-SETTLE",
      title: "Dionson Appeal — Fight or Settle?",
      description: "BEACON recommendation: FIGHT with PHP 150K settlement backstop. Hearing: 2026-03-09.",
      priority: "P0",
      category: "LEGAL",
      options: [
        { label: "⚔️ Fight", value: "FIGHT", style: "primary" },
        { label: "🤝 Settle (PHP 150K)", value: "SETTLE_150K", style: "warning" },
        { label: "🤝 Settle (PHP 200K)", value: "SETTLE_200K", style: "default" },
        { label: "📋 Defer to Counsel", value: "DEFER_COUNSEL", style: "default" },
      ],
      context: "HIGH risk — Twin Notice Rule weakness. USD 11,364.15 + PHP 200K claims. Full brief in shared-kb/cases/dionson-appeal-defense-brief.md",
      deadline: "2026-03-09",
      daysUntil: daysUntil("2026-03-09"),
      sourceFile: path.join(SHARED_KB, "cases", "dionson-appeal-defense-brief.md"),
      sourceLine: null,
      status: "PENDING",
      createdAt: "2026-03-08",
      agentSource: "BEACON",
      documentPath: "shared-kb/cases/dionson-appeal-defense-brief.md",
    });
  }

  return decisions;
}

function parseCrewDecisions(): Decision[] {
  const decisions: Decision[] = [];

  const report = readFile(path.join(SHARED_KB, "crewing", "MARINA-2026-08-compliance-report.md"));
  if (report) {
    decisions.push({
      id: "CREW-C102-PASSPORT",
      title: "C102 Passport Expires March 10 — Action Required",
      description: "Passport expires tomorrow. Emergency DFA renewal or repatriation must be decided today.",
      priority: "P0",
      category: "CREW",
      options: [
        { label: "🛂 Emergency DFA Renewal", value: "DFA_RENEWAL", style: "primary" },
        { label: "✈️ Initiate Repatriation", value: "REPATRIATION", style: "warning" },
        { label: "📞 Notify Principal First", value: "NOTIFY_PRINCIPAL", style: "default" },
      ],
      context: "If not resolved before March 10 → vessel detainment risk, crew abandonment liability, PSC violation. Full action plan in MARINA-2026-08-compliance-report.md",
      deadline: "2026-03-09",
      daysUntil: daysUntil("2026-03-09"),
      sourceFile: path.join(SHARED_KB, "crewing", "MARINA-2026-08-compliance-report.md"),
      sourceLine: "C102",
      status: "PENDING",
      createdAt: "2026-03-08",
      agentSource: "ANCHOR",
      documentPath: "shared-kb/crewing/MARINA-2026-08-compliance-report.md",
    });

    decisions.push({
      id: "CREW-C101-CONTRACT",
      title: "C101 Contract Expired Feb 27 — Extend or Off-Sign?",
      description: "Contract lapsed 9 days ago. Must regularize before POEA inspection.",
      priority: "P1",
      category: "CREW",
      options: [
        { label: "📝 Extend Contract", value: "EXTEND", style: "primary" },
        { label: "🚢 Off-Sign / Repatriate", value: "OFFSIGN", style: "warning" },
      ],
      context: "Working without POEA-approved contract = POEA violation. Decision tree in compliance report.",
      deadline: "2026-03-09",
      daysUntil: daysUntil("2026-03-09"),
      sourceFile: path.join(SHARED_KB, "crewing", "MARINA-2026-08-compliance-report.md"),
      sourceLine: "C101",
      status: "PENDING",
      createdAt: "2026-03-08",
      agentSource: "ANCHOR",
      documentPath: "shared-kb/crewing/MARINA-2026-08-compliance-report.md",
    });
  }

  return decisions;
}

function parseAdvisoryDecisions(): Decision[] {
  const decisions: Decision[] = [];

  const advisory = readFile(path.join(SHARED_KB, "templates", "FINAL-Principal-Advisory-HRA-MARINA-2026-08.md"));
  if (advisory) {
    decisions.push({
      id: "COMMS-MARINA-2026-08-ADVISORY",
      title: "Send MARINA Advisory to Principals?",
      description: "Formal letter + WhatsApp version ready. Informs principals of MARINA 2026-08 HRA compliance posture.",
      priority: "P1",
      category: "COMMS",
      options: [
        { label: "✅ Approve & Send", value: "APPROVED", style: "primary" },
        { label: "✏️ Request Edits", value: "REVISE", style: "warning" },
        { label: "❌ Reject", value: "REJECTED", style: "danger" },
      ],
      context: "T3 item — external communication. Template in shared-kb/templates/FINAL-Principal-Advisory-HRA-MARINA-2026-08.md. Deadline: 2026-03-09.",
      deadline: "2026-03-09",
      daysUntil: daysUntil("2026-03-09"),
      sourceFile: path.join(SHARED_KB, "templates", "FINAL-Principal-Advisory-HRA-MARINA-2026-08.md"),
      sourceLine: null,
      status: "PENDING",
      createdAt: "2026-03-08",
      agentSource: "SIGNAL",
      documentPath: "shared-kb/templates/FINAL-Principal-Advisory-HRA-MARINA-2026-08.md",
    });
  }

  return decisions;
}

function loadDecisions(): Decision[] {
  const all: Decision[] = [
    ...parseCaseDecisions(),
    ...parseCrewDecisions(),
    ...parseAdvisoryDecisions(),
    ...parseT3Queue(),
  ];

  // Sort: P0 first, then by daysUntil
  const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
  return all.sort((a, b) => {
    const po = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (po !== 0) return po;
    return (a.daysUntil ?? 999) - (b.daysUntil ?? 999);
  });
}

function recordDecision(id: string, decision: string, note: string | null) {
  const logPath = path.join(SHARED_KB, "taskboard", "decision-log.md");
  const timestamp = new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });
  const entry = `\n| ${timestamp} | ${id} | ${decision} | ${note || "—"} |`;

  let content = readFile(logPath) || "# Decision Log\n\n| Timestamp | Decision ID | Action | Notes |\n|-----------|-------------|--------|-------|\n";
  content += entry;
  fs.writeFileSync(logPath, content, "utf8");

  // Also append to escalation log
  const escPath = path.join(SHARED_KB, "cases", "escalation-log.md");
  const escContent = readFile(escPath) || "";
  fs.writeFileSync(escPath, escContent + `\n[${timestamp}] DOO DECISION: ${id} → ${decision}${note ? ` (${note})` : ""}`, "utf8");
}

// GET — list all pending decisions
export async function GET() {
  try {
    const decisions = loadDecisions();
    return NextResponse.json({
      decisions,
      total: decisions.length,
      pending: decisions.filter(d => d.status === "PENDING").length,
      p0Count: decisions.filter(d => d.priority === "P0").length,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST — record a decision
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, decision, note } = body;

    if (!id || !decision) {
      return NextResponse.json({ error: "id and decision required" }, { status: 400 });
    }

    recordDecision(id, decision, note || null);

    // Special handling for known decisions
    if (id === "COMMS-MARINA-2026-08-ADVISORY" && decision === "APPROVED") {
      const filePath = path.join(SHARED_KB, "templates", "FINAL-Principal-Advisory-HRA-MARINA-2026-08.md");
      const content = readFile(filePath);
      if (content) {
        fs.writeFileSync(filePath, content.replace("**Status:** FINAL — Ready for Rizaldo's review and dispatch", "**Status:** ✅ APPROVED BY DOO — Ready to send"), "utf8");
      }
    }

    if (id === "LEGAL-DIONSON-FIGHT-SETTLE") {
      const filePath = path.join(SHARED_KB, "cases", "dionson-appeal-defense-brief.md");
      const content = readFile(filePath);
      if (content) {
        const addendum = `\n\n---\n## DOO DECISION — ${new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" })}\n**Decision:** ${decision}\n${note ? `**Notes:** ${note}` : ""}\n`;
        fs.writeFileSync(filePath, content + addendum, "utf8");
      }
    }

    return NextResponse.json({ ok: true, id, decision, timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
