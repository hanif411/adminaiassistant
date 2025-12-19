"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, AlertCircle, Search, Eye } from "lucide-react";
import { useSalesData } from "@/hooks/useSalesData";
import { SalesWithMetrics } from "@/types/sales";
import { formatDate } from "@/utils/formatDate";
import { Button } from "../ui/button";

export default function SalesIndex() {
  const { sales, loading, error, refetch } = useSalesData();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");

  const filteredSales = sales.filter((sale: SalesWithMetrics) => {
    const matchesSearch =
      (sale.customer_name &&
        sale.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sale.order_date &&
        sale.order_date.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCustomer =
      customerFilter === "all" || sale.customer_name === customerFilter;

    const pDate = new Date(sale.order_date);
    const matchesDate =
      (!startDate || pDate >= new Date(startDate)) &&
      (!endDate || pDate <= new Date(endDate));

    return matchesSearch && matchesCustomer && matchesDate;
  });

  const uniqueCustomers = Array.from(
    new Set(sales.map((p) => p.customer_name))
  ).filter((name) => name) as string[];

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Log Penjualan (Sales)
          </h1>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Log Penjualan (Sales)
          </h1>
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl text-gray-900">Penjualan</h1>
        <Button>
          <Link href={"/sales/new"}>+ Penjualan</Link>
        </Button>
      </div>
      <section className="">
        <div className="bg-white  sm:p-2 ">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-1">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nama customer atau tanggal order..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none bg-white">
                <option value="all">Semua Customer</option>
                {uniqueCustomers.map((customer) => (
                  <option key={customer} value={customer}>
                    {customer}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <span className="text-gray-400">s/d</span>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Menampilkan {filteredSales.length} dari {sales.length} order
            </span>
            {(searchQuery || customerFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCustomerFilter("all");
                }}
                className="text-teal-600 hover:text-teal-700">
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="bg-white border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-1 text-left text-xs text-gray-600 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-1 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-1 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-1 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Catatan
                  </th>
                  <th className="px-6 py-1 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Jumlah Item
                  </th>
                  <th className="px-6 py-1 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.map((sale, index) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-1 text-sm text-gray-900">
                      <Link href={`/sales/${sale.id}`}>{index + 1}</Link>
                    </td>
                    <td className="px-6 py-1 text-sm text-gray-900">
                      <Link href={`/sales/${sale.id}`}>
                        {formatDate(sale.order_date)}
                      </Link>
                    </td>
                    <td className="px-6 py-1 text-sm text-gray-900">
                      <Link href={`/sales/${sale.id}`}>
                        {sale.customer_name}
                      </Link>
                    </td>
                    <td className="px-6 py-1 text-sm">
                      <Link href={`/sales/${sale.id}`}>
                        <span className="text-gray-900 truncate block max-w-xs">
                          {sale.notes || "-"}
                        </span>
                        <span className="block text-xs text-gray-500">
                          Akurasi: {sale.accuracy}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-1 text-sm text-gray-900">
                      <Link href={`/sales/${sale.id}`}>
                        {sale.item_count} item
                      </Link>
                    </td>
                    <td className="px-6 py-1 text-sm text-gray-900">
                      <Link href={`/sales/${sale.id}`}>{sale.total}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {filteredSales.map((sale, index) => (
              <div
                key={sale.id}
                className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                    <p className="text-gray-900 mt-1">{sale.customer_name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {sale.notes || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500">Tanggal Order</span>
                    <p className="text-gray-900">{sale.order_date}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Item</span>
                    <p className="text-gray-900">{sale.item_count} item</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total</span>
                    <p className="text-gray-900">{sale.total}</p>
                  </div>
                  {/* <div>
                    <span className="text-gray-500">Akurasi</span>
                    <p className="text-gray-900">{sale.accuracy}</p>
                  </div> */}
                </div>

                <Link href={`/sales/${sale.id}`}>
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                    <span>View/Edit</span>
                  </button>
                </Link>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredSales.length === 0 && (
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
