import React from "react";
import type { Metadata } from "next";
import Navbar from "@/src/components/Navbar";
import CatalogPage from "./main";
import Footer from "@/src/components/Footer";

export const metadata: Metadata = {
  title: "Katalog Produk",
};

function Catalog() {
  return (
    <>
      <main className="min-h-screen">
        <Navbar />
        <CatalogPage />
        <Footer />
      </main>
    </>
  );
}

export default Catalog;
