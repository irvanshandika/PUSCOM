"use client";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">Solusi Digital untuk Kebutuhan Komputer Anda</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">PUSCOM menyediakan layanan jual beli komputer & laptop, servis, dan spare part berkualitas dengan harga terbaik.</p>
            <div className="flex gap-4">
              <Link href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Lihat Produk
              </Link>
              <Link href="/services" className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                Layanan Servis
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative h-[400px] w-full rounded-2xl bg-gradient-to-r from-blue-100 to-pink-100 dark:from-blue-950 dark:to-pink-950">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl text-gray-500 dark:text-gray-400">Hero Image</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
