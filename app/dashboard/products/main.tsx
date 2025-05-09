"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/src/components/ui/alert-dialog";
import { db, auth } from "@/src/config/FirebaseConfig";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { Plus, Pencil, Trash, Package, AlertCircle, Search } from "lucide-react";
import AddProductDialog from "@/src/servercomponents/dashboard/products/AddProductDialog";
import EditProductDialog from "@/src/servercomponents/dashboard/products/EditProductDialog";
import { Button } from "@/src/components/ui/button";
import { toast } from "react-hot-toast";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

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

export default function ProductDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Product)
      );
      setProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Gagal memuat produk");
    }
  };

  const handleAddProduct = async (product: Product) => {
    try {
      const docRef = await addDoc(collection(db, "products"), product);
      setProducts([...products, { ...product, id: docRef.id, slug: docRef.id }]);
      setIsAddDialogOpen(false);
      toast.success("Produk berhasil ditambahkan");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Gagal menambahkan produk");
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      if (!updatedProduct.id) {
        toast.error("ID produk tidak valid");
        return;
      }

      const productRef = doc(db, "products", updatedProduct.id);
      await updateDoc(productRef, updatedProduct);

      setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
      setIsEditDialogOpen(false);
      toast.success("Produk berhasil diperbarui");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Gagal memperbarui produk");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts(products.filter((p) => p.id !== productId));
      toast.success("Produk berhasil dihapus");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Gagal menghapus produk");
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setIsAdmin(userData.roles === "admin");
        } else {
          setIsAdmin(false);
        }
        setCheckingRole(false);
      }
    };

    if (user) {
      checkUserRole();
    } else if (!loading) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  const getStockStatus = (stock: number) => {
    if (stock > 10) return { color: "bg-green-100 text-green-800", label: "Tersedia" };
    if (stock > 0) return { color: "bg-amber-100 text-amber-800", label: "Terbatas" };
    return { color: "bg-red-100 text-red-800", label: "Habis" };
  };

  if (loading || checkingRole) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="text-lg font-medium">Memeriksa hak akses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <p className="text-red-700 dark:text-red-300">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    router.push("/forbidden");
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight dark:text-white">Manajemen Produk</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Kelola semua produk dalam satu tampilan
              </p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="inline-flex items-center gap-2 self-start md:self-auto"
            >
              <Plus size={18} /> Tambah Produk
            </Button>
          </div>
          
          <Separator className="dark:bg-gray-800" />
          
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan {filteredProducts.length} dari {products.length} produk
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tidak ada produk</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {searchQuery ? "Tidak ada hasil yang sesuai dengan pencarian Anda" : "Tambahkan produk pertama Anda dengan mengklik tombol di atas"}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              
              return (
                <Card key={product.id} className="overflow-hidden border-0 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                    {product.images && product.images[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={`${stockStatus.color}`}>
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-medium line-clamp-1 dark:text-white">
                        {product.name}
                      </CardTitle>
                      <Badge variant="outline" className="dark:border-gray-700">
                        {product.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0">
                    <p className="text-lg font-semibold dark:text-white mb-3">
                      Rp {product.price.toLocaleString()}
                    </p>
                    
                    <div className="flex text-sm gap-1 text-gray-500 dark:text-gray-400 mb-4">
                      <span>Kondisi: {product.condition}</span>
                      <span>•</span>
                      <span>Stok: {product.stock}</span>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 dark:border-gray-700 dark:hover:bg-gray-700"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil size={16} className="mr-2" /> Edit
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 dark:border-gray-700 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash size={16} className="mr-2" /> Hapus
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-white">Hapus Produk</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                              Apakah Anda yakin ingin menghapus produk <span className="font-medium text-gray-900 dark:text-gray-200">{product.name}</span>? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="dark:border-gray-600 dark:hover:bg-gray-700">Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteProduct(product.id)} 
                              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AddProductDialog 
        open={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
        onSubmit={handleAddProduct} 
      />

      <EditProductDialog 
        open={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        onSubmit={handleEditProduct} 
        product={selectedProduct} 
      />
    </div>
  );
}