import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import { requireAssetsSession } from "@/lib/suite";
import { ensureCheckoutTables } from "@/lib/packages";

export const runtime = "nodejs";
async function guard() { const store = await cookies(); return await requireAssetsSession(store.get(ADMIN_COOKIE)?.value); }

export async function GET(request: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const businessId = parseInt(searchParams.get("business_id") || "0", 10);
  if (!businessId) return NextResponse.json({ assets: [] });
  await ensureCheckoutTables();
  const rows = await sql`
    SELECT a.*, COALESCE(o.out_qty, 0)::int AS out_count
    FROM assets a
    LEFT JOIN (
      SELECT ci.asset_id, SUM(ci.quantity) AS out_qty
      FROM asset_checkout_items ci JOIN asset_checkouts c ON c.id = ci.checkout_id
      WHERE c.checked_in_at IS NULL
      GROUP BY ci.asset_id
    ) o ON o.asset_id = a.id
    WHERE a.business_id = ${businessId} ORDER BY a.name`;
  return NextResponse.json({ assets: rows });
}

export async function POST(request: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const b = await request.json().catch(() => ({}));
  const businessId = parseInt(String(b.business_id || "0"), 10);
  if (!businessId) return NextResponse.json({ error: "business_id is required." }, { status: 400 });
  const name = String(b.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  const rows = await sql`INSERT INTO assets (business_id, kind, name, category, identifier, description, bin, quantity, unit_cost, condition, status, location, vendor, purchase_date, expected_lifespan_months, renewal_date, notes)
    VALUES (${businessId}, ${b.kind || "equipment"}, ${name}, ${b.category || ""}, ${b.identifier || ""}, ${b.description || ""}, ${b.bin || ""}, ${parseInt(b.quantity) || 1}, ${Number(b.unit_cost) || 0}, ${b.condition || ""}, ${b.status || "in_service"}, ${b.location || ""}, ${b.vendor || ""}, ${b.purchase_date || null}, ${b.expected_lifespan_months ? parseInt(b.expected_lifespan_months) : null}, ${b.renewal_date || null}, ${b.notes || ""})
    RETURNING *`;
  return NextResponse.json({ asset: rows[0] });
}

