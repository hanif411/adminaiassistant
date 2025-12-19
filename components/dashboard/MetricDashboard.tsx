import { Clock, FileText, TrendingUp } from "lucide-react";
import { MetricCard } from "../ui/metricCard";

function MetricDashboard() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl text-gray-900 mb-6">
          Efisiensi Kinerja Bulanan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Jam Kerja Dihemat Bulan Ini"
            value="45 Jam"
            change={23}
            changeLabel="vs bulan lalu"
            icon={Clock}
            iconColor="bg-gradient-to-br from-teal-500 to-teal-600"
          />
          <MetricCard
            title="Total Dokumen Terproses"
            value="320"
            change={18}
            changeLabel="dokumen bulan ini"
            icon={FileText}
            iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <MetricCard
            title="Rata-rata Akurasi AI"
            value="98.2%"
            change={2.1}
            changeLabel="akurasi ekstraksi"
            icon={TrendingUp}
            iconColor="bg-gradient-to-br from-green-500 to-green-600"
          />
        </div>
      </section>
    </>
  );
}

export default MetricDashboard;
