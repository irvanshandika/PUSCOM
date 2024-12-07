/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Search, Filter, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  description: string;
};

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const CATEGORIES = ["Semua", "Komputer", "Laptop", "Spare Part"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, "products");

        const querySnapshot = await getDocs(productsRef);

        const fetchedProducts: Product[] = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Product)
        );

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Katalog Produk</h1>
      </div>

      <div className="flex space-x-4 mb-8">
        <div className="relative flex-grow">
          <Input placeholder="Cari produk..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 dark:bg-neutral-800" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px] dark:bg-neutral-800">
            <div className="flex items-center">
              <Filter className="mr-2 text-gray-400" size={16} />
              <SelectValue placeholder="Kategori" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Tidak ada produk ditemukan</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id}>
              <Card className="hover:shadow-lg transition-shadow duration-300 dark:bg-neutral-800 border-none cursor-pointer">
                <CardContent className="p-4">
                  <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg">
                    <Image src={product.images[0] || "/placeholder.png"} alt={product.name} fill className="object-cover hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold truncate dark:text-white">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold dark:text-white">Rp {product.price.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {filteredProducts.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {[1, 2, 3].map((page) => (
              <Button key={page} variant="outline" size="sm" className="dark:text-white">
                {page}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
