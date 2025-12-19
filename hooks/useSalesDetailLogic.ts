"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { ExtractedSalesData, SalesItem } from "@/types/sales";
import { toast } from "sonner";

export function useSalesDetailLogic(salesId: string) {
  const supabase = createClient();
  const [data, setData] = useState<any>(null);
  const [items, setItems] = useState<SalesItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSalesDetail() {
      try {
        setIsLoading(true);
        // 1. Ambil data Sales utama
        const { data: salesData, error: salesError } = await supabase
          .from("sales")
          .select("*")
          .eq("id", salesId)
          .single();

        if (salesError) throw salesError;

        // 2. Ambil data Items
        const { data: itemsData, error: itemsError } = await supabase
          .from("sales_items")
          .select("*")
          .eq("sales_id", salesId);

        if (itemsError) throw itemsError;

        setData(salesData);
        setItems(
          itemsData.map((item) => ({
            ...item,
            extracted_product_name: item.product_name, // Mapping ke interface UI
            price: item.unit_price,
          }))
        );
      } catch (err: any) {
        setError(err.message);
        toast.error("Gagal memuat detail penjualan");
      } finally {
        setIsLoading(false);
      }
    }

    if (salesId) fetchSalesDetail();
  }, [salesId]);

  const subtotalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [items]);

  // Fungsi Update Data Utama (Customer name, date, dll)
  const handleMainDataUpdate = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Fungsi Update Cell Item (Qty, Price, dll)
  const handleCellEdit = (
    index: number,
    field: keyof SalesItem,
    value: any
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddNewItem = () => {
    const newItem: SalesItem = {
      extracted_product_name: "Produk Baru",
      quantity: 1,
      unit: "PCS",
      price: 0,
    };
    setItems([...items, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      // 1. Update Tabel Sales
      const { error: updateError } = await supabase
        .from("sales")
        .update({
          customer_name: data.customer_name,
          order_date: data.order_date,
          notes: data.notes,
          additional_cost: data.additional_cost,
          subtotal_items: subtotalItems,
          grand_total: subtotalItems + (data.additional_cost || 0),
        })
        .eq("id", salesId);

      if (updateError) throw updateError;

      // 2. Delete item lama & Insert item baru (Cara paling aman)
      await supabase.from("sales_items").delete().eq("sales_id", salesId);

      const { error: itemsError } = await supabase.from("sales_items").insert(
        items.map((item) => ({
          sales_id: salesId,
          product_name: item.extracted_product_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.price,
          item_subtotal: item.quantity * item.price,
        }))
      );

      if (itemsError) throw itemsError;

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
    subtotalItems,
    handleMainDataUpdate,
    handleCellEdit,
    handleAddNewItem,
    handleDeleteItem,
    handleSave,
  };
}
