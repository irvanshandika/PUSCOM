"use client";
import React, { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import { toast } from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  slug?: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  condition: string;
  images: string[];
  ecommerceLinks: {
    platform: string;
    url: string;
  }[];
};

function TotalProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Product
      );
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error fetching products");
    }
  };
  return (
    <>
      <div className="p-6 rounded-xl shadow-md flex items-center text-purple-500 bg-purple-50 transition-transform hover:scale-105">
        <div className="mr-4 p-3 rounded-full bg-white/30">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-75">Total Produk</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
      </div>
    </>
  );
}

export default TotalProducts;