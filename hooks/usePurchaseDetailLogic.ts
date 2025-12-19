// hooks/usePurchaseDetailLogic.ts
import { useState, useMemo, useCallback, useEffect } from "react";
// Import Supabase Client Anda yang asli
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner"; // Tambahkan import toast untuk notifikasi yang lebih baik

// Menggunakan tipe data dari file terpisah
import { PurchaseDetailData, Item, PurchaseBase } from "@/types/purchases";

// Tipe data yang diterima dari Supabase (items adalah array di dalam objek utama)
interface SupabasePurchaseDetail extends PurchaseBase {
  purchase_items: Item[]; // Sesuaikan dengan nama relasi di Supabase Anda
}

export const usePurchaseDetailLogic = (
  purchaseId: string | string[] | undefined
) => {
  // State untuk data utama
  const [data, setData] = useState<PurchaseBase | null>(null); // State untuk item
  const [items, setItems] = useState<Item[]>([]); // State untuk kontrol UI

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{
    rowId: number;
    field: keyof Item;
  } | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const supabase = createClient(); // ********************************************** // 1. IMPLEMENTASI DATA FETCHING DARI SUPABASE // **********************************************

  const fetchPurchaseDetail = useCallback(async () => {
    const id = Array.isArray(purchaseId) ? purchaseId[0] : purchaseId;

    if (!id) {
      setError("ID Transaksi tidak valid.");
      setIsLoading(false);
      return;
    } // Tidak perlu setIsLoading(true) jika ini dipanggil setelah Save, // tapi biarkan saja untuk ensure loading state saat pertama kali load. // if (!data) setIsLoading(true); // Opsional: hanya set loading di awal

    setIsLoading(true);
    setError(null);

    try {
      // Query Supabase: Ambil data purchase dan relasi purchase_items
      const { data: purchase, error: supabaseError } = await supabase
        .from("purchases")
        .select(
          `*, purchase_items (*)` // Mengambil semua kolom dari relasi purchase_items
        )
        .eq("id", id)
        .single();

      if (supabaseError) {
        throw new Error(
          supabaseError.message || "Gagal memuat detail transaksi."
        );
      }

      if (!purchase) {
        throw new Error("Data transaksi tidak ditemukan.");
      } // Transformasi data

      const itemsData: Item[] =
        (purchase as SupabasePurchaseDetail).purchase_items || []; // Hapus items dari object utama sebelum di-set ke state `data`

      const { purchase_items, ...mainData } = purchase;

      setData(mainData as PurchaseBase);
      setItems(itemsData);
    } catch (err: any) {
      const message = err.message || "Terjadi kesalahan saat memuat data.";
      setError(message);
      setData(null);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [purchaseId]); // Jalankan fetching saat komponen dimuat atau ID berubah

  useEffect(() => {
    fetchPurchaseDetail();
  }, [fetchPurchaseDetail]); // ********************************************** // 2. LOGIKA PERHITUNGAN TETAP DINAMIS // **********************************************

  const subtotalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    if (!data) return 0; // Gunakan nilai grand_total yang dihitung dari items, bukan dari data DB awal
    return (
      subtotalItems + (data.extracted_tax || 0) - (data.extracted_discount || 0)
    );
  }, [subtotalItems, data?.extracted_tax, data?.extracted_discount]); // ********************************************** // 3. LOGIKA HANDLER (Perbaikan utama di handleSave) // **********************************************

  const handleCellEdit = useCallback(
    (itemId: number, field: keyof Item, value: string | number) => {
      // Logika perhitungan subtotal lokal tetap sama
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === itemId) {
            const updatedItem = { ...item, [field]: value };

            const safeValue =
              typeof value === "string" &&
              (field === "quantity" || field === "price")
                ? Number(value)
                : value;

            const quantity = (
              field === "quantity" ? safeValue : updatedItem.quantity
            ) as number;
            const price = (
              field === "price" ? safeValue : updatedItem.price
            ) as number;

            if (field === "quantity" || field === "price") {
              // Pastikan perhitungan subtotal menggunakan nilai number yang aman
              updatedItem.subtotal =
                (Number(quantity) || 0) * (Number(price) || 0);
            }

            return updatedItem;
          }
          return item;
        })
      );
    },
    []
  );

  const handleAddNewItem = useCallback(() => {
    // ID sementara (negatif) menandakan item baru
    const newId = Date.now() * -1;
    const newItem: Item = {
      id: newId,
      extracted_product_name: "Produk Baru",
      extracted_code_item: null,
      unit: "Pcs",
      quantity: 1,
      price: 0,
      subtotal: 0,
    };
    setItems((prevItems) => [...prevItems, newItem]);
    setTimeout(() => {
      setEditingCell({ rowId: newId, field: "extracted_product_name" });
    }, 100);
  }, []);

  const handleDeleteItem = useCallback(
    (itemId: number) => {
      if (items.length <= 1) {
        toast.error("Minimal harus ada 1 item dalam faktur.");
        return;
      }
      if (
        window.confirm("Yakin hapus item ini? Simpan untuk menerapkan di DB.")
      ) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      }
    },
    [items.length]
  );

  // hooks/usePurchaseDetailLogic.ts (Ganti fungsi handleSave Anda dengan ini)

  const handleSave = useCallback(async () => {
    if (!data || !purchaseId) return;

    const id = Array.isArray(purchaseId) ? purchaseId[0] : purchaseId;
    setIsLoading(true);

    try {
      // 1. Update data utama
      const purchaseUpdate = {
        ...data,
        grand_total: grandTotal,
      };

      const {
        id: excludedId,
        created_at: excludedCreatedAt,
        ...updatePayload
      } = purchaseUpdate;

      const { error: purchaseError } = await supabase
        .from("purchases")
        .update(updatePayload)
        .eq("id", id);

      if (purchaseError)
        throw new Error(
          `Gagal menyimpan faktur utama: ${purchaseError.message}`
        ); // 2. Persiapan Items untuk Upsert (PERBAIKAN FOKUS DI SINI)

      const itemsToUpsert = items.map((item) => {
        const isNew = item.id < 0;

        // Data item yang akan dikirim, tanpa ID
        const basePayload = {
          purchase_id: data.id,
          extracted_code_item: item.extracted_code_item,
          extracted_product_name: item.extracted_product_name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          subtotal: item.subtotal,
        };

        // Jika item lama (ID positif), tambahkan ID-nya untuk di-upsert
        if (!isNew) {
          return { ...basePayload, id: item.id };
        }
        // Jika item baru (ID negatif), kembalikan payload tanpa ID
        return basePayload;
      }); // 3. Lakukan Upsert dan ambil ID yang baru disimpan/diperbarui

      const { error: itemsError, data: upsertedItems } = await supabase
        .from("purchase_items")
        .upsert(itemsToUpsert, { onConflict: "id" })
        .select("id"); // Hanya perlu ID untuk langkah delete

      if (itemsError)
        throw new Error(`Gagal menyimpan detail item: ${itemsError.message}`); // 4. Implementasi Delete Item (Logika ini sudah benar)

      const currentItemIds = upsertedItems.map((item) => item.id);

      const { data: dbItems, error: fetchError } = await supabase
        .from("purchase_items")
        .select("id")
        .eq("purchase_id", data.id);

      if (fetchError)
        throw new Error(
          `Gagal memverifikasi item untuk dihapus: ${fetchError.message}`
        );

      const idsToDelete = dbItems
        .filter((dbItem) => !currentItemIds.includes(dbItem.id))
        .map((item) => item.id);

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("purchase_items")
          .delete()
          .in("id", idsToDelete);

        if (deleteError)
          throw new Error(`Gagal menghapus item lama: ${deleteError.message}`);
      } // 5. RE-FETCH DATA UNTUK REFRESH UI
      await fetchPurchaseDetail();
      toast.success("✅ Perubahan berhasil disimpan ke database!");
    } catch (error: any) {
      console.error("Gagal menyimpan data:", error);
      toast.error(
        `❌ Gagal menyimpan perubahan: ${
          error instanceof Error ? error.message : "Kesalahan tak terduga"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, [data, items, grandTotal, purchaseId, supabase, fetchPurchaseDetail]);

  const handleMainDataUpdate = useCallback((field: string, value: any) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  }, []);
  return {
    // Data & State
    isLoading,
    error, // Gabungkan data utama dengan grandTotal yang dihitung
    data: data
      ? ({
          ...data,
          grand_total: grandTotal, // Pastikan data ini sesuai dengan PurchaseDetailData
        } as PurchaseDetailData)
      : null,
    items,
    editingCell,
    isImageModalOpen,
    subtotalItems, // Handlers

    setEditingCell,
    setIsImageModalOpen,
    handleCellEdit,
    handleAddNewItem,
    handleDeleteItem,
    handleSave,
    handleMainDataUpdate,
  };
};
