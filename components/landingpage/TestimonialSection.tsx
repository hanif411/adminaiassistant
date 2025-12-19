export default function TestimonialSection() {
  const testimonials = [
    {
      initials: "AG",
      name: "Andi Gunawan",
      role: "Manajer Logistik, CV. Sinar Gemilang",
      quote:
        "Sejak menggunakan Admin Assistant, waktu yang saya habiskan untuk memproses ratusan faktur pembelian per bulan berkurang <strong>80%</strong>. Semua data item dan PPN langsung terekstrak dengan sempurna!",
      gradient: "from-teal-50 to-blue-50",
      border: "border-teal-200",
    },
    {
      initials: "SR",
      name: "Siti Rahmawati",
      role: "Owner, Apotek Sehat Sentosa",
      quote:
        "Game changer untuk apotek kami! Tidak ada lagi kesalahan input harga atau jumlah item. Sistem otomatis mendeteksi dan memberi alert kalau ada yang tidak sesuai. Sangat membantu!",
      gradient: "from-blue-50 to-green-50",
      border: "border-blue-200",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl text-gray-900 mb-4">
            Dipercaya oleh Ribuan Bisnis Indonesia
          </h2>
          <p className="text-xl text-gray-600">
            Dari UMKM hingga enterprise, semua mencintai Admin Assistant
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  initials,
  name,
  role,
  quote,
  gradient,
  border,
}: any) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-8 border ${border}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white">
          {initials}
        </div>
        <div>
          <h4 className="text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
      <p
        className="text-gray-700 mb-4"
        dangerouslySetInnerHTML={{ __html: quote }}
      />
      <div className="flex items-center gap-1 text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <span key={i}>⭐</span>
        ))}
      </div>
    </div>
  );
}
