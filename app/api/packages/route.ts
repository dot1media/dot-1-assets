import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import { ensurePackageTables } from "@/lib/packages";

export const runtime = "nodejs";
async function guard() { const store = await cookies(); return verifyToken(store.get(ADMIN_COOKIE)?.value); }

export async function GET(request: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  await ensurePackageTables();
  const { searchParams } = new URL(request.url);
  const businessId = parseInt(searchParams.get("business_id") || "0", 10);
  if (!businessId) return NextResponse.json({ packages: [] });
  const rows = await sql`
    SELECT p.id, p.name, p.description, p.created_at,
      COALESCE(COUNT(pi.id), 0)::int AS item_count,
      COALESCE(SUM(pi.quantity), 0)::int AS unit_count,
      COALESCE(SUM(pi.quantity * a.unit_cost), 0) AS total_value
    FROM asset_packages p
    LEFT JOIN asset_package_items pi ON pi.package_id = p.id
    LEFT JOIN assets a ON a.id = pi.asset_id
    WHERE p.business_id = ${businessId}
    GROUP BY p.id
    ORDER BY p.name`;
  return NextResponse.json({ packages: rows });
}

export async function POST(request: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  await ensurePackageTables();
  const b = await request.json().catch(() => ({}));
  const businessId = parseInt(String(b.business_id || "0"), 10);
  if (!businessId) return NextResponse.json({ error: "business_id is required." }, { status: 400 });
  const name = String(b.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  const rows = await sql`INSERT INTO asset_packages (business_id, name, description) VALUES (${businessId}, ${name}, ${String(b.description || "")}) RETURNING *`;
  return NextResponse.json({ package: rows[0] });
}
