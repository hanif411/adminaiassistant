// src/types/sales.ts

// --- 1. Interface Data Item Penjualan (Detail Order) ---
export interface SalesItem {
  id?: number; // Opsional: Untuk key sementara di frontend (jika perlu)
  sales_id?: string; // Foreign key
  extracted_product_name: string; // Ganti: biar match dengan output AI
  quantity: number;
  unit: string;
  price: number; // Ganti: biar match dengan output AI (Unit Price)
  item_subtotal?: number; // Opsional: hasil perhitungan
}

// --- 2. Interface Data Penjualan Utama (Header Order) ---
// Ini adalah structure yang DIHARAPKAN dari output Gemini
export interface ExtractedSalesData {
  // Core Data
  extracted_customer_name: string;
  order_date: string; // Format YYYY-MM-DD
  invoice_url: string; // URL file yang di-upload
  notes: string | null;

  // Financials
  // NOTE: Field ini harus match dengan output Gemini di prompt
  subtotal_items_before_additional_cost: number;
  extracted_additional_cost: number;
  additional_cost_description: string | null;
  grand_total: number; // Final total dari AI

  // Item List (sesuai output AI)
  items: SalesItem[];

  // AI Metrics (Initial values)
  extraction_timestamp: string;
  total_input_fields: number;
  corrected_field_count: number;
}

// --- 3. Interface untuk Metrik Kinerja AI/Proses (Untuk Metrik Card) ---
export interface SalesMetrics {
  avg_accuracy_percentage: string;
  needed_review_count: number;
  total_invoices_month: number;
  total_time_saved_hours: number;
  avg_review_time_seconds: number;
}

// --- 4. Interface Penjualan Lengkap + Metrik Tambahan dari API Backend ---
export interface SalesWithMetrics {
  // Data dari Database 'sales'
  id: string;
  customer_name: string;
  order_date: string;
  invoice_url: string | null;
  created_at: string;

  // Financials
  grand_total: number; // Numeric (raw data)
  total: string; // Formatted 'Rp X.XXX'

  // Metrics Fields
  extraction_timestamp: string;
  review_completion_timestamp: string | null;
  total_input_fields: number;
  corrected_field_count: number;

  // Calculated fields (Tambahan dari API)
  status: "Lengkap" | "Perlu Review";
  accuracy: string;
  reviewTimeSeconds: number | null;
  timeSavedHours: string;
  notes: string;

  // Relasi (Count) - Pastikan ini diselaraskan dengan hasil select di getAllSales
  // Di API getAllSales, kita menggunakan `sales_items(count)` jadi item_count adalah hasil perhitungan.
  item_count: number;
}

// --- 5. Interface Respons Penuh dari API Backend ---
export interface SalesApiResponse {
  sales: SalesWithMetrics[];
  metrics: SalesMetrics;
}
