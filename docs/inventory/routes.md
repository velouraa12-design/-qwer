# QABS Digital — Complete API & Route Inventory

## 1. Authentication & Account Routes (Phase 2)
| Method & Route | Protection | Description | Status |
| :--- | :--- | :--- | :---: |
| `GET /api/auth/session` | `authenticateSession` | Inspects active 64-char crypto session token | **PASS** |
| `GET /api/auth/profile` | `requireAuth` | Returns current authenticated user profile & AI quota | **PASS** |
| `PATCH /api/auth/profile` | `requireAuth` | Updates user profile name & company name + Audit Log | **PASS** |
| `POST /api/auth/register` | Public (Anti-Escalation) | Hashes password (`scryptSync`), forces role `merchant` | **PASS** |
| `POST /api/auth/login` | Public (Password Mandatory) | Rejects email-alone (`400`), verifies `timingSafeEqual` | **PASS** |
| `POST /api/auth/logout` | `authenticateSession` | Revokes active session token immediately | **PASS** |
| `POST /api/auth/verify-email` | Public | Returns `503 BLOCKED_PENDING_SMTP` (No fake email claims) | **BLOCKED** |
| `POST /api/auth/recover-password` | Public | Returns `503 BLOCKED_PENDING_SMTP` + WhatsApp fallback | **BLOCKED** |

## 2. Company Formations & 14-Step Lifecycle (Phase 4)
| Method & Route | Protection | Description | Status |
| :--- | :--- | :--- | :---: |
| `GET /api/formations` | `requireAuth` (Tenant Isolated) | Lists only formations belonging to `req.user.id` | **PASS** |
| `POST /api/formations` | `requireAuth` | Creates `draft` or `submitted` formation + pending invoice | **PASS** |
| `GET /api/formations/:id` | `requireAuth` (Cross-Tenant Check) | Rejects cross-tenant reads with `403 FORBIDDEN` | **PASS** |
| `PATCH /api/formations/:id/status` | `requireAuth` / `isStaffOrAdmin` | Transitions across all 11 lifecycle states + Audit + Notification | **PASS** |

## 3. Encrypted Private Document Vault (Phase 5)
| Method & Route | Protection | Description | Status |
| :--- | :--- | :--- | :---: |
| `GET /api/documents` | `requireAuth` (Tenant Isolated) | Lists encrypted document metadata for current tenant | **PASS** |
| `POST /api/documents` | `requireAuth` | Validates MIME & size ($\le 5\text{MB}$), encrypts via AES-256-GCM | **PASS** |
| `GET /api/documents/:id` | `requireAuth` (Cross-Tenant Check) | Decrypts for owner; blocks other tenants with `403 FORBIDDEN` | **PASS** |
| `POST /api/documents/:id/signed-url` | `requireAuth` | Issues 15-minute temporary download token (no public URLs) | **PASS** |
| `DELETE /api/documents/:id` | `requireAuth` | Safely deletes document & records audit trail | **PASS** |

## 4. Unified Pricing & Sandbox Billing (Phase 6)
| Method & Route | Protection | Description | Status |
| :--- | :--- | :--- | :---: |
| `GET /api/pricing` | Public | Single source of truth for QABS fees, state fees, gateway rates | **PASS** |
| `GET /api/invoices` | `requireAuth` (Tenant Isolated) | Lists tenant invoices | **PASS** |
| `POST /api/billing/sandbox/quotes` | `requireAuth` | Generates itemized financial quote (`quote_ready`) | **PASS** |
| `POST /api/billing/sandbox/quotes/:id/approve` | `requireAuth` | Approves quote and generates `pending` invoice | **PASS** |
| `POST /api/billing/sandbox/webhook` | `requireAuth` | Sandbox-only settlement (`payment_intent.succeeded`, `charge.refunded`) | **PASS** |

## 5. Multi-Tenant Stores, AI, Shopify & Health (Phases 8–11)
| Method & Route | Protection | Description | Status |
| :--- | :--- | :--- | :---: |
| `GET /api/stores` | `requireAuth` (Tenant Isolated) | Lists stores owned by current tenant | **PASS** |
| `POST /api/stores` | `requireAuth` | Creates store strictly as `draft` (no auto-publish/payment) | **PASS** |
| `GET /api/stores/:id` | `requireAuth` (Cross-Tenant Check) | Blocks cross-tenant access with `403 FORBIDDEN` | **PASS** |
| `POST /api/stores/:id/products` | `requireAuth` | Adds isolated product to tenant store | **PASS** |
| `GET /api/integrations/shopify/status` | `authenticateSession` | Returns `503 BLOCKED_MISSING_SHOPIFY_ADMIN_TOKEN` | **BLOCKED** |
| `POST /api/ai/generate` | `requireAuth` | Calls server-side `@google/genai` (`gemini-3.8-flash`) with quota tracking | **PASS** |
| `GET /api/ai/usage` | `requireAuth` | Returns tenant AI quota usage history | **PASS** |
| `GET /api/admin/status` | `authenticateSession` | Verifies server-side `super_admin` session | **PASS** |
| `GET /api/admin/audit-logs` | `requireAdmin` | Returns immutable security audit trail | **PASS** |
| `ALL /api/admin/*` | `requireAdmin` | Blocks live administrative write mutations (`503 BLOCKED`) | **BLOCKED** |
| `GET /api/health` & `/health` | Public | Returns `{ status: "ok", environment: "staging", version: "1.4.0" }` | **PASS** |
