import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { ADMIN_COOKIE } from "@/lib/auth";
import { requireAssetsSession } from "@/lib/suite";

export const runtime = "nodejs";

// Admin identity comes from the portal's shared cookie, and access to Assets is decided by the
// portal grant (owner, or an explicit assets grant). A signed-in suite account without Assets
// access sees the signed-out state here rather than a half-working app.
export async function GET() {
  const store = await cookies();
  const s = await requireAssetsSession(store.get(ADMIN_COOKIE)?.value);
  if (!s) return NextResponse.json({ admin: null });
  const businesses = await sql`SELECT id, name, slug, accent FROM asset_businesses ORDER BY name`;
  return NextResponse.json({ admin: { email: s.email, name: s.email.split("@")[0], role: s.role, tier: s.tier }, businesses });
}
