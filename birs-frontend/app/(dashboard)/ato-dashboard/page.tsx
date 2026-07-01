"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";

export default function AtoDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (appliedFrom && appliedTo) {
      params.from_date = appliedFrom;
      params.to_date = appliedTo;
    }
    api.get("/api/performance/summary/", { params })
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [appliedFrom, appliedTo]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const params: any = {};
      if (appliedFrom && appliedTo) {
        params.from_date = appliedFrom;
        params.to_date = appliedTo;
      }

      const response = await api.get("/api/performance/export-my-entries/", {
        responseType: "blob",
        params,
      });

      const blob = new Blob([response.data], {
        type: String(response.headers["content-type"] || "text/csv"),
      });

      const contentDisposition = response.headers["content-disposition"] || "";
      const filenameMatch = contentDisposition.match(/filename="?(.*)"?/);
      const filename = filenameMatch?.[1] || `my_submissions_${new Date().toISOString().slice(0, 10)}.csv`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { fontFamily: "sans-serif" },
    header: { marginBottom: "25px" },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "20px",
      marginBottom: "30px"
    },
    card: {
      background: "white",
      padding: "24px",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e2e8f0"
    },
    label: { color: "#64748b", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", display: "block", textTransform: "uppercase" },
    value: { fontSize: "1.75rem", fontWeight: "bold", margin: 0, color: "#1e293b" },
    btnPrimary: { background: "#2563eb", color: "white", padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" },
    btnSuccess: { background: "#16a34a", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "bold", boxShadow: "0 2px 4px rgba(22, 163, 74, 0.2)" },
    tableWrapper: { background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", marginTop: "10px" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    th: { background: "#f8fafc", padding: "14px", fontSize: "0.8rem", fontWeight: "600", color: "#64748b", borderBottom: "1px solid #e2e8f0" },
    td: { padding: "14px", borderBottom: "1px solid #f1f5f9", fontSize: "0.9rem", color: "#334155" },
    filterBar: { background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "25px", display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-end" }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading ATO Portal...</div>;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <DashboardLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{ fontSize: "24px", margin: "0 0 5px 0", color: "#0f172a" }}>👨‍💼 ATO Dashboard</h1>
          <p style={{ color: "#64748b", margin: 0 }}>Performance tracking for the current revenue cycle.</p>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <button style={styles.btnSuccess} onClick={() => router.push('/enter-tax-data')}>
            ➕ Enter New Tax Record
          </button>
        </div>

        {/* KPI Cards */}
        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <span style={styles.label}>🎯 Monthly Target</span>
            <p style={styles.value}>₦{data?.target?.toLocaleString() || "0.00"}</p>
          </div>
          <div style={styles.card}>
            <span style={styles.label}>💰 Monthly Total</span>
            <p style={{ ...styles.value, color: "#16a34a" }}>₦{data?.grand_total?.toLocaleString() || "0.00"}</p>
          </div>
          <div style={styles.card}>
            <span style={styles.label}>📈 Progress</span>
            <p style={{ ...styles.value, color: "#2563eb" }}>{data?.percent_met || 0}%</p>
          </div>
        </div>

        {/* Date Filters */}
        <div style={styles.filterBar}>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "5px" }}>Start Date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "5px" }}>End Date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
            />
          </div>
          <button
            onClick={() => { setAppliedFrom(from); setAppliedTo(to); }}
            disabled={!from || !to}
            style={{
              ...styles.btnPrimary,
              background: from && to ? "#2563eb" : "#e2e8f0",
              color: from && to ? "white" : "#94a3b8",
              cursor: from && to ? "pointer" : "not-allowed",
            }}
          >
            Apply
          </button>
          {(appliedFrom || appliedTo) && (
            <button
              onClick={() => { setFrom(""); setTo(""); setAppliedFrom(""); setAppliedTo(""); }}
              style={{
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Clear
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              ...styles.btnPrimary,
              background: downloading ? "#94a3b8" : "#2563eb",
              cursor: downloading ? "not-allowed" : "pointer",
            }}
          >
            {downloading ? "Downloading..." : "📥 Download Report"}
          </button>
        </div>

        {/* Table Section */}
        <h3 style={{ fontSize: "18px", color: "#1e293b", marginBottom: "15px" }}>
          {appliedFrom && appliedTo ? "Filtered Submissions" : "Recent Monthly Submissions"}
        </h3>
        <div style={{ overflowX: "auto" }}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Reporting Date</th>
                  <th style={styles.th}>Remita (₦)</th>
                  <th style={styles.th}>Interswitch (₦)</th>
                  <th style={styles.th}>Gokollect (₦)</th>
                  <th style={styles.th}>Total (₦)</th>
                </tr>
              </thead>
              <tbody>
                {data?.records?.length > 0 ? data.records.map((rec: any, i: number) => {
                  const remita = Number(rec.remita_amount || 0);
                  const interswitch = Number(rec.interswitch_amount || 0);
                  const gokollect = Number(rec.gokollect_amount || 0);
                  const total = remita + interswitch + gokollect;

                  return (
                    <tr key={i}>
                      <td style={styles.td}>{formatDate(rec.date_of_remittance)}</td>
                      <td style={styles.td}>₦{remita.toLocaleString()}</td>
                      <td style={styles.td}>₦{interswitch.toLocaleString()}</td>
                      <td style={styles.td}>₦{gokollect.toLocaleString()}</td>
                      <td style={{ ...styles.td, fontWeight: "bold", color: "#0f172a" }}>
                        ₦{total.toLocaleString()}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} style={{ ...styles.td, textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No records found for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}