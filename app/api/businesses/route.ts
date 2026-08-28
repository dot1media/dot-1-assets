import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import { requireAssetsSession } from "@/lib/suite";

export const runtime = "nodejs";
async function guard() { const store = await cookies(); return await requireAssetsSession(store.get(ADMIN_COOKIE)?.value); }
async function guardWrite() { const s = await guard(); return s && (s as any).role !== "viewer" ? s : null; }

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const rows = await sql`SELECT id, name, slug, accent FROM asset_businesses ORDER BY name`;
  return NextResponse.json({ businesses: rows });
}

export async function POST(request: Request) {
  if (!(await guardWrite())) return NextResponse.json({ error: "Read-only access. Your role can view but not change assets." }, { status: 403 });
  const b = await request.json().catch(() => ({}));
  const name = String(b.name || "").trim();
  if (!name) return NextResponse.json({ error: "Business name is required." }, { status: 400 });
  const slug = (name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)) || ("biz-" + Date.now());
  const accent = String(b.accent || "#e23b2e");
  const rows = await sql`INSERT INTO asset_businesses (name, slug, accent) VALUES (${name}, ${slug}, ${accent}) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, accent = EXCLUDED.accent RETURNING id, name, slug, accent`;
  return NextResponse.json({ business: rows[0] });
}

