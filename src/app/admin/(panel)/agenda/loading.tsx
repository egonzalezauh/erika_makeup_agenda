import { SkeletonBlock, SkeletonAppointmentCard } from "@/components/admin/AdminSkeleton";

export default function Loading() {
  return (
    <>
      <header>
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="mt-2 h-8 w-32" />
      </header>

      <div className="mt-7 flex flex-col gap-8">
        <section>
          <SkeletonBlock className="mb-3 h-3 w-16" />
          <div className="flex flex-col gap-3">
            <SkeletonAppointmentCard />
            <SkeletonAppointmentCard />
          </div>
        </section>
      </div>
    </>
  );
}
