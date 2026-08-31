import { SkeletonBlock } from "@/components/admin/AdminSkeleton";

export default function Loading() {
  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div>
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="mt-2 h-8 w-40" />
        </div>
        <SkeletonBlock className="h-11 w-24 rounded-full" />
      </header>

      <div className="mt-7 flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonBlock key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </>
  );
}
