import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/customer', '/admin', '/platform', '/employee'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  // Mock phase: client-side auth via Zustand persist.
  // Cookie bridge can be added in Phase 2 for SSR guards.
  const mockAuth = request.cookies.get('isp-auth-mock')?.value;
  if (!mockAuth && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/customer/:path*', '/admin/:path*', '/platform/:path*', '/employee/:path*'],
};
