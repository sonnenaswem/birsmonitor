"use client";

import { useState } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, CheckCircle, AlertCircle, Loader } from "lucide-react";

const TAX_CATEGORIES = [
  { value: "PAYE", label: "PAYE" },
  { value: "WHT", label: "Withholding Tax" },
  { value: "Dev_Levy", label: "Development Levy" },
  { value: "Bus_Prem", label: "Business Premises" },
  { value: "Penalty", label: "Penalty For Offences" },
  { value: "Interest", label: "Interest On Tax Defaulters" },
  { value: "PIT", label: "Personal Income Tax" },
  { value: "Sch_Reg_Ren", label: "School Registration/Renewal" },
  { value: "Sch_Maint_Fees", label: "School Maintenance Fees" },
  { value: "FSC", label: "Fire Service Charge" },
  { value: "Produce", label: "Produce" },
  { value: "Toxic_Emmision", label: "Toxic Emission" },
  { value: "Income_Rate", label: "Income Rate" },
];

const ROAD_SUBTYPES = [
  "Vehicle License",
  "Hackney Permit",
  "Road Worthiness",
  "Learner's Permit",
  "Plate Number",
  "New Registration",
  "Vehicle Registration Booklet",
  "Proof of Ownership",
  "Change of Ownership Certificate",
  "Heavy Duty Permit",
];

interface LookupResult {
  taxpayer_name: string;
  amount: number;
  service_name: string;
  payment_channel: string;
}

type ChannelType = "remita" | "interswitch";
type LookupState = "idle" | "loading" | "found" | "error";

export default function EnterTaxDataPage() {
  const [taxItem, setTaxItem] = useState("");
  const [roadSubhead, setRoadSubhead] = useState("");
  const [channel, setChannel] = useState<ChannelType>("remita");
  const [reference, setReference] = useState("");
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [lookupError, setLookupError] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", msg: "" });

  const effectiveTaxItem =
    taxItem === "Road_Taxes" ? roadSubhead : taxItem;

  const canLookup =
    reference.trim().length >= 6 && effectiveTaxItem;

  const handleLookup = async () => {
    if (!canLookup) return;
    setLookupState("loading");
    setLookupError("");
    setLookupResult(null);

    try {
      const res = await api.get(
        `/api/tax/lookup-reference/?reference=${encodeURIComponent(reference.trim())}`
      );
      setLookupResult(res.data);
      setLookupState("found");
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        "Could not verify this reference. Please check and try again.";
      setLookupError(msg);
      setLookupState("error");
    }
  };

  const handleSubmit = async () => {
    if (!lookupResult || submitting) return;
    setSubmitting(true);
    setSubmitStatus({ type: "", msg: "" });

    try {
      const payload = {
        tax_item: effectiveTaxItem,
        subhead: effectiveTaxItem,
        remita: channel === "remita" ? reference.trim() : null,
        interswitch_ref: channel === "interswitch" ? reference.trim() : null,
      };

      await api.post("/api/tax/entries/", payload);

      setSubmitStatus({
        type: "success",
        msg: `✅ Payment reference recorded successfully.\nTaxpayer: ${lookupResult.taxpayer_name}\nAmount: ₦${lookupResult.amount.toLocaleString()}\nThis entry has been added to your monthly submissions.`,
      });

      // Reset form
      setReference("");
      setLookupResult(null);
      setLookupState("idle");
      setTaxItem("");
      setRoadSubhead("");
    } catch (err: any) {
      const errData = err.response?.data;
      let msg = "Submission failed.";

      if (errData?.remita || errData?.interswitch_ref) {
        msg = "This reference has already been submitted. Duplicate entries are not allowed.";
      } else if (errData?.error) {
        msg = errData.error;
      } else if (typeof errData === "object") {
        const firstKey = Object.keys(errData)[0];
        if (firstKey) msg = `${firstKey}: ${errData[firstKey]}`;
      }

      setSubmitStatus({ type: "error", msg });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box" as const,
  };

  const readOnlyStyle = {
    ...inputStyle,
    background: "#f8fafc",
    color: "#475569",
    cursor: "not-allowed" as const,
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "640px" }}>
        <h2 style={{ color: "#064e3b", marginBottom: "6px", fontSize: "22px", fontWeight: 700 }}>
          New Tax Entry
        </h2>
        <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "14px" }}>
          Enter a payment reference to verify and record a tax payment.
        </p>

        {submitStatus.msg && (
          <div style={{
            padding: "16px",
            borderRadius: "10px",
            marginBottom: "24px",
            background: submitStatus.type === "success" ? "#dcfce7" : "#fee2e2",
            color: submitStatus.type === "success" ? "#166534" : "#991b1b",
            whiteSpace: "pre-line",
            fontSize: "14px",
            lineHeight: 1.6,
          }}>
            {submitStatus.msg}
          </div>
        )}

        {/* Step 1: Tax Category */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "6px", fontSize: "13px", color: "#374151" }}>
            Step 1 — Select Tax Category
          </label>
          <select
            style={inputStyle}
            value={taxItem}
            onChange={(e) => {
              setTaxItem(e.target.value);
              setRoadSubhead("");
              setLookupResult(null);
              setLookupState("idle");
            }}
          >
            <option value="">— Choose category —</option>
            {TAX_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
            <option value="Road_Taxes">Road Taxes</option>
          </select>
        </div>

        {taxItem === "Road_Taxes" && (
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "6px", fontSize: "13px", color: "#374151" }}>
              Road Tax Type
            </label>
            <select
              style={inputStyle}
              value={roadSubhead}
              onChange={(e) => setRoadSubhead(e.target.value)}
            >
              <option value="">— Choose subtype —</option>
              {ROAD_SUBTYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* Step 2: Payment Channel */}
        {effectiveTaxItem && (
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "8px", fontSize: "13px", color: "#374151" }}>
              Step 2 — Payment Channel
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              {(["remita", "interswitch"] as ChannelType[]).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => {
                    setChannel(ch);
                    setReference("");
                    setLookupResult(null);
                    setLookupState("idle");
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: `2px solid ${channel === ch ? "#047857" : "#cbd5e1"}`,
                    background: channel === ch ? "#ecfdf5" : "white",
                    color: channel === ch ? "#047857" : "#64748b",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {ch === "remita" ? "Remita" : "Interswitch"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Reference Lookup */}
        {effectiveTaxItem && (
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "6px", fontSize: "13px", color: "#374151" }}>
              Step 3 — Enter Payment Reference
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                type="text"
                placeholder={channel === "remita" ? "Enter RRR (Remita Retrieval Reference)" : "Enter Interswitch reference"}
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value);
                  setLookupResult(null);
                  setLookupState("idle");
                  setLookupError("");
                }}
                onKeyDown={(e) => { if (e.key === "Enter") handleLookup(); }}
              />
              <button
                type="button"
                onClick={handleLookup}
                disabled={!canLookup || lookupState === "loading"}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: canLookup ? "#047857" : "#e2e8f0",
                  color: canLookup ? "white" : "#94a3b8",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: canLookup ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {lookupState === "loading" ? (
                  <><Loader size={14} /> Verifying...</>
                ) : (
                  <><Search size={14} /> Verify</>
                )}
              </button>
            </div>

            {/* Lookup error */}
            {lookupState === "error" && (
              <div style={{
                marginTop: "10px",
                padding: "12px",
                borderRadius: "8px",
                background: "#fef2f2",
                color: "#991b1b",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <AlertCircle size={14} />
                {lookupError}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Verified Details */}
        {lookupState === "found" && lookupResult && (
          <div style={{
            marginBottom: "24px",
            padding: "20px",
            borderRadius: "12px",
            border: "2px solid #bbf7d0",
            background: "#f0fdf4",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              color: "#15803d",
              fontWeight: 700,
              fontSize: "14px",
            }}>
              <CheckCircle size={16} />
              Payment Verified — Please confirm the details below
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "Taxpayer Name", value: lookupResult.taxpayer_name },
                { label: "Amount", value: `₦${lookupResult.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                { label: "Service / Item", value: lookupResult.service_name || effectiveTaxItem },
                { label: "Channel", value: lookupResult.payment_channel || channel.toUpperCase() },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "4px" }}>
                    {label}
                  </label>
                  <input
                    readOnly
                    value={value}
                    style={readOnlyStyle}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                border: "none",
                background: submitting ? "#94a3b8" : "#15803d",
                color: "white",
                fontWeight: 700,
                fontSize: "15px",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Confirm & Submit Record"}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}