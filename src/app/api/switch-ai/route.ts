import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const STATE_FILE = path.join(
  process.env.HOME || "/Users/rizaldomadanlo",
  ".openclaw",
  "provider-state.json"
);

const SCRIPT = path.join(
  process.env.HOME || "/Users/rizaldomadanlo",
  ".openclaw",
  "scripts",
  "switch-provider.sh"
);

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return { activeProvider: "unknown", activeModel: "unknown" };
  }
}

// GET — return current provider state
export async function GET() {
  return NextResponse.json(readState());
}

// POST — switch provider
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const model = body.model as string;

    if (!model || !model.includes("/")) {
      return NextResponse.json(
        { ok: false, error: "Invalid model format. Expected: provider/model" },
        { status: 400 }
      );
    }

    const provider = model.split("/")[0];
    const allowed = ["anthropic", "openai", "google"];
    if (!allowed.includes(provider)) {
      return NextResponse.json(
        { ok: false, error: `Unknown provider: ${provider}. Allowed: ${allowed.join(", ")}` },
        { status: 400 }
      );
    }

    // Execute switch script
    const output = execSync(`bash "${SCRIPT}" "${model}" 2>&1`, {
      timeout: 30000,
      encoding: "utf-8",
    });

    // Parse the JSON line from script output
    const lines = output.trim().split("\n");
    const resultLine = lines.find((l) => l.startsWith("{"));
    const result = resultLine ? JSON.parse(resultLine) : { ok: true };

    const state = readState();
    return NextResponse.json({ ...result, state });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
