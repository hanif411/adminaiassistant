import { BarChart3, TrendingUp, Calculator } from "lucide-react";

export default function InsightsSection() {
  const insights = [
    {
      icon: <TrendingUp className="w-5 h-5 text-teal-600" />,
      title: "Tren Pengeluaran",
      description:
        "Bandingkan pengeluaran bulanan dan identifikasi pola pembelian yang tidak efisien",
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      title: "Analisis Supplier",
      description:
        "Evaluasi performa supplier berdasarkan harga, frekuensi pembelian, dan konsistensi",
    },
    {
      icon: <Calculator className="w-5 h-5 text-green-600" />,
      title: "Forecast Budget",
      description:
        "Prediksi pengeluaran bulan depan berdasarkan historical data dan musiman",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                Analytics & Insights
              </span>
            </div>

            <h2 className="text-4xl text-gray-900 mb-6">
              Dapatkan Insight yang Diperlukan untuk Mengurangi Biaya
            </h2>

            <p className="text-xl text-gray-600 mb-8">
              Lihat di mana uang Anda benar-benar pergi dengan visualisasi
              kategori pengeluaran dan tren harga item.
            </p>

            <div className="space-y-4">
              {insights.map((insight, index) => (
                <InsightCard key={index} {...insight} />
              ))}
            </div>
          </div>

          <ChartMockup />
        </div>
      </div>
    </section>
  );
}

function InsightCard({ icon, title, description }: any) {
  return (
    <div className="flex items-start gap-4 bg-white rounded-lg p-4 border border-gray-200">
      <div
        className={`w-10 h-10 ${getColorClass(
          title
        )} rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h4 className="text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function getColorClass(title: any) {
  switch (title) {
    case "Tren Pengeluaran":
      return "bg-teal-100";
    case "Analisis Supplier":
      return "bg-blue-100";
    case "Forecast Budget":
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
}

function ChartMockup() {
  return (
    <div className="relative">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504607798333-52a30db54a5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGZpbmFuY2lhbCUyMGNoYXJ0fGVufDF8fHx8MTc2NTQxNjk1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Analytics Charts"
          className="w-full h-auto"
        />
      </div>

      <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 border border-gray-200 max-w-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Penghematan Terdeteksi</p>
            <p className="text-2xl text-gray-900">Rp 8,4 Jt</p>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          Dengan beralih ke Supplier B untuk kategori obat-obatan generik
        </p>
      </div>
    </div>
  );
}
