import type { Metadata } from "next";
import Link from "next/link";
import { getClients } from "@/actions/clients";
import ClientList from "@/components/admin/ClientList";

export const metadata: Metadata = { title: "Clientes" };
export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clients = await getClients();

  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-[0.65rem] tracking-[0.24em] uppercase text-muted-rose">
            Clientes
          </p>
          <h1 className="mt-2 font-serif text-3xl text-dark-charcoal">
            Tus clientas
          </h1>
        </div>
        <Link
          href="/admin/clientes/nuevo"
          className="flex h-11 items-center rounded-full bg-muted-rose px-5 font-sans text-sm text-cream-soft active:bg-muted-rose-dark"
        >
          + Nueva
        </Link>
      </header>

      <ClientList clients={clients} />
    </>
  );
}
