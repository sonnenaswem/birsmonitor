"use client";

import { useState } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";

export default function CreateUserAndTarget() {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "", // Office Name
    password: "", // ✅ NEW
    role: "ATO",
    target: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/users/create-officer/", formData);

      setStatus({
        type: "success",
        msg: "ATO Account & Target created successfully!",
      });

      // Reset form
      setFormData({
        full_name: "",
        username: "",
        password: "",
        role: "ATO",
        target: "",
      });

    } catch (err: any) {
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Submission failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h2 style={{ color: "#064e3b", marginBottom: "20px" }}>
          Create ATO (Station-Based)
        </h2>

        {status.msg && (
          <div
            style={{
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              backgroundColor:
                status.type === "success" ? "#dcfce7" : "#fee2e2",
              color:
                status.type === "success" ? "#166534" : "#991b1b",
              whiteSpace: "pre-line"
            }}
          >
            {status.msg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "grid", gap: "20px" }}>
            
            {/* FULL NAME */}
            <div>
              <label style={label}>Officer Full Name</label>
              <input
                type="text"
                style={input}
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>

            {/* USERNAME = OFFICE */}
            <div>
              <label style={label}>Station / Office Name (Username)</label>
              <input
                type="text"
                placeholder="e.g., KatsinaAla"
                style={input}
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label style={label}>Access Password</label>
              <input
                type="password"
                placeholder="Set login password"
                style={input}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            {/* TARGET */}
            <div>
              <label style={label}>Monthly Target (₦)</label>
              <input
                type="number"
                placeholder="50000000"
                style={{ ...input, fontWeight: "bold" }}
                required
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: e.target.value })
                }
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            style={btn}
          >
            {loading ? "Processing..." : "Create ATO & Set Target"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

const label = {
  display: "block",
  marginBottom: "5px",
  fontWeight: "600",
};

const input = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
};

const btn = {
  width: "100%",
  marginTop: "25px",
  padding: "14px",
  background: "#064e3b",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};