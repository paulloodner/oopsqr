"use client";

import { useState } from "react";
import type { Surprise } from "@/lib/types";

interface AdminSurprisesProps {
  initial: Surprise[];
}

interface FormState {
  id: string | null;
  emoji: string;
  title: string;
  category: string;
  description: string;
  text: string;
  active: boolean;
}

const EMPTY: FormState = {
  id: null,
  emoji: "🎁",
  title: "",
  category: "Messages humoristiques",
  description: "",
  text: "",
  active: true,
};

export function AdminSurprises({ initial }: AdminSurprisesProps) {
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  function edit(surprise: Surprise) {
    setForm({
      id: surprise.id,
      emoji: surprise.emoji,
      title: surprise.title,
      category: surprise.category,
      description: surprise.description,
      text: surprise.text,
      active: surprise.active,
    });
    setShowForm(true);
    setMessage("");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(
        form.id ? `/api/admin/surprises/${form.id}` : "/api/admin/surprises",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emoji: form.emoji,
            title: form.title,
            category: form.category,
            description: form.description,
            text: form.text,
            active: form.active,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      if (form.id) {
        setItems((list) => list.map((item) => (item.id === data.id ? data : item)));
      } else {
        setItems((list) => [...list, data]);
      }
      setMessage(form.id ? "Surprise mise à jour." : "Surprise ajoutée.");
      setForm(EMPTY);
      setShowForm(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(surprise: Surprise) {
    const res = await fetch(`/api/admin/surprises/${surprise.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !surprise.active }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems((list) => list.map((item) => (item.id === data.id ? data : item)));
    }
  }

  async function remove(surprise: Surprise) {
    if (!window.confirm(`Supprimer « ${surprise.title} » ?`)) return;
    const res = await fetch(`/api/admin/surprises/${surprise.id}`, {
      method: "DELETE",
    });
    if (res.ok) setItems((list) => list.filter((item) => item.id !== surprise.id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-cream/50">
          {items.length} propositions · {items.filter((s) => s.active).length} actives
        </p>
        <div className="flex items-center gap-3">
          {message && <span className="text-xs text-lime">{message}</span>}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setForm(EMPTY);
              setShowForm((value) => !value);
            }}
          >
            {showForm ? "Fermer" : "+ Nouvelle surprise"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="grid gap-3 rounded-2xl border border-cream/10 bg-white/5 p-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2 grid grid-cols-[5rem_1fr] gap-3">
            <div>
              <label className="field-label text-cream/50">Emoji</label>
              <input
                className="input bg-white/10 text-cream"
                value={form.emoji}
                maxLength={8}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label text-cream/50">Titre</label>
              <input
                className="input bg-white/10 text-cream"
                value={form.title}
                maxLength={80}
                required
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="field-label text-cream/50">Catégorie</label>
            <input
              className="input bg-white/10 text-cream"
              value={form.category}
              maxLength={40}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label text-cream/50">Description courte</label>
            <input
              className="input bg-white/10 text-cream"
              value={form.description}
              maxLength={160}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label text-cream/50">Texte révélé</label>
            <textarea
              className="textarea bg-white/10 text-cream"
              rows={4}
              value={form.text}
              maxLength={1500}
              required
              onChange={(e) => setForm({ ...form, text: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-cream/60">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Visible dans la bibliothèque
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY);
              }}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? "Enregistrement…" : form.id ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      )}

      <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
        {items.map((surprise) => (
          <div
            key={surprise.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-cream/10 bg-white/5 px-3 py-2"
          >
            <span className="text-xl">{surprise.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold text-cream">
                {surprise.title}
              </p>
              <p className="truncate text-[0.7rem] text-cream/45">
                {surprise.category} · {surprise.text.slice(0, 70)}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase ${
                surprise.active ? "bg-lime/15 text-lime" : "bg-rose/15 text-rose"
              }`}
            >
              {surprise.active ? "active" : "masquée"}
            </span>
            <div className="flex gap-2 text-xs font-semibold">
              <button type="button" onClick={() => edit(surprise)} className="text-cream/60 hover:text-lime">
                Modifier
              </button>
              <button type="button" onClick={() => toggle(surprise)} className="text-cream/60 hover:text-lime">
                {surprise.active ? "Masquer" : "Afficher"}
              </button>
              <button type="button" onClick={() => remove(surprise)} className="text-cream/40 hover:text-rose">
                Suppr.
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
