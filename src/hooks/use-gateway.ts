"use client";
import { useState, useEffect, useCallback, useRef } from "react";

interface GatewayState {
  connectionState: "connecting" | "connected" | "disconnected" | "error";
  lastTick: string | null;
  activeAgents: string[];
  approvalQueue: Array<{ id: string; title: string; options: string[] }>;
}

// Connect through our server-side proxy to avoid browser Origin/CORS issues
// On localhost, connect directly to the gateway proxy on port 18790.
// On remote (phone via Cloudflare Tunnel), skip WebSocket — dashboard
// still works via 30s HTTP polling of /api/dashboard.
function getWsUrl(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "ws://127.0.0.1:18790";
  }
  // Remote access — WebSocket proxy not reachable through tunnel
  return null;
}

const AUTH_TOKEN = "7c80904c8e4ebd8a82dccb19451edc677d83b6f593ec3d0a9f3e321ff77495e1";

let reqSeq = 0;
function nextId(): string {
  return `helm-${Date.now()}-${++reqSeq}`;
}

export function useGateway() {
  const [state, setState] = useState<GatewayState>({
    connectionState: "disconnected",
    lastTick: null,
    activeAgents: [],
    approvalQueue: [],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>>(new Map());
  const connectNonceRef = useRef<string | null>(null);
  const connectSentRef = useRef(false);

  // JSON-RPC request helper — sends {"type":"req","id":"...","method":"...","params":{...}}
  const request = useCallback((method: string, params: Record<string, unknown> = {}): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not open"));
        return;
      }
      const id = nextId();
      pendingRef.current.set(id, { resolve, reject });
      ws.send(JSON.stringify({ type: "req", id, method, params }));

      // Timeout after 10s
      setTimeout(() => {
        if (pendingRef.current.has(id)) {
          pendingRef.current.delete(id);
          reject(new Error(`Request ${method} timed out`));
        }
      }, 10_000);
    });
  }, []);

  // Send the "connect" RPC after receiving the challenge nonce
  const sendConnect = useCallback(async () => {
    if (connectSentRef.current) return;
    connectSentRef.current = true;

    try {
      await request("connect", {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: "openclaw-macos",
          version: "3.0.0",
          platform: typeof navigator !== "undefined" ? navigator.platform : "web",
          mode: "webchat",
          instanceId: `helm-${Date.now()}`,
        },
        role: "operator",
        scopes: ["operator.admin", "operator.approvals", "operator.pairing", "operator.read"],
        caps: [],
        auth: { token: AUTH_TOKEN, password: "" },
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "HELM Dashboard",
        locale: typeof navigator !== "undefined" ? navigator.language : "en",
      });

      // connect succeeded
      setState(s => ({ ...s, connectionState: "connected" }));
      reconnectAttempt.current = 0;
    } catch {
      // connect failed — close and reconnect
      wsRef.current?.close();
    }
  }, [request]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = getWsUrl();
    if (!wsUrl) {
      // Remote access — skip WebSocket, stay disconnected gracefully
      setState(s => ({ ...s, connectionState: "disconnected" }));
      return;
    }

    connectSentRef.current = false;
    connectNonceRef.current = null;
    setState(s => ({ ...s, connectionState: "connecting" }));

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Wait for the connect.challenge from gateway — don't send anything yet
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // --- Handle "event" frames ---
          if (msg.type === "event") {
            const evt = msg as { event: string; payload?: Record<string, unknown>; seq?: number };

            // 1. Challenge — store nonce and kick off the connect RPC
            if (evt.event === "connect.challenge") {
              const nonce = (evt.payload?.nonce as string) || null;
              if (nonce) {
                connectNonceRef.current = nonce;
                sendConnect();
              }
              return;
            }

            // 2. Agent activity events
            if (evt.event?.startsWith("agent") || evt.event === "cron.run.started" || evt.event === "cron.run.finished") {
              const agentId =
                (evt.payload?.agentId as string) ||
                (evt.payload?.sessionKey as string)?.split(":")?.[1];
              if (agentId) {
                setState(s => ({
                  ...s,
                  activeAgents: [...new Set([...s.activeAgents, agentId])],
                }));
                setTimeout(() => {
                  setState(s => ({
                    ...s,
                    activeAgents: s.activeAgents.filter(a => a !== agentId),
                  }));
                }, 30_000);
              }
            }

            // 3. Health / tick events — confirm we're still connected
            if (evt.event === "tick" || evt.event === "health" || evt.event === "heartbeat") {
              setState(s => ({
                ...s,
                connectionState: "connected",
                lastTick: new Date().toISOString(),
              }));
            }

            // 4. Approval requests
            if (evt.event === "exec.approval.requested") {
              const payload = evt.payload || {};
              setState(s => ({
                ...s,
                approvalQueue: [...s.approvalQueue, {
                  id: (payload.id as string) || "",
                  title: (payload.title as string) || "Approval Required",
                  options: (payload.options as string[]) || ["Approve", "Reject"],
                }],
              }));
            }

            return;
          }

          // --- Handle "res" frames (JSON-RPC responses) ---
          if (msg.type === "res") {
            const id = msg.id as string;
            const pending = pendingRef.current.get(id);
            if (pending) {
              pendingRef.current.delete(id);
              if (msg.error) {
                pending.reject(new Error(typeof msg.error === "string" ? msg.error : msg.error?.message || "RPC error"));
              } else {
                pending.resolve(msg.result ?? msg.payload ?? msg);
              }
            }
            return;
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        // Flush pending requests
        for (const [, p] of pendingRef.current) {
          p.reject(new Error("WebSocket closed"));
        }
        pendingRef.current.clear();
        setState(s => ({ ...s, connectionState: "disconnected" }));
        scheduleReconnect();
      };

      ws.onerror = () => {
        setState(s => ({ ...s, connectionState: "error" }));
      };
    } catch {
      setState(s => ({ ...s, connectionState: "error" }));
      scheduleReconnect();
    }
  }, [sendConnect]);

  const scheduleReconnect = useCallback(() => {
    // Don't reconnect if remote (no WebSocket URL available)
    if (!getWsUrl()) return;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempt.current), 30_000);
    reconnectAttempt.current++;
    reconnectTimer.current = setTimeout(connect, delay);
  }, [connect]);

  // Public: send a command to the gateway
  const sendCommand = useCallback((method: string, params?: Record<string, unknown>) => {
    request(method, params || {}).catch(() => {
      // Silently ignore command errors
    });
  }, [request]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { ...state, sendCommand };
}
