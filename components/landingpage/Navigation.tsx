import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">📦</span>
            </div>
            <div>
              <h1 className="text-xl text-gray-900">Admin Assistant</h1>
              <p className="text-xs hidden md:block text-gray-500">Purchase Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/purchases"
              className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white md:px-6 px-1 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
