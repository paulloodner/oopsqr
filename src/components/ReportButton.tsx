"use client";

import { useState } from "react";
import { REPORT_REASONS } from "@/lib/types";

export function ReportButton({ id, color }: { id: string; color?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p
        className="text-xs font-semibold"
        style={{ color: color ?? "rgba(23,21,31,0.6)" }}
        role="status"
      >
        Merci, le signalement a bien été transmis.
      </p>
    );
  }

  return (
    <div className="w-full max-w-xs">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          // Couleur dérivée du thème de la surprise : le lien reste lisible
          // même avec un fond sombre (au lieu d'un gris fixe devenu invisible).
          style={{ color: color ?? "rgba(23,21,31,0.45)" }}
          className="mx-auto block text-[0.7rem] font-semibold underline underline-offset-2 hover:opacity-70"
        >
          Signaler ce contenu
        </button>
      ) : (
        <form
          onSubmit={submit}
          className="rounded-2xl border border-midnight/10 bg-white p-3 text-left shadow-sm"
        >
          <label className="field-label" htmlFor="report-reason">
            Motif du signalement
          </label>
          <select
            id="report-reason"
            className="input text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REPORT_REASONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          {status === "error" && (
            <p className="mt-2 text-xs text-rose" role="alert">
              L&apos;envoi a échoué. Réessaie plus tard.
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm flex-1"
              onClick={() => setOpen(false)}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-violet btn-sm flex-1"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Envoi…" : "Envoyer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
