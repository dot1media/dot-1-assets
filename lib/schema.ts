import { sql } from "@/lib/db";

// Idempotent schema. Safe to run repeatedly.
export async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS asset_admins (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT '',
    password_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS asset_businesses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    accent TEXT DEFAULT '#e23b2e',
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES asset_businesses(id) ON DELETE CASCADE,
    kind TEXT NOT NULL DEFAULT 'equipment',
    name TEXT NOT NULL,
    category TEXT DEFAULT '',
    identifier TEXT DEFAULT '',
    description TEXT DEFAULT '',
    bin TEXT DEFAULT '',
    quantity INTEGER DEFAULT 1,
    unit_cost NUMERIC DEFAULT 0,
    condition TEXT DEFAULT '',
    status TEXT DEFAULT 'in_service',
    location TEXT DEFAULT '',
    vendor TEXT DEFAULT '',
    purchase_date DATE,
    expected_lifespan_months INTEGER,
    renewal_date DATE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_assets_business ON assets(business_id)`;
}

