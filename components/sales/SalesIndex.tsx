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
      <div className="flex justify-between items-start md:items-center gap-4">
        <h1 className="xl:text-3xl text-xl text-gray-900">Penjualan</h1>
        <Button>
          <Link href={"/sales/new"}>+ Penjualan</Link>
        </Button>
      </div>
      <section className="border-1 p-3 mt-2 rounded-lg">
        <div className="bg-white  sm:p-2 ">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
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

            <div className="md:col-span-3 ">
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
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-gray-400">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
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
          <div className="hidden lg:block border-1 rounded-lg mt-2">
            <table className="w-full">
              <thead className="bg-primary text-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-1 text-left text-xs uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-1 text-left text-xs uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-1 text-left text-xs uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-1 text-left text-xs uppercase tracking-wider">
                    Catatan
                  </th>
                  <th className="px-6 py-1 text-left text-xs uppercase tracking-wider">
                    Jumlah Item
                  </th>
                  <th className="px-6 py-1 text-left text-xs uppercase tracking-wider">
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
          <div className="lg:hidden divide-y divide-gray-200 mt-2 ">
            {filteredSales.map((sale, index) => (
              <div
                key={sale.id}
                className="p-4 hover:bg-gray-50 transition-colors border-2 rounded-lg">
                <div className="flex justify-between flex-row">
                  <p className="text-gray-900">{sale.order_date}</p>
                  <p className="text-gray-900 font-bold">{sale.total}</p>
                </div>
                <p className="text-primary mt-1 font-bold">
                  {sale.customer_name}
                </p>
                <div className="flex justify-between items-center flex-row">
                  <p className="text-gray-900">{sale.item_count} item</p>
                  <Link href={`/sales/${sale.id}`}>
                    <Button>
                      <Search />
                      Detail
                    </Button>
                  </Link>
                </div>
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
