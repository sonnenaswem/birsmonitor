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

      // Save tokens for middleware and API calls
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
      // Save data for client-side logic
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("role", res.data.role?.toLowerCase() || "");
      if (res.data.full_name) {
        localStorage.setItem("fullName", res.data.full_name);
      }

      const userRole = res.data.role?.toLowerCase();
      setUser({ role: userRole || null, fullName: res.data.full_name || null });

      // Precise Redirection logic
      const adminRoles = ["admin", "director", "auditor", "assistant"];

      if (adminRoles.includes(userRole)) {
        router.push("/admin-dashboard");
        router.refresh();
      } else if (userRole === "ato") {
        router.push("/ato-dashboard");
        router.refresh();
      } else {
        console.log("UNKNOWN ROLE:", userRole); // 👈 debug
        setError("User role not recognized. Contact Administrator.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    wrapper: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)", 
      fontFamily: '"Inter", sans-serif',
    },
    card: {
      width: "100%",
      maxWidth: "400px",
      backgroundColor: "white",
      padding: "40px",
      borderRadius: "16px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
      textAlign: "center" as const,
    },
    logo: {
      height: "60px",
      marginBottom: "20px",
    },
    title: {
      fontSize: "24px",
      fontWeight: 700,
      color: "#064e3b",
      marginBottom: "8px",
    },
    subtitle: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "30px",
    },
    inputGroup: {
      marginBottom: "15px",
      textAlign: "left" as const,
    },
    label: {
      display: "block",
      fontSize: "12px",
      fontWeight: 600,
      color: "#374151",
      marginBottom: "5px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      fontSize: "16px",
      outline: "none",
      transition: "border-color 0.2s",
      boxSizing: "border-box" as const,
    },
    button: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#10b981", 
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: 600,
      cursor: "pointer",
      marginTop: "10px",
      transition: "background-color 0.2s",
    },
    errorBox: {
      backgroundColor: "#fef2f2",
      color: "#dc2626",
      padding: "12px",
      borderRadius: "8px",
      fontSize: "14px",
      marginBottom: "20px",
      border: "1px solid #fee2e2",
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <img src="/logo1.png" alt="BIRS" style={styles.logo} />
        <h2 style={styles.title}>Portal Sign In</h2>
        <p style={styles.subtitle}>Enter your credentials to manage tax performance</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              opacity: isLoading ? 0.7 : 1,
              backgroundColor: isLoading ? "#059669" : "#10b981"
            }}
          >
            {isLoading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>

        <p style={{ marginTop: "25px", fontSize: "12px", color: "#9ca3af" }}>
          Secured by BIRS IT Infrastructure
        </p>
      </div>
    </div>
  );
}