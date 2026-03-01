import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * HELM Dashboard Auth Middleware
 * Protects all routes with Basic Auth when DASHBOARD_PASSWORD is set.
 * Set env vars: DASHBOARD_USER and DASHBOARD_PASSWORD
 * If no password is set, dashboard is accessible without auth (local-only mode).
 */
export function middleware(request: NextRequest) {
  const user = process.env.DASHBOARD_USER || 'helm';
  const password = process.env.DASHBOARD_PASSWORD;

  // If no password configured, skip auth (local-only mode)
  if (!password) {
    return NextResponse.next();
  }

  // Check for Basic Auth header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="HELM Dashboard"',
      },
    });
  }

  // Decode and verify credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [providedUser, providedPassword] = credentials.split(':');

  if (providedUser !== user || providedPassword !== password) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="HELM Dashboard"',
      },
    });
  }

  return NextResponse.next();
}

// Protect all routes except static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json).*)'],
};
