"use client";
import Link from "next/link";
import HeroCarousel from "../components/HeroCarousel";

export default function HeroSection() {
  return (
    <section className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12">
          {/* Text Content */}
          <div className="flex-1 space-y-6 sm:space-y-8 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">Solusi Digital untuk Kebutuhan Komputer Anda</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">PUSCOM menyediakan layanan jual beli komputer & laptop, servis, dan spare part berkualitas dengan harga terbaik.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/catalog" className="px-6 py-3 rounded bg-blue-600 text-white  hover:bg-blue-700 transition duration-300 text-center">
                Lihat Produk
              </Link>
              <Link href="/service" className="px-6 py-3 rounded border border-gray-300 dark:border-gray-700  hover:bg-gray-50 dark:hover:bg-gray-900 transition duration-300 text-center">
                Layanan Servis
              </Link>
            </div>
          </div>

          {/* Carousel */}
          <div className="flex-1 w-full mt-8 lg:mt-0">
            <div className="relative h-[300px] sm:h-[350px] md:h-[400px] w-full rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-pink-100 dark:from-blue-950 dark:to-pink-950">
                <div className="absolute inset-0 flex items-center justify-center">
                  <HeroCarousel />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
