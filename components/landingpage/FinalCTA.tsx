import { ArrowRight, Users, Shield, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function FinalCTA() {
  const benefits = [
    {
      icon: <Shield className="w-5 h-5 text-green-500" />,
      text: "Data terenkripsi & aman",
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      text: "Setup dalam 5 menit",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-teal-500" />,
      text: "Support 24/7",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl text-gray-900 mb-6">
          Siap Mengotomatiskan Manajemen Faktur Anda?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Bergabunglah dengan ribuan bisnis yang telah menghemat waktu dan biaya
          dengan Admin Assistant
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl">
            <span>Mulai Gratis 14 Hari</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <button className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-lg border border-gray-300 transition-colors">
            <Users className="w-5 h-5" />
            <span>Hubungi Sales</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              {benefit.icon}
              <span>{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
