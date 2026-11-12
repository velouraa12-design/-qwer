# QABS Digital — System Architecture Map

## 1. High-Level Topology
```text
[Client Browser (RTL/LTR React 19 SPA)]
       │
       │ HTTPS / JSON + Bearer <64-char Crypto Session Token>
       ▼
[Unified Express Kernel (server.ts)]
  ├─ Auth & RBAC Middleware (authenticateSession, requireAuth, requireAdmin)
  ├─ Formation Lifecycle Engine (14 Steps + Notifications + Audit Log)
  ├─ Encrypted Document Vault (AES-256-GCM + SHA-256 Checksum + Signed URLs)
  ├─ Unified Pricing & Sandbox Billing Engine (Quotes -> Invoices -> Sandbox Webhooks)
  ├─ Multi-Tenant Store Engine (Draft Creation + Strict Tenant Isolation)
  ├─ Server-Side Gemini AI Gateway (@google/genai gemini-3.8-flash + Quota Ledger)
  └─ Atomic Disk Storage (/data/qabs_storage.json)
```

## 2. External Integrations & Boundary Controls
- **Gemini AI (`@google/genai`)**: Executed strictly server-side via `POST /api/ai/generate` with `User-Agent: aistudio-build`. Never imported in client code.
- **SMTP / Transactional Email**: Declared `BLOCKED` (`503 BLOCKED_PENDING_SMTP`) until DNS SPF/DKIM and SMTP credentials are provisioned.
- **Live Payment Gateways (Stripe / Tap)**: Live charges disabled; Sandbox simulation active under `/api/billing/sandbox/*`.
- **Shopify Admin API**: Declared `BLOCKED` (`503 BLOCKED_MISSING_SHOPIFY_ADMIN_TOKEN`).
- **Cloudflare Infrastructure**: `/api/health` and `/health` sanitized to expose only `{ status, environment, version }` without leaking D1/R2 resource identifiers.
