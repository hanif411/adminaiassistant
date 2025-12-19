// app/api/sales/createSales/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ExtractedSalesData } from "@/types/sales"; // Import interface kita

// Asumsi: Anda memiliki tabel 'sales' dan 'sales_items' di Supabase.

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { status: 401, message: "Akses ditolak. Anda harus login." },
      { status: 401 }
    );
  }

  try {
    const extractedData: ExtractedSalesData = await req.json();

    // Pastikan data inti ada
    if (
      extractedData.items.length === 0 ||
      !extractedData.extracted_customer_name
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "Data tidak lengkap. Item atau Nama Pelanggan kosong.",
        },
        { status: 400 }
      );
    }

    // Safety check: Finalisasi perhitungan Grand Total sebelum disimpan (sesuai logic FE)
    const subtotalItems = extractedData.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const finalGrandTotal =
      subtotalItems + extractedData.extracted_additional_cost;

    const reviewCompletionTime = new Date().toISOString();

    // --- 1. SIAPKAN DATA UNTUK TABEL 'SALES' ---
    const salesRecord = {
      user_id: user.id,
      customer_name: extractedData.extracted_customer_name,
      order_date: extractedData.order_date,
      invoice_url: extractedData.invoice_url,
      notes: extractedData.notes,

      // Financials
      subtotal_items: subtotalItems, // Subtotal hasil perhitungan FE (Qty * Price)
      additional_cost: extractedData.extracted_additional_cost,
      additional_cost_description: extractedData.additional_cost_description,
      grand_total: finalGrandTotal,

      // Metrik Kualitas Data (Untuk Analisa Kinerja AI)
      extraction_timestamp: extractedData.extraction_timestamp,
      review_completion_timestamp: reviewCompletionTime,
      total_input_fields: extractedData.total_input_fields,
      corrected_field_count: extractedData.corrected_field_count,
    };

    // --- 2. MASUKKAN DATA KE TABEL 'SALES' ---
    const { data: insertedSale, error: salesError } = await supabase
      .from("sales")
      .insert([salesRecord])
      .select("id") // Ambil ID dari record yang baru dibuat
      .single();

    if (salesError || !insertedSale) {
      console.error("Supabase Sales Insert Error:", salesError);
      return NextResponse.json(
        {
          status: 500,
          message: `Gagal menyimpan transaksi penjualan utama: ${salesError?.message}`,
        },
        { status: 500 }
      );
    }

    const salesId = insertedSale.id;

    // --- 3. SIAPKAN DATA UNTUK TABEL 'SALES_ITEMS' ---
    const itemRecords = extractedData.items.map((item) => ({
      sales_id: salesId, // Hubungkan ke ID Penjualan utama
      product_name: item.extracted_product_name,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.price,
      item_subtotal: item.quantity * item.price, // Hitung subtotal per baris
    }));

    // --- 4. MASUKKAN DATA KE TABEL 'SALES_ITEMS' ---
    const { error: itemsError } = await supabase
      .from("sales_items")
      .insert(itemRecords);

    if (itemsError) {
      console.error("Supabase Sales Items Insert Error:", itemsError);
      // Opsional: Lakukan rollback pada tabel 'sales' jika item gagal disimpan
      // (Untuk kesederhanaan, kita hanya return error di sini)
      return NextResponse.json(
        {
          status: 500,
          message: `Gagal menyimpan item penjualan: ${itemsError.message}`,
        },
        { status: 500 }
      );
    }

    // --- 5. SUCCESS RESPONSE ---
    return NextResponse.json(
      {
        status: 200,
        message: "Transaksi Penjualan berhasil disimpan.",
        salesId: salesId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("General API Error (Create Sales):", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Error di API Create Sales: " + error.message,
      },
      { status: 500 }
    );
  }
}
