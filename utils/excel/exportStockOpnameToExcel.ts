import { StockOpname } from "@/types/stock";
import * as xlsx from "xlsx";

export const exportStockOpnameToExcel = (data: StockOpname) => {
  const stock_items = data.stock_items!.map((item, index) => [
    index + 1,
    item.extracted_product_name,
    item.extracted_quantity,
    item.price,
  ]);

  let mainSheetData = [
    ["DETAIL STOCK OPNAME"],
    ["No stock opname", data.no_stockopname],
    ["No Rak", data.rack_number],
    ["tanggal", data.stockopname_date],
    ["", ""],

    ["Detail Item"],
    ["No", "Nama Produk", "Qty", "Harga Satuan"],
  ];

  const final = [...mainSheetData, ...stock_items];
  const wb = xlsx.utils.book_new();
  const wsStock = xlsx.utils.aoa_to_sheet(final);
  xlsx.utils.book_append_sheet(wb, wsStock, "Stock opname");

  xlsx.writeFile(wb, "DataStockopname.xlsx");
};
