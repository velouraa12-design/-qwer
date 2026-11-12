# QABS Digital — Security Status & Controls

## 1. Implemented Security Controls (PASS)
- **Password Storage**: Salted `crypto.scryptSync` (16-byte random salt, 64-byte derived key) with `crypto.timingSafeEqual` verification.
- **Session Tokens**: 32 random bytes (64-character hex) with server-side expiration and immediate revocation on logout.
- **Anti-Privilege Escalation**: Public registration forces `role: 'merchant'`; attempts to claim `super_admin`, `admin`, or `staff` are rejected and logged in the immutable audit trail.
- **Multi-Tenant Isolation**: Enforced on `/api/formations`, `/api/documents`, `/api/invoices`, and `/api/stores`. Cross-tenant access returns `403 FORBIDDEN`.
- **Private Encrypted Document Vault**: Files are validated for MIME type (`application/pdf`, `image/png`, `image/jpeg`) and size ($\le 5\text{MB}$), encrypted at rest using `AES-256-GCM`, and never exposed via public URLs.
- **Secret Hygiene**: Zero API keys, database credentials, or tokens are hardcoded in client bundles or exposed in `/api/health`.

## 2. Blocked Security Dependencies (BLOCKED)
- **Production Identity Provider (IdP / MFA)**: Administrative write mutations (`/api/admin/*` non-GET) are locked with `503 BLOCKED_PENDING_PRODUCTION_IDP`.
- **SMTP Email Verification**: Returns `503 BLOCKED_PENDING_SMTP` until verified SPF/DKIM/DMARC records and SMTP credentials are provisioned.
