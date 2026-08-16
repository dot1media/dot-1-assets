import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
async function guard() { const store = await cookies(); return verifyToken(store.get(ADMIN_COOKIE)?.value); }

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const id = parseInt(params.id, 10);
  const b = await request.json().catch(() => ({}));
  const rows = await sql`UPDATE assets SET
    kind = ${b.kind || "equipment"}, name = ${String(b.name || "").trim()}, category = ${b.category || ""},
    identifier = ${b.identifier || ""}, description = ${b.description || ""}, bin = ${b.bin || ""},
    quantity = ${parseInt(b.quantity) || 1}, unit_cost = ${Number(b.unit_cost) || 0},
    condition = ${b.condition || ""}, status = ${b.status || "in_service"}, location = ${b.location || ""},
    vendor = ${b.vendor || ""}, purchase_date = ${b.purchase_date || null},
    expected_lifespan_months = ${b.expected_lifespan_months ? parseInt(b.expected_lifespan_months) : null},
    renewal_date = ${b.renewal_date || null}, notes = ${b.notes || ""}, updated_at = now()
    WHERE id = ${id} RETURNING *`;
  if (rows.length === 0) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ asset: rows[0] });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const id = parseInt(params.id, 10);
  await sql`DELETE FROM assets WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

