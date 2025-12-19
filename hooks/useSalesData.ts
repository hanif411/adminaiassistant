// src/hooks/useSalesData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
// Asumsikan Anda memiliki type yang sama di "@/types/sales"
import {
  SalesApiResponse,
  SalesWithMetrics,
  SalesMetrics,
} from "@/types/sales";

const initialMetrics: SalesMetrics = {
  avg_accuracy_percentage: "0",
  needed_review_count: 0,
  total_invoices_month: 0,
  total_time_saved_hours: 0,
  avg_review_time_seconds: 0,
};

export function useSalesData() {
  const [sales, setSales] = useState<SalesWithMetrics[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // GANTI ENDPOINT KE SALES
      const response = await fetch("/api/sales/getAllSales");

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?redirected_from=/sales";
          return;
        }
        throw new Error("Gagal mengambil data penjualan dan metrik AI.");
      }

      const data: SalesApiResponse = await response.json();

      setSales(data.sales);
      setMetrics(data.metrics);
    } catch (err) {
      console.error("[useSalesData Error]", err);
      setError("Gagal memuat data. Mohon periksa koneksi atau coba refresh.");
      setMetrics(initialMetrics);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    metrics,
    loading,
    error,
    refetch: fetchSales,
  };
}
