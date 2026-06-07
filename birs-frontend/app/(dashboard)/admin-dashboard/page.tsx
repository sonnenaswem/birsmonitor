"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  LabelList,
  Cell,
  
} from "recharts";
import {
  Download,
  TrendingUp,
  Users,
  Target,
  Wallet,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth() as any;
  const [data, setData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [taxItemData, setTaxItemData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDownload, setActiveDownload] = useState<string | null>(null);
  const [chartAnimation, setChartAnimation] = useState(false);
  const router = useRouter();

  const formatCurrency = (num: number) =>
    "₦" + Number(num || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const formatPercent = (num: number) => `${Number(num || 0).toFixed(1)}%`;

  // ✨ Enhanced Professional Green Palette with Depth
  const colors = {
    primary: "#022c22",
    primaryLight: "#064e3b",
    primaryMid: "#047857",
    accent: "#10b981",
    accentLight: "#34d399",
    accentMuted: "#6ee7b7",
    background: "#f0fdf4",
    backgroundAlt: "#dcfce7",
    backgroundGradient: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)",
    card: "#ffffff",
    cardGradient: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
    border: "#bbf7d0",
    borderLight: "#dcfce7",
    text: "#022c22",
    textMuted: "#065f46",
    textLight: "#6b7280",
    success: "#16a34a",
    warning: "#ca8a04",
    danger: "#dc2626",
    // Chart gradients
    chartGradient1: ["#10b981", "#059669"],
    chartGradient2: ["#047857", "#065f46"],
    chartGradient3: ["#022c22", "#064e3b"],
    chartGradient4: ["#f59e0b", "#d97706"],
    chartGradient5: ["#ef4444", "#dc2626"],
    // Glow effects
    glowGreen: "rgba(16, 185, 129, 0.25)",
    glowEmerald: "rgba(5, 150, 105, 0.2)",
    chart1: "#10b981",
    chart2: "#047857",
    chart3: "#022c22",
    chart4: "#f59e0b",
    chart5: "#ef4444",
  };

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    if (!authLoading && (!user || !user.role)) {
      router.push("/login");
    } else if (user?.role && !["director", "admin", "auditor", "assistant"].includes(user.role)) {
      router.push("/ato-dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && ["director", "admin", "auditor", "assistant"].includes(user.role)) {
      const query =
        appliedFrom && appliedTo
          ? `?from_date=${appliedFrom}&to_date=${appliedTo}`
          : "";

      Promise.all([
        api.get(`/api/performance/dashboard/${query}`, {
          headers: {
            "Cache-Control": "no-cache",
          },
        }),
        api.get(`/api/tax/analytics/${query}`, {
          headers: {
            "Cache-Control": "no-cache",
          },
        }),
        api.get(`/api/tax/tax-item-aggregate/${query}`, {
          headers: {
            "Cache-Control": "no-cache",
          },
        }).catch(() => ({ data: [] })),
      ])
        .then(([dashboardRes, analyticsRes, taxRes]) => {
          setData(dashboardRes.data);
          setAnalyticsData(analyticsRes.data);
          setTaxItemData(taxRes.data || []);
          setLoading(false);
          // Trigger chart entrance animation after data loads
          const timer = setTimeout(() => setChartAnimation(true), 100);

          return () => clearTimeout(timer);
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  }, [user, appliedFrom, appliedTo]);

  // Chart data preparation with memoization for performance
  const revenueTrendData = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const monthMap: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    // Create base 12-month structure
    const fullYearData = months.map((month) => ({
      month,
      revenue: 0,
    }));

    // Inject backend values into matching months
    (data?.monthly_trend || []).forEach((item: any) => {
      const rawMonth =
        String(item.month || item.name || "").slice(0, 3);

      const revenue = Number(
        item.total ??
        item.amount ??
        item.revenue ??
        0
      );

      const monthIndex =
        monthMap[
          rawMonth?.charAt(0).toUpperCase() +
            rawMonth?.slice(1).toLowerCase()
        ];

      if (monthIndex !== -1) {
        fullYearData[monthIndex].revenue = Number(revenue);
      }
    });

    return fullYearData;
  }, [data]);

  const atoPerformanceData = useMemo(() => 
    analyticsData?.ato_performance?.map((item: any) => {
      const rawPercent = parseFloat(item.percent ?? 0);
      return {
        station_name:
          item.area_office ||
          item.station_name ||
          item.name ||
          item.ato_name ||
          item.officer_name ||
          item.username ||
          "Unknown",
        percent: Number.isFinite(rawPercent) ? rawPercent : 0,
        target: Number(item.target || 0),
        revenue: Number(item.amount ?? item.revenue ?? 0),
      };
    }) || [], 
  [analyticsData]);

  const topPerformersData = useMemo(() =>
    analyticsData?.top_performers?.map((item: any) => ({
      station_name:
        item.station_name ||
        item.name ||
        item.ato_name ||
        item.officer_name ||
        "Unknown",

      amount: Number(item.amount ?? item.total ?? item.revenue ?? 0),
    })) || [],
  [analyticsData]);

  const bottomPerformersData = useMemo(() =>
    analyticsData?.bottom_performers?.map((item: any) => ({
      station_name:
        item.station_name ||
        item.name ||
        item.ato_name ||
        item.officer_name ||
        "Unknown",

      amount: Number(item.amount ?? item.total ?? item.revenue ?? 0),
    })) || [],
  [analyticsData]);

  const taxItemChartData = useMemo(
    () =>
      (taxItemData || [])
        .map((item: any, index: number) => ({
          name: item.tax_item || item.name || item.item_name || "Unknown",
          value: Number(
            item.total ??
            item.value ??
            item.total_revenue ??
            item.amount ??
            item.revenue ??
            0
          ),
          fill: [
            colors.chart1,
            colors.chart2,
            colors.chart3,
            colors.accentLight,
            colors.chart4,
            colors.chart5,
            colors.accent,
            colors.primaryMid,
            colors.primary,
            colors.accentMuted,
          ][index % 10],
          gradientId: `gradient-${index}`,
        }))
        .sort((a, b) => b.value - a.value),
    [taxItemData]
  );

  // ✨ Custom Tooltip Component for Rich Formatting
  const CustomTooltip = ({ active, payload, label, formatter, suffix = "" }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${colors.border}`,
          borderRadius: "14px",
          padding: "14px 18px",
          boxShadow: "0 8px 32px rgba(2, 44, 34, 0.15)",
          minWidth: "180px",
          fontSize: "13px",
          fontFamily: "inherit",
        }}>
          <p style={{ 
            margin: "0 0 10px 0", 
            fontWeight: 600, 
            color: colors.text,
            fontSize: "14px",
            borderBottom: `1px solid ${colors.borderLight}`,
            paddingBottom: "8px",
          }}>
            {label}
          </p>
          {payload.map((entry: any, idx: number) => (
            <div key={idx} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              gap: "12px",
              marginBottom: idx < payload.length - 1 ? "6px" : 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  backgroundColor: entry.color || colors.accent,
                  boxShadow: `0 0 0 2px ${colors.card}, 0 2px 4px rgba(0,0,0,0.1)`,
                }} />
                <span style={{ color: colors.textMuted, fontWeight: 500 }}>{entry.name}</span>
              </div>
              <span style={{ 
                fontWeight: 700, 
                color: colors.text,
                fontFamily: "monospace",
              }}>
                {formatter ? formatter(entry.value) : formatCurrency(entry.value)}
                {suffix}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // ✨ Get progress color with glow effect
  const getProgressColor = (percent: number): string => {
    if (percent >= 100) return colors.success;
    if (percent >= 50) return colors.warning;
    return colors.danger;
  };

  const handleDownload = async (type: "excel" | "pdf") => {
    setActiveDownload(type);

    if (type !== "excel") {
      setTimeout(() => setActiveDownload(null), 2000);
      return;
    }

    try {
      const response = await api.get("/api/performance/export-csv/", {
        responseType: "blob",
        params: appliedFrom && appliedTo ? { from_date: appliedFrom, to_date: appliedTo } : {},
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "text/csv",
      });

      const contentDisposition = response.headers["content-disposition"] || "";
      const filenameMatch = contentDisposition.match(/filename="?(.*)"?/);
      const filename = filenameMatch?.[1] || `revenue_report_${new Date().toISOString().slice(0, 10)}.csv`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
    } finally {
      setTimeout(() => setActiveDownload(null), 2000);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setChartAnimation(false);
    
    Promise.all([
      api.get("/api/performance/dashboard/", {
        params: appliedFrom && appliedTo ? {
          from_date: appliedFrom,
          to_date: appliedTo,
        } : {},
      }),
      api.get("/api/tax/analytics/", {
        params: appliedFrom && appliedTo ? {
          from_date: appliedFrom,
          to_date: appliedTo,
        } : {},
      }),
      api.get("/api/tax/tax-item-aggregate/", {
        params: appliedFrom && appliedTo ? {
          from_date: appliedFrom,
          to_date: appliedTo,
        } : {},
      })
    ])
      .then(([dashboardRes, analyticsRes, taxRes]) => {
        setData(dashboardRes.data);
        setAnalyticsData(analyticsRes.data);
        setTaxItemData(taxRes.data || []);
        
        setLoading(false);
        setChartAnimation(true);
        
      })
      .catch((err) => {
        setLoading(false);
      });
  };
  const formatChartCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
      return `₦${(value / 1000).toFixed(1)}K`;
    }

    return `₦${value}`;
  };
  // ✨ Loading Skeleton for Charts
  const ChartSkeleton = ({ height = 280 }: { height?: number }) => (
    <div style={{
      width: "100%",
      height,
      background: `linear-gradient(90deg, ${colors.backgroundAlt} 25%, ${colors.background} 50%, ${colors.backgroundAlt} 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      borderRadius: "12px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );

  if (loading || authLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        flexDirection: "column",
        gap: "20px",
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryMid} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 24px ${colors.glowEmerald}`,
          animation: "pulse 2s infinite",
        }}>
          <Sparkles size={28} color="white" />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: colors.text, fontSize: "16px", margin: 0, fontWeight: 600 }}>
            Loading Dashboard
          </p>
          <p style={{ color: colors.textMuted, fontSize: "13px", margin: "4px 0 0 0" }}>
            Preparing your analytics...
          </p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 8px 24px ${colors.glowEmerald}; }
            50% { transform: scale(1.05); box-shadow: 0 12px 32px ${colors.glowGreen}; }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* LARGE TABLETS */
        @media (max-width: 1300px) {
          .kpi-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }

          .chart-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }

        /* TABLETS */
        @media (max-width: 1024px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .header-actions {
            flex-direction: column;
            align-items: flex-start !important;
          }
        }

        /* MOBILE */
        @media (max-width: 768px) {

          .kpi-grid {
            grid-template-columns: 1fr !important;
          }

          .chart-grid-2 {
            grid-template-columns: 1fr !important;
          }

          .dashboard-container {
            padding: 14px !important;
          }

          .dashboard-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }

          .dashboard-title {
            font-size: 22px !important;
          }

          .chart-card {
            padding: 16px !important;
            overflow-x: auto;
          }

          .chart-title {
            font-size: 14px !important;
          }

          .kpi-card {
            padding: 18px !important;
            min-width: 0;
          }

          .kpi-value {
            font-size: 20px !important;
            word-break: break-word;
          }

          .kpi-label {
            font-size: 11px !important;
          }

          .recharts-wrapper {
            font-size: 11px !important;
          }

          .recharts-cartesian-axis-tick-value {
            font-size: 10px !important;
          }

          .recharts-legend-wrapper {
            font-size: 11px !important;
          }

          input[type="date"] {
            width: 100%;
          }
        
          svg {
            overflow: visible;
          }
          
          .recharts-responsive-container {
            min-width: 100%;
          }
        }
        /* SMALL PHONES */
        @media (max-width: 480px) {

          .dashboard-container {
            padding: 10px !important;
          }

          .dashboard-title {
            font-size: 20px !important;
          }

          .kpi-value {
            font-size: 18px !important;
          }

          .chart-card {
            padding: 12px !important;
          }

          .chart-title {
            font-size: 13px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div
        className="dashboard-container"
        style={{
          ...styles.container,
          background: colors.backgroundGradient,
        }}
      >
        {/* ✨ Enhanced Header with Date Filters */}
        <div 
          className="dashboard-header"
          style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          padding: "16px 20px",
          background: colors.card,
          borderRadius: "16px",
          border: `1px solid ${colors.border}`,
          boxShadow: "0 2px 12px rgba(2, 44, 34, 0.08)",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              background: colors.backgroundAlt,
              borderRadius: "10px",
              border: `1px solid ${colors.border}`,
            }}>
              <Calendar size={14} style={{ color: colors.primaryMid }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: colors.textMuted }}>Date Range:</span>
            </div>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: `1.5px solid ${colors.border}`,
                background: colors.card,
                fontSize: "14px",
                fontWeight: 500,
                color: colors.text,
                cursor: "pointer",
                transition: "all 0.2s",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.accent;
                e.target.style.boxShadow = `0 0 0 3px ${colors.glowGreen}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.boxShadow = "none";
              }}
            />
            <span style={{ color: colors.textLight, fontSize: "14px", fontWeight: 500 }}>to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: `1.5px solid ${colors.border}`,
                background: colors.card,
                fontSize: "14px",
                fontWeight: 500,
                color: colors.text,
                cursor: "pointer",
                transition: "all 0.2s",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.accent;
                e.target.style.boxShadow = `0 0 0 3px ${colors.glowGreen}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={() => {
                setAppliedFrom(from);
                setAppliedTo(to);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                background: colors.primaryMid,
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Apply Filter
            </button>
            {(from || to) && (
              <button
                onClick={() => {
                  setFrom("");
                  setTo("");

                  setAppliedFrom("");
                  setAppliedTo("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  background: "#fef2f2",
                  color: "#991b1b",
                  border: `1px solid #fecaca`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#fee2e2";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#fef2f2";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <RefreshCw size={14} />
                Clear
              </button>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: `linear-gradient(135deg, ${colors.primaryMid} 0%, ${colors.primary} 100%)`,
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.25s",
              boxShadow: loading ? "none" : `0 4px 14px ${colors.glowEmerald}`,
              opacity: loading ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 6px 20px ${colors.glowGreen}`;
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 14px ${colors.glowEmerald}`;
              }
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* ✨ Main Header */}
        <div className="dashboard-header" style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{
              ...styles.headerIcon,
              animation: chartAnimation ? "float 3s ease-in-out infinite" : "none",
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="dashboard-title" style={styles.headerTitle}>Admin Dashboard</h1>
              <p style={styles.headerSub}>
                Real-time Revenue Performance & Analytics
              </p>
            </div>
          </div>
          <div
            className="header-actions" 
            style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            flexWrap: "wrap",
          }}>
            <div style={styles.liveIndicator}>
              <span style={styles.liveDot} />
              <span style={styles.liveText}>Live Data</span>
            </div>
          </div>
        </div>

        {/* ✨ Enhanced KPI Cards with Gradient Accents */}
        <div style={styles.kpiGrid} className="kpi-grid">
          {[
            {
              label: "Remita",
              value: formatCurrency(analyticsData?.total_remita || 0),
              icon: <Wallet size={14} />,
              sub: "Remita Collections",
              gradient: colors.chartGradient1,
              iconBg: colors.accent,
            },
            {
              label: "Interswitch",
              value: formatCurrency(analyticsData?.total_interswitch || 0),
              icon: <FileText size={14} />,
              sub: "Interswitch Collections",
              gradient: colors.chartGradient2,
              iconBg: colors.primaryMid,
            },
            {
              label: "GoKollect",
              value: formatCurrency(analyticsData?.total_gokollect || 0),
              icon: <RefreshCw size={14} />, // Changed icon to distinguish it as "Coming Soon/Processing"
              sub: "Novus Collections",
              gradient: colors.chartGradient1, // Muted gradient to show it's inactive
              iconBg: colors.primaryMid,
              isPending: true,
            },
            {
              label: "Grand Total",
              value: formatCurrency(analyticsData?.grand_total || 0),
              icon: <TrendingUp size={14} />,
              sub: "All Revenue Streams",
              gradient: colors.chartGradient3,
              iconBg: colors.primary,
              accent: true,
              glow: true,
            },
            {
              label: "Target Achieved",
              value: formatPercent(analyticsData?.avg_percent || 0),
              icon: <Target size={14} />,
              sub: "Revenue vs. Total Target",
              gradient: (analyticsData?.avg_percent || 0) >= 100 
                ? colors.chartGradient1 
                : (analyticsData?.avg_percent || 0) >= 50 
                ? colors.chartGradient4 
                : colors.chartGradient5,
              iconBg: (analyticsData?.avg_percent || 0) >= 100 
                ? colors.success 
                : (analyticsData?.avg_percent || 0) >= 50 
                ? colors.warning 
                : colors.danger,
            },
          ].map((card, i) => (
            <div
              key={i}
              className="kpi-card"
              style={{
                ...styles.kpiCard,
                background: styles.kpiCard.background,
                animation: chartAnimation ? `slideIn 0.5s ease forwards ${i * 0.1}s` : "none",
                opacity: chartAnimation ? 1 : 0,
              }}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.kpiCardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(2, 44, 34, 0.06)";
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              {card.accent && <div style={styles.kpiAccent} />}
              {card.glow && (
                <div style={{
                  position: "absolute",
                  top: "-50%",
                  left: "-50%",
                  right: "-50%",
                  bottom: "-50%",
                  background: `radial-gradient(circle, ${colors.glowGreen} 0%, transparent 70%)`,
                  opacity: 0.3,
                  pointerEvents: "none",
                  animation: "pulse 3s infinite",
                }} />
              )}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${card.gradient[0]} 0%, ${card.gradient[1]} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: `0 4px 12px ${card.iconBg}40`,
                }}>
                  {card.icon}
                </div>
                <span style={{
                  ...styles.kpiLabel,
                  margin: 0,
                  textTransform: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                }}>
                  {card.label}
                </span>
              </div>
              <p 
                className="kpi-value"
                style={{ 
                  ...styles.kpiValue, 
                  fontSize: "clamp(16px, 4vw, 26px)",
                  lineHeight: 1.2,
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  marginBottom: "4px",
                }}>
                {card.value}
              </p>
              <span style={{
                ...styles.kpiSub,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}>
                {card.sub}
                {card.glow && (
                  <Sparkles size={10} style={{ color: colors.accent }} />
                )}
              </span>
            </div>
          ))}
        </div>

        {/* ✨ Charts Section with Enhanced Visuals */}

        {/* Row 1: Revenue Trend - Full Width with Area Chart */}
        <div style={{ marginBottom: "24px", width: "100%" }}>
          <div style={{
            ...styles.chartCard,
            animation: chartAnimation ? "slideIn 0.6s ease forwards 0.3s" : "none",
            opacity: chartAnimation ? 1 : 0,
          }}>
            <div style={styles.chartHeader}>
              <div>
                <h4
                  className="chart-title" 
                  style={{ ...styles.chartTitle, display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrendingUp size={18} style={{ color: colors.accent }} />
                  Revenue Trend
                </h4>
                <span style={styles.chartSub}>12-Month Performance Overview</span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                background: colors.backgroundAlt,
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: colors.primaryMid,
              }}>
                <span style={{ 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%", 
                  background: colors.accent,
                  animation: "pulse 2s infinite",
                }} />
                Live
              </div>
            </div>

            {revenueTrendData.length > 0 ? (
              /* ✨ SURGICAL FIX: The chart parent now handles inner swiping perfectly without page shifting */
              <div style={styles.scrollableChartWrapper}>
                <div style={{ minWidth: 750 }}>
              
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart
                      data={revenueTrendData}
                      margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={colors.borderLight}
                        strokeOpacity={0.5}
                      />

                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: colors.textMuted,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dy={10}
                      />

                      <YAxis
                        tickFormatter={formatChartCurrency}
                        tick={{ fill: colors.textMuted, fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip
                        content={<CustomTooltip formatter={formatCurrency} />}
                      />

                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={colors.accent}
                        strokeWidth={4}
                        dot={{
                          r: 5,
                          fill: colors.card,
                          stroke: colors.accent,
                          strokeWidth: 3,
                        }}
                        activeDot={{
                          r: 8,
                          fill: colors.accent,
                          stroke: colors.card,
                          strokeWidth: 3,
                        }}
                        animationDuration={1200}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>

                </div>
              </div>
            ) : (
              <div style={{
                ...styles.emptyState,
                padding: "50px 30px",
                background: `linear-gradient(135deg, ${colors.backgroundAlt} 0%, ${colors.background} 100%)`,
                borderRadius: "12px",
                border: `2px dashed ${colors.border}`,
              }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                  background: colors.background,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}>
                  <TrendingUp size={28} style={{ color: colors.textLight }} />
                </div>
                <p style={{ ...styles.emptyText, fontSize: "15px", fontWeight: 500, marginBottom: "6px" }}>
                  No trend data available
                </p>
                <p 
                  style={{ fontSize: "13px", color: colors.textLight }}>
                  Revenue data will appear once collections are recorded
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: ATO Performance + Tax Item Breakdown */}
        {/* ✨ SURGICAL FIX: Using dynamic grid layouts directly here to match device queries natively */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "24px" }}>

          {/* ✨ % Target Achieved per ATO - Horizontal Scroll with Enhanced Bars */}
          <div style={{
            ...styles.chartCard,
            animation: chartAnimation ? "slideIn 0.6s ease forwards 0.4s" : "none",
            opacity: chartAnimation ? 1 : 0,
            overflow: "hidden",
          }}>
            <div style={styles.chartHeader}>
              <div>
                <h4
                  className="chart-title" 
                  style={{ ...styles.chartTitle, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={18} style={{ color: colors.primaryMid }} />
                  Target Achievement by ATO
                </h4>
                <span style={styles.chartSub}>Individual Performance vs. Assigned Goals</span>
              </div>
              <span style={{
                fontSize: "12px",
                fontWeight: 600,
                color: colors.textMuted,
                background: colors.backgroundAlt,
                padding: "5px 12px",
                borderRadius: "8px",
              }}>
                {atoPerformanceData.length} Officers
              </span>
            </div>

            {atoPerformanceData.length > 0 ? (
              /* ✨ SURGICAL FIX: Placed inside our touch-safe wrapper */
              <div style={styles.scrollableChartWrapper}>
                <div style={{ 
                  minWidth: Math.max(800, atoPerformanceData.length * 60),
                  height: 400,
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={atoPerformanceData} 
                      margin={{ top: 20, right: 20, left: 10, bottom: 100 }}
                      barGap={4}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke={colors.borderLight}
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="station_name"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={30}
                        tick={{ fill: colors.textMuted, fontSize: 12, fontWeight: 500 }}
                        tickLine={false}
                        axisLine={{ stroke: colors.border, strokeWidth: 1 }}
                      />
                      <YAxis 
                        unit="%" 
                        tick={{ fill: colors.textMuted, fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, (dataMax) => Math.max(110, dataMax + 20)]}
                        ticks={[0, 25, 50, 75, 100, 125, 150]}
                      />
                      <Tooltip content={<CustomTooltip formatter={(v: any) => `${v}%`} suffix="%" />} />
                      <Bar 
                        dataKey="percent" 
                        name="% Target"
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                        animationDuration={chartAnimation ? 1000 : 0}
                        animationBegin={chartAnimation ? 300 : 0}
                      >
                        <LabelList
                          dataKey="percent"
                          position="top"
                          style={{ 
                            fill: colors.text, 
                            fontSize: 11, 
                            fontWeight: 700,
                            textShadow: "0 1px 2px rgba(255,255,255,0.9)",
                          }}
                          formatter={(value: any) => {
                            const num = Number(value || 0);
                            return `${num.toFixed(1)}%`;
                          }}
                        />
                        {atoPerformanceData.map((entry: any, index: number) => (
                          <Cell 
                            key={`ato-bar-${index}`} 
                            fill={getProgressColor(entry.percent)}
                            style={{
                              filter: entry.percent >= 100 
                                ? `drop-shadow(0 4px 12px ${colors.glowGreen})` 
                                : "none",
                              transition: "filter 0.3s",
                            }}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div style={{
                ...styles.emptyState,
                padding: "50px 30px",
                background: `linear-gradient(135deg, ${colors.backgroundAlt} 0%, ${colors.background} 100%)`,
                borderRadius: "12px",
                border: `2px dashed ${colors.border}`,
              }}>
                <Users size={32} style={{ color: colors.textLight, marginBottom: "12px" }} />
                <p
                  style={{ ...styles.emptyText, fontSize: "15px", fontWeight: 500, marginBottom: "6px" }}>
                  No ATO performance data
                </p>
                <p style={{ fontSize: "13px", color: colors.textLight }}>
                  Target achievement metrics will populate as officers submit collections
                </p>
              </div>
            )}
          </div>

          {/* ✨ Tax Revenue by Item - Matching Vertical Column Chart */}
          <div
            className="chart-card" 
            style={{
              ...styles.chartCard,
              animation: chartAnimation ? "slideIn 0.6s ease forwards 0.5s" : "none",
              opacity: chartAnimation ? 1 : 0,
            }}
          >
            <div style={styles.chartHeader}>
              <div>
                <h4
                  className="chart-title" 
                  style={{ ...styles.chartTitle, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Wallet size={18} style={{ color: colors.primary }} />
                  Revenue by Tax Item
                </h4>
                <span style={styles.chartSub}>Aggregated Collections Across All Officers</span>
              </div>
              {taxItemChartData.length > 10 && (
                <span style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: colors.accent,
                  background: "rgba(16, 185, 129, 0.12)",
                  padding: "5px 12px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}>
                  <Sparkles size={12} />
                  Top {taxItemChartData.length} Items
                </span>
              )}
            </div>

            {taxItemChartData.length > 0 ? (
              /* Placed inside the scrollable wrapper so it behaves exactly like the ATO chart on mobile */
              <div style={styles.scrollableChartWrapper}>
                <div style={{ 
                  minWidth: Math.max(600, taxItemChartData.slice(0, 12).length * 60), 
                  height: 400 
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={taxItemChartData.slice(0, 12)} 
                      margin={{ top: 25, right: 20, left: 10, bottom: 80 }}
                    >
                      {/* Standard vertical column gradient definition setup */}
                      <defs>
                        {taxItemChartData.slice(0, 12).map((item: any, index: number) => (
                          <linearGradient key={`tax-grad-${index}`} id={item.gradientId || `taxGrad-${index}`} x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor={item.fill || colors.primary} />
                            <stop offset="100%" stopColor={item.fill ? `${item.fill}cc` : colors.primaryMid} />
                          </linearGradient>
                        ))}
                      </defs>
                      
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke={colors.borderLight}
                        strokeOpacity={0.5}
                      />
                      
                      {/* 1. Labels stack along the bottom horizontal X-Axis */}
                      <XAxis
                        dataKey="name"
                        tickFormatter={(value) =>
                          value.length > 18
                            ? value.substring(0, 18) + "..."
                            : value
                        }
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={40}
                        tick={{ fill: colors.textMuted, fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                        axisLine={{ stroke: colors.border, strokeWidth: 1 }}
                      />
                      
                      {/* 2. Numerical values run up the vertical Y-Axis */}
                      <YAxis 
                        tick={{ fill: colors.textMuted, fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => {
                          if (v >= 1000000) {
                            return `₦${(v / 1000000).toFixed(1)}M`;
                          }

                          if (v >= 1000) {
                            return `₦${(v / 1000).toFixed(0)}K`;
                          }

                          return `₦${v}`;
                        }}
                      />
                      
                      <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                      
                      <Bar 
                        dataKey="value" 
                        name="Revenue"
                        radius={[6, 6, 0, 0]} /* 3. Rounds the top edges cleanly */
                        barSize={28}
                        animationDuration={chartAnimation ? 1000 : 0}
                      >
                        {/* 4. Positions metrics clearly floating right above each column bar */}
                        <LabelList
                          dataKey="value"
                          position="top"
                          dy={-10}
                          style={{ 
                            fill: colors.primaryMid || "#4b5563", // Clean TypeScript typing match
                            fontSize: 10, 
                            fontWeight: 700,
                          }}
                          formatter={(v:any)=>formatChartCurrency(v)}
                        />
                        {taxItemChartData.slice(0, 12).map((entry: any, index: number) => (
                          <Cell 
                            key={`tax-cell-${index}`} 
                            fill={`url(#${entry.gradientId || `taxGrad-${index}`})`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div style={{
                ...styles.emptyState,
                padding: "50px 30px",
                background: `linear-gradient(135deg, ${colors.backgroundAlt} 0%, ${colors.background} 100%)`,
                borderRadius: "12px",
                border: `2px dashed ${colors.border}`,
              }}>
                <Wallet size={32} style={{ color: colors.textLight, marginBottom: "12px" }} />
                <p style={{ ...styles.emptyText, fontSize: "15px", fontWeight: 500, marginBottom: "6px" }}>
                  No tax item breakdown available
                </p>
                <p style={{ fontSize: "13px", color: colors.textLight }}>
                  Ensure tax items are properly categorized in collection entries
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Top & Bottom Performers - Side by Side with Avatars */}
        <div style={styles.grid2Col} className="chart-grid-2">
          {/* ✨ Top 5 Performers with Avatar Badges */}
          <div style={{
            ...styles.chartCard,
            animation: chartAnimation ? "slideIn 0.6s ease forwards 0.6s" : "none",
            opacity: chartAnimation ? 1 : 0,
          }}>
            <div style={styles.chartHeader}>
              <h4
                className="chart-title" 
                style={{ 
                ...styles.chartTitle, 
                color: colors.success,
                display: "flex", 
                alignItems: "center", 
                gap: "8px" 
              }}>
                <ArrowUpRight size={18} />
                Top 5 Performance
              </h4>
              <span style={{
                fontSize: "12px",
                fontWeight: 600,
                color: colors.success,
                background: "rgba(22, 163, 74, 0.12)",
                padding: "5px 12px",
                borderRadius: "8px",
              }}>
                Highest Collections
              </span>
            </div>
            {topPerformersData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  layout="vertical" 
                  data={topPerformersData.slice(0, 5)}
                  margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                  barGap={8}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    horizontal={true} 
                    vertical={false} 
                    stroke={colors.borderLight}
                    strokeOpacity={0.4}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="station_name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: colors.text, fontSize: 12, fontWeight: 600 }}
                    width={80}
                    tickFormatter={(name: string) =>
                      name.length > 12
                        ? `${name.slice(0, 12)}...`
                        : name
                    }
                  />
                  <Tooltip 
                    content={<CustomTooltip formatter={formatCurrency} />}
                    cursor={{ fill: colors.backgroundAlt, opacity: 0.5 }}
                  />
                  <Bar 
                    dataKey="amount" 
                    name="Collection"
                    fill={colors.chart1}
                    radius={[0, 8, 8, 0]}
                    barSize={40}
                    animationDuration={chartAnimation ? 800 : 0}
                  >
                    <LabelList
                      dataKey="amount"
                      position="center"
                      style={{ 
                        fill: colors.text, 
                        fontSize: 12, 
                        fontWeight: 700,
                        fontFamily: "monospace",
                      }}
                      formatter={(value: any) => formatCurrency(Number(value || 0))}
                    />
                    {topPerformersData.slice(0, 5).map((entry: any, index: number) => (
                      <Cell 
                        key={`top-${index}`} 
                        fill={index === 0 ? colors.accent : index === 1 ? colors.accentLight : colors.chart1}
                        style={{
                          filter: index === 0 ? `drop-shadow(0 4px 12px ${colors.glowGreen})` : "none",
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No top performers data available</p>
              </div>
            )}
          </div>

          {/* ✨ Bottom 5 Performers with Attention Indicator */}
          <div style={{
            ...styles.chartCard,
            animation: chartAnimation ? "slideIn 0.6s ease forwards 0.7s" : "none",
            opacity: chartAnimation ? 1 : 0,
          }}>
            <div style={styles.chartHeader}>
              <h4
                className="chart-title" 
                style={{ 
                ...styles.chartTitle, 
                color: colors.danger,
                display: "flex", 
                alignItems: "center", 
                gap: "8px" 
              }}>
                <ArrowDownRight size={18} />
                Bottom 5 Performers
              </h4>
              <span style={{
                fontSize: "12px",
                fontWeight: 600,
                color: colors.warning,
                background: "rgba(202, 138, 4, 0.12)",
                padding: "5px 12px",
                borderRadius: "8px",
              }}>
               Lowest Collections
              </span>
            </div>
            {bottomPerformersData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  layout="vertical" 
                  data={bottomPerformersData.slice(0, 5)}
                  margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
                  barGap={8}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    horizontal={true} 
                    vertical={false} 
                    stroke={colors.borderLight}
                    strokeOpacity={0.4}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="station_name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: colors.text, fontSize: 12, fontWeight: 600 }}
                    width={80}
                    tickFormatter={(name: string) =>
                      name.length > 12
                        ? `${name.slice(0, 12)}...`
                        : name
                    }
                  />
                  <Tooltip 
                    content={<CustomTooltip formatter={formatCurrency} />}
                    cursor={{ fill: colors.backgroundAlt, opacity: 0.5 }}
                  />
                  <Bar 
                    dataKey="amount" 
                    name="Collection"
                    fill={colors.chart5}
                    radius={[0, 8, 8, 0]}
                    barSize={40}
                    animationDuration={chartAnimation ? 800 : 0}
                  >
                    <LabelList
                      dataKey="amount"
                      position="center"
                      style={{ 
                        fill: colors.text, 
                        fontSize: 12, 
                        fontWeight: 700,
                        fontFamily: "monospace",
                      }}
                      formatter={(value: any) => formatCurrency(Number(value || 0))}
                    />
                    {bottomPerformersData.slice(0, 5).map((entry: any, index: number) => (
                      <Cell 
                        key={`bottom-${index}`} 
                        fill={index === 4 ? colors.danger : index === 3 ? "#f87171" : colors.chart5}
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No performance data requiring attention</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ✨ Polished & Responsive Styles Object
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: '"Inter", "Segoe UI", Roboto, -apple-system, sans-serif',
    minHeight: "100vh",
    padding: "24px 4%",
    maxWidth: "100%",
    width: "100%",
    overflowX: "clip",
    boxSizing: "border-box",
    transition: "background 0.3s ease",
  },
  header: {
    marginBottom: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: `linear-gradient(135deg, #022c22 0%, #047857 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "22px",
    fontWeight: 700,
    boxShadow: "0 6px 20px rgba(4, 120, 87, 0.4)",
    transition: "transform 0.3s ease",
  },
  headerTitle: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#022c22",
    margin: 0,
    letterSpacing: "-0.02em",
    lineHeight: 1.3,
  },
  headerSub: {
    fontSize: "14px",
    color: "#065f46",
    margin: "4px 0 0 0",
    fontWeight: 500,
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "9999px",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    border: "1px solid #bbf7d0",
    transition: "all 0.2s ease",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    animation: "pulse 2s infinite",
    boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.3)",
  },
  liveText: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#10b981",
  },
  downloadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "12px",
    background: `linear-gradient(135deg, #047857 0%, #022c22 100%)`,
    color: "white",
    border: "none",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 14px rgba(4, 120, 87, 0.3)",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
    gap: "14px",
    marginBottom: "30px",
    width: "100%",
  },
  kpiCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(8px)",
    padding: "20px 22px",
    borderRadius: "16px",
    border: "1px solid #bbf7d0",
    boxShadow: "0 4px 16px rgba(2, 44, 34, 0.08)",
    position: "relative",
    overflow: "hidden",
  },
  kpiLabel: {
    color: "#065f46",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  kpiValue: {
    fontSize: "clamp(16px, 4vw, 26px)",
    fontWeight: 700,
    color: "#022c22",
    margin: 0,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  kpiSub: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
    fontWeight: 500,
  },
  chartCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(8px)",
    padding: "clamp(16px, 3vw, 24px)", 
    borderRadius: "18px",
    border: "1px solid #bbf7d0",
    boxSizing: "border-box",
    boxShadow: "0 4px 20px rgba(2, 44, 34, 0.08)",
    marginBottom: "24px",
    width: "100%",
    overflow: "hidden", 
  },
  chartHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#022c22",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  chartSub: {
    fontSize: "13px",
    color: "#065f46",
    margin: "4px 0 0 0",
  },
  grid2Col: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
    gap: "24px",
    marginBottom: "24px",
    width: "100%",
  },
  scrollableChartWrapper: {
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch", 
    scrollbarWidth: "thin", 
    scrollbarColor: "#047857 transparent",
    paddingBottom: "12px",
  },
  exportCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap", 
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
    transition: "all 0.2s",
    color: "white",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 30px",
    color: "#6b7280",
  },
  emptyText: {
    fontSize: "14px",
    margin: 0,
  },
};