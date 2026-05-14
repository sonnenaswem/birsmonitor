"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Search,
  Users, 
  UserPlus, 
  Target, 
  BarChart3, 
  Trophy, 
  PenLine, 
  History, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    setUserRole(localStorage.getItem("role"));
  }, []);

  const handleLogout = () => {
    deleteCookie("access");
    deleteCookie("refresh");
    localStorage.clear();
    router.push("/");
  };

  const getMenuItems = () => {
    const oversightItems = [
      { name: "Dashboard", icon: <LayoutDashboard size={22} />, path: "/admin-dashboard" },
      { name: "View All Entries", icon: <Search size={22} />, path: "/view-all-entries" },
      { name: "League Table", icon: <Trophy size={22} />, path: "/league-table" },
    ];

    if (userRole === "admin") {
      return [
        { name: "Dashboard", icon: <LayoutDashboard size={22} />, path: "/admin-dashboard" },
        { name: "View All Entries", icon: <Search size={22} />, path: "/view-all-entries" },
        { name: "League Table", icon: <Trophy size={22} />, path: "/league-table" },
        { name: "Create User", icon: <UserPlus size={22} />, path: "/create-user" },
        { name: "Create ATO & Targets", icon: <Target size={22} />, path: "/create-ato" },
        { name: "Manage Users", icon: <Users size={22} />, path: "/manage-users" },
      ];
    }
    
    if (userRole === "auditor") {
      return [
        { name: "Dashboard", icon: <LayoutDashboard size={22} />, path: "/admin-dashboard" },
        { name: "View All Entries", icon: <Search size={22} />, path: "/view-all-entries" },
        { name: "League Table", icon: <Trophy size={22} />, path: "/league-table" },
      ];
    }

    if (userRole === "director") {
      return oversightItems;
    }
    if (userRole === "assistant") {
      return [
        { name: "Dashboard", icon: <LayoutDashboard size={22} />, path: "/admin-dashboard" },
        { name: "View All Entries", icon: <Search size={22} />, path: "/view-all-entries" },
        { name: "League Table", icon: <Trophy size={22} />, path: "/league-table" }, 
        { name: "Create ATO & Targets", icon: <Target size={22} />, path: "/create-ato" },
      ];
    }
    // ATO Terminal
    return [
      { name: "Dashboard", icon: <LayoutDashboard size={22} />, path: "/ato-dashboard" },
      { name: "Enter Tax Data", icon: <PenLine size={22} />, path: "/enter-tax-data" },
      { name: "My Submissions", icon: <History size={22} />, path: "/view-entries" },
    ];
  };

  const menuItems = getMenuItems();

  if (!mounted) return null;

  const isDesktop = typeof window !== "undefined" && window.innerWidth > 768;

  // HELPER FUNCTION: This is now outside the styles object to fix the TS error
  const getNavItemStyle = (active: boolean): React.CSSProperties => ({
    padding: isCollapsed ? "12px 0" : "12px 18px",
    margin: "4px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: isCollapsed ? "center" : "flex-start",
    cursor: "pointer",
    borderRadius: "12px",
    backgroundColor: active ? "rgba(52, 211, 153, 0.15)" : "transparent",
    color: active ? "#34d399" : "#a7f3d0",
    transition: "all 0.2s ease",
    fontWeight: active ? "700" : "500",
    fontSize: "15px",
    borderLeft: active ? "4px solid #34d399" : "4px solid transparent",
  });

  const styles: Record<string, React.CSSProperties> = {
    wrapper: { display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" },
    sidebar: {
      width: isCollapsed ? "85px" : "280px",
      backgroundColor: "#052e16",
      color: "white",
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      height: "100vh",
      zIndex: 100,
      left: isDesktop ? "0" : (isMobileOpen ? "0" : "-280px"),
      boxShadow: "4px 0 24px rgba(0,0,0,0.2)",
    },
    content: {
      flex: 1,
      marginLeft: isDesktop ? (isCollapsed ? "85px" : "280px") : "0",
      padding: "30px",
      transition: "margin-left 0.3s ease",
    },
    mobileOverlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: !isDesktop && isMobileOpen ? "block" : "none",
      zIndex: 90,
      backdropFilter: "blur(4px)",
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.mobileOverlay} onClick={() => setIsMobileOpen(false)} />

      <aside style={styles.sidebar}>
        <div style={{ padding: "35px 20px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <img 
            src="/logo5.png" 
            alt="BIRS" 
            style={{ 
              height: isCollapsed ? "25px" : "90px", 
              transition: "all 0.3s ease",
              marginBottom: isCollapsed ? "0" : "12px"
            }} 
          />
          {!isCollapsed && (
            <div>
              <div style={{ fontWeight: "900", fontSize: "18px", color: "#10b9a5", letterSpacing: "0.5px" }}>PERFORMANCE</div>
              <div style={{ fontSize: "14px", fontWeight: "600", opacity: 0.6, letterSpacing: "1px" }}>MONITORING PORTAL</div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, marginTop: "20px" }}>
          {menuItems.map((item) => (
            <div 
              key={item.name} 
              style={getNavItemStyle(pathname === item.path)}
              onClick={() => {
                router.push(item.path);
                setIsMobileOpen(false);
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                marginRight: isCollapsed ? "0" : "14px",
                color: pathname === item.path ? "#34d399" : "inherit"
              }}>
                {item.icon}
              </div>
              {!isCollapsed && <span>{item.name}</span>}
            </div>
          ))}
        </nav>

        <div 
          style={{ 
            ...getNavItemStyle(false), 
            marginTop: "auto",
            marginBottom: "30px",
            color: "#fca5a5",
          }}
          onClick={handleLogout}
        >
          <div style={{ marginRight: isCollapsed ? "0" : "14px" }}><LogOut size={22} /></div>
          {!isCollapsed && <span>Logout</span>}
        </div>
      </aside>

      <main style={styles.content}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "40px", gap: "18px" }}>
          <button 
            onClick={() => isDesktop ? setIsCollapsed(!isCollapsed) : setIsMobileOpen(!isMobileOpen)}
            style={{ 
              width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", background: "white", border: "1px solid #e2e8f0", borderRadius: "10px",
              color: "#052e16"
            }}
          >
            {!isDesktop && isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0, color: "#052e16" }}>
              {userRole === "admin" || userRole === "director" ? "Administrative Oversight" : "Tax Officer Terminal"}
            </h2>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Benue State Internal Revenue Service</p>
          </div>
        </div>
        
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
          {children}
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
