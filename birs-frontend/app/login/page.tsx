"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { setCookie } from "cookies-next";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth() as any;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/api/auth/login/", {
        username,
        password,
      });

      setCookie("access", res.data.access, {
        maxAge: 60 * 60,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      setCookie("refresh", res.data.refresh, {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      localStorage.setItem("token", res.data.access);
      localStorage.setItem("role", res.data.role?.toLowerCase() || "");
      if (res.data.full_name) {
        localStorage.setItem("fullName", res.data.full_name);
      }

      const userRole = res.data.role?.toLowerCase();
      setUser({ role: userRole || null, fullName: res.data.full_name || null });

      const adminRoles = ["admin", "director", "auditor", "assistant"];

      if (adminRoles.includes(userRole)) {
        router.push("/admin-dashboard");
        router.refresh();
      } else if (userRole === "ato") {
        router.push("/ato-dashboard");
        router.refresh();
      } else {
        setError("User role not recognized. Contact Administrator.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

        .login-input{
          width:100%;padding:13px 16px;border-radius:9px;
          border:1.5px solid #dcd4bf;font-size:15px;outline:none;
          transition:border-color .18s ease, box-shadow .18s ease;
          box-sizing:border-box;font-family:'Inter',sans-serif;
          background:#fff;color:#13261a;
        }
        .login-input::placeholder{color:#9ca39a;}
        .login-input:focus{
          border-color:#052e16;
          box-shadow:0 0 0 3.5px rgba(5,46,22,0.10);
        }
        .login-submit{
          width:100%;padding:14px;border:none;border-radius:9px;
          background:#052e16;color:#faf8f3;font-size:15.5px;font-weight:600;
          cursor:pointer;margin-top:6px;transition:background .18s ease, transform .15s ease;
          display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .login-submit:hover:not(:disabled){background:#0a3d1f;transform:translateY(-1px);}
        .login-submit:disabled{opacity:0.7;cursor:not-allowed;}
        .toggle-pw{
          position:absolute;right:14px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:#7d8c80;
          display:flex;align-items:center;padding:4px;
        }
        .toggle-pw:hover{color:#052e16;}
        .ledger-bg::before{
          content:"";position:absolute;inset:0;pointer-events:none;opacity:0.5;
          background-image:repeating-linear-gradient(180deg, transparent, transparent 27px, rgba(255,255,255,0.035) 28px);
          mask-image:linear-gradient(180deg, transparent, black 25%, black 80%, transparent);
        }
        @media (max-width: 880px){
          .login-brand-panel{ display:none !important; }
          .login-form-panel{ flex:1 1 100% !important; max-width:100% !important; }
        }
      `}</style>

      {/* LEFT — BRAND PANEL */}
      <div
        className="login-brand-panel ledger-bg"
        style={{
          flex: "1 1 46%",
          background: "linear-gradient(160deg, #052e16 0%, #0a3d1f 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 48,
          padding: "56px 64px",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,162,39,0.16), transparent 70%)",
            top: -140,
            right: -100,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "absolute", top: 56, left: 64 }}>
          <img
            src="/logo1.png"
            alt="BIRS Logo"
            style={{ height: 50, width: "auto" }}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div
            style={{
              display: "none",
              width: 42,
              height: 42,
              borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              alignItems: "center",
              justifyContent: "center",
              color: "#e0bf4f",
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            B
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17, color: "#fff" }}>
              BIRS Monitor
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(250,248,243,0.6)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginTop: -2,
              }}
            >
              Revenue Intelligence
            </div>
          </div>
        </div>

        <div style={{ position: "relative", maxWidth: 440 }}>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: "clamp(1.7rem, 2.6vw, 2.25rem)",
              color: "#fff",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              marginBottom: 14,
            }}
          >
            Revenue integrity, <em style={{ fontStyle: "italic", color: "#4ade80" }}>verified in real time.</em>
          </h1>
          <p style={{ fontSize: 14.5, color: "rgba(250,248,243,0.7)", lineHeight: 1.65, marginBottom: 30 }}>
            Sign in to track collections, verify payment references, and audit Area Tax Office
            performance across Benue State.
          </p>

          {/* Dashboard preview mockup */}
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: 20,
              backdropFilter: "blur(6px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(250,248,243,0.55)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                League Table — June 2026
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "#4ade80",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                Live
              </span>
            </div>

            {[
              { name: "ATO Zaki Biam", pct: 100, amt: "₦100.9M", medal: "🥇" },
              { name: "ATO Terwase Agbadu", pct: 96, amt: "₦68.5M", medal: "🥈" },
              { name: "ATO Adikpo", pct: 88, amt: "₦50.4M", medal: "🥉" },
            ].map((row) => (
              <div key={row.name} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(250,248,243,0.92)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{row.medal}</span>
                    {row.name}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#e0bf4f" }}>{row.amt}</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${row.pct}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #4ade80, #e0bf4f)",
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
                marginTop: 18,
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div>
                <div style={{ fontSize: 9.5, color: "rgba(250,248,243,0.5)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
                  Remita
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>₦456.7M</div>
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: "rgba(250,248,243,0.5)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
                  GoKollect
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>₦68.4M</div>
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: "rgba(250,248,243,0.5)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
                  Total
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>₦526.9M</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", gap: 28 }}>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#e0bf4f" }}>
              99.9%
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(250,248,243,0.55)" }}>System uptime</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#e0bf4f" }}>
              24/7
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(250,248,243,0.55)" }}>Monitoring</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#e0bf4f" }}>
              Secure
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(250,248,243,0.55)" }}>Encryption</div>
          </div>
        </div>
      </div>

      {/* RIGHT — FORM PANEL */}
      <div
        className="login-form-panel"
        style={{
          flex: "1 1 54%",
          maxWidth: 560,
          background: "#faf8f3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 26,
              fontWeight: 600,
              color: "#052e16",
              marginBottom: 8,
            }}
          >
            Portal sign in
          </h2>
          <p style={{ fontSize: 14, color: "#3f5648", marginBottom: 32 }}>
            Enter your credentials to manage tax performance.
          </p>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                backgroundColor: "#fef2f2",
                color: "#991b1b",
                padding: "13px 14px",
                borderRadius: 9,
                fontSize: 13.5,
                marginBottom: 22,
                border: "1px solid #fecaca",
                lineHeight: 1.5,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16, textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Username
              </label>
              <input
                className="login-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div style={{ marginBottom: 8, textAlign: "left", position: "relative" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Password
              </label>
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="toggle-pw"
                style={{ top: "calc(50% + 11px)" }}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <button type="submit" disabled={isLoading} className="login-submit">
              {isLoading ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Login to dashboard
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p style={{ marginTop: 28, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
            Secured by BIRS IT Infrastructure
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
