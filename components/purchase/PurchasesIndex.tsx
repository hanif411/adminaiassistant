"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, AlertCircle, Search, Eye, Calendar } from "lucide-react";
import { usePurchasesData } from "@/hooks/usePurchasesData";
import { PurchaseWithMetrics } from "@/types/purchases";
import { formatDate } from "@/utils/formatDate";
import { Button } from "../ui/button";

export default function PurchasesIndex() {
  const { purchases, loading, error, refetch } = usePurchasesData();

  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredPurchases = purchases.filter(
    (purchase: PurchaseWithMetrics) => {
      const matchesSearch =
        (purchase.invoice_number &&
          purchase.invoice_number
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (purchase.extracted_supplier_name &&
          purchase.extracted_supplier_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      const matchesSupplier =
        supplierFilter === "all" ||
        purchase.extracted_supplier_name === supplierFilter;

      const pDate = new Date(purchase.purchase_date);
      const matchesDate =
        (!startDate || pDate >= new Date(startDate)) &&
        (!endDate || pDate <= new Date(endDate));

      return matchesSearch && matchesSupplier && matchesDate;
    }
  );

  const uniqueSuppliers = Array.from(
    new Set(purchases.map((p) => p.extracted_supplier_name))
  ).filter((name) => name) as string[];

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Log Pembelian (Purchase)</h1>
        </header>
        <div className="bg-white rounded-xl p-8 shadow-md text-center text-blue-500">
          <Clock className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p>Memuat data transaksi dan metrik kinerja AI...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Log Pembelian (Purchase)</h1>
        </header>
        <div className="bg-white rounded-xl p-8 shadow-md text-center text-red-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-4" />
          <p>{error}</p>
          <button
            onClick={refetch}
            className="mt-4 text-sm font-medium text-teal-600 hover:text-teal-700">
            Coba Refresh Data
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 md:py-2 mt-2">
      <div className="flex md:flex-row items-center justify-between md:items-center gap-4">
        <h1 className="xl:text-3xl text-xl text-gray-900">Pembelian</h1>
        <Button>
          <Link href={"/purchases/new"}>+ Pembelian</Link>
        </Button>
      </div>
      <section className="mb-2">
        <div className="bg-white rounded-lg p-3 sm:p-2 border-1 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-4 col-span-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nomor faktur atau nama supplier..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Supplier Filter */}
            <div className="md:col-span-3 ">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className=" ps-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none w-full appearance-none bg-white">
                <option value="all">Semua Supplier</option>
                {uniqueSuppliers.map((supplier) => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5 flex items-center gap-2 ">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-gray-400 ">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Menampilkan {filteredPurchases.length} dari {purchases.length}{" "}
              faktur
            </span>
            {(searchQuery || supplierFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSupplierFilter("all");
                }}
                className="text-teal-600 hover:text-teal-700">
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </section>
      <section>
        <div className="bg-white overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto border-1 rounded-lg">
            <table className="w-full">
              <thead className="bg-primary text-primary-foreground border-b border-gray-200">
                <tr>
                  <th className="px-6 py-2 text-left text-xs uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-1 text-left text-xs uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-1 text-left text-xs uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-1 text-left text-xs uppercase tracking-wider">
                    Nomor Faktur
                  </th>
                  <th className="px-6 py-1 text-left text-xs uppercase tracking-wider">
                    Jumlah Item
                  </th>
                  <th className="px-6 py-1 text-left text-xs uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPurchases.map((purchase, index) => (
                  <tr
                    className="hover:bg-gray-50 transition-colors"
                    key={purchase.id}>
                    <td className="px-6 py-2 text-sm text-gray-900">
                      <Link href={`purchases/${purchase.id}`}>{index + 1}</Link>
                    </td>
                    <td className="px-6 py-1 text-sm text-gray-900">
                      <Link href={`purchases/${purchase.id}`}>
                        {formatDate(purchase.purchase_date)}
                      </Link>
                    </td>
                    <td className="px-6 py-1 text-sm text-gray-900">
                      <Link href={`purchases/${purchase.id}`}>
                        {purchase.extracted_supplier_name}
                      </Link>
                    </td>
                    <td className="px-6 py-1 text-sm">
                      <Link href={`purchases/${purchase.id}`}>
                        <span className="text-gray-900">
                          {purchase.invoice_number || "-"}
                        </span>
                        <span className="block text-xs text-gray-500">
                          Akurasi: {purchase.accuracy}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-1 text-sm text-gray-900">
                      <Link href={`purchases/${purchase.id}`}>
                        {purchase.purchase_items[0].count} item
                      </Link>
                    </td>
                    <td className="px-6 py-1 text-sm text-gray-900">
                      <Link href={`purchases/${purchase.id}`}>
                        {purchase.total}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Table */}
          <div className="lg:hidden divide-y divide-gray-200">
            {filteredPurchases.map((purchase, index) => (
              <div
                key={purchase.id}
                className="p-4 hover:bg-gray-50 transition-colors rounded-lg border-2">
                <div className="items-start justify-between">
                  <div className="flex justify-between">
                    <p className="text-gray-900">
                      {formatDate(purchase.purchase_date)}
                    </p>
                    <p className="text-end font-bold">{purchase.total}</p>
                  </div>
                  <p className="text-sm text-primary font-bold mt-1">
                    {purchase.extracted_supplier_name}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 ">{purchase.invoice_number}</p>
                    <Link href={`/purchases/${purchase.id}`}>
                      <Button>
                        <Search />
                        Detail
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPurchases.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 mb-2">Tidak ada hasil</h3>
              <p className="text-sm text-gray-500">
                Coba ubah filter atau kata kunci pencarian Anda
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
