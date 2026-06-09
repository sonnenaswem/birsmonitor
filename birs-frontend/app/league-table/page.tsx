"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { Trophy, Eye, Calendar, Search, Medal } from "lucide-react";

export default function LeagueTablePage() {
  const [data, setData] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const currentMonthLabel = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const formatLabelDate = (value: string) =>
    new Date(value).toLocaleDateString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const currentLabel =
    fromDate && toDate
      ? `${formatLabelDate(fromDate)} — ${formatLabelDate(toDate)}`
      : `Current month: ${currentMonthLabel}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (fromDate) query.append("from_date", fromDate);
      if (toDate) query.append("to_date", toDate);

      const res = await api.get(
        `/api/performance/league-table/?${query.toString()}`
      );
      const sorted = (res.data || []).slice().sort((a: any, b: any) => {
        if (b.percent !== a.percent) return b.percent - a.percent;
        return (b.total || 0) - (a.total || 0);
      });
      setData(sorted);
    } catch (err) {
      console.error("Error fetching league data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (d) =>
        (d.station_name || d.username || "").toLowerCase().includes(q) ||
        (d.username || "").toLowerCase().includes(q)
    );
  }, [data, search]);

  // Summary stats
  const totalRevenue = data.reduce((s, d) => s + (d.total || 0), 0);
  const totalTarget = data.reduce((s, d) => s + (d.target || 0), 0);
  const overallPercent =
    totalTarget > 0 ? ((totalRevenue / totalTarget) * 100).toFixed(1) : "0";
  const atosWithRevenue = data.filter((d) => d.total > 0).length;

  const formatCurrency = (n: number) =>
    "₦" + Number(n || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const getRankStyle = (i: number) => {
    if (i === 0) return { bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
    if (i === 1) return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
    if (i === 2) return { bg: "#ffedd5", color: "#9a3412", border: "#fed7aa" };
    return { bg: "transparent", color: "#94a3b8", border: "#e2e8f0" };
  };

  const getMedalEmoji = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return null;
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "#10b981";
    if (percent >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #052e16 0%, #064e3b 100%)",
        padding: "28px 32px",
        borderRadius: "16px",
        color: "white",
        marginBottom: "20px",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, display: "flex", alignItems: "center", gap: "12px" }}>
              <Trophy size={28} color="#fbbf24" /> BIRS League Table
            </h1>
            <p style={{ margin: "6px 0 0 0", opacity: 0.75, fontSize: "14px" }}>
              Monthly performance ranking of all Area Tax Offices
            </p>
            <div style={{
              marginTop: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#ecfdf5",
              color: "#065f46",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
            }}>
              <Calendar size={13} />
              {currentLabel}
            </div>
          </div>

          {/* Date filters */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "white",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "white",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
              }}
            />
            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(""); setToDate(""); }}
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "12px",
        marginBottom: "20px",
      }}>
        {[
          { label: "Total ATOs", value: data.length, color: "#047857" },
          { label: "ATOs with Revenue", value: atosWithRevenue, color: "#0369a1" },
          { label: "Total Revenue", value: formatCurrency(totalRevenue), color: "#15803d" },
          { label: "Total Target", value: formatCurrency(totalTarget), color: "#b45309" },
          { label: "Overall Achievement", value: `${overallPercent}%`, color: Number(overallPercent) >= 100 ? "#15803d" : Number(overallPercent) >= 60 ? "#b45309" : "#dc2626" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "white",
            borderRadius: "12px",
            padding: "16px 18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
              {label}
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px", position: "relative", maxWidth: "360px" }}>
        <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
        <input
          type="text"
          placeholder="Search ATO station..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px 10px 38px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box" as const,
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        overflow: "auto",
        maxHeight: "65vh",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
      }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
            Loading rankings...
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1100px" }}>
            <thead>
              <tr>
                {["Rank", "ATO Station", "Target", "Remita", "Interswitch", "GoKollect", "Total Revenue", "% Achieved", ""].map((h) => (
                  <th key={h} style={{
                    padding: "16px 18px",
                    background: "#f8fafc",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    borderBottom: "2px solid #f1f5f9",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                    {search ? "No ATOs match your search." : "No data for this period."}
                  </td>
                </tr>
              ) : filteredData.map((d, i) => {
                // Find actual rank in full dataset
                const actualRank = data.findIndex((r) => r.user_id === d.user_id);
                const rankStyle = getRankStyle(actualRank);
                const medal = getMedalEmoji(actualRank);
                const progressColor = getProgressColor(d.percent);

                return (
                  <tr
                    key={d.user_id}
                    style={{ transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Rank */}
                    <td style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "13px",
                        background: rankStyle.bg,
                        color: rankStyle.color,
                        border: `1px solid ${rankStyle.border}`,
                      }}>
                        {medal || actualRank + 1}
                      </div>
                    </td>

                    {/* Station name */}
                    <td style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#1e293b", fontSize: "14px" }}>
                      {d.station_name || d.username}
                    </td>

                    {/* Target */}
                    <td style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#475569" }}>
                      {formatCurrency(d.target)}
                    </td>

                    {/* Remita */}
                    <td style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#475569" }}>
                      {formatCurrency(d.remita)}
                    </td>

                    {/* Interswitch */}
                    <td style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#475569" }}>
                      {formatCurrency(d.interswitch)}
                    </td>

                    {/* GoKollect */}
                    <td style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#475569" }}>
                      {formatCurrency(d.gokollect)}
                    </td>

                    {/* Total */}
                    <td style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9", fontWeight: 800, color: "#052e16", fontSize: "15px" }}>
                      {formatCurrency(d.total)}
                    </td>

                    {/* Progress */}
                    <td style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ flex: 1, height: "8px", background: "#f1f5f9", borderRadius: "4px", minWidth: "80px", overflow: "hidden" }}>
                          <div style={{
                            width: `${Math.min(d.percent, 100)}%`,
                            height: "100%",
                            background: progressColor,
                            borderRadius: "4px",
                            transition: "width 0.6s ease",
                          }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "13px", color: progressColor, minWidth: "44px" }}>
                          {d.percent}%
                        </span>
                      </div>
                    </td>

                    {/* View */}
                    <td style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                      <button
                        onClick={() => router.push(`/ato-detail/${d.user_id}`)}
                        style={{
                          background: "#f0fdf4",
                          color: "#166534",
                          border: "1px solid #dcfce7",
                          padding: "7px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}