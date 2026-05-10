"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ArrowLeft, 
  TrendingUp, 
  ShieldCheck, 
  MousePointer2, 
  Calendar, 
  CreditCard, 
  AlertCircle, 
  BarChart as BarIcon 
} from "lucide-react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell 
} from "recharts";

const COLORS = ['#10b981', '#059669', '#047857', '#064e3b'];

export default function ATODetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // 🔥 FETCH ATO DETAIL WITH FILTER
  useEffect(() => {
    const userId = parseInt(id as string, 10); // ✅ ensure integer

    let url = `/users/ato/${userId}/`;

    if (from && to) {
      url += `?from_date=${from}&to_date=${to}`;
    }

    api.get(url)
      .then(res => setData(res.data))
      .catch(err => {
        if (err.response) {
          // Server responded with a status code outside 2xx
          console.error("Backend error:", err.response.status, err.response.data);
        } else if (err.request) {
          // Request was made but no response received
          console.error("No response received:", err.request);
        } else {
          // Something else happened
          console.error("Axios error:", err.message);
        }
      })
      .finally(() => setLoading(false));

  }, [id, from, to]);


  if (loading) return <DashboardLayout><div style={{padding: "40px", textAlign: "center"}}>Loading Station Intelligence...</div></DashboardLayout>;
  if (!data) return <DashboardLayout>Station not found.</DashboardLayout>;

  const styles: any = {
    statCard: { background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", flex: 1 },
    sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#052e16", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "12px", textAlign: "left", fontSize: "12px", color: "#64748b", borderBottom: "1px solid #f1f5f9" },
    td: { padding: "12px", borderBottom: "1px solid #f1f5f9", fontSize: "14px" }
  };
  const verifiedPercent = data.total ? (data.pos_total / data.total) * 100 : 0;
  return (
    <DashboardLayout>
      <button 
        onClick={() => router.back()} 
        style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", cursor: "pointer", marginBottom: "20px", border: "none", background: "none", fontWeight: "600" }}
      >
        <ArrowLeft size={18} /> Back to League Table
      </button>
      {/* 🔥 DATE FILTER */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#052e16", margin: 0 }}>{data.username}</h1>
          <p style={{ color: "#64748b", margin: 0 }}>Station Performance & Audit Intelligence</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>CURRENT TARGET PROGRESS</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#10b981" }}>{data.percent}%</div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={styles.statCard}>
          <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>TOTAL COLLECTED</div>
          <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "5px" }}>₦{data.total?.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>POS (VERIFIED)</div>
          <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "5px", color: "#10b981" }}>₦{data.pos_total?.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>MANUAL ENTRIES</div>
          <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "5px", color: "#f59e0b" }}>₦{data.manual_total?.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>TARGET</div>
          <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "5px" }}>₦{data.target?.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>LAST ENTRY</div>
          <div style={{ 
            fontSize: data.last_entry === "No entries" ? "20px" : "20px", // Shrink font slightly so full timestamp fits
            fontWeight: "800", 
            marginTop: "5px",
            color: "#052e16" 
          }}>
            {data.last_entry || "---"}
          </div>
        </div>
      </div>

      {/* Main Bar Chart Row */}
      <div style={{ ...styles.statCard, marginBottom: "30px", height: "350px" }}>
        <h3 style={styles.sectionTitle}><BarIcon size={20} /> Revenue by Tax Item</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={data.item_breakdown}>
            <XAxis dataKey="tax_item" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{fill: '#f3f4f6'}} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.item_breakdown?.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Grid: 7-Day Trend & Audit */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
        <div>
          <div style={{ ...styles.statCard, marginBottom: "30px", height: "350px" }}>
            <h3 style={styles.sectionTitle}><TrendingUp size={20} /> Collection Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={data.activity_trend}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Payments Table */}
          <div style={styles.statCard}>
            <h3 style={styles.sectionTitle}><Calendar size={20} /> Recent Submissions</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Taxpayer</th>
                  <th style={styles.th}>Reference</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Source</th>
                  <th style={styles.th}>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_payments?.map((p: any, i: number) => (
                  <tr key={i}>
                    <td style={styles.td}>{p.taxpayer}</td>
                    <td style={styles.td}><code style={{fontSize: "12px"}}>{p.reference}</code></td>
                    <td style={{ ...styles.td, fontWeight: "700" }}>₦{p.amount?.toLocaleString()}</td>
                    <td style={styles.td}>
                      {p.source === 'POS' ? 
                        <span style={{color: "#10b981", display: "flex", alignItems: "center", gap: "4px"}}><ShieldCheck size={14}/> POS</span> : 
                        <span style={{color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px"}}><MousePointer2 size={14}/> Manual</span>
                      }
                    </td>
                    <td style={styles.td}>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}