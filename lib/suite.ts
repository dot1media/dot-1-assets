import crypto from "crypto";

// Assets reads the suite identity the portal owns and gates access on the portal's Assets grant.
// The portal decides who may enter Assets (owner, or an explicit assets grant) and the baseline
// role they carry. Assets has no fine-grained capability model yet, so today the role is carried
// for display and future use; the gate is access yes/no. A live portal check locks out disabled or
// revoked people promptly, with the cookie's baked claims as a fallback if the portal is briefly
// unreachable.

const PORTAL_ORIGIN = process.env.SUITE_PORTAL_ORIGIN || "https://portal.dot1.media";
const VALID_ROLES = ["admin", "manager", "viewer"];

export interface AssetsSession {
  email: string;
  role: string;
  tier: string;
}

function verifyClaims(token: string | undefined | null): { email: string; tier?: string; grants?: any } | null {
  const secret = process.env.SESSION_SECRET || "";
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(sig), e = Buffer.from(expected);
  if (a.length !== e.length || !crypto.timingSafeEqual(a, e)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString());
    if (p.role !== "admin" || typeof p.exp !== "number" || Date.now() > p.exp) return null;
    return { email: String(p.email || ""), tier: p.tier, grants: p.grants };
  } catch { return null; }
}

async function freshFromPortal(token: string): Promise<AssetsSession | null> {
  try {
    const res = await fetch(`${PORTAL_ORIGIN}/api/suite/me`, { headers: { cookie: `dot1_admin=${token}` }, cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d.signedIn) return null;
    const asset = (d.apps || []).find((a: any) => a.id === "assets");
    if (d.tier !== "owner" && !asset) return null;
    const role = d.tier === "owner" ? "admin" : (VALID_ROLES.includes(asset?.role) ? asset.role : "viewer");
    return { email: String(d.email || "").toLowerCase(), role, tier: d.tier || "user" };
  } catch { return null; }
}

// The one guard Assets routes call. Returns the session if this person may use Assets, else null.
export async function requireAssetsSession(token: string | undefined | null): Promise<AssetsSession | null> {
  if (!token) return null;
  const fresh = await freshFromPortal(token);
  if (fresh) return fresh;

  // Fallback to cookie claims if the portal check failed.
  const claim = verifyClaims(token);
  if (!claim) return null;
  const isOwner = claim.tier === "owner";
  const g = claim.grants && typeof claim.grants === "object" ? claim.grants.assets : null;
  if (!isOwner && !(g && g.access)) return null;
  const role = isOwner ? "admin" : (VALID_ROLES.includes(g?.role) ? g.role : "viewer");
  return { email: claim.email.toLowerCase(), role, tier: claim.tier || "user" };
}
