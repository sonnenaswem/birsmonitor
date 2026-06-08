import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface DecodedToken {
  role?: string;
  exp?: number;
  user_id?: string;
}

function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Edge runtime safe base64 decode
    const padded = payload + "==".slice((payload.length % 4) || 4);
    const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get token — try cookie named "access" first, then "token"
  const access =
    req.cookies.get("access")?.value ||
    req.cookies.get("token")?.value;

  const isAdminRoute = pathname.startsWith("/admin-dashboard");
  const isAtoRoute = pathname.startsWith("/ato-dashboard");

  // No token at all — redirect to login
  if (!access) {
    if (isAdminRoute || isAtoRoute) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Decode without throwing
  const decoded = decodeJWT(access);

  // Token unreadable — redirect to login
  if (!decoded) {
    if (isAdminRoute || isAtoRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Token expired — redirect to login
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    if (isAdminRoute || isAtoRoute) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      // Clear the stale cookie
      response.cookies.delete("access");
      return response;
    }
    return NextResponse.next();
  }

  const role = (decoded.role || "").toLowerCase();

  // Admin dashboard — allowed roles
  if (isAdminRoute) {
    const allowedRoles = ["admin", "director", "auditor", "assistant"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ATO dashboard — ato only
  if (isAtoRoute && role !== "ato") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin-dashboard/:path*",
    "/ato-dashboard/:path*",
  ],
};