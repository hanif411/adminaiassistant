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
import { Trash2, Plus, Package, MapPin, Hash, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { formatDisplayNumber, parseRawNumber } from "@/utils/formatCurrency";

export default function StockOpnameDetailView({
  data,
  items,
  onAddItem,
  onDeleteItem,
  onCellUpdate,
  onMainDataUpdate,
}: any) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Informasi Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-1">
            <Hash className="w-3 h-3" /> No. Stock Opname
          </label>
          <Input
            value={data.no_stockopname || ""}
            placeholder="Belum ada nomor"
            onChange={(e) => onMainDataUpdate("no_stockopname", e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-1">
            <MapPin className="w-3 h-3" /> Nomor Rak / Area
          </label>
          <Input
            value={data.rack_number || ""}
            onChange={(e) => onMainDataUpdate("rack_number", e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-1">
            <Calendar className="w-3 h-3" /> Tanggal Opname
          </label>
          <Input
            type="date"
            value={data.stockopname_date}
            onChange={(e) =>
              onMainDataUpdate("stockopname_date", e.target.value)
            }
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabel Item */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Package className="w-4 h-4" /> Rincian Produk ({items.length})
            </h3>
          </div>
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="min-w-50">Nama Produk</TableHead>
                <TableHead className="min-w-20 w-32 text-center">
                  Jumlah
                </TableHead>
                <TableHead className="min-w-30 w-40">Harga</TableHead>
                <TableHead className="w-12"></TableHead>
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
                      className="text-center"
                      value={item.extracted_quantity}
                      onChange={(e) =>
                        onCellUpdate(
                          idx,
                          "extracted_quantity",
                          Number(e.target.value)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs text-nowrap">
                        Rp
                      </span>
                      <Input
                        type="number"
                        className="pl-7"
                        value={formatDisplayNumber(item.price) || 0}
                        onChange={(e) =>
                          onCellUpdate(
                            idx,
                            "price",
                            parseRawNumber(e.target.value)
                          )
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteItem(idx)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
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

        {/* Gambar Preview */}
        <div className="w-full lg:w-80 space-y-4">
          <div className="bg-white p-2 rounded-xl border shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 px-2">
              Bukti Foto Rak
            </p>
            {data.image_url ? (
              <img
                src={data.image_url}
                alt="Bukti Stock Opname"
                className="rounded-lg w-full h-auto cursor-zoom-in"
                onClick={() => window.open(data.image_url, "_blank")}
              />
            ) : (
              <div className="h-40 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400 text-xs text-center p-4">
                Gambar tidak tersedia
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
