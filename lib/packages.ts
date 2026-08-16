import { sql } from "@/lib/db";

// Camera packages: named, reusable bundles of inventory assets in quantities.
// Tables are created on first use so no manual migration is needed.
let ensured = false;
export async function ensurePackageTables(): Promise<void> {
  if (ensured) return;
  await sql`CREATE TABLE IF NOT EXISTS asset_packages (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES asset_businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS asset_package_items (
    id SERIAL PRIMARY KEY,
    package_id INTEGER NOT NULL REFERENCES asset_packages(id) ON DELETE CASCADE,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE (package_id, asset_id)
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_package_items_package ON asset_package_items(package_id)`;
  ensured = true;
}
