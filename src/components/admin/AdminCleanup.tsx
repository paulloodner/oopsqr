"use client";

import { useState } from "react";

export function AdminCleanup() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/cleanup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setMessage(
        `${data.expired} expiration(s), ${data.removedFiles} fichier(s) supprimé(s), ${data.purged} ligne(s) purgée(s).`
      );
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setMessage("Le nettoyage a échoué.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="btn btn-secondary btn-sm"
      >
        {busy ? "Nettoyage…" : "Nettoyer les contenus expirés"}
      </button>
      {message && <span className="text-xs text-cream/60">{message}</span>}
    </div>
  );
}
