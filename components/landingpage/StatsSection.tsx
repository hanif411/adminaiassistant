export default function StatsSection() {
  const stats = [
    { value: "98.5%", label: "Akurasi AI" },
    { value: "80%", label: "Penghematan Waktu" },
    { value: "10K+", label: "Pengguna Aktif" },
    { value: "500K+", label: "Faktur Diproses" }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-500 to-blue-600">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-5xl mb-2">{stat.value}</p>
              <p className="text-teal-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}