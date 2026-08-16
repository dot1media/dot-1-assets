import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword, makeToken, ASSET_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const b = await request.json().catch(() => ({}));
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  const rows = await sql`SELECT email, password_hash FROM asset_admins WHERE email = ${email} LIMIT 1`;
  if (rows.length === 0 || !verifyPassword(password, rows[0].password_hash)) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ASSET_COOKIE, makeToken(email), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}

