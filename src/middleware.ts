import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  parseAuthCookie,
} from '@/lib/auth/session-cookie';
import {
  canAccessPath,
  isRoleAllowedForPrefix,
} from '@/lib/auth/route-access';
import type { UserRole } from '@/types/auth';

const PROTECTED_PREFIXES = ['/customer', '/admin', '/platform', '/employee'];

function resolveAdminRole(pathname: string, cookieRole: UserRole): boolean {
  if (!pathname.startsWith('/admin')) return true;
  return cookieRole === 'admin' || cookieRole === 'resellerAdmin';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const session = parseAuthCookie(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isRoleAllowedForPrefix(session.role, pathname)) {
    return NextResponse.redirect(new URL('/403', request.url));
  }

  if (!resolveAdminRole(pathname, session.role)) {
    return NextResponse.redirect(new URL('/403', request.url));
  }

  const access = canAccessPath(session.role, session.status, pathname);
  if (!access.allowed) {
    if (access.reason === 'expired') {
      const expiredUrl = new URL(
        session.role === 'user' ? '/customer/subscription' : '/admin/subscription',
        request.url,
      );
      expiredUrl.searchParams.set('expired', '1');
      return NextResponse.redirect(expiredUrl);
    }
    return NextResponse.redirect(new URL('/403', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/customer/:path*', '/admin/:path*', '/platform/:path*', '/employee/:path*'],
};
