"use client";
import { useEffect } from "react";
import Link from "next/link";
import { ServerCrash, RefreshCw } from "lucide-react";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <ServerCrash className="mx-auto text-red-500 dark:text-red-400 w-24 h-24" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">500 - Kesalahan Server</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Maaf, terjadi kesalahan internal pada server. Kami sedang berupaya memperbaikinya.</p>
          <div className="flex justify-center space-x-4">
            <button onClick={() => reset()} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              <RefreshCw className="mr-2 h-5 w-5" />
              Coba Lagi
            </button>
            <Link href="/" className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
              Kembali ke Beranda
            </Link>
          </div>
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">Kode Error: {error.digest || "Unknown"}</div>
        </div>
      </div>
      <Footer />
    </>
  );
}
