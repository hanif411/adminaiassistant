"use client";
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
import { Trash2, Plus } from "lucide-react";
import { Button } from "../ui/button";

export default function SalesDetailView({
  data,
  items,
  subtotalItems,
  onAddItem,
  onDeleteItem,
  onCellUpdate,
  onMainDataUpdate,
}: any) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">
            Nama Pelanggan
          </label>
          <Input
            value={data.customer_name}
            onChange={(e) => onMainDataUpdate("customer_name", e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">
            Tanggal Order
          </label>
          <Input
            type="date"
            value={data.order_date}
            onChange={(e) => onMainDataUpdate("order_date", e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead className="w-24">Qty</TableHead>
              <TableHead className="w-24">Unit</TableHead>
              <TableHead>Harga Satuan</TableHead>
              <TableHead>SubTotal</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell>
                  <Input
                    value={item.extracted_product_name}
                    onChange={(e) =>
                      onCellUpdate(
                        idx,
                        "extracted_product_name",
                        e.target.value
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      onCellUpdate(idx, "quantity", Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.unit}
                    onChange={(e) => onCellUpdate(idx, "unit", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={formatDisplayNumber(item.price)}
                    onChange={(e) =>
                      onCellUpdate(idx, "price", parseRawNumber(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Input
                    value={formatDisplayNumber(item.item_subtotal)}
                    onChange={(e) =>
                      onCellUpdate(
                        idx,
                        "item_subtotal",
                        parseRawNumber(e.target.value)
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteItem(idx)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddItem}
            className="gap-2">
            <Plus className="w-4 h-4" /> Tambah Item
          </Button>
        </div>
      </div>

      <div className="flex justify-between">
        {data.invoice_url ? (
          <div className="relative">
            <img
              src={data.invoice_url}
              alt="Preview Chat Penjualan"
              className="rounded-lg shadow-lg object-contain"
            />
          </div>
        ) : (
          <p className="text-gray-500">URL Dokumen tidak tersedia.</p>
        )}
        <div className="w-80 space-y-3 bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between text-sm">
            <span>Subtotal Item:</span>
            <span>{formatCurrency(subtotalItems)}</span>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">
              BIAYA TAMBAHAN
            </label>
            <Input
              type="number"
              value={formatDisplayNumber(data.additional_cost)}
              onChange={(e) =>
                onMainDataUpdate(
                  "additional_cost",
                  parseRawNumber(e.target.value)
                )
              }
              className="text-right"
            />
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 text-blue-600">
            <span>GRAND TOTAL:</span>
            <span>
              {formatCurrency(subtotalItems + (data.additional_cost || 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
