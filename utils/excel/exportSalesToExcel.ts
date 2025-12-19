import { ExtractedSalesData } from "@/types/sales";
import * as XLSX from "xlsx";
import { format } from "date-fns";

/**
 * Fungsi Export Sales ke Excel dengan 2 Sheet:
 * 1. Sales (Ringkasan & Detail)
 * 2. Sales_Items (Hanya list item untuk olah data)
 */
export const exportSalesToExcel = (data: ExtractedSalesData) => {
  // 1. Hitung ulang total untuk memastikan data sinkron
  const subtotalItems = data.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const grandTotal = subtotalItems + data.extracted_additional_cost;

  // 2. Siapkan Data Item (Array of Arrays)
  const itemHeaders = [
    "No",
    "Nama Produk",
    "Qty",
    "Unit",
    "Harga Satuan",
    "Total Harga Item",
  ];

  const itemDataArray = data.items.map((item, index) => [
    index + 1,
    item.extracted_product_name,
    item.quantity,
    item.unit,
    item.price,
    item.quantity * item.price, // Item Subtotal
  ]);

  // 3. Siapkan Sheet Utama ('Sales') - Ringkasan + Detail
  let mainSheetData = [
    ["DETAIL TRANSAKSI PENJUALAN"],
    ["Customer", data.extracted_customer_name],
    ["Tanggal Order", data.order_date],
    ["Catatan/Notes", data.notes || "-"],
    ["", ""], // Spasi

    ["RINGKASAN BIAYA"],
    ["Subtotal Produk", subtotalItems],
    ["Biaya Tambahan (Ongkir/Admin)", data.extracted_additional_cost],
    ["Keterangan Biaya", data.additional_cost_description || "-"],
    ["GRAND TOTAL", grandTotal],
    ["", ""], // Spasi

    ["DETAIL ITEM PESANAN"],
    itemHeaders, // Header Tabel
  ];

  // Gabungkan main sheet dengan list item
  mainSheetData = mainSheetData.concat(itemDataArray);

  // 4. Proses Pembuatan Workbook & Sheet
  const wb = XLSX.utils.book_new();

  // Sheet 1: Sales (Gabungan)
  const wsSales = XLSX.utils.aoa_to_sheet(mainSheetData);
  XLSX.utils.book_append_sheet(wb, wsSales, "Sales_Summary");

  // Sheet 2: Sales_Items (Hanya tabel untuk rekap data)
  const wsSalesItems = XLSX.utils.aoa_to_sheet([itemHeaders, ...itemDataArray]);
  XLSX.utils.book_append_sheet(wb, wsSalesItems, "Sales_Items_Only");

  // 5. Trigger Download
  const fileName = `Sales_${data.extracted_customer_name.replace(
    /\s+/g,
    "_"
  )}_${data.order_date || format(new Date(), "yyyyMMdd")}.xlsx`;

  XLSX.writeFile(wb, fileName);
};
