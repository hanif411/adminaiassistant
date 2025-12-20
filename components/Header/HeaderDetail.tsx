import { PurchaseDetailData } from "@/types/purchases";
import { ArrowLeft, FileSpreadsheet, Save, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

interface HeaderDetailProps {
  data: PurchaseDetailData;
  onBack: () => void;
  onExport: () => void;
  onDelete: () => void;
  onSave: () => void;
}
function HeaderDetail({
  data,
  onBack,
  onExport,
  onDelete,
  onSave,
}: HeaderDetailProps) {
  return (
    <>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl text-gray-900">
                {data.invoice_number ||
                  data.id.toString().slice(0, 8).toUpperCase()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onExport}
              variant={"outline"}
              title="Export Data ke Excel">
              <FileSpreadsheet className="w-4 h-4" />
              <span className=" sm:inline">Export Excel</span>
            </Button>
            <Button
              onClick={onSave}
              className=""
              title="Simpan Perubahan ke Database">
              <Save className="w-4 h-4" />
              <span className=" sm:inline">Simpan</span>
            </Button>
            <Button
              onClick={onDelete}
              variant={"destructive"}
              title="Hapus Transaksi Ini">
              <Trash2 className="w-4 h-4" />
              <span className=" sm:inline">Hapus</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default HeaderDetail;
