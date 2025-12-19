"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function useStockOpnameDetailLogic(opnameId: string) {
  const supabase = createClient();
  const [data, setData] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setIsLoading(true);
        // 1. Ambil data Stock Opname utama
        const { data: mainData, error: e1 } = await supabase
          .from("stockopnames")
          .select("*")
          .eq("id", opnameId)
          .single();

        if (e1) throw e1;

        // 2. Ambil data Items
        const { data: itemsData, error: e2 } = await supabase
          .from("stockopname_items")
          .select("*")
          .eq("stockopname_id", opnameId);

        if (e2) throw e2;

        setData(mainData);
        setItems(itemsData || []);
      } catch (err: any) {
        setError(err.message);
        toast.error("Gagal memuat detail stock opname");
      } finally {
        setIsLoading(false);
      }
    }

    if (opnameId) fetchDetail();
  }, [opnameId]);

  const handleMainDataUpdate = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCellEdit = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddNewItem = () => {
    setItems([
      ...items,
      {
        extracted_product_name: "Produk Baru",
        extracted_quantity: 1,
        price: 0,
      },
    ]);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      // 1. Update Tabel Utama
      const { error: e1 } = await supabase
        .from("stockopnames")
        .update({
          no_stockopname: data.no_stockopname,
          rack_number: data.rack_number,
          stockopname_date: data.stockopname_date,
          review_completion_timestamp: new Date().toISOString(),
        })
        .eq("id", opnameId);

      if (e1) throw e1;

      // 2. Refresh Items (Delete & Re-insert)
      await supabase
        .from("stockopname_items")
        .delete()
        .eq("stockopname_id", opnameId);

      const { error: e2 } = await supabase.from("stockopname_items").insert(
        items.map((item) => ({
          stockopname_id: opnameId,
          extracted_product_name: item.extracted_product_name,
          extracted_quantity: item.extracted_quantity,
          price: item.price || 0,
        }))
      );

      if (e2) throw e2;
      toast.success("Perubahan berhasil disimpan!");
    } catch (err: any) {
      toast.error("Gagal menyimpan: " + err.message);
    }
  };

  return {
    data,
    items,
    isLoading,
    error,
    handleMainDataUpdate,
    handleCellEdit,
    handleAddNewItem,
    handleDeleteItem,
    handleSave,
  };
}
