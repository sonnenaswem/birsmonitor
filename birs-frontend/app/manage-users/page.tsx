"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";
import { UserCog, Trash2, ShieldCheck, X, Search} from "lucide-react";

interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  area_office?: string;
  is_active: boolean;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newOfficer, setNewOfficer] = useState({ full_name: "", password: "" });
  const [mode, setMode] = useState<"reassign" | "target" | null>(null);
  const [targetValue, setTargetValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = () => {
    api.get("/api/users/").then((res) => setUsers(res.data));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/users/${userId}/manage/`, { action: "change_role", value: newRole });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || "Update failed");
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.patch(`/users/${selectedUser.id}/reassign/`, newOfficer);
      alert("Station refreshed with new officer.");
      setSelectedUser(null);
      setMode(null);
      fetchUsers();
    } catch (err) { alert("Error reassigning station."); }
  };

  const handleTargetChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.patch(`/users/set-target/`, { 
        user: selectedUser.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        target_amount: Number(targetValue)
      });
      alert("Target changed successfully.");
      setSelectedUser(null);
      setMode(null);
      setTargetValue("");
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error changing target.");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.area_office?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const styles = {
    badge: (role: string) => ({
      padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800",
      background: role === "ato" ? "#052e16" : (role === "admin" ? "#dc2626" : "#2563eb"),
      color: "white"
    }),
    table: { width: "100%", borderCollapse: "collapse" as const, background: "white", borderRadius: "12px", overflow: "hidden" }
  };

  return (
    <DashboardLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h1 style={{ fontWeight: "800", color: "#052e16" }}>
          Personnel & Stations
        </h1>

        <div style={{ position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8"
            }}
          />
          <input
            placeholder="Search officer or station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "10px 14px 10px 35px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              width: "280px"
            }}
          />
        </div>
      </div>
      
      <div style={{ marginTop: "25px", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
        <table style={styles.table}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left" }}>Official</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Station</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Access Role</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Change Target</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Management</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "15px" }}>
                  <div style={{ fontWeight: "700" }}>{user.full_name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>@{user.username}</div>
                </td>
                <td style={{ padding: "15px", color: "#475569", fontWeight: "600" }}>
                  {user.username}
                </td>
                <td style={{ padding: "15px" }}>
                  {user.role === "ato" ? (
                    <span style={styles.badge("ato")}>FIXED STATION (ATO)</span>
                  ) : (
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{ padding: "5px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: "600" }}
                    >
                      <option value="admin">Admin</option>
                      <option value="director">Director</option>
                      <option value="auditor">Auditor</option>
                      <option value="assistant">Assistant</option>
                    </select>
                  )}
                </td>
                <td style={{ padding: "15px", textAlign: "center" }}>
                  {user.role === "ato" ? (
                    <button
                      onClick={() => { setSelectedUser(user); setMode("target"); }}
                      style={{ background: "#2563eb", color: "white", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "600" }}
                    >
                      <ShieldCheck size={16} /> Change Target
                    </button>
                  ) : (
                    <span style={{ color: "#64748b", fontSize: "12px" }}>N/A</span>
                  )}
                </td>
                <td style={{ padding: "15px", textAlign: "center" }}>
                  {user.role === "ato" ? (
                    <button 
                      onClick={() => { setSelectedUser(user); setMode("reassign"); }}
                      style={{ background: "#052e16", color: "white", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "600" }}
                    >
                      <UserCog size={16} /> Reassign Officer
                    </button>
                  ) : (
                    <button 
                      onClick={() => { if(confirm("Delete this staff member?")) api.delete(`/users/${user.id}/manage/`).then(fetchUsers); }}
                      style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CHANGE TARGET MODAL */}
      {selectedUser && mode === "target" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "16px", width: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Change Target for {selectedUser.username}</h3>
              <X style={{ cursor: "pointer" }} onClick={() => { setSelectedUser(null); setMode(null); }} />
            </div>
            <form onSubmit={handleTargetChange}>
              <input 
                type="number"
                placeholder="New Target Amount" 
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                style={{ width: "100%", padding: "12px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              <button type="submit" style={{ width: "100%", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: "700" }}>
                Confirm Target Change
              </button>
            </form>
          </div>
        </div>
      )}

            {/* REASSIGN MODAL */}
      {selectedUser && mode === "reassign" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "16px", width: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Replace Officer: {selectedUser.username}</h3>
              <X style={{ cursor: "pointer" }} onClick={() => { setSelectedUser(null); setMode(null); }} />
            </div>
            <form onSubmit={handleReassign}>
              <input 
                placeholder="New Officer Full Name" 
                style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                onChange={e => setNewOfficer({...newOfficer, full_name: e.target.value})}
              />
              <input 
                type="password"
                placeholder="New Access Password" 
                style={{ width: "100%", padding: "12px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #ccc" }}
                onChange={e => setNewOfficer({...newOfficer, password: e.target.value})}
              />
              <button type="submit" style={{ width: "100%", padding: "12px", background: "#052e16", color: "white", border: "none", borderRadius: "8px", fontWeight: "700" }}>
                Confirm & Void Old Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )}
