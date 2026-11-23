"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-16 text-center">
      <span className="text-6xl">🫠</span>
      <h1 className="mt-4 text-4xl md:text-5xl">Oups, petit bug.</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-midnight/55">
        L&apos;erreur est de notre côté. Réessaie, ou reviens à l&apos;accueil pour
        créer ton QR code.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Réessayer
        </button>
        <a href="/" className="btn btn-secondary">
          Accueil
        </a>
      </div>
    </main>
  );
}
