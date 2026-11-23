import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import { randomId } from "./validation";
import { SEED_SURPRISES } from "./seed-surprises";
import type {
  AdminStats,
  Creation,
  NewCreation,
  Surprise,
} from "./types";

const DB_DIR = path.join(process.cwd(), process.env.DATA_DIR ?? "data");
const DB_FILE = path.join(DB_DIR, "oopsqr.db");
const UPLOAD_DIR = path.join(DB_DIR, "uploads");

declare global {
  // eslint-disable-next-line no-var
  var __oopsqrDb: Database.Database | undefined;
}

function createDb(): Database.Database {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const d = new Database(DB_FILE);
  d.pragma("journal_mode = WAL");
  d.pragma("synchronous = NORMAL");
  d.pragma("busy_timeout = 5000");
  d.exec(`
    CREATE TABLE IF NOT EXISTS surprises (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '',
      text TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      sort INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS creations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      text TEXT,
      emoji TEXT,
      caption TEXT,
      imagePath TEXT,
      imageMime TEXT,
      fg TEXT NOT NULL DEFAULT '#17151F',
      bg TEXT NOT NULL DEFAULT '#F7F5F0',
      createdAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      downloads INTEGER NOT NULL DEFAULT 0,
      reportedAt TEXT,
      reportReason TEXT,
      status TEXT NOT NULL DEFAULT 'active'
    );

    CREATE INDEX IF NOT EXISTS idx_creations_expires ON creations(expiresAt);
    CREATE INDEX IF NOT EXISTS idx_creations_status ON creations(status);

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      detail TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0,
      resetAt INTEGER NOT NULL
    );
  `);

  const count = d.prepare("SELECT COUNT(*) AS n FROM surprises").get() as {
    n: number;
  };
  if (count.n === 0) {
    const insert = d.prepare(
      `INSERT INTO surprises (id, category, title, description, emoji, text, active, sort, createdAt)
       VALUES (@id, @category, @title, @description, @emoji, @text, @active, @sort, @createdAt)`
    );
    const tx = d.transaction((rows: typeof SEED_SURPRISES) => {
      for (const row of rows) {
        insert.run({ ...row, active: row.active ? 1 : 0 });
      }
    });
    tx(SEED_SURPRISES);
  }
  return d;
}

function raw(): Database.Database {
  if (!globalThis.__oopsqrDb) {
    globalThis.__oopsqrDb = createDb();
  }
  return globalThis.__oopsqrDb;
}

function rowToSurprise(row: any): Surprise {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    emoji: row.emoji,
    text: row.text,
    active: row.active === 1,
    sort: row.sort,
    createdAt: row.createdAt,
  };
}

function rowToCreation(row: any): Creation {
  return {
    id: row.id,
    type: row.type,
    text: row.text ?? null,
    emoji: row.emoji ?? null,
    caption: row.caption ?? null,
    imagePath: row.imagePath ?? null,
    imageMime: row.imageMime ?? null,
    fg: row.fg,
    bg: row.bg,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    views: row.views,
    downloads: row.downloads,
    reportedAt: row.reportedAt ?? null,
    reportReason: row.reportReason ?? null,
    status: row.status,
  };
}

/* ------------------------------------------------------------------ service */

export const db = {
  /* surprises */
  listSurprises(onlyActive = true): Surprise[] {
    const rows = raw()
      .prepare(
        `SELECT * FROM surprises ${onlyActive ? "WHERE active = 1" : ""}
         ORDER BY sort ASC, createdAt ASC`
      )
      .all();
    return (rows as any[]).map(rowToSurprise);
  },
  getSurprise(id: string): Surprise | null {
    const row = raw().prepare("SELECT * FROM surprises WHERE id = ?").get(id);
    return row ? rowToSurprise(row) : null;
  },
  saveSurprise(input: {
    id: string;
    category: string;
    title: string;
    description: string;
    emoji: string;
    text: string;
    active: boolean;
    sort: number;
  }): Surprise {
    const existing = this.getSurprise(input.id);
    if (existing) {
      raw()
        .prepare(
          `UPDATE surprises SET category = @category, title = @title, description = @description,
           emoji = @emoji, text = @text, active = @active, sort = @sort WHERE id = @id`
        )
        .run({ ...input, active: input.active ? 1 : 0 });
    } else {
      raw()
        .prepare(
          `INSERT INTO surprises (id, category, title, description, emoji, text, active, sort, createdAt)
           VALUES (@id, @category, @title, @description, @emoji, @text, @active, @sort, @createdAt)`
        )
        .run({ ...input, active: input.active ? 1 : 0, createdAt: new Date().toISOString() });
    }
    return this.getSurprise(input.id)!;
  },
  deleteSurprise(id: string): boolean {
    return raw().prepare("DELETE FROM surprises WHERE id = ?").run(id).changes > 0;
  },

  /* creations */
  createCreation(input: NewCreation): Creation {
    raw()
      .prepare(
        `INSERT INTO creations (id, type, text, emoji, caption, imagePath, imageMime, fg, bg, createdAt, expiresAt, status)
         VALUES (@id, @type, @text, @emoji, @caption, @imagePath, @imageMime, @fg, @bg, @createdAt, @expiresAt, 'active')`
      )
      .run({ ...input, createdAt: new Date().toISOString() });
    this.recordEvent("creation", input.id);
    return this.getCreation(input.id)!;
  },
  getCreation(id: string): Creation | null {
    const row = raw().prepare("SELECT * FROM creations WHERE id = ?").get(id);
    return row ? rowToCreation(row) : null;
  },
  incrementView(id: string): void {
    raw().prepare("UPDATE creations SET views = views + 1 WHERE id = ?").run(id);
  },
  incrementDownloads(id: string): void {
    raw().prepare("UPDATE creations SET downloads = downloads + 1 WHERE id = ?").run(id);
  },
  reportCreation(id: string, reason: string): boolean {
    return (
      raw()
        .prepare(
          "UPDATE creations SET reportedAt = ?, reportReason = ? WHERE id = ? AND reportedAt IS NULL"
        )
        .run(new Date().toISOString(), reason, id).changes > 0
    );
  },
  listCreations(status?: string): Creation[] {
    const rows = status
      ? raw()
          .prepare(
            "SELECT * FROM creations WHERE status = ? ORDER BY createdAt DESC"
          )
          .all(status)
      : raw().prepare("SELECT * FROM creations ORDER BY createdAt DESC").all();
    return (rows as any[]).map(rowToCreation);
  },
  listReports(): Creation[] {
    const rows = raw()
      .prepare(
        "SELECT * FROM creations WHERE reportedAt IS NOT NULL ORDER BY reportedAt DESC"
      )
      .all();
    return (rows as any[]).map(rowToCreation);
  },
  clearReport(id: string): boolean {
    return (
      raw()
        .prepare(
          "UPDATE creations SET reportedAt = NULL, reportReason = NULL WHERE id = ?"
        )
        .run(id).changes > 0
    );
  },
  deleteCreation(id: string): boolean {
    const row = this.getCreation(id);
    if (!row) return false;
    if (row.imagePath) {
      const clean = path.normalize(row.imagePath).replace(/^(\.\.[\/\\])+/, "");
      const full = path.join(DB_DIR, clean);
      if (full.startsWith(UPLOAD_DIR) && fs.existsSync(full)) {
        fs.unlinkSync(full);
      }
    }
    raw().prepare("DELETE FROM creations WHERE id = ?").run(id);
    return true;
  },
  newCreationId(): string {
    for (let i = 0; i < 6; i += 1) {
      const id = randomId(8);
      if (!this.getCreation(id)) return id;
    }
    return randomId(12);
  },

  /* images */
  saveUploadedImage(id: string, bytes: Buffer, mime: string): string {
    const ext = mime === "image/webp" ? "webp" : mime === "image/jpeg" ? "jpg" : "png";
    const name = `${id}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), bytes);
    return `uploads/${name}`;
  },
  readUploadedImage(relPath: string): { bytes: Buffer; mime: string } | null {
    const clean = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, "");
    const full = path.join(DB_DIR, clean);
    if (!full.startsWith(UPLOAD_DIR)) return null;
    if (!fs.existsSync(full)) return null;
    const ext = path.extname(full).toLowerCase();
    const mime = ext === ".webp" ? "image/webp" : ext === ".jpg" ? "image/jpeg" : "image/png";
    return { bytes: fs.readFileSync(full), mime };
  },
  storageBytes(): number {
    let total = fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0;
    if (fs.existsSync(UPLOAD_DIR)) {
      for (const file of fs.readdirSync(UPLOAD_DIR)) {
        total += fs.statSync(path.join(UPLOAD_DIR, file)).size;
      }
    }
    return total;
  },

  /* cleanup */
  cleanupExpired(): {
    expired: number;
    removedFiles: number;
    purged: number;
  } {
    const nowIso = new Date().toISOString();
    const expiring = raw()
      .prepare(
        "SELECT id, imagePath FROM creations WHERE status = 'active' AND expiresAt <= ?"
      )
      .all(nowIso) as any[];

    let removedFiles = 0;
    const tx = raw().transaction((rows: any[]) => {
      for (const row of rows) {
        raw()
          .prepare("UPDATE creations SET status = 'expired' WHERE id = ?")
          .run(row.id);
        if (row.imagePath) {
          const clean = path.normalize(row.imagePath).replace(/^(\.\.[\/\\])+/, "");
          const full = path.join(DB_DIR, clean);
          if (full.startsWith(UPLOAD_DIR) && fs.existsSync(full)) {
            fs.unlinkSync(full);
            removedFiles += 1;
          }
        }
      }
    });
    tx(expiring);

    const purgeDate = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const purged = raw()
      .prepare(
        "DELETE FROM creations WHERE status = 'expired' AND expiresAt <= ?"
      )
      .run(purgeDate).changes;

    raw().prepare(
      "DELETE FROM rate_limits WHERE resetAt < ?"
    ).run(Date.now() - 24 * 60 * 60 * 1000);

    if (expiring.length > 0) this.recordEvent("cleanup", `${expiring.length} expiration(s)`);
    return { expired: expiring.length, removedFiles, purged };
  },

  /* events */
  recordEvent(name: string, detail?: string): void {
    raw()
      .prepare("INSERT INTO events (name, detail, createdAt) VALUES (?, ?, ?)")
      .run(name, detail ?? null, new Date().toISOString());
  },
  listEvents(limit = 50): Array<{
    id: number;
    name: string;
    detail: string | null;
    createdAt: string;
  }> {
    return raw()
      .prepare("SELECT * FROM events ORDER BY id DESC LIMIT ?")
      .all(limit) as any[];
  },

  /* stats */
  getStats(): AdminStats {
    const d = raw();
    const totals = d
      .prepare(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
           SUM(views) AS scans,
           SUM(downloads) AS downloads,
           SUM(CASE WHEN reportedAt IS NOT NULL THEN 1 ELSE 0 END) AS reports
         FROM creations`
      )
      .get() as any;
    return {
      totalCreations: totals.total ?? 0,
      activeCreations: totals.active ?? 0,
      totalScans: totals.scans ?? 0,
      totalDownloads: totals.downloads ?? 0,
      reports: totals.reports ?? 0,
      storageBytes: this.storageBytes(),
    };
  },

  /* rate limit */
  checkRateLimit(
    key: string,
    max: number,
    windowMs: number
  ): { allowed: boolean; remaining: number } {
    const d = raw();
    const now = Date.now();
    const row = d
      .prepare("SELECT count, resetAt FROM rate_limits WHERE key = ?")
      .get(key) as any;
    if (!row || row.resetAt < now) {
      d.prepare(
        "INSERT INTO rate_limits (key, count, resetAt) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = 1, resetAt = excluded.resetAt"
      ).run(key, now + windowMs);
      return { allowed: true, remaining: max - 1 };
    }
    if (row.count >= max) return { allowed: false, remaining: 0 };
    d.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?").run(key);
    return { allowed: true, remaining: max - row.count - 1 };
  },
};

export type DatabaseInstance = Database.Database;
export { raw as _rawDb };
