import { SkeletonBlock } from "@/components/admin/AdminSkeleton";

export default function Loading() {
  return (
    <>
      <header>
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="mt-2 h-8 w-32" />
      </header>

      <div className="mt-7 flex flex-col gap-4">
        <SkeletonBlock className="h-14 w-full rounded-2xl" />
        <SkeletonBlock className="h-14 w-full rounded-2xl" />
        <SkeletonBlock className="h-14 w-full rounded-2xl" />
        <SkeletonBlock className="h-14 w-full rounded-2xl" />
        <SkeletonBlock className="h-28 w-full rounded-2xl" />
      </div>
    </>
  );
}
