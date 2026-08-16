import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import { ensureCheckoutTables } from "@/lib/packages";

export const runtime = "nodejs";
async function guard() { const store = await cookies(); return verifyToken(store.get(ADMIN_COOKIE)?.value); }

export async function GET(request: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  await ensureCheckoutTables();
  const { searchParams } = new URL(request.url);
  const businessId = parseInt(searchParams.get("business_id") || "0", 10);
  if (!businessId) return NextResponse.json({ checkouts: [] });
  const rows = await sql`
    SELECT c.id, c.package_id, c.package_name, c.label, c.checked_out_at, c.due_back, c.checked_in_at,
      COALESCE(COUNT(ci.id),0)::int AS item_count, COALESCE(SUM(ci.quantity),0)::int AS unit_count
    FROM asset_checkouts c LEFT JOIN asset_checkout_items ci ON ci.checkout_id = c.id
    WHERE c.business_id = ${businessId}
    GROUP BY c.id
    ORDER BY (c.checked_in_at IS NULL) DESC, c.checked_out_at DESC`;
  return NextResponse.json({ checkouts: rows });
}

export async function POST(request: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  await ensureCheckoutTables();
  const b = await request.json().catch(() => ({}));
  const businessId = parseInt(String(b.business_id || "0"), 10);
  const packageId = parseInt(String(b.package_id || "0"), 10);
  if (!businessId || !packageId) return NextResponse.json({ error: "business_id and package_id are required." }, { status: 400 });
  const pkg = await sql`SELECT name FROM asset_packages WHERE id = ${packageId} AND business_id = ${businessId} LIMIT 1`;
  if (pkg.length === 0) return NextResponse.json({ error: "Package not found." }, { status: 404 });
  const items = await sql`SELECT pi.asset_id, pi.quantity, a.name FROM asset_package_items pi JOIN assets a ON a.id = pi.asset_id WHERE pi.package_id = ${packageId}`;
  const dueBack = b.due_back ? String(b.due_back) : null;
  const co = await sql`INSERT INTO asset_checkouts (business_id, package_id, package_name, label, due_back) VALUES (${businessId}, ${packageId}, ${pkg[0].name}, ${String(b.label || "")}, ${dueBack}) RETURNING id`;
  const coId = co[0].id;
  for (const it of items) {
    await sql`INSERT INTO asset_checkout_items (checkout_id, asset_id, asset_name, quantity) VALUES (${coId}, ${it.asset_id}, ${it.name}, ${it.quantity})`;
  }
  return NextResponse.json({ ok: true, id: coId });
}
