"use client";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto text-center px-4 md:px-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Siap untuk memulai?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Hubungi kami sekarang untuk konsultasi gratis seputar kebutuhan komputer Anda</p>
        <Link href="/contact" className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block">
          Hubungi Kami
        </Link>
      </div>
    </section>
  );
}
