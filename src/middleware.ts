import { NextResponse } from "next/server";

/**
 * Middleware — currently open access (no auth).
 * To re-enable Basic Auth later, set DASHBOARD_PASS in Vercel env vars
 * and restore the auth logic.
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
