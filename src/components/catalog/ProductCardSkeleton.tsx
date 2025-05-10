import React from "react";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden flex flex-col h-full border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
      {/* More interesting image skeleton with gradient overlay */}
      <div className="relative aspect-square rounded-t-xl overflow-hidden">
        <Skeleton className="h-full w-full absolute" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200/30 to-gray-300/30 dark:from-gray-700/30 dark:to-gray-600/30"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-300 dark:text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <CardContent className="flex-grow pt-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-4/5 mb-2" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="pt-2">
            <Skeleton className="h-5 w-2/5" />
          </div>
          <div className="flex items-center gap-1 pt-1">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-10 ml-1" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0 pb-4">
        <Skeleton className="h-9 w-full rounded-full" />
      </CardFooter>
    </Card>
  );
};

export default ProductCardSkeleton;