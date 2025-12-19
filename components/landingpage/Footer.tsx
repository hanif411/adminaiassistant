export default function Footer() {
  const footerLinks = {
    Produk: ["Fitur", "Harga", "Demo"],
    Perusahaan: ["Tentang Kami", "Blog", "Karir"],
    Dukungan: ["Help Center", "Kontak", "Status"],
    Legal: ["Privacy", "Terms", "Security"],
  };

  const socialLinks = ["Twitter", "LinkedIn", "Instagram"];

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4">{category}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© 2024 Admin Assistant. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <a key={social} href="#" className="hover:text-white">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
