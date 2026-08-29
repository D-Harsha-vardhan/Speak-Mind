import * as jose from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "speakmind-default-dev-secret-key-change-in-prod"
);
const TOKEN_COOKIE_NAME = "speakmind_session";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

// 1. Password Hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 2. JWT Signing
export async function signJWT(payload: JWTPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// 3. JWT Verification
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

// 4. Session Retrieval from Request Cookies (for APIs)
export async function getSessionUser(req: NextRequest): Promise<JWTPayload | null> {
  const cookie = req.cookies.get(TOKEN_COOKIE_NAME);
  if (!cookie) return null;
  return verifyJWT(cookie.value);
}

// 5. Session Retrieval from Server Component Cookies context
// Note: In Next.js App Router, cookies can be imported dynamically to prevent build-time static errors.
export async function getSessionUserFromContext(): Promise<JWTPayload | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookie = cookieStore.get(TOKEN_COOKIE_NAME);
    if (!cookie) return null;
    return verifyJWT(cookie.value);
  } catch {
    return null;
  }
}

// 6. Set Auth Cookie Helper
export async function setAuthCookie(token: string) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// 7. Clear Auth Cookie Helper
export async function clearAuthCookie() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}
