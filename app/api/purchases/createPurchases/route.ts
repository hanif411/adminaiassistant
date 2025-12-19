import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ExtractedData } from "@/types/purchases";

interface PurchaseDataWithMetrics extends ExtractedData {
  extraction_timestamp: string; // Dari extractPurchases
  total_input_fields: number; // Dihitung di Frontend
  corrected_field_count: number; // Dihitung di Frontend
}

async function savePurchaseToDatabase(
  data: PurchaseDataWithMetrics,
  userId: string
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      status: 401,
      message: "Akses ditolak. Anda harus login.",
    });
  }
  const reviewCompletionTime = new Date().toISOString();

  const isManuallyCorrected = data.corrected_field_count > 0;

  // Hitung Subtotal Item dan Grand Total dari data yang sudah divalidasi di FE
  const subtotalItems = data.items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );
  const grandTotal =
    subtotalItems + data.extracted_tax - data.extracted_discount;

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      extracted_supplier_name: data.extracted_supplier_name,
      invoice_number: data.invoice_number,
      purchase_date: data.purchase_date,
      invoice_url: data.invoice_url,

      // >>> TAMBAHKAN KOLOM BARU UNTUK DISIMPAN <<<
      extracted_tax: data.extracted_tax,
      extracted_discount: data.extracted_discount,
      grand_total: grandTotal,
      user_id: userId,

      extraction_timestamp: data.extraction_timestamp, // Dari Step 1
      review_completion_timestamp: reviewCompletionTime, // Waktu saat ini
      total_input_fields: data.total_input_fields, // Dari Frontend
      corrected_field_count: data.corrected_field_count, // Dari Frontend
      is_manually_corrected: isManuallyCorrected, // Turunan dari corrected_field_count
    })
    .select("id")
    .single();

  if (purchaseError || !purchase) {
    throw new Error(
      `Gagal membuat transaksi pembelian: ${purchaseError?.message}`
    );
  }

  const purchaseId = purchase.id;

  // ... (Sisanya sama untuk purchase_items)
  const purchaseItems = data.items
    .filter((item) => item.extracted_product_name && item.quantity > 0) // Hapus item kosong
    .map((item) => ({
      purchase_id: purchaseId,
      extracted_code_item: item.extracted_code_item,
      extracted_product_name: item.extracted_product_name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      subtotal: item.subtotal,
    }));

  const { error: itemsError } = await supabase
    .from("purchase_items")
    .insert(purchaseItems);

  if (itemsError) {
    console.error("Gagal insert item:", itemsError.message);
    throw new Error(
      `Gagal menyimpan detail item. Transaksi ID: ${purchaseId} mungkin parsial.`
    );
  }

  return purchaseId;
}

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
    const data: PurchaseDataWithMetrics = await req.json();

    if (
      !data.extracted_supplier_name ||
      !data.items ||
      data.items.length === 0 ||
      !data.extraction_timestamp ||
      data.total_input_fields === undefined
    ) {
      return NextResponse.json(
        { message: "Data tidak lengkap (Supplier atau Item Kosong)" },
        { status: 400 }
      );
    }

    const purchaseId = await savePurchaseToDatabase(data, user.id);

    return NextResponse.json(
      {
        status: 201,
        message: "Transaksi Pembelian Berhasil Dicatat.",
        purchaseId: purchaseId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("General API Error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Gagal mencatat transaksi ke database: " + error.message,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
