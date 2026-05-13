"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import DashboardLayout from "@/components/DashboardLayout";

export default function PerformanceSummaryPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/performance-summary/")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <DashboardLayout>
      <h2>📊 Performance Summary</h2>

      {data.map((d, i) => (
        <div key={i}>
          <p>{d.user}</p>
          <p>Target: ₦{d.target}</p>
          <p>Achieved: ₦{d.achieved}</p>
          <p>{d.percentage.toFixed(1)}%</p>
        </div>
      ))}
    </DashboardLayout>
  );
}