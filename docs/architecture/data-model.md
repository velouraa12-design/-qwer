# QABS Digital — Persistent Data Model

All entities are persisted atomically to `/data/qabs_storage.json` and align with `/DATABASE_SCHEMA.sql`. Every tenant-scoped record carries a mandatory `tenant_id` foreign key enforced at the API middleware layer.

## 1. Core Collections
1. **`users`**:
   - `id`, `name`, `email`, `password_hash` (`salt:scryptHash`), `company_name`, `role` (`customer | merchant | staff | admin | super_admin`), `credits`, `ai_quota_limit`, `ai_quota_used`, `email_verified`, `created_at`, `updated_at`.
2. **`sessions`**:
   - `token` (64-char hex), `user_id`, `role`, `created_at`, `expires_at`.
3. **`formations`**:
   - `id`, `tenant_id`, `company_name`, `jurisdiction`, `entity_type`, `package_id`, `state_file_number` (`null` until state verification), `ein` (`null` until IRS issuance), `status` (`draft | submitted | under_review | needs_information | quote_ready | approved | paid | processing | completed | cancelled | rejected`), `payment_status`, `qabs_fee`, `state_fee`, `addons_fee`, `total_amount`, `history[]`.
4. **`quotes`**:
   - `id`, `quote_number`, `tenant_id`, `formation_id`, `qabs_fee`, `state_fee`, `external_fee`, `gateway_fee`, `tax_amount`, `total_amount`, `status` (`draft | quote_ready | approved | expired | cancelled`).
5. **`invoices`**:
   - `id`, `invoice_number`, `tenant_id`, `quote_id`, `formation_id`, `amount`, `currency`, `status` (`pending | paid | cancelled | refunded`), `issued_date`, `paid_at`, `refunded_at`.
6. **`documents`**:
   - `id`, `tenant_id`, `formation_id`, `filename`, `mime_type`, `size_bytes`, `encrypted_payload` (AES-256-GCM `iv:tag:ciphertext`), `checksum_sha256`, `signed_tokens[]`, `access_log[]`.
7. **`stores`**:
   - `id`, `tenant_id`, `name`, `subdomain`, `currency`, `status` (`draft`), `approval_status` (`draft`), `payment_connected` (`false`), `domain_verified` (`false`), `products[]`, `orders[]`.
8. **`audit_logs`**:
   - `id`, `actor_name`, `actor_id`, `action_ar`, `action_en`, `target_entity`, `status` (`success | failed | blocked`), `timestamp`.
