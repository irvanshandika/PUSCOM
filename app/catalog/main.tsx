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
import { Search, SlidersHorizontal, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import { useTheme } from "next-themes";

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
    hasMore: true,
  });

  const [searchValue, setSearchValue] = useState(""); 
  const [sortOption, setSortOption] = useState("name-asc"); 
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { theme } = useTheme();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories");
        const querySnapshot = await getDocs(categoriesRef);
        const fetchedCategories = querySnapshot.docs.map((doc) => doc.data().name);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const fetchProducts = async (direction: "next" | "prev" | "initial" = "initial") => {
    try {
      setLoading(true);
      const productsRef = collection(db, "products");
      let q = query(productsRef);

      // Apply filters
      if (selectedCategory && selectedCategory !== "all") {
        q = query(q, where("category", "==", selectedCategory));
      }

      if (debouncedSearch) {
        q = query(q, where("name", ">=", debouncedSearch), where("name", "<=", debouncedSearch + "\uf8ff"));
      }

      // Sorting
      switch (sortOption) {
        case "name-asc":
          q = query(q, orderBy("name", "asc"));
          break;
        case "name-desc":
          q = query(q, orderBy("name", "desc"));
          break;
        case "price-asc":
          q = query(q, orderBy("price", "asc"));
          break;
        case "price-desc":
          q = query(q, orderBy("price", "desc"));
          break;
        default:
          q = query(q, orderBy("name", "asc"));
      }

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
        hasMore: querySnapshot.docs.length === pagination.productsPerPage,
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
  }, [debouncedSearch, sortOption, selectedCategory]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSort = (value: string) => {
    setSortOption(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Reset pagination when changing category
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      lastVisibleDoc: null,
      firstVisibleDoc: null,
    }));
  };

  const handleNextPage = () => {
    if (pagination.hasMore) {
      fetchProducts("next");
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      fetchProducts("prev");
    }
  };

  return (
    <div className="w-full min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 pt-24 md:pt-32">
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Katalog Produk</h1>
            <p className="text-muted-foreground text-center max-w-md">
              Temukan berbagai produk berkualitas untuk kebutuhan Anda
            </p>
          </div>
          
          <Separator className="my-2" />

          {/* Search and filter section */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Cari produk..." 
                className="pl-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus-visible:ring-2 focus-visible:ring-offset-0" 
                value={searchValue} 
                onChange={handleSearch} 
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={sortOption} onValueChange={handleSort}>
                <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full">
                  <div className="flex items-center">
                    <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Urutkan" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Nama (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Nama (Z-A)</SelectItem>
                  <SelectItem value="price-desc">Harga (Tertinggi)</SelectItem>
                  <SelectItem value="price-asc">Harga (Terendah)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Kategori" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Category chips - mobile view */}
          <div className="md:hidden flex gap-2 overflow-x-auto py-2 hide-scrollbar">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs whitespace-nowrap"
              onClick={() => handleCategoryChange("all")}
            >
              Semua
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs whitespace-nowrap"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products count display */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Memuat produk...' : `Menampilkan ${products.length} produk`}
            </p>
            
            {selectedCategory !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                {selectedCategory}
                <button 
                  className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
                  onClick={() => handleCategoryChange('all')}
                >
                  ✕
                </button>
              </Badge>
            )}
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
            {loading ? 
              Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={`skeleton-${index}`} />) 
              : 
              products.map((product) => <ProductCard key={product.id} product={product} />)
            }

            {!loading && products.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">Tidak ada produk yang ditemukan</h3>
                <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                  Coba gunakan kata kunci pencarian yang berbeda atau hapus filter yang digunakan.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    setSearchValue("");
                    setSelectedCategory("all");
                    setSortOption("name-asc");
                  }}
                >
                  Hapus Semua Filter
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {products.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage} 
                disabled={pagination.currentPage <= 1}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Halaman {pagination.currentPage}
              </span>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage} 
                disabled={!pagination.hasMore}
                className="rounded-full"
              >
                Selanjutnya <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}