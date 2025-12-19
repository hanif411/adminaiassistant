"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useStockOpnameDetailLogic } from "@/hooks/useStockOpnameDetailLogic";
import { toast } from "sonner";
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import HeaderDetail from "@/components/Header/HeaderDetail";
import StockOpnameDetailView from "@/components/stock-opname/StockOpnameDetailView";
import { exportStockOpnameToExcel } from "@/utils/excel/exportStockOpnameToExcel";
import { StockOpname } from "@/types/stock";
import { da } from "date-fns/locale";

export default function StockOpnameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const opnameId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data,
    items,
    isLoading,
    error,
    handleMainDataUpdate,
    handleCellEdit,
    handleAddNewItem,
    handleDeleteItem,
    handleSave,
  } = useStockOpnameDetailLogic(opnameId as string);

  const handleExport = () => {
    if (!data) {
      toast.error("Data transaksi belum dimuat atau tidak valid.");
      return;
    }
    const excelData: StockOpname = {
      ...data,
      stock_items: items,
    };
    exportStockOpnameToExcel(excelData);
  };

  const handleDelete = async () => {
    if (!confirm("Hapus data stock opname ini?")) return;
    const { error } = await supabase
      .from("stockopnames")
      .delete()
      .eq("id", opnameId);
    if (error) return toast.error("Gagal menghapus");
    toast.success("Berhasil dihapus");
    router.push("/stockopname");
  };

  if (isLoading) return <div className="p-20 text-center">Memuat Data...</div>;
  if (error)
    return <div className="p-20 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      <HeaderDashboard />
      <HeaderDetail
        data={{
          ...data,
          invoice_number: data.no_stockopname || `ID: ${data.id.slice(0, 8)}`,
        }}
        onBack={() => router.push("/stockopname")}
        onExport={handleExport}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <StockOpnameDetailView
        data={data}
        items={items}
        onAddItem={handleAddNewItem}
        onDeleteItem={handleDeleteItem}
        onCellUpdate={handleCellEdit}
        onMainDataUpdate={handleMainDataUpdate}
      />
    </>
  );
}
