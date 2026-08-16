import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken, ADMIN_COOKIE, isDot1Email } from "@/lib/auth";

export const runtime = "nodejs";

// Admin identity comes from the portal's shared cookie. We don't keep our own admin table
// anymore; a valid signed @dot1.media cookie is proof of access.
export async function GET() {
  const store = await cookies();
  const v = verifyToken(store.get(ADMIN_COOKIE)?.value);
  if (!v || !isDot1Email(v.email)) return NextResponse.json({ admin: null });
  const businesses = await sql`SELECT id, name, slug, accent FROM asset_businesses ORDER BY name`;
  return NextResponse.json({ admin: { email: v.email, name: v.email.split("@")[0] }, businesses });
}
