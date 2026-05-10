"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { Trophy, Eye, Calendar, ArrowUpRight } from "lucide-react";

export default function LeagueTablePage() {
  const [data, setData] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const router = useRouter();

  const fetchData = async () => {
    try {
      const query = new URLSearchParams();

      if (fromDate) query.append("from_date", fromDate);
      if (toDate) query.append("to_date", toDate);

      const res = await api.get(`/performance/league-table/?${query.toString()}`);
      const sortedData = (res.data || []).slice().sort((a: any, b: any) => {
        const percentA = Number(a.percent) || 0;
        const percentB = Number(b.percent) || 0;
        if (percentB !== percentA) return percentB - percentA;
        return (Number(b.total) || 0) - (Number(a.total) || 0);
      });
      setData(sortedData);
    } catch (err) {
      console.error("Error fetching league data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const styles = {
    header: {
      background: "linear-gradient(135deg, #052e16 0%, #064e3b 100%)",
      padding: "30px",
      borderRadius: "16px",
      color: "white",
      marginBottom: "25px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
    },
    tableContainer: {
      background: "white",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      overflowY: "auto" as const,
      overflowX: "auto" as const,
      maxHeight: "75vh",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
    },
    th: { 
      padding: "18px 20px",
      background: "#f8fafc",
      textAlign: "left" as const,
      fontSize: "12px",
      fontWeight: "700",
      color: "#64748b",
      borderBottom: "2px solid #f1f5f9",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",

      position: "sticky" as const,
      top: 0,
      zIndex: 10
    },
    td: { 
      padding: "16px 20px", 
      borderBottom: "1px solid #f1f5f9", 
      fontSize: "14px", 
      color: "#1e293b",
      verticalAlign: "middle"
    },
    rankCircle: (index: number) => ({
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "800",
      fontSize: "13px",
      background: index === 0 ? "#fef3c7" : index === 1 ? "#f1f5f9" : index === 2 ? "#ffedd5" : "transparent",
      color: index === 0 ? "#92400e" : index === 1 ? "#475569" : index === 2 ? "#9a3412" : "#94a3b8",
      border: index > 2 ? "1px solid #e2e8f0" : "none"
    })
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "white",
    padding: "6px 10px",
    borderRadius: "8px",
    outline: "none",
    cursor: "pointer"
  };

  return (
    <DashboardLayout>
      {/* Header with Title and Modern Selects */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "800", display: "flex", alignItems: "center", gap: "12px" }}>
            <Trophy size={32} color="#fbbf24" /> BIRS League Table
          </h1>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8, fontSize: "14px" }}>
            Monthly performance ranking of all Area Tax Offices
          </p>
        </div>

        {/* 🔥 NEW FILTER UI */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Calendar size={16} />

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={inputStyle}
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>ATO Station</th>
              <th style={styles.th}>Target</th>
              <th style={styles.th}>Remita</th>
              <th style={styles.th}>Interswitch</th>
              <th style={styles.th}>Gokollect</th>
              <th style={styles.th}>Total Revenue</th>
              <th style={styles.th}>% Achieved</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((d, i) => (
              <tr key={i} style={{ transition: "background 0.2s" }}>
                <td style={styles.td}>
                  <div style={styles.rankCircle(i)}>{i + 1}</div>
                </td>
                <td style={{ ...styles.td, fontWeight: "700" }}>{d.username}</td>
                <td style={styles.td}>₦{Number(d.target).toLocaleString()}</td>
                <td style={styles.td}>₦{Number(d.remita).toLocaleString()}</td>
                <td style={styles.td}>₦{Number(d.interswitch).toLocaleString()}</td>
                <td style={styles.td}>₦{Number(d.gokollect).toLocaleString()}</td>
                <td style={{ ...styles.td, fontWeight: "800", color: "#052e16" }}>
                  ₦{Number(d.total).toLocaleString()}
                </td>
                <td style={styles.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1, height: "8px", background: "#f1f5f9", borderRadius: "4px", minWidth: "80px", overflow: "hidden" }}>
                      <div 
                        style={{ 
                          width: `${Math.min(d.percent, 100)}%`, 
                          height: "100%", 
                          background: d.percent >= 100 ? "#10b981" : "#34d399",
                          borderRadius: "4px"
                        }} 
                      />
                    </div>
                    <span style={{ fontWeight: "700", width: "40px" }}>{d.percent}%</span>
                  </div>
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <button
                    onClick={() => router.push(`/ato-detail/${d.user_id}`)}
                    style={{ 
                      background: "#f0fdf4", color: "#166534", border: "1px solid #dcfce7",
                      padding: "8px 14px", borderRadius: "10px", cursor: "pointer",
                      display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                  >
                    <Eye size={16} /> View Profile
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={9} style={{ padding: "50px", textAlign: "center", color: "#64748b" }}>
                  No performance data available for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}