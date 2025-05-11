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

  const renderImagePreview = (file: File, index: number) => {
    const src = URL.createObjectURL(file);

    return (
      <div key={index} className="relative group overflow-hidden rounded-lg">
        <Image 
          src={src} 
          alt={`Preview ${index}`} 
          className="w-full h-24 object-cover transition-all group-hover:opacity-80" 
          width={120} 
          height={96} 
        />
        <button 
          onClick={() => removeImage(index)} 
          className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          type="button"
        >
          <X size={14} />
        </button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 dark:scrollbar-track-neutral-800 dark:scrollbar-thumb-neutral-600">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium dark:text-white">Tambah Produk Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block text-neutral-700 dark:text-neutral-300">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Masukkan nama produk" 
                className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" 
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-neutral-700 dark:text-neutral-300">
                Kategori <span className="text-red-500">*</span>
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="dark:bg-neutral-900">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price & Stock Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block text-neutral-700 dark:text-neutral-300">
                Harga <span className="text-red-500">*</span>
              </label>
              <Input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="Harga" 
                className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" 
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block text-neutral-700 dark:text-neutral-300">
                Stok <span className="text-red-500">*</span>
              </label>
              <Input 
                type="number" 
                value={stock} 
                onChange={(e) => setStock(e.target.value)} 
                placeholder="Stok" 
                className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" 
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block text-neutral-700 dark:text-neutral-300">
                Kondisi <span className="text-red-500">*</span>
              </label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
                  <SelectValue placeholder="Pilih Kondisi" />
                </SelectTrigger>
                <SelectContent className="dark:bg-neutral-900">
                  {CONDITIONS.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {cond}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <label className="text-sm font-medium mb-2 block text-neutral-700 dark:text-neutral-300">
              Deskripsi
            </label>
            <TiptapEditor
              content={description}
              onChange={setDescription}
              className="min-h-[250px] rounded-md border dark:border-neutral-700"
            />
          </div>

          {/* Images Section */}
          <div>
            <label className="text-sm font-medium mb-2 block text-neutral-700 dark:text-neutral-300">
              Gambar Produk
            </label>
            
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
                ${isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-neutral-300 dark:border-neutral-700"}
                hover:border-blue-400 dark:hover:border-blue-600 transition-colors
                dark:bg-neutral-800
              `}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-blue-500 dark:text-blue-400">Lepaskan gambar di sini</p>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <ImagePlus size={36} className="text-neutral-400 mb-3" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Seret & lepas gambar atau <span className="text-blue-500 font-medium">pilih file</span>
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">Maks. 5 gambar (PNG, JPG, WEBP)</p>
                </div>
              )}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {images.map(renderImagePreview)}
              </div>
            )}
          </div>

          {/* E-Commerce Links Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Link E-Commerce
              </label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addEcommerceLink} 
                className="h-8 text-xs flex items-center gap-1 dark:border-neutral-700 dark:text-white"
                disabled={ecommerceLinks.length >= 5}
              >
                <Plus size={14} /> Tambah Link
              </Button>
            </div>

            <div className="space-y-3">
              {ecommerceLinks.map((link, index) => (
                <div key={index} className="flex gap-3">
                  <Select value={link.platform} onValueChange={(platform) => updateEcommercePlatform(index, platform)}>
                    <SelectTrigger className="w-1/3 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-neutral-900">
                      {E_COMMERCE.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input 
                    value={link.url} 
                    onChange={(e) => updateEcommerceUrl(index, e.target.value)} 
                    placeholder="URL E-Commerce" 
                    className="flex-grow dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" 
                  />

                  {ecommerceLinks.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeEcommerceLink(index)}
                      className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t dark:border-neutral-800">
          <div className="flex gap-3 justify-end w-full">
            <Button 
              variant="outline" 
              onClick={resetForm} 
              className="dark:bg-transparent dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!name || !category || !price || !stock || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
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