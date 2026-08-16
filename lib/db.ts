import { neon } from "@neondatabase/serverless";

// Accept whichever connection-string variable the Neon/Vercel integration created.
// The Neon-native integration sets DATABASE_URL; Vercel's Postgres integration sets POSTGRES_URL.
// Falls back to a harmless placeholder so a missing value can't crash the build (real queries
// only run at request time, where a real connection string is present).
const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  "postgresql://placeholder:placeholder@placeholder.neon.tech/neondb";

export const sql = neon(url);

