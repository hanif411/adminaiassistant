export interface StockItem {
  id?: number;
  extracted_product_name: string;
  extracted_quantity: number;
  price: number;
}

export interface StockOpname {
  id: string;
  no_stockopname: string | null;
  rack_number: string | null;
  stockopname_date: string;
  image_url?: string;
  created_at: string;
  extraction_timestamp?: string;
  review_completion_timestamp?: string;
  total_input_fields?: number;
  corrected_field_count?: number;
  status?: string;
  accuracy?: string;
  items_count?: number;
  stock_items?: StockItem[] | null;
}

export interface StockMetrics {
  total_scans_month: number;
  avg_accuracy: string;
  total_items_scanned: number;
}
