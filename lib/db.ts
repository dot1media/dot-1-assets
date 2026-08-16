import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Connect your Neon database in the Vercel project settings.");

export const sql = neon(url);

