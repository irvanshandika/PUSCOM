import React from "react";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import Link from "next/link";
import { Shield, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "403 - Akses Ditolak",
};

function forbidden() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mb-8 relative">
          <Lock className="mx-auto text-yellow-500 dark:text-yellow-400 w-24 h-24" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">403 - Akses Ditolak</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini. Pastikan Anda memiliki hak akses yang sesuai.</p>
        <div className="flex justify-center space-x-4">
          <Link href="/auth/signin" className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Shield className="mr-2 h-5 w-5" />
            Masuk ke Akun
          </Link>
          <Link href="/" className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
}

export default forbidden;
