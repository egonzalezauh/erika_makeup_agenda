import { SkeletonBlock } from "@/components/admin/AdminSkeleton";

export default function Loading() {
  return (
    <>
      <header>
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="mt-2 h-8 w-52" />
      </header>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-cream-deep bg-white p-5">
          <SkeletonBlock className="h-3 w-14" />
          <SkeletonBlock className="mt-3 h-7 w-20" />
        </div>
        <div className="rounded-3xl border border-cream-deep bg-white p-5">
          <SkeletonBlock className="h-3 w-14" />
          <SkeletonBlock className="mt-3 h-7 w-20" />
        </div>
      </div>

      <SkeletonBlock className="mt-8 mb-1 h-3 w-28" />
      <SkeletonBlock className="h-48 w-full" />
    </>
  );
}
