import { Zap, Calculator, Archive, CheckCircle } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="w-7 h-7 text-white" />,
      title: "Otomatisasi Data Faktur (OCR)",
      description:
        "Upload foto faktur Anda, dan biarkan sistem mengekstrak detail seperti nama supplier, tanggal, PPN, diskon, dan daftar item secara instan.",
      benefits: [
        "Ekstraksi otomatis 100+ field data",
        "Support format gambar & PDF",
        "Akurasi AI hingga 98.5%",
      ],
      color: "teal",
      gradient: "from-teal-500 to-teal-600",
    },
    {
      icon: <Calculator className="w-7 h-7 text-white" />,
      title: "Kalkulasi Akurat & Edit",
      description:
        "Kontrol Data 100%. Semua total dihitung ulang secara otomatis berdasarkan item yang diekstrak. Edit quantity atau harga langsung di tabel detail faktur Anda.",
      benefits: [
        "Auto-calculate PPN & Diskon",
        "Inline editing untuk koreksi cepat",
        "Validasi data otomatis",
      ],
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <Archive className="w-7 h-7 text-white" />,
      title: "Manajemen Dokumen",
      description:
        "Arsip Digital Terstruktur. Simpan semua dokumen faktur Anda di satu tempat, terindeks, dan dapat dicari berdasarkan supplier, tanggal, atau grand total.",
      benefits: [
        "Cloud storage unlimited",
        "Advanced search & filter",
        "Export ke Excel/PDF",
      ],
      color: "green",
      gradient: "from-green-500 to-green-600",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl text-gray-900 mb-4">
            Fitur yang Membuat Pekerjaan Anda Lebih Mudah
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dirancang khusus untuk admin dan staff yang menangani ratusan faktur
            pembelian setiap bulan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  benefits,
  color,
  gradient,
}: any) {
  return (
    <div
      className={`group relative bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all hover:border-${color}-500`}>
      <div
        className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>

      <h3 className="text-2xl text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="space-y-2">
        {benefits.map((benefit: any, idx: any) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className={`w-4 h-4 text-${color}-500`} />
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-2xl group-hover:bg-${color}-500/10 transition-colors`}></div>
    </div>
  );
}
