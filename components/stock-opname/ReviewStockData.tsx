"use client";

import { StockItem } from "@/app/stockopname/new/page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Trash2,
  Plus,
  Calendar as CalendarIcon,
  Hash,
  MapPin,
  Package,
  Save,
} from "lucide-react";
import { formatDisplayNumber, parseRawNumber } from "@/utils/formatCurrency";
import { exportStockOpnameToExcel } from "@/utils/excel/exportStockOpnameToExcel";

export function ReviewStockData({ data, setData, onSave, isSaving }: any) {
  // Helper untuk update data utama (non-items)
  const handleMainDataChange = (field: string, value: any) => {
    setData({ ...data, [field]: value });
  };

  const updateItem = (index: number, field: keyof StockItem, value: any) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setData({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    setData({
      ...data,
      items: data.items.filter((_: any, i: number) => i !== index),
    });
  };

  const addItem = () => {
    setData({
      ...data,
      items: [
        ...data.items,
        { extracted_product_name: "", extracted_quantity: 1, price: 0 },
      ],
    });
  };

  const stockDate = data.stockopname_date
    ? new Date(data.stockopname_date)
    : new Date();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <h2 className="text-2xl font-bold text-gray-800">
        Review & Konfirmasi Stock Opname
      </h2>

      {/* 1. PREVIEW GAMBAR (PALING ATAS) */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500 italic">
            Bukti Foto / Hasil Scan AI
          </span>
          <Button
            variant="link"
            size="sm"
            onClick={() => window.open(data.image_url, "_blank")}
            className="text-blue-600 h-auto p-0">
            Buka Gambar Penuh
          </Button>
        </div>
        <div className="relative aspect-video md:aspect-[21/9] w-full bg-black flex items-center justify-center">
          <img
            src={data.image_url}
            className="h-full object-contain cursor-zoom-in"
            alt="Preview Stock Opname"
            onClick={() => window.open(data.image_url, "_blank")}
          />
        </div>
      </div>

      {/* 2. DETAIL TRANSAKSI UTAMA (BISA DIEDIT) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl bg-white shadow-sm">
        {/* No Stock Opname */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
            <Hash className="w-3 h-3" /> No. Stock Opname
          </label>
          <Input
            value={data.no_stockopname || ""}
            onChange={(e) =>
              handleMainDataChange("no_stockopname", e.target.value)
            }
            placeholder="Contoh: SO-202310-001"
            className="font-mono"
          />
        </div>

        {/* Tanggal Stock Opname */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
            <CalendarIcon className="w-3 h-3" /> Tanggal Opname
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${
                  !data.stockopname_date && "text-muted-foreground"
                }`}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.stockopname_date ? (
                  format(stockDate, "PPP", { locale: id })
                ) : (
                  <span>Pilih Tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={stockDate}
                onSelect={(date) => {
                  if (date) {
                    const formattedDate = format(date, "yyyy-MM-dd");
                    handleMainDataChange("stockopname_date", formattedDate);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Nomor Rak / Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
            <MapPin className="w-3 h-3" /> Nomor Rak / Area
          </label>
          <Input
            value={data.rack_number || ""}
            onChange={(e) =>
              handleMainDataChange("rack_number", e.target.value)
            }
            placeholder="Input Nomor Rak..."
          />
        </div>
      </div>

      {/* 3. TABEL ITEM */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Rincian Produk ({data.items?.length || 0})
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={addItem}
            className="border-dashed border-blue-500 text-blue-600 hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-1" /> Tambah Baris
          </Button>
        </div>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead className="w-32 text-center">Qty (Fisik)</TableHead>
              <TableHead className="w-40">Harga Satuan</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items?.map((item: StockItem, idx: number) => (
              <TableRow key={idx} className="hover:bg-gray-50/50">
                <TableCell className="text-center text-gray-400 text-sm">
                  {idx + 1}
                </TableCell>
                <TableCell>
                  <Input
                    className="border-none focus-visible:ring-1 shadow-none p-0 h-auto"
                    value={item.extracted_product_name || ""}
                    onChange={(e) =>
                      updateItem(idx, "extracted_product_name", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="text-center font-bold"
                    value={item.extracted_quantity || 0}
                    onChange={(e) =>
                      updateItem(
                        idx,
                        "extracted_quantity",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      Rp
                    </span>
                    <Input
                      type="number"
                      className="pl-7"
                      value={formatDisplayNumber(item.price) || 0}
                      onChange={(e) =>
                        updateItem(idx, "price", parseRawNumber(e.target.value))
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(idx)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 4. ACTIONS */}
      <div className="flex gap-4">
        <Button
          onClick={() => exportStockOpnameToExcel(data)}
          variant="outline"
          className="flex-1 ">
          Export ke Excel
        </Button>
        <Button
          onClick={onSave}
          disabled={status === "saving" || data.items.length === 0}
          className="flex-1">
          {status === "saving"
            ? "Menyimpan..."
            : "SIMPAN TRANSAKSI KE DATABASE"}
        </Button>
      </div>
    </div>
  );
}
