"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function SubmitPayment() {
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await api.post("/payments/submit/", {
        reference,
      });

      setMessage("✅ Payment Verified & Saved");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Error occurred");
    }
  };

  return (
    <div>
      <h2>Submit Payment</h2>

      <input
        className="input"
        placeholder="Enter Payment Reference"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />

      <button className="btn btn-primary" onClick={handleSubmit}>
        Verify & Submit
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}