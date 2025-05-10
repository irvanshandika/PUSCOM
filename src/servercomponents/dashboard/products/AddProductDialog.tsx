/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { X, Plus, ImagePlus, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Card, CardContent } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

// Dynamic import for Tiptap editor (compatible with Next.js 15+)
const TiptapEditor = dynamic(() => import("@/src/components/TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-32 items-center justify-center rounded-md border border-dashed p-4 dark:border-neutral-700">
      <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
    </div>
  ),
});

const CATEGORIES = ["Komputer", "Laptop", "Spare Part"];
const E_COMMERCE = ["Shopee", "Blibli", "Tokopedia", "Lazada"];
const CONDITIONS = ["Baru", "Bekas"];

type ECommerceLink = {
  platform: string;
  url: string;
};

type AddProductDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: any) => Promise<void>;
};

export default function AddProductDialog({ open, onClose, onSubmit }: AddProductDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [ecommerceLinks, setEcommerceLinks] = useState<ECommerceLink[]>([{ platform: "", url: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > 5) {
        toast.error("Maksimal 5 gambar");
        return;
      }
      setImages((prevImages) => [...prevImages, ...acceptedFiles]);
    },
    [images]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".webp"],
    },
    multiple: true,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const addEcommerceLink = () => {
    if (ecommerceLinks.length < 5) {
      setEcommerceLinks([...ecommerceLinks, { platform: "", url: "" }]);
    } else {
      toast.error("Maksimal 5 link e-commerce");
    }
  };

  const updateEcommercePlatform = (index: number, platform: string) => {
    const newLinks = [...ecommerceLinks];
    newLinks[index].platform = platform;
    setEcommerceLinks(newLinks);
  };

  const updateEcommerceUrl = (index: number, url: string) => {
    const newLinks = [...ecommerceLinks];
    newLinks[index].url = url;
    setEcommerceLinks(newLinks);
  };

  const removeEcommerceLink = (index: number) => {
    const newLinks = ecommerceLinks.filter((_, i) => i !== index);
    setEcommerceLinks(newLinks);
  };

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  const handleSubmit = async () => {
    if (!name || !category || !price || !stock) {
      toast.error("Harap isi semua field wajib");
      return;
    }

    setIsSubmitting(true);

    try {
      const storage = getStorage();

      const imageUrls: string[] = [];
      for (const file of images) {
        const imageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        imageUrls.push(downloadURL);
      }

      const slug = generateSlug(name);

      const productData = {
        name,
        category,
        slug,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
        condition,
        images: imageUrls,
        ecommerceLinks: ecommerceLinks.filter((link) => link.platform && link.url),
      };

      await onSubmit(productData);

      toast.success("Produk berhasil ditambahkan");
      resetForm();
    } catch (error) {
      console.error("Error uploading product:", error);
      toast.error("Gagal menambahkan produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setPrice("");
    setStock("");
    setDescription("");
    setCondition("");
    setImages([]);
    setEcommerceLinks([{ platform: "", url: "" }]);
    setActiveTab("details");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium tracking-tight">Tambah Produk Baru</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details">Detail Produk</TabsTrigger>
            <TabsTrigger value="description">Deskripsi</TabsTrigger>
            <TabsTrigger value="media">Media & Link</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-0">
            <Card className="border-none shadow-none">
              <CardContent className="p-0 space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Nama Produk</label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Masukkan nama produk" 
                    className="h-9 dark:bg-neutral-800" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Kategori</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9 dark:bg-neutral-800">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Harga</label>
                    <Input 
                      type="number" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      placeholder="Harga" 
                      className="h-9 dark:bg-neutral-800" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Stok</label>
                    <Input 
                      type="number" 
                      value={stock} 
                      onChange={(e) => setStock(e.target.value)} 
                      placeholder="Stok" 
                      className="h-9 dark:bg-neutral-800" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Kondisi</label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="h-9 dark:bg-neutral-800">
                      <SelectValue placeholder="Pilih Kondisi" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((cond) => (
                        <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="description" className="mt-0">
            <Card className="border-none shadow-none">
              <CardContent className="p-0">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Deskripsi Produk</label>
                  <TiptapEditor
                    content={description}
                    onChange={setDescription}
                    className="min-h-[250px] rounded-md border dark:border-neutral-700"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="media" className="mt-0">
            <Card className="border-none shadow-none">
              <CardContent className="p-0 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Gambar Produk</label>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 transition-colors text-center cursor-pointer",
                      isDragActive 
                        ? "border-primary bg-primary/5" 
                        : "border-neutral-200 hover:border-primary/50 dark:border-neutral-700"
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center py-4">
                      <ImagePlus size={32} className="text-neutral-400 mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {isDragActive ? "Lepaskan file di sini" : "Seret & lepas gambar atau klik untuk memilih"}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">Maks. 5 gambar (PNG, JPG, WEBP)</p>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 mt-3">
                      {images.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden group">
                          <Image 
                            src={URL.createObjectURL(file)} 
                            alt={`Preview ${index}`} 
                            className="object-cover" 
                            fill 
                            sizes="(max-width: 768px) 100vw, 20vw"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }} 
                              className="bg-red-500 text-white p-1 rounded-full"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Link E-Commerce</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addEcommerceLink}
                      className="h-8 text-xs"
                      disabled={ecommerceLinks.length >= 5}
                    >
                      <Plus size={14} className="mr-1" /> Tambah Link
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {ecommerceLinks.map((link, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Select value={link.platform} onValueChange={(platform) => updateEcommercePlatform(index, platform)}>
                          <SelectTrigger className="h-9 w-1/3 dark:bg-neutral-800">
                            <SelectValue placeholder="Platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {E_COMMERCE.map((platform) => (
                              <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input 
                          value={link.url} 
                          onChange={(e) => updateEcommerceUrl(index, e.target.value)} 
                          placeholder="URL E-Commerce" 
                          className="h-9 flex-grow dark:bg-neutral-800" 
                        />

                        {ecommerceLinks.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeEcommerceLink(index)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t dark:border-neutral-800">
          <div className="flex justify-between w-full">
            <Button variant="ghost" onClick={resetForm} className="h-9 px-4">
              Batal
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!name || !category || !price || !stock || isSubmitting} 
              className="h-9 px-5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Produk"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const validateProductData = (data: any) => {
  const errors: string[] = [];

  if (!data.name) errors.push("Nama produk harus diisi");
  if (!data.category) errors.push("Kategori harus dipilih");
  if (!data.price || data.price <= 0) errors.push("Harga harus valid");
  if (!data.stock || data.stock < 0) errors.push("Stok harus valid");

  data.ecommerceLinks?.forEach((link: ECommerceLink) => {
    if (link.platform && !isValidUrl(link.url)) {
      errors.push(`URL ${link.platform} tidak valid`);
    }
  });

  return errors;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export { validateProductData };