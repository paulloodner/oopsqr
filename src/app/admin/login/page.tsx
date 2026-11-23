import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-midnight px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-white/10 bg-midnight-2 p-7 shadow-2xl">
          <div className="mb-6 text-center">
            <Link href="/" className="brand text-2xl text-cream">
              OOPS<em className="not-italic text-lime">QR</em>
            </Link>
            <h1 className="mt-4 text-2xl text-cream">Espace admin</h1>
            <p className="mt-1 text-xs text-cream/45">
              Accès privé. Gestion des surprises et des signalements.
            </p>
          </div>
          <LoginForm />
        </div>
        <Link
          href="/"
          className="mt-4 block text-center text-xs text-cream/40 hover:text-lime"
        >
          ← Retour au site
        </Link>
      </div>
    </main>
  );
}
