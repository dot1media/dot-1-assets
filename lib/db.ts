import { neon } from "@neondatabase/serverless";

// Use the real Neon connection string at runtime. Fall back to a harmless placeholder so that a
// missing DATABASE_URL at build time cannot crash `next build` (this module gets imported during
// the build). Real queries only ever run at request time, where DATABASE_URL is present.
const url = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@placeholder.neon.tech/neondb";

export const sql = neon(url);

