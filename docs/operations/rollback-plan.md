# QABS Digital — Rollback & Recovery Plan

## 1. Application Code Rollback
- All changes are isolated within the application workspace without altering external DNS, Cloudflare production routes, or live payment gateway keys.
- To revert to the prior baseline, restore `server.ts` and `src/` components from the pre-release commit or backup branch.

## 2. Database & Persistent Storage Rollback
- Persistent data is stored atomically in `/data/qabs_storage.json` while preserving `/DATABASE_SCHEMA.sql` untouched.
- No destructive migrations (`DROP TABLE` or schema deletions) have been executed.
- Calling `db.ensureSeedDefaults()` or restoring `/data/qabs_storage.json` from snapshot immediately restores the baseline state.
