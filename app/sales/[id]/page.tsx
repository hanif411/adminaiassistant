"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useSalesDetailLogic } from "@/hooks/useSalesDetailLogic";
import { exportSalesToExcel } from "@/utils/excel/exportSalesToExcel";
import { toast } from "sonner";
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import HeaderDetail from "@/components/Header/HeaderDetail";
import SalesDetailView from "@/components/sales/SalesDetailView";

export default function SalesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const salesId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data,
    items,
    subtotalItems,
    isLoading,
    error,
    handleMainDataUpdate,
    handleCellEdit,
    handleAddNewItem,
    handleDeleteItem,
    handleSave,
  } = useSalesDetailLogic(salesId as string);

  const handleBack = () => router.push("/sales");

  const handleExport = () => {
    if (!data) return;
    // Mapping data ke format yang dibutuhkan export excel
    const excelData = {
      ...data,
      extracted_customer_name: data.customer_name,
      extracted_additional_cost: data.additional_cost,
      items: items,
    };
    exportSalesToExcel(excelData);
  };

  const handleDelete = async () => {
    if (!confirm("Hapus transaksi ini?")) return;
    const { error } = await supabase.from("sales").delete().eq("id", salesId);
    if (error) return toast.error("Gagal menghapus");
    toast.success("Berhasil dihapus");
    router.push("/sales");
  };

  if (isLoading)
    return <div className="p-20 text-center">Memuat Data Penjualan...</div>;
  if (error)
    return <div className="p-20 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      <HeaderDashboard />
      <HeaderDetail
        data={{ ...data, invoice_number: data.customer_name }} // Reuse header component
        onBack={handleBack}
        onExport={handleExport}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <SalesDetailView
        data={data}
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
