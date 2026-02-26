import { NextRequest, NextResponse } from "next/server";

/**
 * Basic Auth middleware — protects the dashboard when accessed through
 * Cloudflare Tunnel (or any non-localhost origin). Local access is unprotected
 * for development convenience.
 *
 * Credentials are set in .env.local:
 *   DASHBOARD_USER=helm
 *   DASHBOARD_PASS=<your-password>
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // Allow localhost without auth (local development)
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return NextResponse.next();
  }

  // Require auth for all remote access
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="HELM Dashboard"' },
    });
  }

  try {
    const credentials = atob(authHeader.split(" ")[1]);
    const [user, pass] = credentials.split(":");

    const validUser = process.env.DASHBOARD_USER || "helm";
    const validPass = process.env.DASHBOARD_PASS;

    // If no password is configured, block all remote access
    if (!validPass) {
      return new NextResponse("Dashboard password not configured. Set DASHBOARD_PASS in .env.local", {
        status: 503,
      });
    }

    if (user !== validUser || pass !== validPass) {
      return new NextResponse("Invalid credentials", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="HELM Dashboard"' },
      });
    }
  } catch {
    return new NextResponse("Invalid authorization header", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="HELM Dashboard"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
