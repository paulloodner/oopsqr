import { neon } from "@neondatabase/serverless";

import { randomId } from "./validation";
import { SEED_SURPRISES } from "./seed-surprises";
import type {
  AdminStats,
  Creation,
  NewCreation,
  Surprise,
} from "./types";

/**
 * Persistance serverless : Postgres managé (Neon / Vercel Postgres).
 * Aucune écriture disque : les images sont stockées en base64 dans la table
 * `creations`, ce qui permet le déploiement sur Vercel (FS éphémère).
 */

const url = process.env.DATABASE_URL;
if (!url) {
  // eslint-disable-next-line no-console
  console.warn("[db] DATABASE_URL manquant : renseigner Neon/Vercel Postgres.");
}
const sql = neon(url ?? "postgres://invalid");

let schemaReady: Promise<void> | null = null;

/**
 * Postgres plie en minuscules les identifiants non quotés (`createdAt` ->
 * `createdat`). Les mappers lisent donc les deux écritures
 * (`row.createdAt ?? row.createdat`) : le code reste valide quel que soit le
 * pilote utilisé (HTTP, WebSocket ou `pg`).
 */

/** Intervalle minimal entre deux purges automatiques (24 h). */
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS surprises (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          emoji TEXT NOT NULL DEFAULT '',
          text TEXT NOT NULL,
          active BOOLEAN NOT NULL DEFAULT TRUE,
          sort INTEGER NOT NULL DEFAULT 0,
          createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS creations (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          text TEXT,
          emoji TEXT,
          caption TEXT,
          imageB64 TEXT,
          imageMime TEXT,
          fg TEXT NOT NULL DEFAULT '#17151F',
          bg TEXT NOT NULL DEFAULT '#F7F5F0',
          createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
          expiresAt TIMESTAMPTZ NOT NULL,
          views INTEGER NOT NULL DEFAULT 0,
          downloads INTEGER NOT NULL DEFAULT 0,
          reportedAt TIMESTAMPTZ,
          reportReason TEXT,
          status TEXT NOT NULL DEFAULT 'active'
        )`;
      await sql`CREATE INDEX IF NOT EXISTS idx_creations_expires ON creations(expiresAt)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_creations_status ON creations(status)`;
      await sql`
        CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          detail TEXT,
          createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS rate_limits (
          key TEXT PRIMARY KEY,
          count INTEGER NOT NULL DEFAULT 0,
          resetAt BIGINT NOT NULL
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS app_state (
          key TEXT PRIMARY KEY,
          val TEXT NOT NULL
        )`;

      const count = await sql`SELECT COUNT(*)::int AS n FROM surprises`;
      if ((count[0] as { n: number }).n === 0) {
        for (const row of SEED_SURPRISES) {
          await sql`
            INSERT INTO surprises (id, category, title, description, emoji, text, active, sort, createdAt)
            VALUES (${row.id}, ${row.category}, ${row.title}, ${row.description}, ${row.emoji}, ${row.text}, ${row.active}, ${row.sort}, ${row.createdAt})
            ON CONFLICT (id) DO NOTHING`;
        }
      }
    })();
  }
  return schemaReady;
}

/** Conversion défensive vers un ISO : jamais de RangeError sur une page. */
function iso(value: unknown, fallback = new Date(0).toISOString()): string {
  if (value === null || value === undefined || value === "") return fallback;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function rowToSurprise(row: any): Surprise {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    emoji: row.emoji,
    text: row.text,
    active: Boolean(row.active),
    sort: row.sort,
    createdAt: iso(row.createdAt ?? row.createdat),
  };
}

function rowToCreation(row: any): Creation {
  return {
    id: row.id,
    type: row.type,
    text: row.text ?? null,
    emoji: row.emoji ?? null,
    caption: row.caption ?? null,
    imageB64: row.imageb64 ?? row.imageB64 ?? null,
    imageMime: row.imagemime ?? row.imageMime ?? null,
    fg: row.fg,
    bg: row.bg,
    createdAt: iso(row.createdAt ?? row.createdat),
    expiresAt: iso(row.expiresAt ?? row.expiresat),
    views: row.views,
    downloads: row.downloads,
    reportedAt: row.reportedat ?? row.reportedAt ? iso(row.reportedat ?? row.reportedAt) : null,
    reportReason: row.reportreason ?? row.reportReason ?? null,
    status: row.status,
  };
}

/* ------------------------------------------------------------------ service */

export const db = {
  /* surprises */
  async listSurprises(onlyActive = true): Promise<Surprise[]> {
    await ensureSchema();
    await this.cleanupIfDue();
    const rows = onlyActive
      ? await sql`SELECT * FROM surprises WHERE active = TRUE ORDER BY sort ASC, createdAt ASC`
      : await sql`SELECT * FROM surprises ORDER BY sort ASC, createdAt ASC`;
    return (rows as any[]).map(rowToSurprise);
  },
  async getSurprise(id: string): Promise<Surprise | null> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM surprises WHERE id = ${id}`;
    return rows[0] ? rowToSurprise(rows[0]) : null;
  },
  async saveSurprise(input: {
    id: string;
    category: string;
    title: string;
    description: string;
    emoji: string;
    text: string;
    active: boolean;
    sort: number;
  }): Promise<Surprise> {
    await ensureSchema();
    await sql`
      INSERT INTO surprises (id, category, title, description, emoji, text, active, sort, createdAt)
      VALUES (${input.id}, ${input.category}, ${input.title}, ${input.description}, ${input.emoji}, ${input.text}, ${input.active}, ${input.sort}, now())
      ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category, title = EXCLUDED.title, description = EXCLUDED.description,
        emoji = EXCLUDED.emoji, text = EXCLUDED.text, active = EXCLUDED.active, sort = EXCLUDED.sort`;
    return (await this.getSurprise(input.id))!;
  },
  async deleteSurprise(id: string): Promise<boolean> {
    await ensureSchema();
    const res = await sql`DELETE FROM surprises WHERE id = ${id}`;
    return (res as any).count > 0;
  },

  /* creations */
  async createCreation(input: NewCreation): Promise<Creation> {
    await ensureSchema();
    await this.cleanupIfDue();
    await sql`
      INSERT INTO creations (id, type, text, emoji, caption, imageB64, imageMime, fg, bg, createdAt, expiresAt, status)
      VALUES (${input.id}, ${input.type}, ${input.text}, ${input.emoji}, ${input.caption}, ${input.imageB64}, ${input.imageMime}, ${input.fg}, ${input.bg}, now(), ${input.expiresAt}, 'active')`;
    await this.recordEvent("creation", input.id);
    return (await this.getCreation(input.id))!;
  },
  async getCreation(id: string): Promise<Creation | null> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM creations WHERE id = ${id}`;
    return rows[0] ? rowToCreation(rows[0]) : null;
  },
  async incrementView(id: string): Promise<void> {
    await ensureSchema();
    await sql`UPDATE creations SET views = views + 1 WHERE id = ${id}`;
  },
  async incrementDownloads(id: string): Promise<void> {
    await ensureSchema();
    await sql`UPDATE creations SET downloads = downloads + 1 WHERE id = ${id}`;
  },
  async reportCreation(id: string, reason: string): Promise<boolean> {
    await ensureSchema();
    const res = await sql`
      UPDATE creations SET reportedAt = now(), reportReason = ${reason}
      WHERE id = ${id} AND reportedAt IS NULL`;
    return (res as any).count > 0;
  },
  async listCreations(status?: string): Promise<Creation[]> {
    await ensureSchema();
    const rows = status
      ? await sql`SELECT * FROM creations WHERE status = ${status} ORDER BY createdAt DESC`
      : await sql`SELECT * FROM creations ORDER BY createdAt DESC`;
    return (rows as any[]).map(rowToCreation);
  },
  async listReports(): Promise<Creation[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM creations WHERE reportedAt IS NOT NULL ORDER BY reportedAt DESC`;
    return (rows as any[]).map(rowToCreation);
  },
  async clearReport(id: string): Promise<boolean> {
    await ensureSchema();
    const res = await sql`UPDATE creations SET reportedAt = NULL, reportReason = NULL WHERE id = ${id}`;
    return (res as any).count > 0;
  },
  async deleteCreation(id: string): Promise<boolean> {
    await ensureSchema();
    const res = await sql`DELETE FROM creations WHERE id = ${id}`;
    return (res as any).count > 0;
  },
  async newCreationId(): Promise<string> {
    for (let i = 0; i < 6; i += 1) {
      const id = randomId(8);
      if (!(await this.getCreation(id))) return id;
    }
    return randomId(12);
  },

  /* images (stockées en base64, pas de disque) */
  async readUploadedImage(id: string): Promise<{ bytes: Buffer; mime: string } | null> {
    const creation = await this.getCreation(id);
    if (!creation || !creation.imageB64 || !creation.imageMime) return null;
    return { bytes: Buffer.from(creation.imageB64, "base64"), mime: creation.imageMime };
  },
  async storageBytes(): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COALESCE(SUM(LENGTH(imageB64)), 0)::bigint AS n FROM creations`;
    return Math.round(Number((rows[0] as any).n) * 0.75);
  },

  /* cleanup */
  async cleanupExpired(): Promise<{ expired: number; removedFiles: number; purged: number }> {
    await ensureSchema();
    const expiring = (await sql`
      SELECT id FROM creations WHERE status = 'active' AND expiresAt <= now()`) as any[];
    for (const row of expiring) {
      await sql`UPDATE creations SET status = 'expired', imageB64 = NULL WHERE id = ${row.id}`;
    }
    const purge = await sql`
      DELETE FROM creations WHERE status = 'expired' AND expiresAt <= now() - INTERVAL '30 days'`;
    await sql`DELETE FROM rate_limits WHERE resetAt < ${Date.now() - 24 * 60 * 60 * 1000}`;
    if (expiring.length > 0) await this.recordEvent("cleanup", `${expiring.length} expiration(s)`);
    return { expired: expiring.length, removedFiles: expiring.length, purged: (purge as any).count };
  },

  /**
   * Purge automatique quotidienne, déclenchée à la demande par l'activité du
   * site. Elle remplace un cron externe (hébergeur gratuit sans cron) :
   * au plus une purge toutes les 24 h, pilotée par `app_state`.
   */
  async cleanupIfDue(): Promise<void> {
    try {
      await ensureSchema();
      const rows = (await sql`SELECT val FROM app_state WHERE key = 'last_cleanup'`) as any[];
      const last = Number(rows[0]?.val ?? 0);
      const now = Date.now();
      if (last && now - last < CLEANUP_INTERVAL_MS) return;
      await this.cleanupExpired();
      await sql`
        INSERT INTO app_state (key, val) VALUES ('last_cleanup', ${String(now)})
        ON CONFLICT (key) DO UPDATE SET val = EXCLUDED.val`;
    } catch {
      // la purge automatique ne doit jamais casser une page
    }
  },

  /* events */
  async recordEvent(name: string, detail?: string): Promise<void> {
    await ensureSchema();
    await sql`INSERT INTO events (name, detail, createdAt) VALUES (${name}, ${detail ?? null}, now())`;
  },
  async listEvents(limit = 50): Promise<Array<{ id: number; name: string; detail: string | null; createdAt: string }>> {
    await ensureSchema();
    const rows = (await sql`SELECT * FROM events ORDER BY id DESC LIMIT ${limit}`) as any[];
    return rows.map((r) => ({ id: r.id, name: r.name, detail: r.detail, createdAt: new Date(r.createdAt ?? r.createdat).toISOString() }));
  },

  /* stats */
  async getStats(): Promise<AdminStats> {
    await ensureSchema();
    const totals = (await sql`
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)::int AS active,
        SUM(views)::int AS scans,
        SUM(downloads)::int AS downloads,
        SUM(CASE WHEN reportedAt IS NOT NULL THEN 1 ELSE 0 END)::int AS reports
      FROM creations`) as any[];
    const t = totals[0];
    return {
      totalCreations: t.total ?? 0,
      activeCreations: t.active ?? 0,
      totalScans: t.scans ?? 0,
      totalDownloads: t.downloads ?? 0,
      reports: t.reports ?? 0,
      storageBytes: await this.storageBytes(),
    };
  },

  /* rate limit */
  async checkRateLimit(key: string, max: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }> {
    await ensureSchema();
    const now = Date.now();
    const rows = (await sql`SELECT count, resetAt FROM rate_limits WHERE key = ${key}`) as any[];
    const row = rows[0];
    if (!row || Number(row.resetat ?? row.resetAt) < now) {
      await sql`
        INSERT INTO rate_limits (key, count, resetAt) VALUES (${key}, 1, ${now + windowMs})
        ON CONFLICT (key) DO UPDATE SET count = 1, resetAt = EXCLUDED.resetAt`;
      return { allowed: true, remaining: max - 1 };
    }
    if (row.count >= max) return { allowed: false, remaining: 0 };
    await sql`UPDATE rate_limits SET count = count + 1 WHERE key = ${key}`;
    return { allowed: true, remaining: max - row.count - 1 };
  },
};
