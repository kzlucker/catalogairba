export default function ProductSkeleton() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-gray-200" />
      <div className="space-y-3 p-4 sm:p-5">
        <div className="h-5 w-[88%] animate-pulse rounded-xl bg-gray-200" />
        <div className="h-5 w-[55%] animate-pulse rounded-xl bg-gray-200" />
        <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-200" />
        <div className="flex flex-wrap gap-2 pt-1">
          <div className="h-7 w-16 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-7 w-14 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-7 w-14 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
