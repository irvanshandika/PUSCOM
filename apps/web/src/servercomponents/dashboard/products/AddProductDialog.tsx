/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@repo/ui/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Button } from "@repo/ui/components/ui/button";
import { X, Plus, ImagePlus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { toast } from "react-hot-toast";

const CATEGORIES = ["Komputer", "Laptop", "Spare Part"];
const E_COMMERCE = ["Shopee", "Blibli", "Tokopedia", "Lazada"];
const CONDITIONS = ["Baru", "Bekas"];
const STATUS = ["Tersedia", "Tidak Tersedia"];

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
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [ecommerceLinks, setEcommerceLinks] = useState<ECommerceLink[]>([{ platform: "", url: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (newLinks[index]) {
      newLinks[index].platform = platform;
      setEcommerceLinks(newLinks);
    }
  };

  const updateEcommerceUrl = (index: number, url: string) => {
    const newLinks = [...ecommerceLinks];
    if (newLinks[index]) {
      newLinks[index].url = url;
    }
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
        status,
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
    setStatus("");
    setCondition("");
    setImages([]);
    setEcommerceLinks([{ platform: "", url: "" }]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 dark:scrollbar-track-neutral-800 dark:scrollbar-thumb-neutral-600">
        <DialogHeader>
          <DialogTitle className="text-2xl dark:text-white">Tambah Produk Baru</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 dark:text-neutral-200">Nama Produk</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama produk" className="dark:bg-neutral-800 dark:text-white" />
            </div>

            <div>
              <label className="block mb-2 dark:text-neutral-200">Kategori</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="dark:bg-neutral-800 dark:text-white">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 dark:text-neutral-200">Harga</label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Harga" className="dark:bg-neutral-800 dark:text-white" />
              </div>
              <div>
                <label className="block mb-2 dark:text-neutral-200">Stok</label>
                <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stok" className="dark:bg-neutral-800 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block mb-2 dark:text-neutral-200">Kondisi</label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="dark:bg-neutral-800 dark:text-white">
                  <SelectValue placeholder="Pilih Kondisi" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {cond}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2 dark:text-neutral-200">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="dark:bg-neutral-800 dark:text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS.map((stat) => (
                    <SelectItem key={stat} value={stat}>
                      {stat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 dark:text-neutral-200">Deskripsi</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi produk" className="h-32 dark:bg-neutral-800 dark:text-white" />
            </div>

            <div>
              <label className="block mb-2 dark:text-neutral-200">Upload Gambar</label>
              <div
                {...getRootProps()}
                className={`
                      border-2 border-dashed p-6 text-center cursor-pointer 
                      ${isDragActive ? "border-green-500" : "border-gray-300 dark:border-neutral-700"}
                      hover:border-primary transition-colors
                      dark:bg-neutral-800
                    `}>
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-green-500">Lepaskan file di sini</p>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImagePlus size={48} className="text-gray-400 mb-2" />
                    <p className="text-gray-500 dark:text-neutral-400">
                      Seret & lepas gambar atau
                      <span className="text-primary ml-1">Pilih File</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Maks. 5 gambar (PNG, JPG, WEBP)</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4">
                {images.map((file, index) => (
                  <div key={index} className="relative">
                    <Image src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded" width={80} height={80} />
                    <button onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full m-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 dark:text-neutral-200 flex justify-between items-center">
                <span>E-Commerce Links</span>
                <Button type="button" variant="ghost" size="sm" onClick={addEcommerceLink} className="flex items-center gap-2">
                  <Plus size={16} /> Tambah Link
                </Button>
              </label>

              {ecommerceLinks.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Select value={link.platform} onValueChange={(platform) => updateEcommercePlatform(index, platform)}>
                    <SelectTrigger className="w-1/3 dark:bg-neutral-800 dark:text-white">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {E_COMMERCE.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input value={link.url} onChange={(e) => updateEcommerceUrl(index, e.target.value)} placeholder="URL E-Commerce" className="flex-grow dark:bg-neutral-800 dark:text-white" />

                  {ecommerceLinks.length > 1 && (
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeEcommerceLink(index)}>
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={resetForm} className="dark:text-white dark:border-neutral-700">
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={!name || !category || !price || !stock || isSubmitting} variant="default">
              {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
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
