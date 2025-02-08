"use client";
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@repo/ui/components/ui/carousel";
import { Button } from "@repo/ui/components/ui/button";
import { ShoppingCart, Heart, Share2, ChevronRight, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  images: string[];
  ecommerceLinks?: Array<{
    platform: string;
    url: string;
  }>;
}

const PLATFORM_ICONS = {
  Shopee: "https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/icon_favicon_1_32.0Wecxv.png",
  Blibli: "https://www.static-src.com/siva/asset/10_2023/icon-144px.png",
  Tokopedia: "https://images.tokopedia.net/assets-tokopedia-lite/prod/icon192.png",
  Lazada: "https://lzd-img-global.slatic.net/g/tps/tfs/TB1e_.JhHY1gK0jSZTEXXXDQVXa-64-64.png",
};

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
}

interface ProductDetailMainProps {
  slug: string;
}

export default function ProductDetailMain({ slug }: ProductDetailMainProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        const productsRef = collection(db, "products");
        const q = query(productsRef, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast.error("Produk tidak ditemukan");
          setLoading(false);
          return;
        }

        const productDoc = querySnapshot.docs[0];
        const productData = {
          id: productDoc?.id || "",
          ...productDoc?.data(),
        } as Product;

        setProduct(productData);

        const relatedQ = query(productsRef, where("category", "==", productData.category));
        const relatedSnapshot = await getDocs(relatedQ);

        const related = relatedSnapshot.docs
          .filter((doc) => doc.id !== productData.id)
          .slice(0, 4)
          .map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              }) as RelatedProduct
          );

        setRelatedProducts(related);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug]);

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Fungsi copy link
  const handleCopyLink = () => {
    if (product) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          setCopied(true);
          toast.success("Link produk disalin");

          // Reset copied state setelah 2 detik
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        })
        .catch((err) => {
          console.error("Gagal menyalin:", err);
          toast.error("Gagal menyalin link");
        });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-32 pb-20 md:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="w-full aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto text-center px-4 py-8 pt-32 pb-20 md:px-8">
        <h1 className="text-2xl font-bold mb-4">Produk Tidak Ditemukan</h1>
        <p>Maaf, produk yang Anda cari tidak tersedia.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-32 pb-20 md:px-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Carousel className="w-full">
          <CarouselContent>
            {product.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-square">
                  <Image src={image} alt={`${product.name} - Gambar ${index + 1}`} fill className="object-cover rounded-lg" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-4">{product.category}</p>

          <div className="flex items-center mb-6">
            <span className="text-2xl font-bold mr-4">Rp {product.price.toLocaleString()}</span>
            <span className="text-green-600">Stok: {product.stock}</span>
          </div>

          <div className="flex items-center mb-6">
            <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
              -
            </Button>
            <span className="mx-4">{quantity}</span>
            <Button variant="outline" size="icon" onClick={incrementQuantity} disabled={quantity >= product.stock}>
              +
            </Button>
          </div>

          <div className="flex gap-4">
            <Button className="flex-grow" disabled={product.stock === 0}>
              <ShoppingCart className="mr-2" /> Tambah Keranjang
            </Button>
            <Button variant="outline" size="icon">
              <Heart />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Share2 />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bagikan Produk</DialogTitle>
                  <DialogDescription>Pilih metode berbagi produk</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      name: "WhatsApp",
                      icon: "https://api.iconify.design/logos:whatsapp-icon.svg",
                      shareUrl: (url: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
                    },
                    {
                      name: "Facebook",
                      icon: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png",
                      shareUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    },
                    {
                      name: "Twitter",
                      icon: "https://api.iconify.design/devicon:twitter.svg",
                      shareUrl: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
                    },
                  ].map((platform) => (
                    <Button
                      key={platform.name}
                      variant="outline"
                      className="flex flex-col items-center"
                      onClick={() => {
                        if (product) {
                          window.open(platform.shareUrl(window.location.href), "_blank");
                        }
                      }}>
                      <Image src={platform.icon} alt={`${platform.name} Icon`} width={32} height={32} className="mb-2" />
                      {platform.name}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Input value={window.location.href} readOnly className="flex-grow" />
                  <Button variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="text-green-500" /> : <Copy />}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Deskripsi</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {product.ecommerceLinks && product.ecommerceLinks.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Beli di Platform Lain</h2>
              <div className="grid grid-cols-2 gap-4">
                {product.ecommerceLinks.map((link, index) => {
                  const PlatformIcon = PLATFORM_ICONS[link.platform as keyof typeof PLATFORM_ICONS];

                  return (
                    <Link key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full flex items-center justify-between">
                        <div className="flex items-center justify-center">
                          {PlatformIcon && <Image src={PlatformIcon} alt={`${link.platform} Icon`} width={24} height={24} className="mr-2" />}
                          <span>{link.platform}</span>
                        </div>
                        <ChevronRight className="ml-2" size={16} />
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Produk Terkait</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/product/${relatedProduct.slug}`} className="group">
                <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                  <Image src={relatedProduct.images[0] || ""} alt={relatedProduct.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold truncate">{relatedProduct.name}</h3>
                <p className="text-gray-600">Rp {relatedProduct.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
