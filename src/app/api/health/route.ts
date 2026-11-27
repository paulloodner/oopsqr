import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Sonde de disponibilité, volontairement SANS accès base de données :
 * utilisée par la tâche GitHub Actions « keepalive » qui empêche l'instance
 * Render Free de s'endormir après 15 minutes d'inactivité (cold start).
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, service: "oopsqr", time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
