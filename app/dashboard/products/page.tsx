import React from "react";
import ProductDashboard from "./main";
import type { Metadata } from "next";
import Sidebar from "@/src/components/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard Produk",
};

function Product() {
  return (
    <Sidebar>
      <ProductDashboard />
    </Sidebar>
  );
}

export default Product;