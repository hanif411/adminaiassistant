import { ExtractedData } from "@/types/purchases";
import * as XLSX from "xlsx";
import { format } from "date-fns";
// Fungsi Export ke Excel yang Diperbarui
export const exportPurchasesToExcel = (data: ExtractedData) => {
  // Hitung total
  const subtotalItems = data.items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );
  const grandTotal =
    subtotalItems + data.extracted_tax - data.extracted_discount; // 1. Siapkan Item Data (untuk sheet 'Purchases_Item' dan digabungkan di sheet 'Purchases')

  const itemDataArray = data.items.map((item, index) => [
    index + 1, // No
    item.extracted_code_item || "", // Kode Item
    item.extracted_product_name, // Nama Produk
    item.quantity, // Qty
    item.unit, // Unit
    item.price, // Harga Satuan (Dasar)
    item.subtotal, // Subtotal (Net)
  ]); // Definisikan Header untuk Item Data

  const itemHeaders = [
    "No",
    "Kode Item",
    "Nama Produk",
    "Qty",
    "Unit",
    "Harga Satuan (Dasar)",
    "Subtotal (Net)",
  ]; // 2. Siapkan Data untuk Sheet Utama ('Purchases')

  let mainSheetData = [
    // Bagian A: Detail Header
    ["DETAIL TRANSAKSI PEMBELIAN"],
    ["Supplier", data.extracted_supplier_name],
    ["No. Faktur", data.invoice_number],
    ["Tanggal Pembelian", data.purchase_date],
    ["", ""], // Baris kosong // Bagian B: Ringkasan Total

    ["RINGKASAN TOTAL"],
    ["Subtotal Item (Bersih)", subtotalItems],
    ["PPN / Tax Total", data.extracted_tax],
    ["Diskon Faktur Total", data.extracted_discount],
    ["GRAND TOTAL AKHIR", grandTotal],
    ["", ""], // Baris kosong // Bagian C: Detail Item (Header Tabel Item)

    ["DETAIL ITEM PRODUK"],
    itemHeaders,
  ]; // Gabungkan Item Data Array ke dalam Main Sheet Data

  mainSheetData = mainSheetData.concat(itemDataArray); // Buat Sheet Utama ('Purchases')

  const wsPurchases = XLSX.utils.aoa_to_sheet(mainSheetData); // Buat Sheet Detail Item ('Purchases_Item') // Gunakan itemDataArray dan tambahkan itemHeaders di atasnya

  const wsPurchasesItem = XLSX.utils.aoa_to_sheet([
    itemHeaders,
    ...itemDataArray,
  ]); // Gabungkan ke Workbook

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsPurchases, "Purchases");
  XLSX.utils.book_append_sheet(wb, wsPurchasesItem, "Purchases_Item");

  XLSX.writeFile(
    wb,
    `Pembelian_${data.invoice_number || "baru"}_${
      data.purchase_date || format(new Date(), "yyyyMMdd")
    }.xlsx`
  );
};
