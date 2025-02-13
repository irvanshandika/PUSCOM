import React from "react";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import Link from "next/link";
import { Home, Search } from "lucide-react";

function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Search className="mx-auto text-blue-500 dark:text-blue-400 w-24 h-24" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404 - Halaman Tidak Ditemukan</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin telah dipindahkan atau tidak tersedia.</p>
        <div className="flex justify-center space-x-4">
          <Link href="/" className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Home className="mr-2 h-5 w-5" />
            Kembali ke Beranda
          </Link>
          <Link href="/contact" className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Hubungi Kami
          </Link>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
}

export default NotFound;