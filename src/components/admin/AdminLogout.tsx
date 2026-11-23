"use client";

export function AdminLogout() {
  async function logout() {
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
    } finally {
      window.location.assign("/admin/login");
    }
  }

  return (
    <button type="button" onClick={logout} className="text-xs font-semibold text-cream/50 hover:text-lime">
      Déconnexion
    </button>
  );
}
