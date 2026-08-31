import type { Metadata } from "next";
import { getCompletedAppointmentsInYear } from "@/actions/appointments";
import { guayaquilDateString } from "@/lib/dates";
import { formatCurrency } from "@/lib/utils";
import RevenueChart from "@/components/admin/RevenueChart";

export const metadata: Metadata = { title: "Ingresos" };
export const dynamic = "force-dynamic";

export default async function IngresosPage() {
  const today = guayaquilDateString();
  const [thisYear, thisMonth] = today.split("-"); // "YYYY-MM-DD" -> YYYY, MM

  const completed = await getCompletedAppointmentsInYear(thisYear);

  let thisMonthTotal = 0;
  let thisYearTotal = 0;
  const monthly = new Array(12).fill(0) as number[];

  for (const appointment of completed) {
    const amount = appointment.amountEarned ?? 0;
    const month = appointment.date.toISOString().split("T")[0].split("-")[1];

    thisYearTotal += amount;
    monthly[Number(month) - 1] += amount;
    if (month === thisMonth) {
      thisMonthTotal += amount;
    }
  }

  return (
    <>
      <header>
        <p className="font-sans text-[0.65rem] tracking-[0.24em] uppercase text-muted-rose">
          Ingresos
        </p>
        <h1 className="mt-2 font-serif text-3xl text-dark-charcoal">
          Lo que has ganado
        </h1>
      </header>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-cream-deep bg-white p-5">
          <p className="font-sans text-xs tracking-[0.14em] uppercase text-charcoal-light">
            Este mes
          </p>
          <p className="mt-2 font-serif text-2xl text-dark-charcoal">
            {formatCurrency(thisMonthTotal)}
          </p>
        </div>
        <div className="rounded-3xl border border-cream-deep bg-white p-5">
          <p className="font-sans text-xs tracking-[0.14em] uppercase text-charcoal-light">
            Este año
          </p>
          <p className="mt-2 font-serif text-2xl text-dark-charcoal">
            {formatCurrency(thisYearTotal)}
          </p>
        </div>
      </div>

      <h2 className="mt-8 mb-1 font-sans text-xs tracking-[0.18em] uppercase text-charcoal-light">
        Por mes, {thisYear}
      </h2>
      <RevenueChart monthly={monthly} />
    </>
  );
}
