// app/api/stock-opname/create/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const { no_stockopname, rack_number, image_url, items, stockopname_date } =
      await req.json();

    // 1. Insert ke tabel stockopnames
    const { data: opname, error: e1 } = await supabase
      .from("stockopnames")
      .insert([
        {
          user_id: user.id,
          no_stockopname,
          stockopname_date:
            stockopname_date || new Date().toISOString().split("T")[0],
          rack_number,
          image_url,
        },
      ])
      .select()
      .single();

    if (e1) throw e1;

    // 2. Insert ke tabel stockopname_items
    const itemRecords = items.map((item: any) => ({
      stockopname_id: opname.id,
      extracted_product_name: item.extracted_product_name,
      extracted_quantity: item.extracted_quantity,
      price: item.price,
    }));

    const { error: e2 } = await supabase
      .from("stockopname_items")
      .insert(itemRecords);
    if (e2) throw e2;

    return NextResponse.json({
      status: 200,
      message: "Stock Opname berhasil disimpan!",
      id: opname.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 500, message: error.message },
      { status: 500 }
    );
  }
}
