/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs, where, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import Image from "next/image";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Filter, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/src/components/ui/skeleton";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
};

export default function CatalogMain() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    productsPerPage: 12,
    lastVisibleDoc: null as any,
    firstVisibleDoc: null as any,
  });

  const fetchProducts = async (direction: "next" | "prev" | "initial" = "initial") => {
    try {
      setLoading(true);
      const productsRef = collection(db, "products");
      let q = query(productsRef);

      if (filters.category) {
        q = query(q, where("category", "==", filters.category));
      }

      if (filters.minPrice) {
        q = query(q, where("price", ">=", Number(filters.minPrice)));
      }
      if (filters.maxPrice) {
        q = query(q, where("price", "<=", Number(filters.maxPrice)));
      }

      if (filters.search) {
        q = query(q, where("name", ">=", filters.search));
      }

      q = query(q, orderBy("name"), limit(pagination.productsPerPage));

      if (direction === "next" && pagination.lastVisibleDoc) {
        q = query(q, startAfter(pagination.lastVisibleDoc));
      } else if (direction === "prev" && pagination.firstVisibleDoc) {
        q = query(q, orderBy("name", "desc"), startAfter(pagination.firstVisibleDoc));
      }

      const querySnapshot = await getDocs(q);

      const fetchedProducts = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Product)
      );

      if (direction === "prev") {
        fetchedProducts.reverse();
      }

      setProducts(fetchedProducts);
      setPagination((prev) => ({
        ...prev,
        lastVisibleDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        firstVisibleDoc: querySnapshot.docs[0],
        currentPage: direction === "next" ? prev.currentPage + 1 : direction === "prev" ? prev.currentPage - 1 : 1,
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts("initial");
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-32 pb-20 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="w-full aspect-square" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-32 pb-20 md:px-8">
      <div className="mb-8 grid md:grid-cols-4 gap-4">
        <Select onValueChange={(value) => handleFilterChange("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {["Elektronik", "Fashion", "Olahraga", "Lainnya"].map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input type="number" placeholder="Harga Min" onChange={(e) => handleFilterChange("minPrice", e.target.value)} />

        <Input type="number" placeholder="Harga Max" onChange={(e) => handleFilterChange("maxPrice", e.target.value)} />

        <Input placeholder="Cari Produk" onChange={(e) => handleFilterChange("search", e.target.value)} />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link href={`/product/${product.slug}`} key={product.id} className="group">
              <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
              </div>
              <h3 className="text-lg font-semibold truncate">{product.name}</h3>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Rp {product.price.toLocaleString()}</p>
                <span className="text-xs text-green-600">Stok: {product.stock}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8 space-x-4">
        <Button variant="outline" disabled={pagination.currentPage === 1} onClick={() => fetchProducts("prev")}>
          <ArrowLeft className="mr-2" /> Sebelumnya
        </Button>

        <Button variant="outline" onClick={() => fetchProducts("next")}>
          Selanjutnya <ArrowRight className="ml-2" />
        </Button>
      </div>

      <div className="text-center mt-4 text-gray-600">Halaman {pagination.currentPage}</div>
    </div>
  );
}
