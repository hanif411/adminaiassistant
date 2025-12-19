import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Definisi Tipe Data yang akan di-fetch (sesuai struktur DB)
interface PurchaseDetail {
  id: string;
  invoice_number: string;
  purchase_date: string;
  extracted_supplier_name: string;
  invoice_url: string;
  extracted_tax: number;
  extracted_discount: number;
  grand_total: number;
  created_at: string;
  purchase_items: {
    extracted_code_item: string | null;
    extracted_product_name: string;
    quantity: number;
    unit: string;
    price: number;
    subtotal: number;
  }[];
}

export async function GET(req: Request, { params }: any) {
  const { id } = params;
  const supabase = createClient();
  console.log("Menerima request untuk Purchase ID:", id);

  if (!id) {
    return NextResponse.json(
      { message: "ID Pembelian tidak ditemukan." },
      { status: 400 }
    );
  }

  try {
    const { data: purchase, error } = await supabase
      .from("purchases")
      .select(
        `
        *, 
        purchase_items (
            extracted_code_item, 
            extracted_product_name, 
            quantity, 
            unit, 
            price, 
            subtotal
        )
      `
      )
      .eq("id", id)
      .single(); // Ambil hanya satu baris

    if (error) {
      if (error.code === "PGRST116") {
        // Kode error Supabase untuk "Row not found"
        return NextResponse.json(
          { message: `Transaksi ID: ${id} tidak ditemukan.` },
          { status: 404 }
        );
      }
      console.error("Supabase Detail Error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json(purchase as PurchaseDetail, { status: 200 });
  } catch (error: any) {
    console.error("General API Error (Detail):", error);
    return NextResponse.json(
      { message: "Gagal mengambil detail pembelian: " + error.message },
      { status: 500 }
    );
  }
}
