import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "oopsqr_admin";
const MAX_AGE = 60 * 60 * 12;
const IS_PROD = process.env.NODE_ENV === "production";

/**
 * Secret de signature du cookie admin.
 * En production AUCUN repli n'est toléré : si ADMIN_SECRET et ADMIN_PASSWORD
 * sont absents, la vérification échoue (au lieu d'utiliser un secret public).
 * Le repli "oopsqr-dev-secret" ne sert qu'en développement local.
 */
function secret(): string | null {
  const configured = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (configured) return configured;
  return IS_PROD ? null : "oopsqr-dev-secret";
}

export function signAdminToken(expiresAt = Date.now() + MAX_AGE * 1000): string {
  const key = secret();
  if (!key) throw new Error("ADMIN_SECRET manquant : signature impossible");
  const payload = `${expiresAt}`;
  const sig = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const key = secret();
  if (!key) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig) return false;
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = createHmac("sha256", key).update(expires).digest("base64url");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkPassword(value: string): boolean {
  // En production, un ADMIN_PASSWORD manquant doit REFUSER toute connexion
  // (jamais le mot de passe de développement "oopsqr-admin").
  const expected = process.env.ADMIN_PASSWORD ?? (IS_PROD ? undefined : "oopsqr-admin");
  if (!expected) return false;
  try {
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_MAX_AGE = MAX_AGE;

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(store.get(COOKIE)?.value);
}
