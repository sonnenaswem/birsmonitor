"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Calendar, Wallet, User, Hash } from "lucide-react";

interface Entry {
  id: number;
  tax_item: string;
  subhead: string;
  taxpayer_name: string;
  amount?: number;
  display_amount?: number;
  remita_amount?: number;
  interswitch_amount?: number;
  gokollect_amount?: number;
  total_amount?: number;
  date_of_remittance: string;
}

export default function MyEntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);

  // Consistency Colors
  const colors = {
    primary: "#052e16", // Deep Green
    accent: "#22c55e",  // Vibrant Green
    accentMuted: "#86efac",
    background: "#f0fdf4",
    backgroundAlt: "#dcfce7",
    card: "#ffffff",
    border: "#bbf7d0",
    text: "#052e16",
    textMuted: "#166534",
  };

  useEffect(() => {
    fetchEntries();
  }, [page]);

  const fetchEntries = async (pageNumber = 1) => {
    setLoading(true);

    try {
      const res = await api.get(`/api/tax/my-entries/?page=${pageNumber}`);

      setEntries(res.data.results);
      setCount(res.data.count);
      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
    } catch (err) {
      console.error("❌ Failed to fetch entries", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number) => "₦" + Number(num || 0).toLocaleString();

  const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: "32px", backgroundColor: colors.background, minHeight: "100vh" },
    header: { marginBottom: "32px" },
    title: { fontSize: "28px", fontWeight: 800, color: colors.text, margin: 0 },
    subtitle: { color: colors.textMuted, margin: "4px 0 0 0" },
    tableWrapper: { background: "white", borderRadius: "16px", border: `1px solid ${colors.border}`, overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" },
    tableHeader: { padding: "20px 28px", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { background: colors.background, padding: "16px", fontSize: "12px", color: colors.textMuted, textAlign: "left", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" },
    td: { padding: "16px 20px", borderBottom: `1px solid ${colors.backgroundAlt}`, fontSize: "14px", color: colors.text },
    amountCell: { fontWeight: 700, color: colors.accent },
    iconWrapper: { display: "inline-flex", alignItems: "center", gap: "8px" },
    badge: { padding: "4px 10px", borderRadius: "6px", backgroundColor: colors.backgroundAlt, color: colors.primary, fontSize: "12px", fontWeight: 600 }
  };

  return (
    <DashboardLayout>
      <div style={styles.container}>
        
        {/* Page Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📑 My Submissions</h1>
          <p style={styles.subtitle}>Review and manage your tax collection entries.</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", padding: "100px", justifyContent: "center", color: colors.primary, fontWeight: 600 }}>
            Verifying records...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ background: "white", padding: "60px", textAlign: "center", borderRadius: "16px", border: `1px solid ${colors.border}` }}>
            <p style={{ color: colors.textMuted }}>No submissions found for your account yet.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <div style={styles.tableHeader}>
              <h4 style={{ margin: 0, color: colors.text }}>Recent Activities</h4>
              <span style={styles.badge}>{count} Entries Found</span>
            </div>
            
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}><span style={styles.iconWrapper}><Hash size={14}/> ID</span></th>
                  <th style={styles.th}><span style={styles.iconWrapper}><FileText size={14}/> Tax Item & Subhead</span></th>
                  <th style={styles.th}><span style={styles.iconWrapper}><User size={14}/> Taxpayer</span></th>
                  <th style={styles.th}><span style={styles.iconWrapper}><Wallet size={14}/> Amount</span></th>
                  <th style={styles.th}><span style={styles.iconWrapper}><Calendar size={14}/> Date</span></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} style={{ transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = colors.background)}>
                    <td style={styles.td}>#{entry.id}</td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600 }}>{entry.tax_item}</div>
                      <div style={{ fontSize: "12px", color: colors.textMuted }}>{entry.subhead}</div>
                    </td>
                    <td style={styles.td}>{entry.taxpayer_name || "N/A"}</td>
                    <td style={{ ...styles.td, ...styles.amountCell }}>
                      {formatCurrency(
                        Number(entry.total_amount ?? entry.display_amount ?? 0)
                      )}
                    </td>
                    <td style={styles.td}>
                      {(() => {
                        try {
                          const date = entry.date_of_remittance ? new Date(entry.date_of_remittance) : null;
                          return date && !isNaN(date.getTime()) ? date.toLocaleDateString("en-NG", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          }) : "N/A";
                        } catch (err) {
                          return "N/A";
                        }
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "20px",
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              <button
                disabled={!prevPage}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: prevPage ? "pointer" : "not-allowed",
                  opacity: prevPage ? 1 : 0.5,
                }}
              >
                Previous
              </button>

              <span style={{ fontWeight: 600 }}>
                Page {page}
              </span>

              <button
                disabled={!nextPage}
                onClick={() => setPage((prev) => prev + 1)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: nextPage ? "pointer" : "pointer",
                  opacity: nextPage ? 1 : 0.5,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}