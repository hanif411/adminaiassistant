export interface ExtractedItem {
  id: number;
  extracted_code_item: string | null;
  extracted_product_name: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
}

export interface ExtractedData {
  extracted_supplier_name: string;
  invoice_number: string;
  purchase_date: string;
  extracted_tax: number;
  extracted_discount: number;
  extraction_timestamp: string;
  items: ExtractedItem[];
  invoice_url: string;
  total_input_fields?: number | null;
  corrected_field_count?: number | null;
}

export interface PurchaseList {
  id: string;
  invoice_number: string;
  purchase_date: string;
  extracted_supplier_name: string;
  extracted_tax: number;
  extracted_discount: number;
  grand_total: number;
  created_at: string;
}

// Tipe data untuk metrik kualitas dan performa AI
export interface PurchaseMetrics {
  avg_accuracy_percentage: string; // Rata-rata akurasi AI, e.g., "98.5"
  needed_review_count: number; // Jumlah faktur yang perlu di-review
  total_invoices_month: number; // Total faktur bulan ini
  total_time_saved_hours: number; // Total jam kerja dihemat
  avg_review_time_seconds: number; // Rata-rata waktu review per faktur
}

// Tipe data untuk setiap entri pembelian (Purchase List)
export interface PurchaseWithMetrics {
  id: string; // ID unik pembelian
  invoice_number: string | null; // Nomor faktur
  extracted_supplier_name: string; // Nama supplier hasil ekstraksi
  purchase_date: string; // Tanggal pembelian (diasumsikan sudah diformat dari API)
  total: string; // Grand Total (diasumsikan sudah diformat mata uang dari API)
  status: "Lengkap" | "Perlu Review" | string; // Status data
  accuracy: string; // Akurasi ekstraksi AI, e.g., "95.5%"
  item_count: number;
  purchase_items: any;
}

export interface PurchasesMetrics {
  avg_accuracy_percentage: string; // e.g., "95.2"
  needed_review_count: number;
  total_invoices_month: number;
  total_time_saved_hours: number;
  avg_review_time_seconds: number;
}

export interface PurchaseDataResponse {
  purchases: PurchaseWithMetrics[];
  metrics: PurchaseMetrics;
}

export interface UsePurchasesDataResult {
  purchases: PurchaseWithMetrics[];
  metrics: PurchaseMetrics;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface PurchasesApiResponse {
  purchases: PurchaseWithMetrics[];
  metrics: PurchasesMetrics;
}

// types.ts

export interface Item {
  id: number;
  extracted_code_item: string | null;
  extracted_product_name: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
}

export interface PurchaseBase {
  id: string | number;
  invoice_number: string;
  purchase_date: string;
  extracted_supplier_name: string;
  invoice_url: string;
  extracted_tax: number;
  extracted_discount: number;
  grand_total: number;
  created_at: string;
  accuracy: number;
  reviewTime: number;
  // Hapus 'items' di sini
}

// PurchaseDetailData yang digunakan di View adalah gabungan PurchaseBase + items
export interface PurchaseDetailData extends PurchaseBase {
  items: Item[];
}
