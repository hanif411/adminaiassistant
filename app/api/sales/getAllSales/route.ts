// app/api/sales/getAllSales/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
// Import types SalesMetrics dan SalesApiResponse (Diasumsikan ada)
// import { SalesMetrics, SalesApiResponse } from "@/types/sales";

// Asumsi: Waktu input manual per field.
const MANUAL_INPUT_TIME_PER_FIELD = 5;

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        status: 401,
        message: "Akses ditolak. Anda harus login.",
      },
      { status: 401 }
    );
  }

  try {
    // 1. Ambil data dari tabel 'sales' dan 'sales_items'
    const { data: sales, error } = await supabase
      .from("sales")
      .select(
        `
                id, customer_name, order_date, invoice_url, created_at, grand_total,
                extraction_timestamp, review_completion_timestamp, total_input_fields, corrected_field_count,
                is_manually_corrected,
                sales_items(count) 
            `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET Sales Error:", error);
      throw new Error(error.message);
    }

    if (!sales || sales.length === 0) {
      return NextResponse.json({
        sales: [],
        metrics: calculateMetrics([]),
      });
    } // 2. Hitung Metrik Per Transaksi (Accuracy, Review Time, etc.)

    const salesWithMetrics = sales.map((p: any) => {
      // Menggunakan 'p' untuk singkatan 'penjualan'
      let reviewTimeSeconds = null;
      let timeSavedHours = 0;
      let accuracyScore = 0;
      let status = p.review_completion_timestamp ? "Lengkap" : "Perlu Review";

      if (p.review_completion_timestamp) {
        const extractionTime = new Date(p.extraction_timestamp).getTime();
        const completionTime = new Date(
          p.review_completion_timestamp
        ).getTime();

        reviewTimeSeconds = Math.round(
          (completionTime - extractionTime) / 1000
        );
        reviewTimeSeconds = Math.max(1, reviewTimeSeconds);

        const estimatedManualTime =
          (p.total_input_fields || 0) * MANUAL_INPUT_TIME_PER_FIELD;

        const timeSavedSeconds = Math.max(
          0,
          estimatedManualTime - reviewTimeSeconds
        );
        timeSavedHours = timeSavedSeconds / 3600; // Accuracy Calculation: 1 - (corrected fields / total fields)
        const corrected = p.corrected_field_count || 0;
        const total = p.total_input_fields || 1;
        accuracyScore = (1 - corrected / total) * 100;
        accuracyScore = Math.min(100, accuracyScore);
      }

      return {
        ...p,
        status,
        accuracy: accuracyScore.toFixed(1) + "%",
        reviewTimeSeconds,
        timeSavedHours: timeSavedHours.toFixed(2),
        total: p.grand_total.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
        item_count: p.sales_items[0].count, // Ambil count dari relation
      };
    }); // 3. Hitung Metrik Keseluruhan

    const metrics = calculateMetrics(salesWithMetrics);

    return NextResponse.json(
      { sales: salesWithMetrics, metrics }, // Mengganti purchases menjadi sales
      { status: 200 }
    );
  } catch (error: any) {
    console.error("General API Error (GET Sales):", error);
    return NextResponse.json(
      { message: "Gagal mengambil daftar penjualan: " + error.message },
      { status: 500 }
    );
  }
}

// Fungsi calculateMetrics (sama persis dengan yang di Purchases)
function calculateMetrics(sales: any[]) {
  const completedSales = sales.filter((p) => p.reviewTimeSeconds !== null);
  const neededReview = sales.filter((p) => p.status === "Perlu Review").length;

  const totalInvoicesMonth = sales.length;

  const avgAccuracy =
    completedSales.length > 0
      ? completedSales.reduce((sum, p) => sum + parseFloat(p.accuracy), 0) /
        completedSales.length
      : 0;

  const totalReviewTime = completedSales.reduce(
    (sum, p) => sum + p.reviewTimeSeconds,
    0
  );
  const avgReviewTime =
    completedSales.length > 0
      ? Math.round(totalReviewTime / completedSales.length)
      : 0;

  const totalTimeSavedHours = completedSales.reduce(
    (sum, p) => sum + parseFloat(p.timeSavedHours),
    0
  );

  return {
    total_invoices_month: totalInvoicesMonth,
    needed_review_count: neededReview,
    avg_accuracy_percentage: avgAccuracy.toFixed(1),
    avg_review_time_seconds: avgReviewTime,
    total_time_saved_hours: totalTimeSavedHours.toFixed(1),
  };
}
