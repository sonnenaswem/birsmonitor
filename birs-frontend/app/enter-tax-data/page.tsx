"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";

const fieldMap: Record<string, string[]> = {
  PAYE: ["Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  Withholding: ["Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  Development: ["Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  Business: ["Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  Penalty: ["Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  Interest: ["Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  Personal: ["Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  "Vehicle License": ["Vehicle Type", "Registration Number", "Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  "Hackney Permit": ["Vehicle Type", "Registration Number", "Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  "Road Worthiness": ["Vehicle Type", "Registration Number", "Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  "Learner's Permit": ["Vehicle Type", "Registration Number", "Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  "Plate Number": ["Vehicle Type", "Registration Number", "Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  "New Registration": ["Vehicle Type", "Registration Number", "Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  "Vehicle Registration Booklet": ["Vehicle Type", "Registration Number", "Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  "Proof of Ownership": ["Vehicle Type", "Registration Number", "Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  "Change of Ownership Certificate": ["Vehicle Type", "Registration Number", "Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
  "Heavy Duty Permit": ["Vehicle Type", "Registration Number", "Taxpayer's Name", "Amount", "Date of Remittance", "Remita", "Interswitch"],
};

export default function EnterTaxDataPage() {
  const [taxItem, setTaxItem] = useState("");
  const [roadSubhead, setRoadSubhead] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setFormData((prev) => ({ ...prev, date_of_remittance: today }));
  }, []);

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
        subhead: taxItem === "Road" ? roadSubhead : taxItem,

        taxpayer_name: formData["taxpayer's_name"] || "",
        date_of_remittance: formData["date_of_remittance"] || null,
        vehicle_type: formData["vehicle_type"] || null,
        registration_number: formData["registration_number"] || null,

        remita: formData["remita"] || null,
        interswitch_ref: formData["interswitch"] || null,

        remita_amount: hasRemita ? Number(formData["amount"]) : null,
        interswitch_amount: hasInterswitch ? Number(formData["amount"]) : null,
      };

      await api.post("/tax/entries/", payload);

      alert("Tax entry submitted successfully!");

      setFormData({
        date_of_remittance: new Date().toISOString().slice(0, 10),
      });
      setTaxItem("");
      setRoadSubhead("");
    } catch (err: any) {
      console.log("❌ FULL ERROR:", err.response?.data);
      alert(JSON.stringify(err.response?.data) || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const fields =
    taxItem === "Road"
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
              <option value="Withholding">Withholding Tax</option>
              <option value="Road">Road Taxes</option>
              <option value="Development">Development Levy</option>
              <option value="Business">Business Premises</option>
              <option value="Penalty">Penalty For Offences</option>
              <option value="Interest">Interest On Tax Defaulters</option>
              <option value="Personal">Personal Income Tax</option>
            </select>
          </div>

          {taxItem === "Road" && (
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
                        "Withholding",
                        "Development",
                        "Business",
                        "Penalty",
                        "Interest",
                        "Personal",
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