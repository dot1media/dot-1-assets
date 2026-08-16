import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/schema";
import { SEED_BUSINESS, SEED_ASSETS } from "@/lib/seed-data";
import { hashPassword, makeToken, ASSET_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

// Is first-run setup needed? (schema is created here too, so the app never crashes on a fresh DB.)
export async function GET() {
  try {
    await ensureSchema();
    const admins = await sql`SELECT COUNT(*)::int AS n FROM asset_admins`;
    return NextResponse.json({ needed: (admins[0]?.n || 0) === 0 });
  } catch (e: any) {
    return NextResponse.json({ needed: true, error: String(e?.message || e) });
  }
}

// First-time setup: create the admin, seed the first business + its assets, and sign in.
export async function POST(request: Request) {
  const b = await request.json().catch(() => ({}));
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  const name = String(b.name || "").trim();
  const setupCode = String(b.setupCode || "");

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const required = process.env.SETUP_CODE || "";
  if (required && setupCode !== required) return NextResponse.json({ error: "Incorrect setup code." }, { status: 403 });

  await ensureSchema();
  const existing = await sql`SELECT COUNT(*)::int AS n FROM asset_admins`;
  if ((existing[0]?.n || 0) > 0) return NextResponse.json({ error: "Setup has already been completed. Please sign in." }, { status: 409 });

  await sql`INSERT INTO asset_admins (email, name, password_hash) VALUES (${email}, ${name}, ${hashPassword(password)})`;

  const biz = await sql`SELECT id FROM asset_businesses WHERE slug = ${SEED_BUSINESS.slug} LIMIT 1`;
  if (biz.length === 0) {
    const rows = await sql`INSERT INTO asset_businesses (name, slug, accent) VALUES (${SEED_BUSINESS.name}, ${SEED_BUSINESS.slug}, ${SEED_BUSINESS.accent}) RETURNING id`;
    const businessId = rows[0].id;
    const queries = SEED_ASSETS.map((a: any) => sql`INSERT INTO assets (business_id, kind, name, category, identifier, description, bin, quantity, unit_cost) VALUES (${businessId}, ${a.kind}, ${a.name}, ${a.category}, ${a.identifier}, ${a.description || ""}, ${a.bin}, ${a.quantity}, ${a.unit_cost})`);
    for (let i = 0; i < queries.length; i += 40) await sql.transaction(queries.slice(i, i + 40));
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ASSET_COOKIE, makeToken(email), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}

