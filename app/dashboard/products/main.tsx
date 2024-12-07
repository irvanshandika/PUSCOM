/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/src/components/ui/alert-dialog";
import { db } from "@/src/config/FirebaseConfig";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import AddProductDialog from "@/src/servercomponents/dashboard/products/AddProductDialog";
import EditProductDialog from "@/src/servercomponents/dashboard/products/EditProductDialog";
import { Button } from "@/src/components/ui/button";
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

export default function ProductDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
          } as Product)
      );
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
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

  return (
    <div className="min-h-screen bg-background dark:bg-black/90 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Product Dashboard</h1>
          <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
            <PlusCircle /> Tambah Produk
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold dark:text-white">{product.name}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => openEditDialog(product)}>
                    <Edit size={20} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 size={20} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus produk <strong>{product.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteProduct(product.id!)} className="bg-red-600 hover:bg-red-700">
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="space-y-2 dark:text-neutral-300">
                <p>Category: {product.category}</p>
                <p>Price: Rp {product.price.toLocaleString()}</p>
                <p>Stock: {product.stock}</p>
              </div>
            </div>
          ))}
        </div>

        <AddProductDialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onSubmit={handleAddProduct} />

        <EditProductDialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} onSubmit={handleEditProduct} product={selectedProduct} />
      </div>
    </div>
  );
}
