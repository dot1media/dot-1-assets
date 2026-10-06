import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { ADMIN_COOKIE } from "@/lib/auth";
import { requireAssetsSession } from "@/lib/suite";
import { ensurePackageTables } from "@/lib/packages";

export const runtime = "nodejs";
async function guardWrite() {
  const store = await cookies();
  const s = await requireAssetsSession(store.get(ADMIN_COOKIE)?.value);
  return s && (s as any).role !== "viewer" ? s : null;
}

// Best-effort matchers against an item's "name + category" (lower-cased).
const rx = {
  body: (t: string) => /(camera|\bbody\b|mirrorless|dslr|\bz\s?\d|\br[0-9]\b|\ba7|a7r|a7s|\bgfx|\bd[0-9]{3}|r5|r6|z6|z7|z8|z9)/.test(t) && !/bag|strap|cage|case|backpack|rig/.test(t),
  lens: (t: string) => /(lens|[0-9]{2,3}\s?mm|f\/?[0-9]|prime|zoom|24-70|70-200|16-35|24-105|50mm|85mm|35mm|sigma|tamron)/.test(t),
  light: (t: string) => /(light|strobe|flash|speedlight|speedlite|godox|profoto|aputure|softbox|umbrella|\bad[0-9]{3}|trigger)/.test(t),
  reflector: (t: string) => /(reflector|diffuser|5-in-1|scrim|bounce)/.test(t),
  tripod: (t: string) => /(tripod|monopod|\bstand\b|c-stand|gimbal|slider)/.test(t),
  battery: (t: string) => /(batter|\bnp-|lp-e|\bcharger)/.test(t),
  card: (t: string) => /(\bsd\b|\bcf\b|cfexpress|xqd|memory\s?card|\bcard\b)/.test(t),
  bag: (t: string) => /(bag|hard case|backpack|roller|pelican)/.test(t),
};

type Rule = { match: (t: string) => boolean; max: number };
type Spec = { name: string; sessionTypes: string; description: string; rules: Rule[] };

const SPECS: Spec[] = [
  { name: "Mini Session Kit", sessionTypes: "Mini Session", description: "Light, fast kit for mini sessions.",
    rules: [{ match: rx.body, max: 1 }, { match: rx.lens, max: 1 }, { match: rx.reflector, max: 1 }, { match: rx.card, max: 1 }] },
  { name: "Portrait Session Kit", sessionTypes: "Portrait Photography, Full Session", description: "Full portrait kit with a light and reflector.",
    rules: [{ match: rx.body, max: 1 }, { match: rx.lens, max: 2 }, { match: rx.light, max: 1 }, { match: rx.reflector, max: 1 }, { match: rx.tripod, max: 1 }, { match: rx.battery, max: 1 }, { match: rx.card, max: 1 }] },
  { name: "Event Kit", sessionTypes: "Event Photography", description: "Two-body, run-and-gun event coverage.",
    rules: [{ match: rx.body, max: 2 }, { match: rx.lens, max: 2 }, { match: rx.light, max: 1 }, { match: rx.battery, max: 2 }, { match: rx.card, max: 2 }, { match: rx.bag, max: 1 }] },
  { name: "Destination Kit", sessionTypes: "Destination Photography", description: "Travel-ready kit for destination shoots.",
    rules: [{ match: rx.body, max: 1 }, { match: rx.lens, max: 2 }, { match: rx.battery, max: 2 }, { match: rx.card, max: 2 }, { match: rx.bag, max: 1 }, { match: rx.tripod, max: 1 }] },
];

// Create the four standard photography kits from the current inventory. Idempotent by name:
// a kit whose name already exists is skipped, so re-running never duplicates.
export async function POST(request: Request) {
  const s = await guardWrite();
  if (!s) return NextResponse.json({ error: "Read-only access. Your role can view but not change assets." }, { status: 403 });
  await ensurePackageTables();
  const b = await request.json().catch(() => ({}));
  const businessId = parseInt(String(b.business_id || "0"), 10);
  if (!businessId) return NextResponse.json({ error: "business_id is required." }, { status: 400 });

  const existing = (await sql`SELECT name FROM asset_packages WHERE business_id = ${businessId}`) as any[];
  const have = new Set(existing.map((r) => String(r.name).toLowerCase().trim()));
  const inv = (await sql`SELECT id, name, category, kind FROM assets WHERE business_id = ${businessId} AND (kind = 'equipment' OR kind IS NULL)`) as any[];
  const txt = (a: any) => (String(a.name || "") + " " + String(a.category || "")).toLowerCase();

  const created: { name: string; items: number; sessionTypes: string }[] = [];
  const skipped: string[] = [];

  for (const spec of SPECS) {
    if (have.has(spec.name.toLowerCase().trim())) { skipped.push(spec.name); continue; }
    const used = new Set<number>();
    const items: { asset_id: number; quantity: number }[] = [];
    for (const rule of spec.rules) {
      let n = 0;
      for (const a of inv) {
        if (n >= rule.max) break;
        if (used.has(a.id)) continue;
        if (rule.match(txt(a))) { used.add(a.id); items.push({ asset_id: a.id, quantity: 1 }); n++; }
      }
    }
    const pkgRows = (await sql`INSERT INTO asset_packages (business_id, name, description, session_types) VALUES (${businessId}, ${spec.name}, ${spec.description}, ${spec.sessionTypes}) RETURNING id`) as any[];
    const pid = pkgRows[0].id;
    for (const it of items) {
      await sql`INSERT INTO asset_package_items (package_id, asset_id, quantity) VALUES (${pid}, ${it.asset_id}, ${it.quantity}) ON CONFLICT (package_id, asset_id) DO UPDATE SET quantity = EXCLUDED.quantity`;
    }
    created.push({ name: spec.name, items: items.length, sessionTypes: spec.sessionTypes });
  }

  return NextResponse.json({ ok: true, created, skipped, inventorySeen: inv.length });
}
