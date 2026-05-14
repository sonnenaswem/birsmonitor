import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role?: string;
}

export function middleware(req: NextRequest) {
  const access = req.cookies.get("access")?.value;

  if (!access) {
    if (req.nextUrl.pathname.startsWith("/admin-dashboard") ||
        req.nextUrl.pathname.startsWith("/ato-dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  let role: string | undefined;
  try {
    const decoded: DecodedToken = jwtDecode(access);
    role = decoded.role?.toLowerCase();  // Normalize to lowercase
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/admin-dashboard")) {
    const allowedRoles = ["admin", "director", "auditor", "assistant"]; // Add auditor if they use this dashboard too
    if (!allowedRoles.includes(role || "")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith("/auditor-dashboard") && role !== "auditor") {
      return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/ato-dashboard") && role !== "ato") {
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