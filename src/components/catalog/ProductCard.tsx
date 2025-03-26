import React from "react";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

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

const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-md">
      <div className="aspect-square overflow-hidden relative">
        <Image src={product.images[0] || "https://placehold.co/400x400/png"} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" width={0} height={0} />
        <div className="absolute top-2 right-2">
          <Badge variant={product.stock > 0 ? "default" : "destructive"}>{product.stock > 0 ? "Tersedia" : "Habis"}</Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant="secondary">{product.category}</Badge>
        </div>
      </div>

      <CardContent className="flex-grow pt-4">
        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{product.description}</p>
        <div className="mt-3">
          <p className="font-bold text-lg">{formatPrice(product.price)}</p>
          <p className="text-sm text-muted-foreground">Stok: {product.stock} tersisa</p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0 pb-4">
        <Button className="w-full" asChild>
          <Link href={`/product/${product.slug}`}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat Produk
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
