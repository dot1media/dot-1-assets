import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken, ASSET_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const store = await cookies();
  const v = verifyToken(store.get(ASSET_COOKIE)?.value);
  if (!v) return NextResponse.json({ admin: null });
  const admins = await sql`SELECT email, name FROM asset_admins WHERE email = ${v.email} LIMIT 1`;
  if (admins.length === 0) return NextResponse.json({ admin: null });
  const businesses = await sql`SELECT id, name, slug, accent FROM asset_businesses ORDER BY name`;
  return NextResponse.json({ admin: admins[0], businesses });
}

