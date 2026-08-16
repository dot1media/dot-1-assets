# Dot One Assets

Multi-tenant asset management and lifecycle tracking for Dot One Media and future businesses.
Built with Next.js and Neon Postgres, deployed on Vercel at assets.dot1.media.

## Environment variables (set in the Vercel project)
- `DATABASE_URL`  - Neon connection string (already connected)
- `SESSION_SECRET` - a long random string used to sign the login cookie
- `SETUP_CODE` - optional; if set, it is required to run first-time setup

## First run
Open the site and complete the setup form. It creates the database schema, seeds the
Dot One Media inventory, and creates your owner account, then signs you in.

## What it does
- Tracks equipment, software licenses, and web services per business
- Dashboard: inventory value, counts, category and condition breakdowns, lifecycle alerts
- Inventory: searchable and filterable table of every asset
- Lifecycle: replacement dates (purchase date + expected lifespan) and subscription renewals
- Add businesses and switch between them from the top bar

