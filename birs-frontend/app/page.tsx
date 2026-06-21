"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goToLogin = () => router.push("/login");

  return (
    <div style={{ margin: 0, fontFamily: "'Inter', sans-serif", background: "var(--cream)", color: "var(--ink)" }}>
      <style>{`
        :root{
          --green-950:#052e16;
          --green-900:#0a3d1f;
          --green-800:#0f4d28;
          --gold:#c9a227;
          --gold-light:#e0bf4f;
          --cream:#faf8f3;
          --cream-2:#f3efe4;
          --ink:#13261a;
          --ink-soft:#3f5648;
          --charcoal:#15191a;
          --border-soft:#dcd4bf;
        }
        *{box-sizing:border-box;}
        h1,h2,h3{font-family:'Fraunces',serif;margin:0;}
        a{text-decoration:none;}
        img{max-width:100%;display:block;}
        .wrap{max-width:1180px;margin:0 auto;padding:0 28px;}

        nav{
          position:fixed;top:0;left:0;right:0;z-index:100;
          background:rgba(250,248,243,0.88);
          backdrop-filter:blur(14px);
          border-bottom:1px solid var(--border-soft);
        }
        .nav-inner{
          max-width:1180px;margin:0 auto;padding:0 28px;
          height:72px;display:flex;align-items:center;justify-content:space-between;
        }
        .logo-wrap{display:flex;align-items:center;gap:12px;}
        .logo-mark{
          width:40px;height:40px;border-radius:8px;
          background:var(--green-950);
          display:flex;align-items:center;justify-content:center;
          color:var(--gold-light);font-family:'Fraunces',serif;font-weight:700;font-size:18px;
          flex-shrink:0;
        }
        .logo-mark-img{height:42px;width:auto;flex-shrink:0;}
        .logo-text{font-family:'Fraunces',serif;font-weight:600;font-size:17px;color:var(--green-950);letter-spacing:-0.01em;}
        .logo-sub{font-size:10px;color:var(--ink-soft);letter-spacing:0.08em;text-transform:uppercase;margin-top:-2px;}

        .nav-links{display:flex;align-items:center;gap:8px;}
        .nav-link{
          position:relative;
          font-size:14px;font-weight:500;color:var(--ink-soft);
          padding:8px 16px;border-radius:7px;
          transition:color .2s ease, background .2s ease;
          display:inline-block;
        }
        .nav-link:hover{color:var(--green-950);background:rgba(5,46,22,0.06);}
        .nav-link::after{
          content:"";position:absolute;left:16px;right:16px;bottom:4px;height:2px;
          background:var(--gold);transform:scaleX(0);transform-origin:left;
          transition:transform .25s ease;
        }
        .nav-link:hover::after{transform:scaleX(1);}

        .nav-cta{display:flex;align-items:center;gap:14px;}
        .btn{
          display:inline-flex;align-items:center;gap:8px;
          font-family:'Inter',sans-serif;font-weight:600;font-size:14px;
          border:none;border-radius:8px;cursor:pointer;
          transition:transform .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .btn-primary{
          background:var(--green-950);color:var(--cream);
          padding:11px 22px;
        }
        .btn-primary:hover{background:var(--green-800);transform:translateY(-1px);box-shadow:0 8px 20px -8px rgba(5,46,22,0.5);}
        .btn-large{padding:16px 30px;font-size:15.5px;border-radius:10px;}
        .btn-outline{
          background:transparent;color:var(--green-950);
          border:1.5px solid var(--border-soft);padding:15px 28px;border-radius:10px;
        }
        .btn-outline:hover{border-color:var(--green-950);background:rgba(5,46,22,0.04);}
        .btn-gold{background:var(--gold);color:var(--green-950);}
        .btn-gold:hover{background:var(--gold-light);transform:translateY(-1px);box-shadow:0 10px 24px -8px rgba(201,162,39,0.55);}

        .hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px;}
        .hamburger span{width:22px;height:2px;background:var(--green-950);border-radius:2px;transition:.25s;}

        .mobile-menu{
          display:none;position:fixed;top:72px;left:0;right:0;bottom:0;
          background:var(--cream);z-index:99;padding:24px 28px;
          flex-direction:column;gap:4px;
        }
        .mobile-menu.open{display:flex;}
        .mobile-menu a{
          font-size:18px;font-weight:600;color:var(--green-950);
          padding:16px 4px;border-bottom:1px solid var(--border-soft);
          font-family:'Fraunces',serif;
        }
        .mobile-menu .btn{margin-top:20px;justify-content:center;}

        .hero{
          padding:168px 28px 100px;text-align:center;position:relative;overflow:hidden;
          background:
            radial-gradient(ellipse 700px 380px at 50% -10%, rgba(201,162,39,0.10), transparent),
            var(--cream);
        }
        .hero::before{
          content:"";position:absolute;inset:0;pointer-events:none;opacity:0.5;
          background-image:repeating-linear-gradient(180deg, transparent, transparent 27px, rgba(5,46,22,0.035) 28px);
          mask-image:linear-gradient(180deg, transparent, black 30%, black 70%, transparent);
        }
        .hero-inner{max-width:760px;margin:0 auto;position:relative;}
        .badge{
          display:inline-flex;align-items:center;gap:9px;
          padding:8px 16px 8px 12px;border-radius:99px;
          background:rgba(5,46,22,0.06);border:1px solid rgba(5,46,22,0.12);
          margin-bottom:36px;
        }
        .badge-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,0.25);animation:pulse 2.2s infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .badge span.label{font-size:12.5px;font-weight:600;color:var(--green-950);letter-spacing:0.03em;}

        .hero h1{
          font-size:clamp(2.4rem,5.4vw,4.1rem);font-weight:600;line-height:1.07;
          letter-spacing:-0.02em;color:var(--green-950);margin-bottom:26px;
        }
        .hero h1 em{font-style:italic;color:#16a34a;font-weight:500;}
        .hero p{
          font-size:clamp(1rem,1.6vw,1.18rem);color:var(--ink-soft);
          max-width:580px;margin:0 auto 42px;line-height:1.7;
        }
        .hero-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;}

        .stats{background:var(--green-950);padding:54px 28px;position:relative;}
        .stats::before{
          content:"";position:absolute;inset:0;opacity:0.5;
          background-image:repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.025) 80px);
        }
        .stats-grid{
          max-width:980px;margin:0 auto;display:grid;
          grid-template-columns:repeat(4,1fr);gap:0;position:relative;
        }
        .stat-item{
          text-align:center;padding:0 16px;position:relative;
        }
        .stat-item:not(:last-child)::after{
          content:"";position:absolute;right:0;top:8px;bottom:8px;width:1px;
          background:rgba(255,255,255,0.12);
        }
        .stat-value{font-family:'Fraunces',serif;font-size:clamp(1.6rem,3vw,2.2rem);font-weight:600;color:var(--gold-light);margin-bottom:6px;}
        .stat-label{font-size:12.5px;color:rgba(250,248,243,0.65);letter-spacing:0.04em;}

        .section{padding:108px 28px;}
        .section-alt{background:var(--cream-2);}
        .section-head{text-align:center;max-width:600px;margin:0 auto 64px;}
        .eyebrow{
          display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.12em;
          text-transform:uppercase;color:var(--gold);margin-bottom:14px;
          padding-bottom:6px;border-bottom:2px solid var(--gold);
        }
        .section-head h2{font-size:clamp(1.7rem,3.2vw,2.5rem);font-weight:600;color:var(--green-950);letter-spacing:-0.015em;margin-bottom:16px;}
        .section-head p{font-size:16.5px;color:var(--ink-soft);line-height:1.7;}

        .card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto;}
        .feature-card{
          background:#fff;border:1px solid var(--border-soft);border-radius:14px;
          padding:34px 30px;transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        .feature-card:hover{transform:translateY(-5px);box-shadow:0 24px 44px -18px rgba(5,46,22,0.18);border-color:rgba(5,46,22,0.18);}
        .feat-icon{
          width:46px;height:46px;border-radius:11px;
          background:rgba(5,46,22,0.06);
          display:flex;align-items:center;justify-content:center;margin-bottom:22px;
          color:var(--green-950);
        }
        .feature-card h3{font-size:19px;font-weight:600;color:var(--green-950);margin-bottom:10px;font-family:'Inter',sans-serif;}
        .feature-card p{font-size:14.5px;color:var(--ink-soft);line-height:1.65;margin:0;}

        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;max-width:1100px;margin:0 auto;}
        .check-list{display:flex;flex-direction:column;gap:18px;margin-top:32px;}
        .check-item{display:flex;align-items:flex-start;gap:14px;}
        .check-ico{
          width:26px;height:26px;border-radius:50%;background:var(--green-950);
          display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;
        }
        .check-text{font-size:15.5px;color:var(--ink);line-height:1.5;}
        .mini-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
        .mini-card{
          background:#fff;border:1px solid var(--border-soft);border-radius:13px;padding:24px;
          transition:border-color .2s ease, transform .2s ease;
        }
        .mini-card:hover{border-color:var(--gold);transform:translateY(-3px);}
        .mini-ico{width:34px;height:34px;color:var(--green-950);margin-bottom:14px;}
        .mini-card h4{font-size:16px;font-weight:600;color:var(--green-950);margin-bottom:3px;font-family:'Inter',sans-serif;}
        .mini-card p{font-size:12.5px;color:var(--ink-soft);margin:0;}

        .security{text-align:center;max-width:680px;margin:0 auto;}
        .sec-icon{
          width:60px;height:60px;border-radius:15px;margin:0 auto 30px;
          background:var(--green-950);display:flex;align-items:center;justify-content:center;color:var(--gold-light);
        }
        .tags{display:flex;flex-wrap:wrap;justify-content:center;gap:11px;margin-top:42px;}
        .tag{
          padding:9px 18px;border-radius:99px;background:#fff;border:1px solid var(--border-soft);
          font-size:13.5px;font-weight:500;color:var(--green-950);display:inline-flex;align-items:center;gap:7px;
        }

        .cta{
          padding:100px 28px;text-align:center;position:relative;overflow:hidden;
          background:linear-gradient(160deg, var(--green-950) 0%, var(--green-900) 100%);
        }
        .cta::before{
          content:"";position:absolute;width:480px;height:480px;border-radius:50%;
          background:radial-gradient(circle, rgba(201,162,39,0.18), transparent 70%);
          top:-200px;right:-120px;
        }
        .cta h2{font-size:clamp(1.8rem,3.4vw,2.6rem);font-weight:600;color:#fff;margin-bottom:20px;position:relative;}
        .cta p{font-size:16.5px;color:rgba(250,248,243,0.75);max-width:560px;margin:0 auto 38px;line-height:1.7;position:relative;}

        footer{background:var(--charcoal);padding:56px 28px 32px;}
        .footer-inner{max-width:1180px;margin:0 auto;}
        .footer-top{
          display:flex;flex-wrap:wrap;justify-content:space-between;gap:40px;
          padding-bottom:36px;border-bottom:1px solid rgba(255,255,255,0.08);
        }
        .footer-brand{max-width:280px;}
        .footer-logo{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
        .footer-logo-mark{
          width:38px;height:38px;border-radius:8px;background:rgba(201,162,39,0.15);
          display:flex;align-items:center;justify-content:center;color:var(--gold-light);
          font-family:'Fraunces',serif;font-weight:700;
        }
        .footer-logo-text{font-family:'Fraunces',serif;font-weight:600;color:#fff;font-size:16px;}
        .footer-brand p{font-size:13.5px;color:rgba(255,255,255,0.5);line-height:1.6;}
        .footer-cols{display:flex;gap:64px;}
        .footer-col h5{
          font-size:11.5px;font-weight:700;color:rgba(255,255,255,0.4);
          text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;
        }
        .footer-col a{
          display:block;font-size:13.5px;color:rgba(255,255,255,0.7);margin-bottom:11px;
          transition:color .18s ease;
        }
        .footer-col a:hover{color:var(--gold-light);}
        .footer-bottom{
          padding-top:24px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;
          font-size:12.5px;color:rgba(255,255,255,0.4);
        }

        @media(max-width:860px){
          .nav-links,.nav-cta .btn-outline{display:none;}
          .hamburger{display:flex;}
          .two-col{grid-template-columns:1fr;gap:40px;}
          .card-grid{grid-template-columns:1fr;}
          .stats-grid{grid-template-columns:repeat(2,1fr);row-gap:28px;}
          .stat-item:nth-child(2)::after{display:none;}
          .mini-grid{grid-template-columns:1fr 1fr;}
          .footer-top{flex-direction:column;}
          .footer-cols{gap:40px;}
        }
        @media(max-width:480px){
          .hero{padding-top:140px;}
          .section{padding:72px 20px;}
          .mini-grid{grid-template-columns:1fr;}
          .footer-cols{flex-direction:column;gap:28px;}
        }
        @media (prefers-reduced-motion: reduce){
          *{animation-duration:0.01ms !important;transition-duration:0.01ms !important;}
        }
      `}</style>

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap"
      />

      <nav>
        <div className="nav-inner">
          <div className="logo-wrap">
            <img
              src="/logo1.png"
              alt="BIRS Logo"
              className="logo-mark-img"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div className="logo-mark" style={{ display: "none" }}>
              B
            </div>
            <div>
              <div className="logo-text">BIRS Monitor</div>
              <div className="logo-sub">Revenue Intelligence</div>
            </div>
          </div>

          <div className="nav-links">
            <a className="nav-link" href="#features">
              Features
            </a>
            <a className="nav-link" href="#capabilities">
              Capabilities
            </a>
            <a className="nav-link" href="#security">
              Security
            </a>
          </div>

          <div className="nav-cta">
            <button className="btn btn-primary" onClick={goToLogin}>
              Access Portal
            </button>
            <button
              className="hamburger"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
        <a href="#features" onClick={() => setMobileOpen(false)}>
          Features
        </a>
        <a href="#capabilities" onClick={() => setMobileOpen(false)}>
          Capabilities
        </a>
        <a href="#security" onClick={() => setMobileOpen(false)}>
          Security
        </a>
        <button className="btn btn-primary" onClick={goToLogin}>
          Access Portal
        </button>
      </div>

      <section className="hero">
        <div className="hero-inner">
          <div className="badge">
            <span className="badge-dot" />
            <span className="label">System Online — Live Sync Active</span>
          </div>
          <h1>
            Revenue integrity,
            <br />
            <em>verified in real time.</em>
          </h1>
          <p>
            The authoritative gateway for tax verification, Area Tax Officer performance
            tracking, and revenue auditing for Benue State Internal Revenue Service.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large" onClick={goToLogin}>
              Access Secured Portal
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <a href="#features">
              <button className="btn btn-outline btn-large">Learn More</button>
            </a>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">99.9%</div>
            <div className="stat-label">System Uptime</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">24/7</div>
            <div className="stat-label">Monitoring</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">Real-time</div>
            <div className="stat-label">Data Sync</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">Secure</div>
            <div className="stat-label">Encryption</div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Platform</span>
            <h2>Comprehensive revenue management</h2>
            <p>
              Everything needed to track, verify, and audit tax collection across the
              entire network.
            </p>
          </div>
          <div className="card-grid">
            <div className="feature-card">
              <div className="feat-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-6 3 4 5-8" />
                </svg>
              </div>
              <h3>Live Analytics</h3>
              <p>
                Real-time dashboards showing ATO performance metrics, revenue trends, and
                collection statistics across all zones.
              </p>
            </div>

            <div className="feature-card">
              <div className="feat-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
              </div>
              <h3>Instant Verification</h3>
              <p>
                Real-time Remita, Interswitch and GoKollect payment lookup with automated
                reconciliation and duplicate detection.
              </p>
            </div>

            <div className="feature-card">
              <div className="feat-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M9 13h6M9 17h6" />
                </svg>
              </div>
              <h3>Smart Reporting</h3>
              <p>
                One-click Excel and PDF report generation with customizable templates and
                automated scheduling.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="section section-alt">
        <div className="wrap">
          <div className="two-col">
            <div>
              <span className="eyebrow">Why BIRS Monitor</span>
              <h2
                style={{
                  fontSize: "clamp(1.7rem,3vw,2.3rem)",
                  fontWeight: 600,
                  color: "var(--green-950)",
                  letterSpacing: "-0.015em",
                }}
              >
                Built for revenue excellence
              </h2>
              <p
                style={{
                  fontSize: "15.5px",
                  color: "var(--ink-soft)",
                  lineHeight: 1.7,
                  marginTop: "14px",
                }}
              >
                Our platform combines modern infrastructure with deep understanding of tax
                administration to deliver unmatched performance tracking.
              </p>
              <div className="check-list">
                {[
                  "Automated revenue auditing with anomaly detection",
                  "High-performance league ranking system",
                  "Strict month-cycle validation protocols",
                  "Anti-duplicate payment reference logic",
                ].map((item) => (
                  <div className="check-item" key={item}>
                    <div className="check-ico">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#faf8f3"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <span className="check-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mini-grid">
              <div className="mini-card">
                <svg
                  className="mini-ico"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <h4>49 ATOs</h4>
                <p>Active tax officers tracked</p>
              </div>
              <div className="mini-card">
                <svg
                  className="mini-ico"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <h4>Revenue</h4>
                <p>Tracked daily, every channel</p>
              </div>
              <div className="mini-card">
                <svg
                  className="mini-ico"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <h4>Secure</h4>
                <p>End-to-end encryption</p>
              </div>
              <div className="mini-card">
                <svg
                  className="mini-ico"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <h4>Verified</h4>
                <p>Every transaction audited</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="section">
        <div className="wrap">
          <div className="security">
            <div className="sec-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="eyebrow">Trust &amp; Compliance</span>
            <h2>Enterprise-grade security</h2>
            <p
              style={{
                fontSize: "16px",
                color: "var(--ink-soft)",
                lineHeight: 1.7,
                marginTop: "10px",
              }}
            >
              Your data is protected with industry-leading security measures, ensuring
              complete integrity and confidentiality of all revenue information.
            </p>
            <div className="tags">
              <span className="tag">🔒 256-bit Encryption</span>
              <span className="tag">👤 Role-based Access</span>
              <span className="tag">📋 Audit Logging</span>
              <span className="tag">🛡️ Secure Sessions</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to get started?</h2>
        <p>
          Access the portal to begin tracking performance metrics, verifying
          transactions, and generating comprehensive reports.
        </p>
        <button className="btn btn-gold btn-large" onClick={goToLogin}>
          Access Secured Portal
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <img
                  src="/logo1.png"
                  alt="BIRS Logo"
                  style={{ height: "36px", width: "auto" }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div className="footer-logo-mark" style={{ display: "none" }}>
                  B
                </div>
                <span className="footer-logo-text">BIRS Monitor</span>
              </div>
              <p>
                Powered by Gash Consult Ltd. The official revenue intelligence platform
                for Benue State Internal Revenue Service.
              </p>
            </div>
            <div className="footer-cols">
              <div className="footer-col">
                <h5>Platform</h5>
                <a href="#features">Features</a>
                <a href="#capabilities">Capabilities</a>
                <a href="#security">Security</a>
              </div>
              <div className="footer-col">
                <h5>Access</h5>
                <a href="/login">Portal Login</a>
                <a href="#">Support</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Benue State Internal Revenue Service. All Rights Reserved.</span>
            <span>Built &amp; secured by Gash Consult Ltd.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
