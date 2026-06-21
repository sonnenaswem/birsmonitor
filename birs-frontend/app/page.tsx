"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  const colors = {
    primary: "#052e16",
    primaryLight: "#14532d",
    accent: "#22c55e",
    accentHover: "#16a34a",
    background: "#f0fdf4",
    card: "#ffffff",
    border: "#bbf7d0",
    text: "#14532d",
    textMuted: "#166534",
    textLight: "#6b7280",
  };

  const styles: { [key: string]: React.CSSProperties } = {
    page: {
      minHeight: "100vh",
      backgroundColor: colors.background,
      fontFamily: '"Inter", "Segoe UI", Roboto, -apple-system, sans-serif',
    },
    // Navigation
    nav: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: "rgba(240, 253, 244, 0.9)",
      backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${colors.border}`,
      padding: "0 24px",
    },
    navInner: {
      maxWidth: "1200px",
      margin: "0 auto",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logoWrap: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    logoIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      backgroundColor: colors.primary,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "18px",
    },
    logoText: {
      fontWeight: 600,
      fontSize: "18px",
      color: colors.text,
      letterSpacing: "-0.02em",
    },
    navLinks: {
      display: "flex",
      alignItems: "center",
      gap: "32px",
    },
    navLink: {
      fontSize: "14px",
      color: colors.textMuted,
      textDecoration: "none",
      transition: "color 0.2s",
    },
    button: {
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: 600,
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      backgroundColor: colors.primary,
      color: "white",
      transition: "all 0.2s",
    },
    buttonLarge: {
      padding: "14px 32px",
      fontSize: "16px",
      fontWeight: 600,
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      backgroundColor: colors.primary,
      color: "white",
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
    },
    buttonOutline: {
      padding: "14px 32px",
      fontSize: "16px",
      fontWeight: 600,
      borderRadius: "10px",
      border: `2px solid ${colors.border}`,
      cursor: "pointer",
      backgroundColor: "transparent",
      color: colors.text,
      transition: "all 0.2s",
    },
    // Hero
    hero: {
      paddingTop: "140px",
      paddingBottom: "80px",
      paddingLeft: "24px",
      paddingRight: "24px",
      textAlign: "center" as const,
    },
    heroInner: {
      maxWidth: "800px",
      margin: "0 auto",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      borderRadius: "9999px",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      border: "1px solid rgba(34, 197, 94, 0.2)",
      marginBottom: "32px",
    },
    badgeDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: colors.accent,
      animation: "pulse 2s infinite",
    },
    badgeText: {
      fontSize: "14px",
      color: colors.accent,
      fontWeight: 500,
    },
    heroTitle: {
      fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
      fontWeight: 700,
      color: colors.text,
      letterSpacing: "-0.03em",
      lineHeight: 1.1,
      marginBottom: "24px",
    },
    heroTitleAccent: {
      color: colors.accent,
    },
    heroSub: {
      fontSize: "clamp(1rem, 2vw, 1.25rem)",
      color: colors.textMuted,
      maxWidth: "640px",
      margin: "0 auto 40px",
      lineHeight: 1.7,
    },
    heroButtons: {
      display: "flex",
      flexWrap: "wrap" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
    },
    // Stats
    stats: {
      padding: "64px 24px",
      backgroundColor: colors.primary,
    },
    statsInner: {
      maxWidth: "1000px",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "32px",
    },
    statItem: {
      textAlign: "center" as const,
    },
    statValue: {
      fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
      fontWeight: 700,
      color: "white",
      marginBottom: "8px",
    },
    statLabel: {
      fontSize: "14px",
      color: "rgba(255,255,255,0.7)",
    },
    // Section
    section: {
      padding: "96px 24px",
    },
    sectionAlt: {
      padding: "96px 24px",
      backgroundColor: "rgba(34, 197, 94, 0.05)",
    },
    sectionInner: {
      maxWidth: "1100px",
      margin: "0 auto",
    },
    sectionHeader: {
      textAlign: "center" as const,
      marginBottom: "64px",
    },
    sectionTitle: {
      fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
      fontWeight: 700,
      color: colors.text,
      marginBottom: "16px",
      letterSpacing: "-0.02em",
    },
    sectionSub: {
      fontSize: "18px",
      color: colors.textMuted,
      maxWidth: "600px",
      margin: "0 auto",
      lineHeight: 1.6,
    },
    logo: {
      height: "50px",
      marginBottom: "20px",
    },
    // Cards
    cardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "24px",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: "16px",
      padding: "32px",
      border: `1px solid ${colors.border}`,
      transition: "all 0.3s",
    },
    cardIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
      fontSize: "24px",
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: 600,
      color: colors.text,
      marginBottom: "12px",
    },
    cardText: {
      fontSize: "15px",
      color: colors.textMuted,
      lineHeight: 1.7,
    },
    // Two Column
    twoCol: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
      gap: "64px",
      alignItems: "center",
    },
    checkList: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "20px",
    },
    checkItem: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    checkIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: colors.accent,
      fontSize: "16px",
      flexShrink: 0,
    },
    checkText: {
      fontSize: "16px",
      color: colors.text,
    },
    miniGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
    },
    miniCard: {
      backgroundColor: colors.card,
      borderRadius: "12px",
      padding: "24px",
      border: `1px solid ${colors.border}`,
    },
    miniIcon: {
      fontSize: "28px",
      marginBottom: "12px",
    },
    miniTitle: {
      fontSize: "18px",
      fontWeight: 600,
      color: colors.text,
      marginBottom: "4px",
    },
    miniText: {
      fontSize: "13px",
      color: colors.textLight,
    },
    // Security
    securityCenter: {
      textAlign: "center" as const,
      maxWidth: "700px",
      margin: "0 auto",
    },
    securityIcon: {
      width: "64px",
      height: "64px",
      borderRadius: "16px",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 32px",
      fontSize: "32px",
    },
    tags: {
      display: "flex",
      flexWrap: "wrap" as const,
      justifyContent: "center",
      gap: "12px",
      marginTop: "48px",
    },
    tag: {
      padding: "10px 20px",
      borderRadius: "9999px",
      backgroundColor: "rgba(34, 197, 94, 0.05)",
      border: `1px solid ${colors.border}`,
      fontSize: "14px",
      color: colors.text,
      fontWeight: 500,
    },
    // CTA
    cta: {
      padding: "96px 24px",
      backgroundColor: colors.primary,
      textAlign: "center" as const,
    },
    ctaTitle: {
      fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
      fontWeight: 700,
      color: "white",
      marginBottom: "24px",
      letterSpacing: "-0.02em",
    },
    ctaSub: {
      fontSize: "18px",
      color: "rgba(255,255,255,0.8)",
      maxWidth: "600px",
      margin: "0 auto 40px",
      lineHeight: 1.6,
    },
    ctaButton: {
      padding: "16px 40px",
      fontSize: "16px",
      fontWeight: 600,
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      backgroundColor: colors.accent,
      color: "white",
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
    },
    // Footer
    footer: {
      padding: "48px 24px",
      backgroundColor: colors.primary,
      borderTop: "1px solid rgba(255,255,255,0.1)",
    },
    footerInner: {
      maxWidth: "1100px",
      margin: "0 auto",
      display: "flex",
      flexWrap: "wrap" as const,
      alignItems: "center",
      justifyContent: "space-between",
      gap: "24px",
    },
    footerLogo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    footerLogoIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      backgroundColor: "rgba(255,255,255,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "18px",
    },
    footerLogoText: {
      fontWeight: 600,
      color: "white",
    },
    footerCopy: {
      fontSize: "14px",
      color: "rgba(255,255,255,0.6)",
    },
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logoWrap}>
            <img 
              src="/logo1.png"   
              alt="BIRS Logo" 
              style={{ height: "60px", width: "auto" }} 
            />
            <span style={styles.logoText}></span>
          </div>

          <div style={styles.navLinks} className="nav-links">
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#capabilities" style={styles.navLink}>Capabilities</a>
            <a href="#security" style={styles.navLink}>Security</a>
          </div>
          <Link href="/login">
            <button
              style={styles.button}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.primaryLight)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.primary)}
            >
              Access Portal
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            <span style={styles.badgeText}>System Online</span>
          </div>
          <h1 style={styles.heroTitle}>
            Revenue Integrity<br />
            <span style={styles.heroTitleAccent}>Driven by Data</span>
          </h1>
          <p style={styles.heroSub}>
            The authoritative gateway for real-time tax verification, Area Tax Officer's performance 
            tracking, and comprehensive revenue auditing for Benue State Internal Revenue Service.
          </p>
          <div style={styles.heroButtons}>
            <Link href="/login">
              <button
                style={styles.buttonLarge}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.primaryLight)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.primary)}
              >
                Access Secured Portal
                <span></span>
              </button>
            </Link>
            <a href="#features">
              <button
                style={styles.buttonOutline}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(34, 197, 94, 0.05)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Learn More
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={styles.stats}>
        <div style={styles.statsInner}>
          {[
            { value: "99.9%", label: "System Uptime" },
            { value: "24/7", label: "Monitoring" },
            { value: "Real-time", label: "Data Sync" },
            { value: "Secure", label: "Encryption" },
          ].map((stat) => (
            <div key={stat.label} style={styles.statItem}>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Comprehensive Revenue Management</h2>
            <p style={styles.sectionSub}>
              Everything you need to track, verify, and audit tax collection across the entire network.
            </p>
          </div>
          <div style={styles.cardGrid}>
            {[
              {
                icon: "📊",
                title: "Live Analytics",
                text: "Real-time dashboards showing ATO performance metrics, revenue trends, and collection statistics across all zones.",
              },
              {
                icon: "⚡",
                title: "Instant Verification",
                text: "Real-time Remita, Interswitch and Gokollect payment pull with automated reconciliation and duplicate detection.",
              },
              {
                icon: "📄",
                title: "Smart Reporting",
                text: "One-click Excel and PDF report generation with customizable templates and automated scheduling.",
              },
            ].map((card) => (
              <div
                key={card.title}
                style={styles.card}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(20, 83, 45, 0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={styles.cardIcon}>{card.icon}</div>
                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardText}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" style={styles.sectionAlt}>
        <div style={styles.sectionInner}>
          <div style={styles.twoCol} className="two-col">
            <div>
              <h2 style={styles.sectionTitle}>Built for Revenue Excellence</h2>
              <p style={{ ...styles.sectionSub, margin: "0 0 32px", textAlign: "left" }}>
                Our platform combines cutting-edge technology with deep understanding of 
                tax administration to deliver unmatched performance tracking capabilities.
              </p>
              <div style={styles.checkList}>
                {[
                  "Automated revenue auditing with anomaly detection",
                  "High-performance league ranking system",
                  "Strict month-cycle validation protocols",
                  "Anti-duplicate reference logic",
                ].map((item) => (
                  <div key={item} style={styles.checkItem}>
                    <div style={styles.checkIcon}>✓</div>
                    <span style={styles.checkText}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.miniGrid}>
              {[
                { icon: "👥", title: "ATOs", text: "Active tax officers" },
                { icon: "📈", title: "Revenue", text: "Tracked daily" },
                { icon: "🔒", title: "Secure", text: "End-to-end encryption" },
                { icon: "🛡️", title: "Verified", text: "Transaction audit" },
              ].map((item) => (
                <div key={item.title} style={styles.miniCard}>
                  <div style={styles.miniIcon}>{item.icon}</div>
                  <div style={styles.miniTitle}>{item.title}</div>
                  <div style={styles.miniText}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" style={styles.section}>
        <div style={styles.securityCenter}>
          <div style={styles.securityIcon}>🛡️</div>
          <h2 style={styles.sectionTitle}>Enterprise-Grade Security</h2>
          <p style={styles.sectionSub}>
            Your data is protected with industry-leading security measures, ensuring 
            complete integrity and confidentiality of all revenue information.
          </p>
          <div style={styles.tags}>
            {["256-bit Encryption", "Role-based Access", "Audit Logging", "Secure Sessions"].map((tag) => (
              <span key={tag} style={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
        <p style={styles.ctaSub}>
          Access the portal to begin tracking performance metrics, verifying 
          transactions, and generating comprehensive reports.
        </p>
        <Link href="/login">
          <button
            style={styles.ctaButton}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.accentHover)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.accent)}
          >
            Access Secured Portal
            <span>→</span>
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLogo}>
            <div style={styles.footerLogoIcon}><img src="/logo3.png" alt="BIRS" style={styles.logo} /></div>
            <span style={styles.footerLogoText}>Powered by Gash Consult Ltd</span>
          </div>
          <p style={styles.footerCopy}> Copyright@
            {new Date().getFullYear()} Benue State Internal Revenue Service. All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}