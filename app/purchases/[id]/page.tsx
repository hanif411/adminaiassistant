"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { usePurchaseDetailLogic } from "@/hooks/usePurchaseDetailLogic";

import PurchaseDetailView from "@/components/purchase/PurchaseDetailView";
import { toast } from "sonner";
import { exportPurchasesToExcel } from "@/utils/excel/exportPurchasesToExcel";
import { ExtractedData } from "@/types/purchases";
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import HeaderDetail from "@/components/Header/HeaderDetail";

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const purchaseId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!purchaseId || purchaseId === undefined) {
    return toast.error("purchase id tidak di temukan");
  }

  const {
    data,
    items,
    editingCell,
    isImageModalOpen,
    subtotalItems,
    setEditingCell,
    setIsImageModalOpen,
    handleCellEdit,
    handleAddNewItem,
    handleDeleteItem,
    handleSave,
    handleMainDataUpdate,
    isLoading,
    error,
  } = usePurchaseDetailLogic(purchaseId);

  const handleBack = () => {
    router.push("/purchases");
  };

  const handleExport = () => {
    if (!data) {
      toast.error("Data transaksi belum dimuat atau tidak valid.");
      return;
    }

    const extractedData: ExtractedData = {
      extracted_supplier_name: data.extracted_supplier_name || "",
      invoice_number: data.invoice_number || "",
      purchase_date: data.purchase_date || "",
      extracted_tax: data.extracted_tax || 0,
      extracted_discount: data.extracted_discount || 0,
      extraction_timestamp: data.created_at,
      items: items,
      invoice_url: data.invoice_url || "",
    };

    exportPurchasesToExcel(extractedData);
  };

  const handleDeleteTransaction = async () => {
    if (!data || !purchaseId) return;

    const id = Array.isArray(purchaseId) ? purchaseId[0] : purchaseId;

    if (
      confirm(
        `Apakah Anda yakin ingin menghapus Faktur #${
          data.invoice_number || data.id.toString().slice(0, 8)
        }? Tindakan ini TIDAK dapat dibatalkan.`
      )
    ) {
      try {
        const { error: deleteError } = await supabase
          .from("purchases")
          .delete()
          .eq("id", id);

        if (deleteError) {
          throw new Error(deleteError.message || "Gagal menghapus transaksi.");
        }

        toast.success("✅ Transaksi berhasil dihapus.");
        router.push("/purchases");
      } catch (err: any) {
        console.error("Gagal menghapus data:", err);
        toast.error(
          `❌ Gagal menghapus transaksi: ${
            err.message || "Kesalahan tak terduga"
          }`
        );
      }
    }
  };

  if (isLoading) {
    // Ganti dengan UI loading Anda yang sebenarnya
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Memuat Detail Pembelian...</p>
      </div>
    );
  }

  if (error || !data) {
    // Ganti dengan UI error Anda yang sebenarnya
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4">
        <h1 className="text-3xl text-red-600 mb-4">Kesalahan Memuat Data</h1>
        <p className="text-lg text-gray-700">
          Detail pembelian tidak ditemukan atau terjadi kesalahan server.
        </p>
        {error && <p className="text-sm text-gray-500 mt-2">Error: {error}</p>}
        <button
          onClick={handleBack}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <>
      <HeaderDashboard />
      <HeaderDetail
        data={data}
        onBack={handleBack}
        onExport={handleExport}
        onSave={handleSave}
        onDelete={handleDeleteTransaction}
      />
      <PurchaseDetailView
        data={data as any}
        items={items}
        subtotalItems={subtotalItems}
        onAddItem={handleAddNewItem}
        onDeleteItem={handleDeleteItem}
        onCellUpdate={handleCellEdit}
        onMainDataUpdate={handleMainDataUpdate}
      />
    </>
  );
}
