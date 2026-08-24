import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex flex-col justify-center px-6 py-12 bg-cream-soft">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-10">
          <p className="font-sans text-[0.7rem] tracking-[0.28em] uppercase text-muted-rose">
            Erika Auhing
          </p>
          <h1 className="mt-3 font-serif text-4xl text-dark-charcoal">
            Mi agenda
          </h1>
          <p className="mt-3 font-sans text-sm text-charcoal-light">
            Ingresa tu contraseña para ver tus citas.
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
