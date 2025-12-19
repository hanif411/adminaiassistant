// components/newSales/ReviewSalesData.tsx
"use client";

import { useMemo } from "react";
// Import dari types/sales yang baru
import { ExtractedSalesData, SalesItem } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea untuk Notes
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import {
  formatCurrency,
  formatDisplayNumber,
  parseRawNumber,
} from "@/utils/formatCurrency";
import { exportSalesToExcel } from "@/utils/excel/exportSalesToExcel";

interface ReviewSalesDataProps {
  data: ExtractedSalesData;
  status: "review" | "saving";
  handleMainDataChange: (field: keyof ExtractedSalesData, value: any) => void;
  handleItemChange: (
    index: number,
    field: keyof SalesItem,
    value: string | number
  ) => void;
  handleSave: () => void;
  handleAddItem: () => void;
  handleRemoveItem: (index: number) => void;
}

export function ReviewSalesData({
  data,
  status,
  handleMainDataChange,
  handleItemChange,
  handleSave,
  handleAddItem,
  handleRemoveItem,
}: ReviewSalesDataProps) {
  // Perhitungan Subtotal Item Bersih (Qty * Price)
  const subtotalItems = useMemo(() => {
    return data.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  }, [data.items]);

  // Perhitungan Grand Total Akhir
  const grandTotal = subtotalItems + data.extracted_additional_cost;

  // Konversi tanggal untuk Calendar/DatePicker shadcn
  const orderDate = data.order_date ? new Date(data.order_date) : null;

  // Update state subtotal_items_before_additional_cost saat render
  // Note: Ini akan memicu render ganda, idealnya kalkulasi dilakukan di handleSave,
  // tetapi untuk tampilan review kita hitung di sini.
  if (data.subtotal_items_before_additional_cost !== subtotalItems) {
    // Karena kita tidak bisa memanggil setExtractedData di sini,
    // kita hanya menggunakan useMemo untuk tampilan dan finalisasi dilakukan di handleSave (page.tsx)
  }

  return (
    <div className="space-y-2">
      {/* Image Preview */}

      <div className="p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Pelanggan
            </label>
            <Input
              type="text"
              value={data.extracted_customer_name}
              onChange={(e) =>
                handleMainDataChange("extracted_customer_name", e.target.value)
              }
            />
          </div>

          {/* Tanggal Penjualan (Menggunakan shadcn/ui Calendar) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tanggal Penjualan
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${
                    !orderDate && "text-muted-foreground"
                  }`}>
                  {orderDate ? (
                    format(orderDate, "yyyy-MM-dd")
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={orderDate || undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formattedDate = format(date, "yyyy-MM-dd");
                      handleMainDataChange("order_date", formattedDate);
                    } else {
                      handleMainDataChange("order_date", "");
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Biaya Tambahan Total */}
        </div>
      </div>

      {/* Tabel Item Penjualan */}
      <div className="overflow-x-auto ">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead className="w-[100px] text-right">Jumlah</TableHead>
              <TableHead className="w-[80px]">Satuan</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item, index) => (
              <TableRow key={item.id || index}>
                <TableCell className="font-medium">{index + 1}</TableCell>

                <TableCell>
                  <Input
                    value={item.extracted_product_name}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "extracted_product_name",
                        e.target.value
                      )
                    }
                    className="text-sm"
                  />
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    className="text-right text-sm"
                  />
                </TableCell>

                <TableCell>
                  <Input
                    value={item.unit}
                    onChange={(e) =>
                      handleItemChange(index, "unit", e.target.value)
                    }
                    className="text-sm"
                  />
                </TableCell>

                <TableCell className="text-right">
                  <Input
                    type="number"
                    step="0.01"
                    value={formatDisplayNumber(item.price)}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "price",
                        parseRawNumber(e.target.value)
                      )
                    }
                    className="text-right text-sm"
                  />
                </TableCell>

                {/* Subtotal Baris (Qty * Price) - Dibuat read-only */}
                <TableCell className="text-right font-medium text-gray-700">
                  <Input
                    type="text"
                    readOnly
                    value={formatCurrency(item.quantity * item.price)}
                    className="text-right text-sm bg-gray-100 font-bold"
                  />
                </TableCell>

                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-700 p-2 h-auto w-auto">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-start">
        <Button
          onClick={handleAddItem}
          variant="outline"
          className="border-dashed border-blue-500 text-blue-500 hover:bg-blue-50">
          + Tambah Baris Item Baru
        </Button>
      </div>

      {/* Total Section (SALES LOGIC) */}
      <div className="flex justify-between">
        {data.invoice_url ? (
          <div className="relative">
            <img
              src={data.invoice_url}
              alt="Preview Chat Penjualan"
              className="rounded-lg shadow-lg object-contain"
              onClick={() => window.open(data.invoice_url, "_blank")}
            />
          </div>
        ) : (
          <p className="text-gray-500">URL Dokumen tidak tersedia.</p>
        )}
        <div className="w-full max-w-sm space-y-2 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between font-medium">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotalItems)}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Biaya Tambahan Total
            </label>
            <Input
              type="number"
              step="0.01"
              value={formatDisplayNumber(data.extracted_additional_cost)}
              onChange={(e) =>
                handleMainDataChange(
                  "extracted_additional_cost",
                  parseRawNumber(e.target.value)
                )
              }
            />
          </div>

          {/* Notes/Ringkasan Chat */}
          <div className="col-span-1 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Catatan (Ringkasan Order dari Chat)
            </label>
            <Textarea
              value={data.notes || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleMainDataChange("notes", e.target.value)
              }
              rows={3}
            />
          </div>

          <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2">
            <span>TOTAL</span>
            <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Tombol Aksi (Export dan Save) */}
      <div className="flex gap-4">
        <Button
          onClick={() => exportSalesToExcel(data)}
          variant="outline"
          className="flex-1">
          Export ke Excel
        </Button>
        <Button
          onClick={handleSave}
          disabled={status === "saving" || data.items.length === 0}
          className="flex-1 bg-green-600 text-white hover:bg-green-700">
          {status === "saving" ? "Menyimpan..." : "SIMPAN TRANSAKSI PENJUALAN"}
        </Button>
      </div>
    </div>
  );
}
