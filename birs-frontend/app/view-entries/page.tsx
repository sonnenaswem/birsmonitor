"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";
import * as XLSX from "xlsx";

interface Entry {
  id: number;
  tax_item: string;
  subhead: string;
  taxpayer_name: string;
  remita_amount?: number;
  interswitch_amount?: number;
  gokollect_amount?: number;
  total_amount?: number;
  display_amount?: number;
  date_of_remittance: string;
  payment_channel?: string;
  source?: string;
  softnet_reference?: string;
  remita?: string;
  interswitch_ref?: string;
  gokollect?: string;
  display_reference?: string;
}

const G = {
  ink: "#052e16",
  inkSoft: "#166534",
  accent: "#16a34a",
  accentLight: "#22c55e",
  surface: "#ffffff",
  ground: "#f0fdf4",
  muted: "#dcfce7",
  border: "#bbf7d0",
  borderMid: "#86efac",
  textGray: "#64748b",
  textDark: "#0f172a",
  gold: "#c9a227",
};

const fmt = (n: number) =>
  "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (s: string | null | undefined) => {
  if (!s) return "—";
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
};

const getRef = (e: Entry) =>
  e.display_reference || e.remita || e.interswitch_ref || e.gokollect || e.softnet_reference || "—";

const getAmount = (e: Entry) =>
  Number(e.total_amount ?? e.display_amount ?? e.remita_amount ?? e.interswitch_amount ?? e.gokollect_amount ?? 0);

const getChannel = (e: Entry): string => {
  const ch = (e.payment_channel || "").toLowerCase();
  if (ch.includes("remita")) return "Remita";
  if (ch.includes("interswitch")) return "Interswitch";
  if (ch.includes("gokollect")) return "GoKollect";
  if (e.remita_amount && Number(e.remita_amount) > 0) return "Remita";
  if (e.interswitch_amount && Number(e.interswitch_amount) > 0) return "Interswitch";
  if (e.gokollect_amount && Number(e.gokollect_amount) > 0) return "GoKollect";
  return "—";
};

const CHANNEL_STYLE: Record<string, { bg: string; color: string }> = {
  Remita:      { bg: "#ecfdf5", color: "#15803d" },
  Interswitch: { bg: "#eff6ff", color: "#1d4ed8" },
  GoKollect:   { bg: "#fefce8", color: "#a16207" },
  "—":         { bg: "#f8fafc", color: "#64748b" },
};

export default function MyEntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const PAGE_SIZE = 15;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  useEffect(() => {
    fetchEntries();
  }, [page, appliedFrom, appliedTo]);

  const buildUrl = (p: number, af: string, at: string, size = PAGE_SIZE) => {
    let url = `/api/tax/my-entries/?page=${p}&page_size=${size}`;
    if (af && at) url += `&from_date=${af}&to_date=${at}`;
    return url;
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get(buildUrl(page, appliedFrom, appliedTo));
      setEntries(res.data.results || []);
      setCount(res.data.count || 0);
      setHasNext(!!res.data.next);
      setHasPrev(!!res.data.previous);
    } catch (err) {
      console.error("Failed to fetch entries", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setPage(1);
    setAppliedFrom(from);
    setAppliedTo(to);
  };

  const handleClear = () => {
    setFrom(""); setTo("");
    setAppliedFrom(""); setAppliedTo("");
    setPage(1);
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      // Fetch all matching records (up to 5000)
      const res = await api.get(buildUrl(1, appliedFrom, appliedTo, 5000));
      const total = res.data.count || 0;
      let all: Entry[] = res.data.results || [];

      // If more than 5000 (unlikely for a single ATO), fetch remaining
      if (total > 5000) {
        const pages = Math.ceil(total / 5000);
        for (let p = 2; p <= pages; p++) {
          const r = await api.get(buildUrl(p, appliedFrom, appliedTo, 5000));
          all = all.concat(r.data.results || []);
        }
      }

      const rows = all.map((e) => ({
        "Date":        fmtDate(e.date_of_remittance),
        "Tax Item":    e.tax_item || "—",
        "Taxpayer":    e.taxpayer_name || "—",
        "Reference":   getRef(e),
        "Channel":     getChannel(e),
        "Amount (NGN)": getAmount(e),
        "Source":      e.source || "—",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);

      // Column widths
      ws["!cols"] = [
        { wch: 14 }, { wch: 32 }, { wch: 24 },
        { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 10 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "My Submissions");

      const suffix = appliedFrom && appliedTo ? `_${appliedFrom}_to_${appliedTo}` : "";
      XLSX.writeFile(wb, `MySubmissions${suffix}.xlsx`);
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const periodLabel = appliedFrom && appliedTo
    ? `${fmtDate(appliedFrom)} — ${fmtDate(appliedTo)}`
    : "Current period";

  return (
    <DashboardLayout>
      <style>{`
        .me-row:hover td { background: ${G.ground}; }
        .me-btn { transition: background .15s, transform .15s; }
        .me-btn:hover:not(:disabled) { transform: translateY(-1px); }
        @media (max-width: 700px) {
          .me-filter-row { flex-wrap: wrap !important; }
          .me-header-row { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
          .me-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .me-table-wrap table { min-width: 720px; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="me-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            {/* Ledger icon — SVG, no emoji */}
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: G.ink, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bbf7d0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: G.ink, margin: 0 }}>My Submissions</h1>
          </div>
          <p style={{ color: G.textGray, fontSize: 13.5, margin: 0 }}>
            {count > 0 ? `${count.toLocaleString()} records · ${periodLabel}` : "No records for the selected period."}
          </p>
        </div>

        <button
          className="me-btn"
          onClick={exportExcel}
          disabled={exporting || count === 0}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 9, border: "none",
            background: exporting || count === 0 ? "#e2e8f0" : G.ink,
            color: exporting || count === 0 ? G.textGray : G.ground,
            fontWeight: 600, fontSize: 13.5,
            cursor: exporting || count === 0 ? "not-allowed" : "pointer",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {exporting ? "Exporting..." : "Export Excel"}
        </button>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="me-filter-row" style={{
        display: "flex", gap: 10, alignItems: "center",
        background: G.surface, border: `1px solid ${G.border}`,
        borderRadius: 12, padding: "14px 18px", marginBottom: 20,
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={G.inkSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <input
          type="date" value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={{ padding: "8px 11px", borderRadius: 8, border: `1px solid ${G.border}`, fontSize: 13.5, outline: "none", color: G.textDark }}
        />
        <span style={{ color: G.textGray, fontSize: 13 }}>to</span>
        <input
          type="date" value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ padding: "8px 11px", borderRadius: 8, border: `1px solid ${G.border}`, fontSize: 13.5, outline: "none", color: G.textDark }}
        />
        <button
          className="me-btn"
          onClick={handleApply}
          disabled={!from || !to}
          style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: from && to ? G.accent : "#e2e8f0",
            color: from && to ? "white" : G.textGray,
            fontWeight: 600, fontSize: 13, cursor: from && to ? "pointer" : "not-allowed",
          }}
        >
          Apply
        </button>
        {(appliedFrom || appliedTo) && (
          <button
            className="me-btn"
            onClick={handleClear}
            style={{
              padding: "8px 14px", borderRadius: 8,
              border: `1px solid #fca5a5`, background: "#fef2f2",
              color: "#b91c1c", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
        {appliedFrom && appliedTo && (
          <span style={{
            marginLeft: "auto", fontSize: 12, fontWeight: 600,
            color: G.inkSoft, background: G.muted,
            padding: "5px 12px", borderRadius: 99,
          }}>
            {fmtDate(appliedFrom)} — {fmtDate(appliedTo)}
          </span>
        )}
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: G.surface, borderRadius: 14, border: `1px solid ${G.border}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(5,46,22,0.06)" }}>

        {/* table heading strip */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 20px", borderBottom: `1px solid ${G.muted}`,
          background: G.ground,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: G.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Transaction History
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: G.inkSoft,
            background: G.muted, padding: "4px 12px", borderRadius: 99,
          }}>
            {count.toLocaleString()} entries
          </span>
        </div>

        <div className="me-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  ["Date", "13%"],
                  ["Tax Item", "26%"],
                  ["Taxpayer", "16%"],
                  ["Reference", "16%"],
                  ["Channel", "11%"],
                  ["Amount", "12%"],
                  ["Source", "6%"],
                ].map(([label, w]) => (
                  <th key={label} style={{
                    padding: "12px 16px", textAlign: "left", width: w,
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                    color: G.textGray, textTransform: "uppercase",
                    background: "#f8fafc", borderBottom: `2px solid ${G.muted}`,
                  }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "60px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: G.inkSoft }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>Loading records…</span>
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "72px 24px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: G.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G.inkSoft} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      </div>
                      <p style={{ color: G.inkSoft, fontWeight: 600, fontSize: 15, margin: 0 }}>No submissions found</p>
                      <p style={{ color: G.textGray, fontSize: 13, margin: 0 }}>
                        {appliedFrom ? "Try clearing the date filter." : "No records exist for your account yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : entries.map((entry) => {
                const ch = getChannel(entry);
                const chStyle = CHANNEL_STYLE[ch] || CHANNEL_STYLE["—"];
                const amt = getAmount(entry);
                return (
                  <tr key={entry.id} className="me-row">
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${G.muted}`, fontSize: 13.5, color: G.textDark }}>
                      {fmtDate(entry.date_of_remittance)}
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${G.muted}` }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: G.textDark, lineHeight: 1.3 }}>
                        {entry.tax_item || "—"}
                      </div>
                      {entry.subhead && entry.subhead !== entry.tax_item && (
                        <div style={{ fontSize: 11.5, color: G.textGray, marginTop: 2 }}>{entry.subhead}</div>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${G.muted}`, fontSize: 13.5, color: G.textDark }}>
                      {entry.taxpayer_name || "—"}
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${G.muted}` }}>
                      <code style={{
                        background: "#f1f5f9", padding: "3px 7px",
                        borderRadius: 5, fontSize: 12, color: G.textDark,
                        letterSpacing: "0.01em",
                      }}>
                        {getRef(entry)}
                      </code>
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${G.muted}` }}>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 10px", borderRadius: 99,
                        fontSize: 11.5, fontWeight: 700,
                        background: chStyle.bg, color: chStyle.color,
                      }}>
                        {ch}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${G.muted}`, fontWeight: 700, fontSize: 14, color: G.ink, textAlign: "right" }}>
                      {fmt(amt)}
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: `1px solid ${G.muted}` }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: entry.source === "POS" ? "#ecfdf5" : "#fff7ed",
                        color: entry.source === "POS" ? "#15803d" : "#c2410c",
                      }}>
                        {entry.source === "POS" ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        )}
                        {entry.source || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderTop: `1px solid ${G.muted}`,
          background: G.ground,
        }}>
          <button
            className="me-btn"
            disabled={!hasPrev}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 8,
              border: `1px solid ${G.border}`, background: G.surface,
              color: hasPrev ? G.ink : G.textGray,
              fontWeight: 600, fontSize: 13.5,
              cursor: hasPrev ? "pointer" : "not-allowed",
              opacity: hasPrev ? 1 : 0.45,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            Previous
          </button>

          <span style={{ fontWeight: 700, color: G.inkSoft, fontSize: 13.5 }}>
            Page {page} of {totalPages}
          </span>

          <button
            className="me-btn"
            disabled={!hasNext}
            onClick={() => setPage((p) => p + 1)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 8,
              border: `1px solid ${G.border}`, background: G.surface,
              color: hasNext ? G.ink : G.textGray,
              fontWeight: 600, fontSize: 13.5,
              cursor: hasNext ? "pointer" : "not-allowed",
              opacity: hasNext ? 1 : 0.45,
            }}
          >
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
