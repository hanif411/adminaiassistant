import { ArrowRight, ScanLine, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full mb-6">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-teal-700">
                Otomasi Data Faktur dengan AI
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl text-gray-900 mb-6 leading-tight">
              Dapatkan Visibilitas Penuh Atas{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
                Uang dan Inventaris Anda
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Lupakan entri data manual. Admin Assistant mengotomatiskan
              ekstraksi detail faktur pembelian, menghitung ulang total, dan
              memberi Anda pandangan real-time ke biaya bisnis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl">
                <span>Mulai Kelola Faktur Anda</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <button className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-lg border border-gray-300 transition-colors">
                <ScanLine className="w-5 h-5" />
                <span>Lihat Demo</span>
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Gratis 14 hari</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Tidak perlu kartu kredit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Setup 5 menit</span>
              </div>
            </div>
          </div>

          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkYXNoYm9hcmQlMjBhbmFseXRpY3N8ZW58MXx8fHwxNzY1Mzc2OTgzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Dashboard Mockup"
          className="w-full h-auto"
        />

        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Pengeluaran Bulan Ini</p>
          <p className="text-2xl text-teal-600">Rp 45,2 Jt</p>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <span className="w-3 h-3">↑</span>
            <span>12% lebih efisien</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Faktur Diproses</p>
          <p className="text-2xl text-blue-600">127</p>
          <p className="text-xs text-gray-500 mt-1">Akurasi AI: 98.5%</p>
        </div>
      </div>
    </div>
  );
}
