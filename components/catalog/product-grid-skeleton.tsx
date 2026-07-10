import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-[3/4] rounded-none" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
