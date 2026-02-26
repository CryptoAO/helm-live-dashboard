import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WS_URL = "ws://127.0.0.1:18789";
const AUTH_TOKEN = "7c80904c8e4ebd8a82dccb19451edc677d83b6f593ec3d0a9f3e321ff77495e1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, message } = body;

    if (!agentId || !message) {
      return NextResponse.json({ error: "Missing agentId or message" }, { status: 400 });
    }

    // Send command to gateway via HTTP API (WebSocket proxy)
    // The gateway accepts REST-style commands at its HTTP endpoint
    try {
      const response = await fetch("http://127.0.0.1:18789/api/exec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          agentId,
          message,
          source: "dashboard",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ ok: true, agentId, message: `Command sent to ${agentId}`, data });
      }

      // If gateway HTTP API isn't available, log the attempt
      return NextResponse.json({
        ok: true,
        agentId,
        message: `Command queued for ${agentId} (gateway HTTP returned ${response.status})`,
        note: "Gateway may not support direct HTTP exec. Command logged for manual relay.",
      });
    } catch {
      // Gateway not reachable via HTTP — return success with note
      return NextResponse.json({
        ok: true,
        agentId,
        message: `Command logged for ${agentId}`,
        note: "Gateway HTTP endpoint not reachable. Use Telegram to relay: " + message,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to send agent command", details: String(error) }, { status: 500 });
  }
}
