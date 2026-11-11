-- =====================================================================
-- QABS UNIFIED PLATFORM — MASTER DATABASE SCHEMA
-- PostgreSQL / Supabase / Cloud SQL / Drizzle Compatible DDL
-- Multi-Tenant Isolation · Compliance Vault · Financial Ledger
-- =====================================================================

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants (Isolated Merchants & Enterprises)
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company_legal_name VARCHAR(255),
    role VARCHAR(32) DEFAULT 'merchant', -- 'merchant', 'super_admin', 'compliance_officer', 'support_agent'
    credits_balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Corporate Formations (US Delaware, Wyoming, UK LTD)
CREATE TABLE IF NOT EXISTS company_formations (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(64) NOT NULL, -- 'US_WYOMING', 'US_DELAWARE', 'US_NEW_MEXICO', 'UK_LTD'
    entity_type VARCHAR(32) NOT NULL, -- 'LLC', 'LTD', 'C-CORP'
    state_file_number VARCHAR(128),
    ein VARCHAR(64),
    crn VARCHAR(64),
    registered_agent VARCHAR(255) NOT NULL,
    registered_address TEXT NOT NULL,
    filing_date DATE NOT NULL,
    renewal_due_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'draft', -- 'draft', 'under_review', 'submitted_to_state', 'approved'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Statutory Document Vault
CREATE TABLE IF NOT EXISTS statutory_documents (
    id VARCHAR(64) PRIMARY KEY,
    formation_id VARCHAR(64) REFERENCES company_formations(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(64) NOT NULL, -- 'articles', 'ein_letter', 'operating_agreement', 'resolution'
    storage_url TEXT,
    verification_hash VARCHAR(128),
    status VARCHAR(32) DEFAULT 'ready',
    issued_date DATE NOT NULL
);

-- 4. Isolated Multi-Store Instances
CREATE TABLE IF NOT EXISTS store_instances (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(128) UNIQUE NOT NULL,
    custom_domain VARCHAR(255),
    currency VARCHAR(8) DEFAULT 'USD',
    theme_preset VARCHAR(64) DEFAULT 'gold_executive',
    status VARCHAR(32) DEFAULT 'active', -- 'active', 'setup', 'paused'
    gateway_type VARCHAR(32) DEFAULT 'Stripe', -- 'Stripe', 'Tap', 'Moyasar', 'Wise'
    total_revenue NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Product Catalog & Inventory
CREATE TABLE IF NOT EXISTS store_products (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) REFERENCES store_instances(id) ON DELETE CASCADE,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    sku VARCHAR(128) NOT NULL,
    retail_price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2) DEFAULT 0.00,
    stock_quantity INT DEFAULT 0,
    category_ar VARCHAR(128),
    category_en VARCHAR(128),
    supplier_name VARCHAR(255),
    status VARCHAR(32) DEFAULT 'active',
    sales_count INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Multi-Store Customer Orders
CREATE TABLE IF NOT EXISTS store_orders (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) REFERENCES store_instances(id) ON DELETE CASCADE,
    order_number VARCHAR(64) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_country VARCHAR(128),
    total_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    payment_gateway VARCHAR(32) DEFAULT 'Stripe',
    tracking_number VARCHAR(128),
    status VARCHAR(32) DEFAULT 'paid', -- 'paid', 'processing', 'shipped', 'delivered', 'refunded'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Recurring Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
    plan_tier VARCHAR(32) NOT NULL, -- 'starter', 'growth', 'enterprise'
    billing_cycle VARCHAR(16) NOT NULL, -- 'monthly', 'annual'
    renewal_date DATE NOT NULL,
    current_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'active'
);

-- 8. Tax Invoices & Receipts
CREATE TABLE IF NOT EXISTS billing_invoices (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(64) UNIQUE NOT NULL,
    tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'paid',
    issued_date DATE NOT NULL
);

-- 9. Platform Sales Commissions
CREATE TABLE IF NOT EXISTS platform_commissions (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) REFERENCES store_instances(id) ON DELETE CASCADE,
    order_number VARCHAR(64) NOT NULL,
    gross_amount NUMERIC(10, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL,
    commission_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'settled',
    settled_date DATE NOT NULL
);

-- 10. Refunds & Dispute Ledger
CREATE TABLE IF NOT EXISTS refund_records (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(64) NOT NULL,
    refund_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    reason_ar TEXT NOT NULL,
    reason_en TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'processed',
    processed_date DATE NOT NULL
);

-- 11. Immutable Security Audit Trail
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_name VARCHAR(255) NOT NULL,
    action_ar TEXT NOT NULL,
    action_en TEXT NOT NULL,
    target_entity VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'success',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_formations_tenant ON company_formations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stores_tenant ON store_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_store ON store_products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON store_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON billing_invoices(tenant_id);

-- =====================================================================
-- 12. Cloudflare D1 & Edge Sync Extensions (from Snapshot Supplements)
-- =====================================================================

-- Multi-Tenant Customer Support Tickets & Threads
CREATE TABLE IF NOT EXISTS account_tickets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES tenants(id),
    category VARCHAR(32) NOT NULL CHECK(category IN ('technical','question','suggestion','security','account_deletion')),
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'open' CHECK(status IN ('open','closed')),
    revision INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_ticket_posts (
    id VARCHAR(64) PRIMARY KEY,
    ticket_id VARCHAR(64) NOT NULL REFERENCES account_tickets(id) ON DELETE CASCADE,
    actor_id VARCHAR(64) NOT NULL REFERENCES tenants(id),
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Two-Factor Authentication & Identity Verification
CREATE TABLE IF NOT EXISTS account_mfa (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    enabled SMALLINT DEFAULT 0 CHECK(enabled IN (0, 1)),
    version INT DEFAULT 0,
    secret TEXT,
    iv TEXT,
    last_step INT DEFAULT -1,
    last_claim TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cloudflare Edge Buyer Cart & Draft Orders
CREATE TABLE IF NOT EXISTS qs_buyer_cart (
    user_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    variant_id VARCHAR(64) DEFAULT '',
    quantity INT NOT NULL CHECK(quantity BETWEEN 1 AND 1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, product_id, variant_id)
);

CREATE TABLE IF NOT EXISTS qs_buyer_order_drafts (
    id VARCHAR(64) PRIMARY KEY,
    buyer_id VARCHAR(64) NOT NULL REFERENCES tenants(id),
    store_id VARCHAR(64) NOT NULL REFERENCES store_instances(id),
    quote_fingerprint VARCHAR(128) NOT NULL,
    snapshot_json JSONB NOT NULL,
    subtotal_cents BIGINT NOT NULL CHECK(subtotal_cents >= 0),
    currency VARCHAR(8) DEFAULT 'USD',
    state VARCHAR(32) DEFAULT 'draft' CHECK(state IN ('draft','cancelled','confirmed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Real-time Operational Alerts & Webhook Event Deliveries
CREATE TABLE IF NOT EXISTS qs_alert_events (
    id VARCHAR(64) PRIMARY KEY,
    dedupe_key VARCHAR(128) UNIQUE NOT NULL,
    kind VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64) NOT NULL,
    payload_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qs_alert_deliveries (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL REFERENCES qs_alert_events(id) ON DELETE CASCADE,
    channel VARCHAR(32) NOT NULL CHECK(channel IN ('email','telegram','webhook')),
    state VARCHAR(32) DEFAULT 'pending' CHECK(state IN ('pending','sending','accepted','failed')),
    attempts INT DEFAULT 0,
    next_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, channel)
);

