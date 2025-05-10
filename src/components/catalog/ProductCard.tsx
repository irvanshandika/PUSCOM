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

  const applyMarkdownFormatting = (text: string) => {
    // Match and process table pattern
    const processedText = text;

    // Convert bold (**text**)
    let formattedText = processedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Convert italic (*text*)
    formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Convert code (`text`)
    formattedText = formattedText.replace(/`([^`]*)`/g, "<code>$1</code>");
    // Convert headings (#, ##, ###)
    formattedText = formattedText.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    formattedText = formattedText.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    formattedText = formattedText.replace(/^# (.*$)/gim, "<h1>$1</h1>");
    // Convert links [text](url)
    formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    // Convert lists (- or *)
    formattedText = formattedText.replace(/^\* (.*$)/gim, "<ul><li>$1</li></ul>");
    formattedText = formattedText.replace(/^\- (.*$)/gim, "<ul><li>$1</li></ul>");
    // Convert numbered lists (1. 2. etc)
    formattedText = formattedText.replace(/^\d+\. (.*$)/gim, "<ol><li>$1</li></ol>");

    return formattedText;
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:translate-y-[-5px] hover:shadow-lg border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
      <div className="aspect-square overflow-hidden relative rounded-t-xl">
        <Image 
          src={product.images[0] || "https://placehold.co/400x400/png"} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
          width={400} 
          height={400} 
          priority
        />
        <div className="absolute top-2 right-2">
          {product.stock <= 0 ? (
            <Badge variant="destructive" className="rounded-full">Habis</Badge>
          ) : product.stock < 5 ? (
            <Badge variant="secondary" className="rounded-full">Stok Terbatas</Badge>
          ) : null}
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-sm">
            {product.category}
          </Badge>
        </div>
      </div>

      <CardContent className="flex-grow pt-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-medium text-base line-clamp-1 text-gray-900 dark:text-gray-50">{product.name}</h3>
        </div>
        
        <p 
          className="text-muted-foreground text-xs line-clamp-2 min-h-[2rem] mt-1"
          dangerouslySetInnerHTML={{ __html: applyMarkdownFormatting(product.description) }}
        />
        
        <div className="mt-2">
          <p className="font-semibold text-base text-gray-900 dark:text-gray-50">{formatPrice(product.price)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {product.stock > 0 
              ? `${product.stock} tersisa` 
              : "Stok habis"}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0 pb-4">
        <Button 
          className="w-full rounded-full" 
          variant="default"
          asChild
        >
          <Link href={`/product/${product.slug}`}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat Detail
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;