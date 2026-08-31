import { SkeletonBlock, SkeletonAppointmentCard } from "@/components/admin/AdminSkeleton";

export default function Loading() {
  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div>
          <SkeletonBlock className="h-3 w-10" />
          <SkeletonBlock className="mt-2 h-8 w-48" />
          <SkeletonBlock className="mt-2 h-4 w-32" />
        </div>
      </header>

      <section className="mt-7 flex flex-col gap-3">
        <SkeletonAppointmentCard />
        <SkeletonAppointmentCard />
      </section>
    </>
  );
}
