"use client";

import { format } from "date-fns";
import { Trash2, Plus } from "lucide-react";

import { Item, PurchaseDetailData } from "@/types/purchases";
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
  formatCurrency,
  formatDisplayNumber,
  parseRawNumber,
} from "@/utils/formatCurrency";

interface PurchaseDetailViewProps {
  data: PurchaseDetailData;
  items: Item[];
  subtotalItems: number;
  onAddItem: () => void;
  onDeleteItem: (itemId: number) => void;
  onCellUpdate: (
    itemId: number,
    field: keyof Item,
    value: string | number
  ) => void;
  onMainDataUpdate: (field: string, value: any) => void;
}

export default function PurchaseDetailView({
  data,
  items,
  subtotalItems,
  onAddItem,
  onDeleteItem,
  onCellUpdate,
  onMainDataUpdate,
}: PurchaseDetailViewProps) {
  const grandTotal =
    subtotalItems + (data.extracted_tax || 0) - (data.extracted_discount || 0);

  return (
    <div className="space-y-2 max-w-[1440px] mx-auto p-4">
      {/* Bagian 1: Detail Transaksi Utama (Grid 3 Kolom) */}
      <div className="p-6 border rounded-lg bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <Input
              type="text"
              value={data.extracted_supplier_name || ""}
              onChange={(e) =>
                onMainDataUpdate("extracted_supplier_name", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              No. Faktur
            </label>
            <Input
              type="text"
              value={data.invoice_number || ""}
              onChange={(e) =>
                onMainDataUpdate("invoice_number", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tanggal Transaksi
            </label>
            <Input
              type="date"
              value={
                data.purchase_date
                  ? format(new Date(data.purchase_date), "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) =>
                onMainDataUpdate("purchase_date", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Bagian 2: Tabel Item (Sama dengan ReviewData) */}
      <div className="overflow-x-auto border rounded-lg shadow-md bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead className="min-w-30 w-[100px]">
                Kode Item
              </TableHead>
              <TableHead className="min-w-50">Nama Produk</TableHead>
              <TableHead className="min-w-20 w-[70px] text-right">Jumlah</TableHead>
              <TableHead className="min-w-24 w-[100px]">Satuan</TableHead>
              <TableHead className="min-w-30 [100px] text-right">Harga</TableHead>
              <TableHead className="min-w-30 text-right">
                Subtotal
              </TableHead>
              <TableHead className="min-w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <Input
                    value={item.extracted_code_item || ""}
                    onChange={(e) =>
                      onCellUpdate(
                        item.id,
                        "extracted_code_item",
                        e.target.value
                      )
                    }
                    className="text-sm h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.extracted_product_name}
                    onChange={(e) =>
                      onCellUpdate(
                        item.id,
                        "extracted_product_name",
                        e.target.value
                      )
                    }
                    className="text-sm h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      onCellUpdate(item.id, "quantity", e.target.value)
                    }
                    className="text-right text-sm h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.unit}
                    onChange={(e) =>
                      onCellUpdate(item.id, "unit", e.target.value)
                    }
                    className="text-sm h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={formatDisplayNumber(item.price)}
                    onChange={(e) =>
                      onCellUpdate(
                        item.id,
                        "price",
                        parseRawNumber(e.target.value)
                      )
                    }
                    className="text-right text-sm h-8"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={formatDisplayNumber(item.subtotal)}
                    onChange={(e) =>
                      onCellUpdate(
                        item.id,
                        "subtotal",
                        parseRawNumber(e.target.value)
                      )
                    }
                    className="text-right text-sm h-8 font-medium"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteItem(item.id)}
                    className="text-red-500 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-start">
        <Button
          onClick={onAddItem}
          variant="outline"
          className="border-dashed border-blue-500 text-blue-500 hover:bg-blue-50">
          <Plus className="w-4 h-4 mr-2" /> Tambah Baris Item Baru
        </Button>
      </div>

      {/* Bagian 3: Image Preview & Summary (Layout Horizontal) */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 mb-10">
        {/* Gambar Faktur */}
        <div className="flex-1">
          <div className="border rounded-lg overflow-hidden bg-gray-100 shadow-sm">
            {data.invoice_url ? (
              <img
                src={data.invoice_url}
                alt="Faktur"
                className="w-full h-auto max-h-[600px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(data.invoice_url, "_blank")}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Gambar tidak tersedia
              </div>
            )}
          </div>
        </div>

        {/* Ringkasan Biaya */}
        <div className="w-full lg:max-w-md space-y-4 p-6 border rounded-lg bg-gray-50 shadow-sm h-fit">
          <h4 className="font-semibold text-gray-700 border-b pb-2">
            Ringkasan Biaya
          </h4>

          <div className="flex justify-between font-medium">
            <span>Subtotal Items:</span>
            <span>{formatCurrency(subtotalItems)}</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              PPN / Tax (Rp)
            </label>
            <Input
              type="number"
              value={formatDisplayNumber(data.extracted_tax) || 0}
              onChange={(e) =>
                onMainDataUpdate(
                  "extracted_tax",
                  parseRawNumber(e.target.value)
                )
              }
              className="bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Diskon Faktur (Rp)
            </label>
            <Input
              type="number"
              value={formatDisplayNumber(data.extracted_discount) || 0}
              onChange={(e) =>
                onMainDataUpdate(
                  "extracted_discount",
                  parseRawNumber(e.target.value)
                )
              }
              className="bg-white"
            />
          </div>

          <div className="flex justify-between font-bold text-2xl border-t pt-4 mt-4 text-gray-900">
            <span>TOTAL:</span>
            <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
