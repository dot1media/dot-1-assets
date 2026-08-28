import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import { requireAssetsSession } from "@/lib/suite";
import { ensureCheckoutTables } from "@/lib/packages";

export const runtime = "nodejs";
async function guard() { const store = await cookies(); return await requireAssetsSession(store.get(ADMIN_COOKIE)?.value); }
async function guardWrite() { const s = await guard(); return s && (s as any).role !== "viewer" ? s : null; }

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guardWrite())) return NextResponse.json({ error: "Read-only access. Your role can view but not change assets." }, { status: 403 });
  await ensureCheckoutTables();
  const id = parseInt((await params).id, 10);
  const b = await request.json().catch(() => ({}));
  if (b.reopen) await sql`UPDATE asset_checkouts SET checked_in_at = NULL WHERE id = ${id}`;
  else await sql`UPDATE asset_checkouts SET checked_in_at = now() WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guardWrite())) return NextResponse.json({ error: "Read-only access. Your role can view but not change assets." }, { status: 403 });
  await ensureCheckoutTables();
  await sql`DELETE FROM asset_checkouts WHERE id = ${parseInt((await params).id, 10)}`;
  return NextResponse.json({ ok: true });
}
