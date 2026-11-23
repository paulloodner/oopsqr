import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-16 text-center">
      <p className="font-display text-6xl font-black text-violet">404</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Cette page s&apos;est perdue.</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-midnight/55">
        Le lien est peut-être expiré, mal orthographié, ou la surprise a été
        supprimée. Les contenus OOPSQR ne durent que 14 jours.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-secondary">
          Accueil
        </Link>
        <Link href="/creer" className="btn btn-primary">
          Créer un QR code
        </Link>
      </div>
    </main>
  );
}
