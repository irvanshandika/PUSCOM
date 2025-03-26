/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/src/components/ui/carousel";
import { Button } from "@/src/components/ui/button";
import { Copy, Check, ChevronLeft, Share } from "lucide-react";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { useRouter } from "next/navigation";
import { Badge } from "@/src/components/ui/badge";
import ProductDetailSkeleton from "@/src/components/ProductDetailSkeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";

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
  const router = useRouter();
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = React.useState(0);

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
          id: productDoc.id,
          ...productDoc.data(),
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
              } as RelatedProduct)
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

  useEffect(() => {
    if (!api) return;

    const autoplayInterval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    return () => {
      clearInterval(autoplayInterval);
      api?.off("select", onSelect);
    };
  }, [api]);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
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
      <>
        <ProductDetailSkeleton />
      </>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Produk tidak ditemukan</h2>
        <p className="text-muted-foreground mb-6">Maaf, produk yang Anda cari tidak tersedia.</p>
        <Button asChild>
          <Link href="/catalog">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Kembali ke Katalog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="relative flex flex-col items-center">
            <Carousel setApi={setApi} className="w-full max-w-xl mx-auto">
              <CarouselContent>
                {product.images.map((image, index) => (
                  <CarouselItem key={index} className="relative">
                    <div className="aspect-square overflow-hidden rounded-lg">
                      <Image src={image} alt={`${product.name} - gambar ${index + 1}`} className="w-full h-full object-cover" width={500} height={500} sizes="(max-width: 768px) 100vw, 500px" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2" />
              <CarouselNext className="absolute right-4 top-1/2" />
            </Carousel>

            <div className="flex justify-center gap-2 mt-4 w-full">
              {product.images.map((_, index) => (
                <button key={index} className={`h-2 w-10 rounded-full transition-colors ${current === index ? "bg-primary" : "bg-muted"}`} onClick={() => api?.scrollTo(index)} />
              ))}
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>{product.stock > 0 ? "Tersedia" : "Habis"}</Badge>
              </div>
              <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
              <p className="text-2xl font-bold text-primary mb-4">{formatPrice(product.price)}</p>
              <p className="text-sm text-muted-foreground mb-4">Stok: {product.stock} tersisa</p>
              <div className="flex items-center gap-2">
                <Dialog>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-9 w-9">
                            <Share className="h-4 w-4" />
                            <span className="sr-only">Bagikan</span>
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bagikan produk</p>
                      </TooltipContent>
                    </Tooltip>
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
                  </TooltipProvider>
                </Dialog>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Deskripsi Produk</h3>
              <div className="prose max-w-none">
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            </div>

            {product.ecommerceLinks && product.ecommerceLinks.length > 0 && (
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-4">Tersedia di Platform</h3>
                <div className="flex flex-wrap gap-3">
                  {product.ecommerceLinks.map((link, index) => {
                    const PlatformIcon = PLATFORM_ICONS[link.platform as keyof typeof PLATFORM_ICONS];
                    return (
                      <Button key={index} variant="outline" className="flex items-center gap-2" onClick={() => router.push(link.url)}>
                        {PlatformIcon && <Image src={PlatformIcon} alt={`${link.platform} Icon`} width={24} height={24} className="h-4 w-4" />}
                        {link.platform}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
