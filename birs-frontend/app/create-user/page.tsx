"use client";
import { useState } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";

export default function CreateAdminUser() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    role: "director", // Options: DIRECTOR, AUDITOR
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      // Endpoint for internal administrative staff (No Target needed)
      await api.post("/api/users/create-admin/", formData);
      setStatus({ type: "success", msg: `${formData.role} account created successfully!` });
    } catch (err: any) {
      setStatus({ type: "error", msg: err.response?.data?.detail || "Failed to create administrative account." });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    outline: "none",
    marginTop: "5px",
    fontSize: "0.95rem"
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: "25px" }}>
          <h2 style={{ color: "#064e3b", margin: "0 0 5px 0" }}>Create Administrative Staff</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Register Directors or Auditors with system oversight privileges.</p>
        </div>
        
        {status.msg && (
          <div style={{ 
            padding: "15px", borderRadius: "12px", marginBottom: "20px",
            backgroundColor: status.type === "success" ? "#dcfce7" : "#fee2e2",
            color: status.type === "success" ? "#166534" : "#991b1b",
            fontWeight: "500", border: `1px solid ${status.type === "success" ? "#bbf7d0" : "#fecaca"}`
          }}>
            {status.type === "success" ? "✅" : "⚠️"} {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "white", padding: "35px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "600", color: "#334155" }}>Staff Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Dr. Terlumun Akwa" 
              style={inputStyle} 
              required 
              onChange={e => setFormData({...formData, full_name: e.target.value})} 
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
            <div>
              <label style={{ fontWeight: "600", color: "#334155" }}>System Role</label>
              <select 
                style={inputStyle} 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="DIRECTOR">Director</option>
                <option value="AUDITOR">Auditor</option>
                <option value="SUPERADMIN">Super Admin</option>
              </select>
            </div>
            <div>
              <label style={{ fontWeight: "600", color: "#334155" }}>Email Address</label>
              <input 
                type="email" 
                placeholder="staff@birs.be.gov.ng" 
                style={inputStyle} 
                required 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "30px" }}>
            <div>
              <label style={{ fontWeight: "600", color: "#334155" }}>Username</label>
              <input 
                type="text" 
                style={inputStyle} 
                required 
                onChange={e => setFormData({...formData, username: e.target.value})} 
              />
            </div>
            <div>
              <label style={{ fontWeight: "600", color: "#334155" }}>Access Password</label>
              <input 
                type="password" 
                style={inputStyle} 
                required 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: "100%", 
              padding: "14px", 
              background: "#064e3b", 
              color: "white", 
              border: "none", 
              borderRadius: "10px", 
              fontWeight: "700", 
              cursor: "pointer",
              transition: "0.2s",
              boxShadow: "0 4px 12px rgba(6, 78, 59, 0.2)"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#065f46"}
            onMouseOut={(e) => e.currentTarget.style.background = "#064e3b"}
          >
            {loading ? "Creating Profile..." : "Confirm Staff Registration"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}