/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect } from "react";
import { collection, query, getDocs, where, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import ProductCard from "@/src/components/catalog/ProductCard";
import ProductCardSkeleton from "@/src/components/catalog/ProductCardSkeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
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
  const [sortOption, setSortOption] = useState(""); // State untuk menangani pilihan urutan
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
      const fetchedProducts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));

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
    const sorted = [...products];

    switch (sortOption) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      default:
        // No sorting
        break;
    }

    setProducts(sorted);
  }, [sortOption]);

  useEffect(() => {
    fetchProducts("initial");
  }, [filters, pagination.currentPage, debouncedSearch]); // Gunakan debouncedSearch di sini

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSort = (value: string) => {
    setSortOption(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-32">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center">
          <h1 className="text-2xl font-bold">Katalog Produk</h1>
        </div>

        {/* Search and filter section */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center w-full">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Cari produk..." className="pl-10" value={searchValue} onChange={handleSearch} />
          </div>

          <div className="flex items-center gap-2 w-full md:w-[200px]">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={sortOption} onValueChange={handleSort}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Nama (A-Z)</SelectItem>
                <SelectItem value="price-desc">Harga (Tertinggi)</SelectItem>
                <SelectItem value="price-asc">Harga (Terendah)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {loading ? Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={`skeleton-${index}`} />) : products.map((product) => <ProductCard key={product.id} product={product} />)}

          {!loading && products.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-muted-foreground">Tidak ada produk yang ditemukan.</p>
              <p className="text-sm text-muted-foreground mt-2">Coba gunakan kata kunci pencarian yang berbeda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
