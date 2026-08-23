import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import { requireAssetsSession } from "@/lib/suite";
import { ensurePackageTables } from "@/lib/packages";

export const runtime = "nodejs";
async function guard() { const store = await cookies(); return await requireAssetsSession(store.get(ADMIN_COOKIE)?.value); }

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  await ensurePackageTables();
  const pid = parseInt((await params).id, 10);
  const pkg = await sql`SELECT * FROM asset_packages WHERE id = ${pid} LIMIT 1`;
  if (pkg.length === 0) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const items = await sql`
    SELECT pi.asset_id, pi.quantity, a.name, a.category, a.kind, a.unit_cost, a.quantity AS available, a.status
    FROM asset_package_items pi JOIN assets a ON a.id = pi.asset_id
    WHERE pi.package_id = ${pid} ORDER BY a.name`;
  return NextResponse.json({ package: pkg[0], items });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  await ensurePackageTables();
  const pid = parseInt((await params).id, 10);
  const b = await request.json().catch(() => ({}));
  if (typeof b.name === "string" || typeof b.description === "string") {
    const nm = typeof b.name === "string" ? b.name.trim() : null;
    if (typeof b.name === "string" && !nm) return NextResponse.json({ error: "Name can't be empty." }, { status: 400 });
    const desc = typeof b.description === "string" ? b.description : null;
    await sql`UPDATE asset_packages SET name = COALESCE(${nm}, name), description = COALESCE(${desc}, description), updated_at = now() WHERE id = ${pid}`;
  }
  if (Array.isArray(b.items)) {
    await sql`DELETE FROM asset_package_items WHERE package_id = ${pid}`;
    for (const it of b.items) {
      const assetId = parseInt(String(it.asset_id), 10);
      const qty = Math.max(1, parseInt(String(it.quantity)) || 1);
      if (assetId) await sql`INSERT INTO asset_package_items (package_id, asset_id, quantity) VALUES (${pid}, ${assetId}, ${qty}) ON CONFLICT (package_id, asset_id) DO UPDATE SET quantity = EXCLUDED.quantity`;
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  await ensurePackageTables();
  await sql`DELETE FROM asset_packages WHERE id = ${parseInt((await params).id, 10)}`;
  return NextResponse.json({ ok: true });
}
