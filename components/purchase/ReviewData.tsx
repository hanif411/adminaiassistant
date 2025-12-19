"use client";

import { useMemo } from "react";
import { ExtractedData, ExtractedItem } from "@/types/purchases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { exportPurchasesToExcel } from "@/utils/excel/exportPurchasesToExcel";
import {
  formatCurrency,
  formatDisplayNumber,
  parseRawNumber,
} from "@/utils/formatCurrency";
import { Trash2 } from "lucide-react";

interface ReviewDataProps {
  data: ExtractedData;
  status: "review" | "saving";
  handleMainDataChange: (field: keyof ExtractedData, value: any) => void;
  handleItemChange: (
    index: number,
    field: keyof ExtractedItem,
    value: string | number
  ) => void;
  handleSave: () => void;
  handleAddItem: () => void;
  handleRemoveItem: (index: number) => void;
}

export function ReviewData({
  data,
  status,
  handleMainDataChange,
  handleItemChange,
  handleSave,
  handleAddItem,
  handleRemoveItem,
}: ReviewDataProps) {
  // Perhitungan Subtotal Item Bersih (dari kolom subtotal item)
  const subtotalItems = useMemo(() => {
    return data.items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [data.items]);

  // Perhitungan Grand Total Akhir
  const grandTotal =
    subtotalItems + data.extracted_tax - data.extracted_discount;

  // Konversi tanggal untuk Calendar/DatePicker shadcn
  const purchaseDate = data.purchase_date ? new Date(data.purchase_date) : null;

  return (
    <div className="space-y-2">
      <div className="p-6 border rounded-lg shadow-md bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <Input
              type="text"
              value={data.extracted_supplier_name}
              onChange={(e) =>
                handleMainDataChange("extracted_supplier_name", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              No. Faktur
            </label>
            <Input
              type="text"
              value={data.invoice_number}
              onChange={(e) =>
                handleMainDataChange("invoice_number", e.target.value)
              }
            />
          </div>

          {/* Tanggal Pembelian (Menggunakan shadcn/ui Calendar) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tanggal Pembelian
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${
                    !purchaseDate && "text-muted-foreground"
                  }`}>
                  {purchaseDate ? (
                    format(purchaseDate, "PPP")
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={purchaseDate || undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formattedDate = format(date, "yyyy-MM-dd");
                      handleMainDataChange("purchase_date", formattedDate);
                    } else {
                      handleMainDataChange("purchase_date", "");
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Tabel Item Pembelian */}
      <div className="overflow-x-auto border rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead className="w-[100px]">Kode Item</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead className="w-[80px] text-right">Jumlah</TableHead>
              <TableHead className="w-[80px]">Satuan</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>

                <TableCell>
                  <Input
                    value={item.extracted_code_item || ""}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "extracted_code_item",
                        e.target.value
                      )
                    }
                    className="text-sm"
                  />
                </TableCell>

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
                    step="0.01"
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

                {/* Diskon Item (Nominal) */}

                <TableCell className="text-right font-medium text-gray-700">
                  {/* Kolom Subtotal ini hasil perhitungan dari page.tsx */}

                  <Input
                    type="number"
                    step="0.01"
                    value={formatDisplayNumber(item.subtotal)}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "subtotal",
                        parseRawNumber(e.target.value)
                      )
                    }
                    className="text-right text-sm"
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

      {/* Total Section (FIXED LOGIC) */}
      <div className="flex justify-between gap-2 mb-10">
        {/* Image preview */}
        <div className="w-xl">
          {data.invoice_url ? (
            <div className="relative">
              <img
                src={data.invoice_url}
                alt="Preview Faktur Pembelian"
                className="rounded-lg shadow-lg object-cover"
                onClick={() => window.open(data.invoice_url, "_blank")}
              />
            </div>
          ) : (
            <p className="text-gray-500">URL Faktur tidak tersedia.</p>
          )}
        </div>
        <div className="w-full max-w-sm space-y-2 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between font-medium">
            <span>Subtotal :</span>
            <span>{formatCurrency(subtotalItems)}</span>
          </div>
          {/* PPN / Tax Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              PPN / Tax Total (Rp)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formatDisplayNumber(data.extracted_tax)}
              onChange={(e) =>
                handleMainDataChange(
                  "extracted_tax",
                  parseRawNumber(e.target.value)
                )
              }
            />
          </div>

          {/* Diskon Faktur Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Diskon Faktur Total (Rp)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formatDisplayNumber(data.extracted_discount)}
              onChange={(e) =>
                handleMainDataChange(
                  "extracted_discount",
                  parseRawNumber(e.target.value)
                )
              }
            />
          </div>
          <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2">
            <span>TOTAL </span>
            <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Tombol Aksi (Export dan Save) */}
      <div className="flex gap-4">
        <Button
          onClick={() => exportPurchasesToExcel(data)}
          variant="outline"
          className="flex-1 ">
          Export ke Excel
        </Button>
        <Button
          onClick={handleSave}
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
