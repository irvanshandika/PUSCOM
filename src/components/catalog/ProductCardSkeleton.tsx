import React from "react";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <Skeleton className="aspect-square" />

      <CardContent className="flex-grow pt-4">
        <Skeleton className="h-6 w-4/5 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-3" />
        <Skeleton className="h-6 w-2/5 mb-1" />
        <Skeleton className="h-4 w-1/4" />
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0 pb-4">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
};

export default ProductCardSkeleton;
