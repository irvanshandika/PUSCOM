import React from "react";
import { Skeleton } from "@/src/components/ui/skeleton";

const ProductDetailSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images Carousel Skeleton */}
        <div>
          <Skeleton className="aspect-square w-full max-w-xl mx-auto rounded-lg" />
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((_, index) => (
              <Skeleton key={index} className="h-2 w-10 rounded-full" />
            ))}
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-9 w-4/5 mb-2" />
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-4 w-1/4 mb-4" />
          </div>

          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          <div className="pt-4">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4].map((index) => (
                <Skeleton key={index} className="h-10 w-28" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
