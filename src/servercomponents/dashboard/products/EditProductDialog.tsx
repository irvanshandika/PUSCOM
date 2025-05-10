/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { X, Plus, ImagePlus, Bold, Italic, List, ListOrdered, Heading2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { toast } from "react-hot-toast";

// TipTap imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

const CATEGORIES = ["Komputer", "Laptop", "Spare Part"];
const E_COMMERCE = ["Shopee", "Blibli", "Tokopedia", "Lazada"];
const CONDITIONS = ["Baru", "Bekas"];

type ECommerceLink = {
  platform: string;
  url: string;
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  condition: string;
  images: string[];
  ecommerceLinks: ECommerceLink[];
};

type EditProductDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
  product: Product | null;
};

// TipTap Rich Text Editor component
const RichTextEditor = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Tulis deskripsi produk...',
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor border rounded-md overflow-hidden dark:border-neutral-700">
      <div className="bg-neutral-50 border-b p-2 flex gap-2 dark:bg-neutral-800 dark:border-neutral-700">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`h-8 w-8 ${editor.isActive('heading', { level: 2 }) ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </Button>
      </div>
      <EditorContent 
        editor={editor} 
        className="p-3 min-h-[150px] focus:outline-none prose prose-sm max-w-none dark:prose-invert dark:bg-neutral-800"
      />
    </div>
  );
};

export default function EditProductDialog({ open, onClose, onSubmit, product }: EditProductDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [images, setImages] = useState<(File | string)[]>([]);
  const [ecommerceLinks, setEcommerceLinks] = useState<ECommerceLink[]>([]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setDescription(product.description || "");
      setCondition(product.condition);

      setImages([...product.images.map((img) => img)]);
      setEcommerceLinks(product.ecommerceLinks.length > 0 ? product.ecommerceLinks : [{ platform: "", url: "" }]);
    }
  }, [product]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const currentImageCount = images.length;
      const remainingSlots = 5 - currentImageCount;

      const newImages = acceptedFiles.slice(0, remainingSlots);

      if (newImages.length < acceptedFiles.length) {
        toast.error("Maksimal 5 gambar");
      }

      setImages([...images, ...newImages]);
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

  const handleSubmit = () => {
    if (!name || !category || !price || !stock) {
      toast.error("Harap isi semua field wajib");
      return;
    }

    const existingImages = images.filter((img) => typeof img === "string") as string[];
    const newImageFiles = images.filter((img) => img instanceof File) as File[];

    const productData: Product = {
      id: product?.id || "",
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      description,
      condition,
      images: existingImages,
      ecommerceLinks: ecommerceLinks.filter((link) => link.platform && link.url),
    };

    onSubmit(productData);
    toast.success("Produk berhasil diperbarui");
    resetForm();
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
    onClose();
  };

  const renderImagePreview = (image: string | File, index: number) => {
    const src = typeof image === "string" ? image : URL.createObjectURL(image);

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
          <DialogTitle className="text-xl font-medium dark:text-white">Edit Produk</DialogTitle>
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
            <RichTextEditor value={description} onChange={setDescription} />
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
              disabled={!name || !category || !price || !stock} 
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Perbarui Produk
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const validateProductData = (data: Product) => {
  const errors: string[] = [];

  if (!data.name) errors.push("Nama produk harus diisi");
  if (!data.category) errors.push("Kategori harus dipilih");
  if (!data.price || data.price <= 0) errors.push("Harga harus valid");
  if (!data.stock || data.stock < 0) errors.push("Stok harus valid");

  data.ecommerceLinks.forEach((link) => {
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