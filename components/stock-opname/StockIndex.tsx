"use client";

import { useStockData } from "@/hooks/useStockData";
import { formatDate } from "@/utils/formatDate";
import { Package, MapPin, Clock, AlertCircle, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";

export default function StockIndex() {
  const { data, loading, error, refetch } = useStockData();
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Logic Filter
  const filtered = data.filter((s) => {
    const rackName = s.rack_number ?? "";
    const soId = s.id ?? "";
    const matchesSearch =
      rackName.toLowerCase().includes(search.toLowerCase()) ||
      soId.toLowerCase().includes(search.toLowerCase());

    const sDate = new Date(s.stockopname_date);
    const matchesDate =
      (!startDate || sDate >= new Date(startDate)) &&
      (!endDate || sDate <= new Date(endDate));

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <div className="bg-white rounded-xl p-8 shadow-sm text-blue-500">
          <Clock className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p>Memuat riwayat stock opname...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <div className="bg-white rounded-xl p-8 shadow-sm text-red-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-4" />
          <p>Error: {error}</p>
          <button onClick={refetch} className="mt-4 text-blue-600 underline">
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-row justify-between items-center mb-2">
        <h1 className="xl:text-3xl text-xl text-gray-900">Stock Opname</h1>
        <Button>
          <Link href={"/stockopname/new"}>+ Stock Opname</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari No. SO atau Rak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          {(search || startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStartDate("");
                setEndDate("");
              }}>
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-primary text-primary-foreground border-b border-gray-200">
              <tr>
                <th className="px-6 py-2 text-xs  uppercase">No</th>
                <th className="px-6 py-2 text-xs  uppercase">Tanggal</th>
                <th className="px-6 py-2 text-xs  uppercase">
                  No. Stock Opname
                </th>
                <th className="px-6 py-2 text-xs  uppercase">Rak</th>
                <th className="px-6 py-2 text-xs  uppercase text-center">
                  Jumlah Item
                </th>
                <th className="px-6 py-2 text-xs  uppercase">Akurasi AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((stock, index) => (
                <tr
                  key={stock.id}
                  className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-2 text-sm text-gray-500">
                    <Link href={`stockopname/${stock.id}`}>{index + 1}</Link>
                  </td>
                  <td className="px-6 py-2 text-sm text-gray-700">
                    <Link href={`stockopname/${stock.id}`}>
                      {formatDate(stock.stockopname_date)}
                    </Link>
                  </td>
                  <td className="px-6 py-2 text-sm">
                    <Link href={`stockopname/${stock.id}`}>
                      {stock.no_stockopname || "-"}
                    </Link>
                  </td>
                  <td className="px-6 py-2">
                    <Link href={`stockopname/${stock.id}`}>
                      {stock.rack_number || "-"}
                    </Link>
                  </td>
                  <td className="px-6 py-2 text-center">
                    <Link href={`stockopname/${stock.id}`}>
                      <span className="">{stock.items_count} Item</span>
                    </Link>
                  </td>
                  <td className="px-6 py-2">
                    <Link href={`stockopname/${stock.id}`}>
                      <span className="">{stock.accuracy}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-gray-100">
          {filtered.map((stock, index) => (
            <div key={stock.id} className="p-4">
              <div className="flex justify-between">
                <p className=" ">{formatDate(stock.stockopname_date)}</p>
                <p className="">{stock.no_stockopname || "-"}</p>
              </div>
              <h3 className="font-bold text-primary flex items-center mt-1">
                Rak: {stock.rack_number || "N/A"}
              </h3>
              <div className="flex justify-between items-center">
                <p className="text-gray-900 ">{stock.items_count} Produk</p>
                <Link href={`stockopname/${stock.id}`}>
                  <Button>
                    <Search />
                    Detail
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="p-20 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500">Tidak ada data stock opname.</p>
          </div>
        )}
      </div>
    </div>
  );
}
