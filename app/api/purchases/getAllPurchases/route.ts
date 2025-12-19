import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const MANUAL_INPUT_TIME_PER_FIELD = 5;

export async function GET() {
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

  try {
    const { data: purchases, error } = await supabase
      .from("purchases")
      .select(
        `
                id, invoice_number, purchase_date, extracted_supplier_name, created_at, grand_total,
                extraction_timestamp, review_completion_timestamp, total_input_fields, corrected_field_count,
                is_manually_corrected,
                purchase_items(count)
            `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET Error:", error);
      throw new Error(error.message);
    }

    if (!purchases || purchases.length === 0) {
      return NextResponse.json({
        purchases: [],
        metrics: calculateMetrics([]),
      });
    }

    const purchasesWithMetrics = purchases.map((p) => {
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
        timeSavedHours = timeSavedSeconds / 3600;
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
      };
    });

    const metrics = calculateMetrics(purchasesWithMetrics);

    return NextResponse.json(
      { purchases: purchasesWithMetrics, metrics },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("General API Error (GET):", error);
    return NextResponse.json(
      { message: "Gagal mengambil daftar pembelian: " + error.message },
      { status: 500 }
    );
  }
}

function calculateMetrics(purchases: any[]) {
  const completedPurchases = purchases.filter(
    (p) => p.reviewTimeSeconds !== null
  );
  const neededReview = purchases.filter(
    (p) => p.status === "Perlu Review"
  ).length;

  const totalInvoicesMonth = purchases.length;

  const avgAccuracy =
    completedPurchases.length > 0
      ? completedPurchases.reduce((sum, p) => sum + parseFloat(p.accuracy), 0) /
        completedPurchases.length
      : 0;

  const totalReviewTime = completedPurchases.reduce(
    (sum, p) => sum + p.reviewTimeSeconds,
    0
  );
  const avgReviewTime =
    completedPurchases.length > 0
      ? Math.round(totalReviewTime / completedPurchases.length)
      : 0;

  const totalTimeSavedHours = completedPurchases.reduce(
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
