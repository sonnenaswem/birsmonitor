"use client";

import { logout } from "@/lib/logout";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { usePathname } from "next/navigation";

interface DecodedToken {
  role?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  let role: string | undefined;

  const access = getCookie("access");
  if (access) {
    try {
      const decoded: DecodedToken = jwtDecode(access as string);
      role = decoded.role;
    } catch {
      role = undefined;
    }
  }

  // Helper to apply active class
  const linkClass = (href: string) =>
    `nav-link ${pathname.startsWith(href) ? "active fw-bold text-primary" : ""}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
      <a className="navbar-brand" href="/">BIRS</a>

      <div className="ms-auto d-flex align-items-center gap-3">
        {/* Role-specific links */}
        {role === "admin" && (
          <>
            <a className={linkClass("/admin-dashboard")} href="/admin-dashboard">Manage Users</a>
            <a className={linkClass("/performance-dashboard")} href="/performance-dashboard">Performance</a>
          </>
        )}
        {role === "director" && (
          <>
            <a className={linkClass("/director-dashboard")} href="/director-dashboard">Reports</a>
            <a className={linkClass("/tax-dashboard")} href="/tax-dashboard">Tax Entries</a>
          </>
        )}
        {role === "ato" && (
          <>
            <a className={linkClass("/ato-dashboard")} href="/ato-dashboard">Payments</a>
          </>
        )}

        {/* Logout button */}
        <button onClick={logout} className="btn btn-danger">
          Logout
        </button>
      </div>
    </nav>
  );
}