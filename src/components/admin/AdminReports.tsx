"use client";

import { useState } from "react";
import type { Creation } from "@/lib/types";

export function AdminReports({ initial }: { initial: Creation[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState("");

  async function action(id: string, type: "dismiss" | "delete") {
    if (type === "delete" && !window.confirm("Supprimer définitivement ce contenu ?")) {
      return;
    }
    setBusy(id);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: type }),
      });
      if (res.ok) {
        setItems((list) => list.filter((item) => item.id !== id));
      }
    } finally {
      setBusy("");
    }
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-cream/10 bg-white/5 px-4 py-6 text-center text-xs text-cream/45">
        Aucun signalement en attente. Tout va bien.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-rose/20 bg-rose/5 px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-cream">
              {item.reportReason ?? "Signalement"}
            </p>
            <p className="truncate text-[0.7rem] text-cream/45">
              /s/{item.id} ·{" "}
              {item.type === "text" ? item.text?.slice(0, 80) : "image"}
            </p>
            <p className="text-[0.65rem] text-cream/30">
              Signalé le{" "}
              {item.reportedAt
                ? new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(item.reportedAt))
                : "—"}
            </p>
          </div>
          <a
            href={`/s/${item.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-cream/50 hover:text-lime"
          >
            Voir
          </a>
          <button
            type="button"
            disabled={busy === item.id}
            onClick={() => action(item.id, "dismiss")}
            className="text-xs font-semibold text-cream/60 hover:text-lime"
          >
            Ignorer
          </button>
          <button
            type="button"
            disabled={busy === item.id}
            onClick={() => action(item.id, "delete")}
            className="text-xs font-semibold text-rose/80 hover:text-rose"
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
