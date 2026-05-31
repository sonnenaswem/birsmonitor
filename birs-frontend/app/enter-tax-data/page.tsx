"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";

const fieldMap: Record<string, string[]> = {
  PAYE: ["Remita", "Interswitch"],
  WHT: ["Remita", "Interswitch"],
  Dev_Levy: ["Remita", "Interswitch"],
  Bus_Prem: ["Remita", "Interswitch"],
  Penalty: ["Remita", "Interswitch"],
  Interest: ["Remita", "Interswitch"],
  PIT: ["Remita", "Interswitch"],
  Sch_Reg_Ren: ["Remita", "Interswitch"],
  Sch_Maint_Fees: ["Remita", "Interswitch"],
  FSC: ["Remita", "Interswitch"],
  Produce: ["Remita", "Interswitch"],
  Toxic_Emmision: ["Remita", "Interswitch"],
  Income_Rate: ["Remita", "Interswitch"],

  "Vehicle License": ["Remita", "Interswitch"],
  "Hackney Permit": ["Remita", "Interswitch"],
  "Road Worthiness": ["Remita", "Interswitch"],
  "Learner's Permit": ["Remita", "Interswitch"],
  "Plate Number": ["Remita", "Interswitch"],
  "New Registration": ["Remita", "Interswitch"],
  "Vehicle Registration Booklet": ["Remita", "Interswitch"],
  "Proof of Ownership": ["Remita", "Interswitch"],
  "Change of Ownership Certificate": ["Remita", "Interswitch"],
  "Heavy Duty Permit": ["Remita", "Interswitch"],
};

export default function EnterTaxDataPage() {
  const [taxItem, setTaxItem] = useState("");
  const [roadSubhead, setRoadSubhead] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });


  const handleChange = (field: string, value: string) => {
    const key = field.replace(/\s+/g, "_").toLowerCase();

    setFormData((prev) => {
      const newData = { ...prev, [key]: value };

      if (key === "remita" && value !== "") {
        newData["interswitch"] = "";
      } else if (key === "interswitch" && value !== "") {
        newData["remita"] = "";
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const hasRemita = !!formData["remita"];
    const hasInterswitch = !!formData["interswitch"];

    if (!hasRemita && !hasInterswitch) {
      alert("Please provide either a Remita or an Interswitch reference.");
      setLoading(false);
      return;
    }

    try {
      // ✅ CLEAN PAYLOAD (THIS FIXES EVERYTHING)
      const payload = {
        
        tax_item: taxItem,
        subhead: taxItem === "Road_Taxes" ? roadSubhead : taxItem,

        remita: formData["remita"] || null,
        interswitch_ref: formData["interswitch"] || null,
      };
      

      await api.post("/api/tax/entries/", payload);

      setStatus({
        type: "success",
        msg: "Reference submitted successfully. Awaiting verification and reconciliation.",
      });


      setFormData({});

      setTaxItem("");
      setRoadSubhead("");
    } catch (err: any) {
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Submission failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fields =
    taxItem === "Road_Taxes"
      ? fieldMap[roadSubhead] || []
      : fieldMap[taxItem] || [];

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: "800px",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h2 style={{ color: "#064e3b", marginBottom: "20px" }}>
          ➕ New Tax Entry
        </h2>
        {status.msg && (
          <div
            style={{
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              backgroundColor:
                status.type === "success" ? "#dcfce7" : "#fee2e2",
              color: status.type === "success" ? "#166534" : "#991b1b",
              whiteSpace: "pre-line",
            }}
          >
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
              Select Tax Category
            </label>
            <select
              style={{ width: "100%", padding: "10px", borderRadius: "6px" }}
              value={taxItem}
              onChange={(e) => {
                setTaxItem(e.target.value);
                setRoadSubhead("");
              }}
              required
            >
              <option value="">— Choose —</option>
              <option value="PAYE">PAYE</option>
              <option value="WHT">Withholding Tax</option>
              <option value="Road_Taxes">Road Taxes</option>
              <option value="Dev_Levy">Development Levy</option>
              <option value="Bus_Prem">Business Premises</option>
              <option value="Penalty">Penalty For Offences</option>
              <option value="Interest">Interest On Tax Defaulters</option>
              <option value="PIT">Personal Income Tax</option>
              <option value="Sch_Reg_Ren">School Registration/Renewal</option>
              <option value="Sch_Maint_Fees">School Maintenance Fees</option>
              <option value="FSC">Fire Service Charge</option>
              <option value="Produce">Produce</option>
              <option value="Toxic_Emmision">Toxic Emmision</option>
              <option value="Income_Rate">Income Rate</option>
            </select>
          </div>

          {taxItem === "Road_Taxes" && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
                Road Tax Type
              </label>
              <select
                style={{ width: "100%", padding: "10px", borderRadius: "6px" }}
                value={roadSubhead}
                onChange={(e) => setRoadSubhead(e.target.value)}
                required
              >
                <option value="">— Choose Subhead —</option>
                {Object.keys(fieldMap)
                  .filter(
                    (k) =>
                      ![
                        "PAYE",
                        "WHT",
                        "Dev_Levy",
                        "Bus_Prem",
                        "Penalty",
                        "Interest",
                        "PIT",
                      ].includes(k)
                  )
                  .map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {fields.map((field) => {
              const fieldKey = field.replace(/\s+/g, "_").toLowerCase();

              return (
                <div key={field}>
                  <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>
                    {field}
                  </label>
                  <input
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      backgroundColor:
                        (fieldKey === "remita" && !!formData["interswitch"]) ||
                        (fieldKey === "interswitch" && !!formData["remita"])
                          ? "#f1f5f9"
                          : "white",
                    }}
                    type={
                      field === "Amount"
                        ? "number"
                        : field.includes("Date")
                        ? "date"
                        : "text"
                    }
                    value={formData[fieldKey] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    disabled={
                      (fieldKey === "remita" && !!formData["interswitch"]) ||
                      (fieldKey === "interswitch" && !!formData["remita"])
                    }
                    placeholder={
                      fieldKey === "remita" || fieldKey === "interswitch"
                        ? "Enter ref if applicable"
                        : ""
                    }
                  />
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "30px",
              width: "100%",
              padding: "15px",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Submitting..." : "Submit Tax Record"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}