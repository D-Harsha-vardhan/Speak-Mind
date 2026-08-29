import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "speakmind-default-dev-secret-key-change-in-prod"
);
const TOKEN_COOKIE_NAME = "speakmind_session";

// Pages that require authentication
const PROTECTED_PAGES = [
  "/dashboard",
  "/chat",
  "/check-in",
  "/journal",
  "/insights",
  "/activities",
  "/profile",
  "/settings",
  "/support",
  "/onboarding",
];

// Auth pages (redirect to dashboard if already logged in)
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get(TOKEN_COOKIE_NAME);
  const token = tokenCookie?.value;

  // Verify token if present
  let isAuthenticated = false;
  if (token) {
    try {
      await jose.jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch (e) {
      // Token is invalid/expired
      isAuthenticated = false;
    }
  }

  // 1. If trying to access protected pages and not authenticated -> redirect to login
  const isProtectedPage = PROTECTED_PAGES.some((page) =>
    pathname.startsWith(page)
  );
  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Keep track of the original page to redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If trying to access auth pages and already authenticated -> redirect to dashboard
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. For protected API routes, we can return 401 directly in the API handler
  // or handle it here. It is safer to handle it in the handler for modularity,
  // but middleware can also intercept them. Let's let the API routes handle their own auth
  // so we can return standard JSON responses with error messages.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, safety documents etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|about|how-it-works|privacy|safety|$).*)",
  ],
};
