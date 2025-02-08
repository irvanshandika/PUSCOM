// apps/web/components/ProductCard.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/components/ui/card";
import Image from "next/image";

interface Product {
  name: string;
  price: number;
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>Rp {product.price.toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Image src={product.image} alt={product.name} width={300} height={200} className="rounded-lg" />
      </CardContent>
    </Card>
  );
}
