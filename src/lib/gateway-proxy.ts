import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

const GATEWAY_URL = "ws://127.0.0.1:18789";
const PROXY_PORT = 18790;

let server: Server | null = null;

export function startGatewayProxy() {
  if (server) return; // already running

  server = createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("HELM Gateway Proxy");
  });

  const wss = new WebSocketServer({ server });

  wss.on("connection", (clientWs) => {
    // Connect to the real gateway from server-side — explicitly set origin
    // to match the gateway's own host so it passes the origin check
    const gatewayWs = new WebSocket(GATEWAY_URL, {
      headers: { Origin: "http://127.0.0.1:18789" },
    });

    gatewayWs.on("open", () => {
      console.log("[gateway-proxy] Connected to gateway");
    });

    // Forward gateway → client
    gatewayWs.on("message", (data) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data.toString());
      }
    });

    // Forward client → gateway
    clientWs.on("message", (data) => {
      if (gatewayWs.readyState === WebSocket.OPEN) {
        gatewayWs.send(data.toString());
      }
    });

    // Cleanup
    clientWs.on("close", () => {
      console.log("[gateway-proxy] Client disconnected");
      if (gatewayWs.readyState === WebSocket.OPEN) gatewayWs.close();
    });

    gatewayWs.on("close", () => {
      console.log("[gateway-proxy] Gateway disconnected");
      if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
    });

    gatewayWs.on("error", (err) => {
      console.error("[gateway-proxy] Gateway error:", err.message);
      if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
    });

    clientWs.on("error", (err) => {
      console.error("[gateway-proxy] Client error:", err.message);
      if (gatewayWs.readyState === WebSocket.OPEN) gatewayWs.close();
    });
  });

  server.listen(PROXY_PORT, "127.0.0.1", () => {
    console.log(`[gateway-proxy] WebSocket proxy running on ws://127.0.0.1:${PROXY_PORT}`);
  });
}
