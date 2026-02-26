export async function register() {
  // Only start the proxy on the Node.js server runtime (not edge, not client)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startGatewayProxy } = await import("./lib/gateway-proxy");
    startGatewayProxy();
  }
}
