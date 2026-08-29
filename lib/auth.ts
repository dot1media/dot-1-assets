import crypto from "crypto";

export const ADMIN_COOKIE = "dot1_admin"; // shared cross-suite admin cookie, set by the portal on .dot1.media
const WEEK_MS = 1000 * 60 * 60 * 24 * 7;

function sign(payloadObj: object): string {
  const secret = process.env.SESSION_SECRET || "";
  const body = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + sig;
}
function verify(token: string | undefined | null, role: string): { email: string } | null {
  const secret = process.env.SESSION_SECRET || "";
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(sig), e = Buffer.from(expected);
  if (a.length !== e.length || !crypto.timingSafeEqual(a, e)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString());
    if (p.role !== role || typeof p.exp !== "number" || Date.now() > p.exp) return null;
    const floor = Number(process.env.SESSION_MIN_IAT || 0);
    if (floor && (typeof p.iat !== "number" || p.iat < floor)) return null;
    return { email: String(p.email || "") };
  } catch { return null; }
}
export function makeToken(email: string): string { return sign({ role: "admin", email, exp: Date.now() + WEEK_MS }); }
export function verifyToken(token: string | undefined | null) { return verify(token, "admin"); }

export function isDot1Email(email: string): boolean {
  return /^[^@\s]+@dot1\.media$/i.test(String(email || "").trim());
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return "scrypt$" + salt + "$" + hash;
}
export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const test = crypto.scryptSync(password, parts[1], 64).toString("hex");
  const a = Buffer.from(parts[2], "hex"), b = Buffer.from(test, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

