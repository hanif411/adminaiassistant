// File: src/hooks/usePurchasesData.ts

import { useState, useEffect, useCallback } from "react";
import {
  PurchasesApiResponse,
  PurchaseWithMetrics,
  PurchasesMetrics,
} from "@/types/purchases";

// Definisikan nilai default untuk metrik agar tidak terjadi error saat loading
const initialMetrics: PurchasesMetrics = {
  avg_accuracy_percentage: "0",
  needed_review_count: 0,
  total_invoices_month: 0,
  total_time_saved_hours: 0,
  avg_review_time_seconds: 0,
};

export function usePurchasesData() {
  const [purchases, setPurchases] = useState<PurchaseWithMetrics[]>([]);
  const [metrics, setMetrics] = useState<PurchasesMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi fetch yang dipisahkan dan bisa dipanggil ulang
  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint ini diasumsikan endpoint baru yang mengembalikan data purchases DAN metrics
      const response = await fetch("/api/purchases/getAllPurchases");

      if (!response.ok) {
        if (response.status === 401) {
          // Contoh redirect jika tidak terautentikasi
          window.location.href = "/login?redirected_from=/purchases";
          return;
        }
        throw new Error("Gagal mengambil data transaksi dan metrik AI.");
      }

      const data: PurchasesApiResponse = await response.json();

      setPurchases(data.purchases);
      setMetrics(data.metrics);
    } catch (err) {
      console.error("[usePurchasesData Error]", err);
      setError("Gagal memuat data. Mohon periksa koneksi atau coba refresh.");
      setMetrics(initialMetrics); // Reset metrics on error
      setPurchases([]); // Clear purchases on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Panggil fetch saat komponen dimuat
  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return {
    purchases,
    metrics,
    loading,
    error,
    refetch: fetchPurchases, // Memberikan fungsi untuk refresh data secara manual
  };
}
