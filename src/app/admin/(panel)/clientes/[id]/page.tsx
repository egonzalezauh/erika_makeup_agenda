import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientById } from "@/lib/clients-data";
import ClientForm from "@/components/admin/ClientForm";

export const metadata: Metadata = { title: "Editar clienta" };
export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) notFound();

  return (
    <>
      <header>
        <p className="font-sans text-[0.65rem] tracking-[0.24em] uppercase text-muted-rose">
          Editar
        </p>
        <h1 className="mt-2 font-serif text-3xl text-dark-charcoal">
          {client.name}
        </h1>
      </header>

      <ClientForm
        clientId={client.id}
        initial={{
          name:  client.name,
          phone: client.phone ?? "",
          email: client.email ?? "",
          notes: client.notes ?? "",
        }}
        submitLabel="Guardar cambios"
      />
    </>
  );
}
