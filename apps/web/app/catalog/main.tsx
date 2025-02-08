/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { collection, query, getDocs, where, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import Image from "next/image";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
};

type SortOption = "nameAsc" | "nameDesc" | "priceAsc" | "priceDesc";

export default function CatalogMain() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    sort: "nameAsc" as SortOption,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    productsPerPage: 12,
    lastVisibleDoc: null as any,
    firstVisibleDoc: null as any,
  });

  const [searchValue, setSearchValue] = useState(""); // State untuk menangani input pencarian
  const [debouncedSearch, setDebouncedSearch] = useState(""); // State untuk pencarian setelah delay

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500); // Delay 500ms setelah pengguna berhenti mengetik
    return () => clearTimeout(timer);
  }, [searchValue]);

  const fetchProducts = async (direction: "next" | "prev" | "initial" = "initial") => {
    try {
      setLoading(true);
      const productsRef = collection(db, "products");
      let q = query(productsRef);

      // Apply filters
      if (filters.category && filters.category !== "all") {
        q = query(q, where("category", "==", filters.category));
      }

      if (debouncedSearch) {
        // Gunakan debouncedSearch untuk pencarian
        q = query(q, where("name", ">=", debouncedSearch), where("name", "<=", debouncedSearch + "\uf8ff"));
      }

      // Sorting
      const [sortField, sortDirection] = filters.sort.split(/(?=[A-Z])/) as [string, "Asc" | "Desc"];
      q = query(q, orderBy(sortField, sortDirection.toLowerCase() as "asc" | "desc"));

      // Pagination
      q = query(q, limit(pagination.productsPerPage));

      if (direction === "next" && pagination.lastVisibleDoc) {
        q = query(q, startAfter(pagination.lastVisibleDoc));
      } else if (direction === "prev" && pagination.firstVisibleDoc) {
        q = query(q, startAfter(pagination.firstVisibleDoc));
      }

      const querySnapshot = await getDocs(q);
      const fetchedProducts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product);

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
  }, [filters, pagination.currentPage, debouncedSearch]); // Gunakan debouncedSearch di sini

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1, lastVisibleDoc: null, firstVisibleDoc: null }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-32 pb-20 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-32 pb-20 md:px-8">
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Input
              placeholder="Cari Produk"
              className="pl-10"
              onChange={(e) => setSearchValue(e.target.value)} // Update searchValue
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Select onValueChange={(value) => handleFilterChange("category", value)} value={filters.category}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem> {/* Default value */}
              {["Laptop", "Komputer", "Spare Part"].map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleFilterChange("sort", value as SortOption)} value={filters.sort}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nameAsc">Nama (A-Z)</SelectItem>
              <SelectItem value="nameDesc">Nama (Z-A)</SelectItem>
              <SelectItem value="priceAsc">Harga (Terendah)</SelectItem>
              <SelectItem value="priceDesc">Harga (Tertinggi)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link href={`/product/${product.slug}`} key={product.id} className="group">
              <div className="relative aspect-square mb-2 overflow-hidden rounded-lg bg-gray-100">
                <Image src={product.images[0] || ""} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h3 className="text-sm font-medium truncate">{product.name}</h3>
              <div className="flex justify-between items-center text-sm">
                <p className="font-semibold">Rp {product.price.toLocaleString()}</p>
                <span className="text-green-600">Stok: {product.stock}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8 space-x-4">
        <Button variant="outline" size="sm" disabled={pagination.currentPage === 1} onClick={() => fetchProducts("prev")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Sebelumnya
        </Button>
        <Button variant="outline" size="sm" onClick={() => fetchProducts("next")}>
          Selanjutnya <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="text-center mt-4 text-sm text-gray-600">Halaman {pagination.currentPage}</div>
    </div>
  );
}