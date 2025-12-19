import { useState, useEffect, useCallback } from "react";
import { StockOpname } from "@/types/stock";

export function useStockData() {
  const [data, setData] = useState<StockOpname[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stock-opname/get-all");
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setData(result.stockOpnames);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
