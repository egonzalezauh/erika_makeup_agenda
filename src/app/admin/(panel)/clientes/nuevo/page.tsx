import type { Metadata } from "next";
import ClientForm from "@/components/admin/ClientForm";

export const metadata: Metadata = { title: "Nueva clienta" };
export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <>
      <header>
        <p className="font-sans text-[0.65rem] tracking-[0.24em] uppercase text-muted-rose">
          Nueva clienta
        </p>
        <h1 className="mt-2 font-serif text-3xl text-dark-charcoal">Guardar clienta</h1>
      </header>

      <ClientForm
        initial={{ name: "", phone: "", email: "", notes: "" }}
        submitLabel="Guardar clienta"
      />
    </>
  );
}
