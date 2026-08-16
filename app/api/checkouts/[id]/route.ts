import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import { ensureCheckoutTables } from "@/lib/packages";

export const runtime = "nodejs";
async function guard() { const store = await cookies(); return verifyToken(store.get(ADMIN_COOKIE)?.value); }

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  await ensureCheckoutTables();
  const id = parseInt(params.id, 10);
  const b = await request.json().catch(() => ({}));
  if (b.reopen) await sql`UPDATE asset_checkouts SET checked_in_at = NULL WHERE id = ${id}`;
  else await sql`UPDATE asset_checkouts SET checked_in_at = now() WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  await ensureCheckoutTables();
  await sql`DELETE FROM asset_checkouts WHERE id = ${parseInt(params.id, 10)}`;
  return NextResponse.json({ ok: true });
}
