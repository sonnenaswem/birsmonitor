"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Trash2, 
  ShieldCheck, 
  Search, 
  FileDown, 
  AlertCircle,
  Clock
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface TaxEntry {
  id: number;
  tax_item: string;
  taxpayer_name: string;
  date_of_remittance: string;
  source: "POS" | "Manual";

  remita?: string | null;
  interswitch_ref?: string | null;
  gokollect?: string | null;
  payment_channel?: string;

  remita_amount?: string | null;
  interswitch_amount?: string | null;
  gokollect_amount?: string | null;
  total_amount?: string | null;

  user_full_name?: string;
  area_office?: string;

  display_reference?: string;
  display_amount?: number;
  station_name?: string;
}

export default function ViewAllEntries() {
  const [entries, setEntries] = useState<TaxEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setUserRole(localStorage.getItem("role"));
    fetchEntries();
  }, [from, to, page]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      let url = `/tax/all/?page=${page}&page_size=15`;

      if (from && to) {
        url += `&from_date=${from}&to_date=${to}`;
      }
      const res = await api.get(url);
      setTotalPages(Math.ceil(res.data.count / 15));
      const normalized: TaxEntry[] = res.data.results.map((entry: TaxEntry) => ({
        ...entry,
        display_reference:
          entry.display_reference ||
          entry.remita ||
          entry.interswitch_ref ||
          entry.gokollect ||
          "N/A",

        display_amount: Number(
          entry.display_amount ??
          entry.remita_amount ??
          entry.interswitch_amount ??
          entry.gokollect_amount ??
          entry.total_amount ??
          0
        ),

        station_name:
          entry.station_name ||
          entry.user_full_name ||
          entry.area_office ||
          "Headquarters"
      })).sort((a: any, b: any) => new Date(b.date_of_remittance).getTime() - new Date(a.date_of_remittance).getTime());
      

      setEntries(normalized);
    } catch (err) {
      console.error("Failed to fetch entries", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    const confirmation = window.confirm(
      "SECURITY WARNING: This will permanently remove this manual record. " +
      "Only Auditors and Admins can perform this. Proceed?"
    );
    if (!confirmation) return;

    try {
      await api.delete(`/tax/entries/${id}/delete/`);
      setEntries(entries.filter(e => e.id !== id));
      alert("Manual entry successfully removed.");
    } catch (err: any) {
      alert(err.response?.data?.error || "Deletion failed. Ensure you have Auditor privileges.");
    }
  };

  const filteredEntries = entries.filter((e) =>
    e.taxpayer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.remita || e.interswitch_ref || e.gokollect ||"")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (e.user_full_name || e.area_office || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const exportExcel = () => {
    const exportData = filteredEntries.map((e) => ({
      Date: e.date_of_remittance,
      Taxpayer: e.taxpayer_name,
      Reference: e.display_reference,
      Channel: e.payment_channel,
      Amount: e.display_amount,
      Station: e.station_name,
      Source: e.source,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Revenue Ledger"
    );

    XLSX.writeFile(workbook, "RevenueLedger.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Revenue Ledger", 14, 16);

    const tableData = filteredEntries.map((e) => [
      e.date_of_remittance,
      e.taxpayer_name,
      e.display_reference,
      e.payment_channel,
      `₦${Number(e.display_amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}`,
      e.station_name,
      e.source,
    ]);

    (doc as any).autoTable({
      startY: 24,
      head: [["Date", "Taxpayer", "Reference", "Channel", "Amount", "Station", "Source"]],
      body: tableData,
    });

    doc.save("RevenueLedger.pdf");
  };

  const styles = {
    card: { background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" as const },
    table: { width: "100%", borderCollapse: "collapse" as const },
    th: { padding: "12px", background: "#f8fafc", borderBottom: "2px solid #f1f5f9", textAlign: "left" as const, color: "#64748b", fontSize: "12px", fontWeight: "700" },
    td: { padding: "12px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#1e293b" },
    badge: (source: string) => ({
      padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
      display: "inline-flex", alignItems: "center", gap: "4px",
      background: source === "POS" ? "#ecfdf5" : "#fff7ed",
      color: source === "POS" ? "#059669" : "#c2410c"
    })
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#052e16", margin: 0 }}>Revenue Ledger</h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
            Comprehensive oversight of all BIRS revenue channels.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              placeholder="Search Remita, Officer, or Taxpayer..."
              style={{ padding: "10px 15px 10px 40px", borderRadius: "10px", border: "1px solid #cbd5e1", width: "320px", fontSize: "14px" }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Export Buttons */}
          <button onClick={exportExcel} style={{ padding: "10px 15px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
            <FileDown size={18} /> Export Excel
          </button>
          {/* <button onClick={exportPDF} style={{ padding: "10px 15px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
            <FileDown size={18} /> Export PDF
          </button> */}
        </div>
      </div>

      {/* Date Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(1);
          }}
        />

        <input
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>DATE</th>
              <th style={styles.th}>TAXPAYER / REVENUE ITEM</th>
              <th style={styles.th}>REFERENCE</th>
              <th style={{ ...styles.th, textAlign: "left" }}>CHANNEL</th>
              <th style={styles.th}>AMOUNT</th>
              <th style={styles.th}>ATO STATION</th>
              <th style={styles.th}>SOURCE</th>
              <th style={styles.th}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Fetching records...</td></tr>
            ) : filteredEntries.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No transactions found matching your search.</td></tr>
            ) : (
              filteredEntries.map(entry => (
                <tr key={entry.id}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} color="#94a3b8" />
                      {entry.date_of_remittance}
                    </div>
                  </td>
                  {/* TAXPAYER / ITEM */}
                  <td style={styles.td}>
                    <div style={{ fontWeight: "700" }}>{entry.taxpayer_name || "N/A"}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{entry.tax_item}</div>
                  </td>

                  {/* REFERENCE */}
                  <td style={styles.td}>
                    <code style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", fontSize: "13px" }}>
                      {entry.display_reference}
                    </code>
                  </td>

                  {/* CHANNEL */}
                  <td
                    style={{
                      ...styles.td,
                      textAlign: "left",
                      verticalAlign: "middle"
                    }}
                  >
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "700",
                        background:
                          entry.payment_channel === "Remita"
                            ? "#ecfdf5"
                            : entry.payment_channel === "Interswitch"
                            ? "#eff6ff"
                            : "#fef3c7",
                        color:
                          entry.payment_channel === "Remita"
                            ? "#059669"
                            : entry.payment_channel === "Interswitch"
                            ? "#2563eb"
                            : "#d97706",
                      }}
                    >
                      {entry.payment_channel}
                    </span>
                  </td>

                  {/* AMOUNT */}
                  <td style={styles.td}>
                    <span style={{ fontWeight: "800", color: "#052e16" }}>
                      ₦{entry.display_amount?.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </td>

                  {/* ATO STATION */}
                  <td style={styles.td}>
                    <span style={{ fontWeight: "600", color: "#475569" }}>
                      {entry.station_name}
                    </span>
                  </td>
                  {/* SOURCE */}
                  <td style={styles.td}>
                    <span style={styles.badge(entry.source)}>
                      {entry.source === "POS" ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                      {entry.source}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td style={styles.td}>
                    {(userRole === "admin" || userRole === "auditor") && entry.source === "Manual" ? (
                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{
                          border: "none",
                          background: "#fef2f2",
                          color: "#ef4444",
                          padding: "8px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "0.2s"
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#fee2e2")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#fef2f2")}
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <span style={{ color: "#cbd5e1", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>
                        Locked
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          marginTop: "20px"
        }}
      >
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            cursor: page === 1 ? "not-allowed" : "pointer",
            opacity: page === 1 ? 0.5 : 1
          }}
        >
          Previous
        </button>

        <span
          style={{
            fontWeight: "700",
            color: "#334155"
          }}
        >
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            opacity: page === totalPages ? 0.5 : 1
          }}
        >
          Next
        </button>
      </div>
    </DashboardLayout>
  );
}