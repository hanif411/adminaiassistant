import { usePurchasesData } from "@/hooks/usePurchasesData";
import { MetricCard } from "../ui/metricCard";
import { AlertCircle, Clock, TrendingUp } from "lucide-react";

function MetricPurchases() {
  const { metrics } = usePurchasesData();

  return (
    <>
      <section className="mb-8">
        <h2 className="text-2xl text-gray-900 mb-6">
          Metrik Kualitas Data Pembelian
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Tingkat Akurasi Ekstraksi"
            value={metrics.avg_accuracy_percentage + "%"}
            subtitle="rata-rata akurasi AI"
            icon={TrendingUp}
            iconColor="bg-gradient-to-br from-green-500 to-green-600"
          />
          <MetricCard
            title="Total Faktur Bulan Ini"
            value={metrics.total_invoices_month}
            icon={AlertCircle}
            iconColor="bg-gradient-to-br from-red-500 to-orange-500"
          />
          <MetricCard
            title="Rata-Rata Waktu Input"
            value={metrics.avg_review_time_seconds + " detik"}
            subtitle="per faktur"
            icon={Clock}
            iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
          />
        </div>
      </section>
    </>
  );
}

export default MetricPurchases;
