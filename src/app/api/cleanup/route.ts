import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization") ?? "";
  const validCron = Boolean(cronSecret) && authorization === `Bearer ${cronSecret}`;
  const admin = await isAdmin();

  if (!validCron && !admin) {
    return NextResponse.json({ error: "non_autorise" }, { status: 401 });
  }

  const result = db.cleanupExpired();
  return NextResponse.json(result);
}
