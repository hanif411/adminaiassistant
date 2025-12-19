import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { data, error } = await supabase
      .from("stockopnames")
      .select(
        `
    id,no_stockopname, rack_number, stockopname_date, image_url, created_at,
    extraction_timestamp, review_completion_timestamp,
    total_input_fields, corrected_field_count,
    stockopname_items(count)
  `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedData = data.map((s: any) => {
      // Logic Akurasi
      const total = s.total_input_fields || 1;
      const corrected = s.corrected_field_count || 0;
      const accuracy = ((1 - corrected / total) * 100).toFixed(1) + "%";

      return {
        ...s,
        status: s.review_completion_timestamp ? "Verified" : "Pending",
        accuracy,
        items_count: s.stockopname_items?.[0]?.count || 0,
      };
    });

    return NextResponse.json({
      stockOpnames: formattedData,
      metrics: {
        total_scans_month: data.length,
        avg_accuracy:
          (
            formattedData.reduce(
              (acc, curr) => acc + parseFloat(curr.accuracy),
              0
            ) / (data.length || 1)
          ).toFixed(1) + "%",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
