import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' }));

// ==========================================
// PERSISTENT DATA SCHEMAS (DATABASE_SCHEMA.sql)
// ==========================================

export type UserRoleType = 'customer' | 'merchant' | 'staff' | 'admin' | 'super_admin' | 'compliance_officer' | 'support_agent';

export type FormationLifecycleStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'needs_information'
  | 'quote_ready'
  | 'approved'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'submitted_to_state';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password_hash: string; // salt:hash
  company_name: string;
  role: UserRoleType;
  credits: number;
  ai_quota_limit: number;
  ai_quota_used: number;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionRecord {
  token: string; // 64-char unguessable hex
  user_id: string;
  role: string;
  created_at: string;
  expires_at: string;
}

export interface CompanyFormationRecord {
  id: string;
  tenant_id: string; // Strict link to client tenant account
  company_name: string;
  jurisdiction: string;
  entity_type: 'LLC' | 'C-CORP' | 'LTD';
  package_id?: 'starter' | 'complete' | 'premium';
  state_file_number: string | null;
  ein: string | null;
  crn: string | null;
  registered_agent: string;
  registered_address: string;
  filing_date: string;
  renewal_due_date: string;
  status: FormationLifecycleStatus;
  payment_status: 'unpaid' | 'pending_payment' | 'paid' | 'refunded';
  qabs_fee?: number;
  state_fee?: number;
  addons_fee?: number;
  total_amount?: number;
  notes: string | null;
  history: {
    status: string;
    changed_at: string;
    changed_by: string;
    note: string;
  }[];
  created_at: string;
}

export interface QuoteRecord {
  id: string;
  quote_number: string;
  tenant_id: string;
  formation_id?: string;
  qabs_fee: number;
  state_fee: number;
  external_fee: number;
  gateway_fee: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'quote_ready' | 'approved' | 'expired' | 'cancelled';
  created_at: string;
  approved_at?: string;
}

export interface InvoiceRecord {
  id: string;
  invoice_number: string;
  tenant_id: string;
  quote_id?: string;
  formation_id?: string;
  qabs_fee?: number;
  state_fee?: number;
  external_fee?: number;
  gateway_fee?: number;
  tax_amount?: number;
  amount: number;
  currency: string;
  description_ar: string;
  description_en: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  issued_date: string;
  paid_at?: string;
  refunded_at?: string;
}

export interface DocumentVaultRecord {
  id: string;
  tenant_id: string;
  formation_id?: string;
  filename: string;
  mime_type: 'application/pdf' | 'image/png' | 'image/jpeg';
  size_bytes: number;
  encrypted_payload: string; // AES-256-GCM iv:authTag:ciphertext
  checksum_sha256: string;
  signed_tokens: {
    token: string;
    expires_at: string;
  }[];
  access_log: {
    actor_id: string;
    action: 'upload' | 'read' | 'sign_url' | 'replace' | 'delete' | 'unauthorized_attempt';
    timestamp: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface StoreBackendRecord {
  id: string;
  tenant_id: string;
  name: string;
  subdomain: string;
  currency: string;
  theme: string;
  status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'suspended';
  approval_status: 'draft' | 'pending_review' | 'approved_published' | 'changes_requested' | 'rejected';
  payment_connected: boolean;
  domain_verified: boolean;
  tax_rate: number;
  products: {
    id: string;
    store_id: string;
    title: string;
    sku: string;
    price: number;
    stock: number;
    category: string;
  }[];
  orders: {
    id: string;
    store_id: string;
    order_number: string;
    total: number;
    status: string;
  }[];
  created_at: string;
}

export interface NotificationRecord {
  id: string;
  tenant_id: string;
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  read: boolean;
  created_at: string;
}

export interface AIUsageRecord {
  id: string;
  tenant_id: string;
  model: string;
  prompt_preview: string;
  tokens_estimated: number;
  credits_deducted: number;
  status: 'success' | 'fallback' | 'error';
  created_at: string;
}

export interface SecurityAuditRecord {
  id: string;
  actor_name: string;
  actor_id: string;
  action_ar: string;
  action_en: string;
  target_entity: string;
  status: 'success' | 'failed' | 'blocked';
  ip_address?: string;
  timestamp: string;
}

interface PersistentStorage {
  version: string;
  users: Record<string, UserAccount>;
  sessions: Record<string, SessionRecord>;
  formations: Record<string, CompanyFormationRecord>;
  quotes: Record<string, QuoteRecord>;
  invoices: Record<string, InvoiceRecord>;
  documents: Record<string, DocumentVaultRecord>;
  stores: Record<string, StoreBackendRecord>;
  notifications: NotificationRecord[];
  ai_usage: AIUsageRecord[];
  audit_logs: SecurityAuditRecord[];
}

// Storage path on disk (ensures persistence across server reboots)
const DATA_DIR = path.resolve(__dirname, 'data');
const STORAGE_FILE = path.resolve(DATA_DIR, 'qabs_storage.json');

// Document Vault AES-256-GCM Encryption Key (derived deterministically in dev/staging without exposing secrets)
const VAULT_MASTER_KEY = crypto
  .createHash('sha256')
  .update(process.env.VAULT_ENCRYPTION_SECRET || 'qabs_private_document_vault_key_2026')
  .digest();

export function encryptDocumentContent(plainTextBase64: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', VAULT_MASTER_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainTextBase64, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptDocumentContent(payload: string): string {
  const [ivHex, tagHex, encHex] = payload.split(':');
  if (!ivHex || !tagHex || !encHex) throw new Error('Invalid encrypted payload');
  const decipher = crypto.createDecipheriv('aes-256-gcm', VAULT_MASTER_KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

// Password Hashing Helpers
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, originalHash] = stored.split(':');
    if (!salt || !originalHash) return false;
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch {
    return false;
  }
}

// Unified Pricing Single Source of Truth (Phase 6)
export const UNIFIED_PRICING_SOURCE = {
  currency: 'USD',
  qabs_packages: {
    starter: { id: 'starter', name_ar: 'الأساسية (Starter)', name_en: 'Starter', qabs_fee: 0, registered_agent_months: 6 },
    complete: { id: 'complete', name_ar: 'المتكاملة (Complete)', name_en: 'Complete', qabs_fee: 299, registered_agent_months: 12 },
    premium: { id: 'premium', name_ar: 'التنفيذية الشاملة (Premium)', name_en: 'Premium', qabs_fee: 599, registered_agent_months: 12 }
  },
  government_state_fees: {
    US_WYOMING: 100,
    US_DELAWARE: 110,
    US_NEW_MEXICO: 50,
    US_FLORIDA: 125,
    US_TEXAS: 300,
    UK_LTD: 50
  } as Record<string, number>,
  external_third_party_fees: {
    expedited_ein: 50,
    virtual_address_suite: 99,
    apostille_certification: 150
  },
  payment_gateway_rates: {
    sandbox_stripe_percent: 2.9,
    sandbox_stripe_fixed: 0.3
  },
  tax_rates: {
    us_formation_tax_percent: 0,
    gcc_store_vat_percent: 15
  },
  complimentary_free_services: [
    'Free Registered Agent (First Term)',
    'Operating Agreement / Corporate Bylaws Draft',
    'Initial Banking Resolution Template',
    'Compliance Calendar Alerts'
  ],
  suspended_blocked_services: [
    { id: 'live_stripe_connect', reason: 'BLOCKED — Requires live production Stripe Connect merchant onboarding' },
    { id: 'live_mercury_auto_open', reason: 'BLOCKED — Subject to Mercury Bank compliance & KYC verification' },
    { id: 'uk_companies_house_direct', reason: 'BLOCKED — Direct Companies House API gateway disabled in staging' }
  ]
};

// Database Engine with Atomic File Persistence
class PersistentDatabase {
  private data: PersistentStorage;

  constructor() {
    this.data = this.load();
    this.ensureSeedDefaults();
  }

  private load(): PersistentStorage {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          version: parsed.version || '2.0',
          users: parsed.users || {},
          sessions: parsed.sessions || {},
          formations: parsed.formations || {},
          quotes: parsed.quotes || {},
          invoices: parsed.invoices || {},
          documents: parsed.documents || {},
          stores: parsed.stores || {},
          notifications: parsed.notifications || [],
          ai_usage: parsed.ai_usage || [],
          audit_logs: parsed.audit_logs || []
        };
      }
    } catch (err) {
      console.warn('Could not read existing storage file, initializing seed defaults:', err);
    }

    return this.initSeedDefaults(true);
  }

  private initSeedDefaults(saveToDisk = false): PersistentStorage {
    const seedCustomer1Password = hashPassword('QabsSecure2026!');
    const seedCustomer2Password = hashPassword('QabsSecure2026!');
    const seedStaffPassword = hashPassword('QabsStaff2026!');
    const seedAdminPassword = hashPassword('QabsAdminRoot2026!');

    const seed: PersistentStorage = {
      version: '2.0',
      users: {
        usr_customer_01: {
          id: 'usr_customer_01',
          name: 'محمد الخالدي (عميل قبس)',
          email: 'customer@qabs1.store',
          password_hash: seedCustomer1Password,
          company_name: 'Khaledi Retail LLC',
          role: 'merchant',
          credits: 100,
          ai_quota_limit: 50,
          ai_quota_used: 2,
          email_verified: false,
          created_at: '2026-01-10T10:00:00Z',
          updated_at: '2026-01-10T10:00:00Z'
        },
        usr_customer_02: {
          id: 'usr_customer_02',
          name: 'سارة المنصوري (عميلة قبس)',
          email: 'founder@atlasventures.com',
          password_hash: seedCustomer2Password,
          company_name: 'Al-Mansouri Modern Ventures',
          role: 'merchant',
          credits: 50,
          ai_quota_limit: 25,
          ai_quota_used: 0,
          email_verified: false,
          created_at: '2026-02-01T12:00:00Z',
          updated_at: '2026-02-01T12:00:00Z'
        },
        usr_staff_01: {
          id: 'usr_staff_01',
          name: 'كريم عادل (موظف مراجعة وامتثال)',
          email: 'staff@qabs1.store',
          password_hash: seedStaffPassword,
          company_name: 'QABS Compliance Desk',
          role: 'staff',
          credits: 200,
          ai_quota_limit: 100,
          ai_quota_used: 0,
          email_verified: true,
          created_at: '2026-01-05T09:00:00Z',
          updated_at: '2026-01-05T09:00:00Z'
        },
        usr_admin_01: {
          id: 'usr_admin_01',
          name: 'مدير عمليات قبس (System Administrator)',
          email: 'admin@qabs1.store',
          password_hash: seedAdminPassword,
          company_name: 'QABS Operations HQ',
          role: 'super_admin',
          credits: 1000,
          ai_quota_limit: 500,
          ai_quota_used: 5,
          email_verified: true,
          created_at: '2026-01-01T08:00:00Z',
          updated_at: '2026-01-01T08:00:00Z'
        }
      },
      sessions: {
        qabs_seed_token_customer_01_secure_64_bytes_entropy_token_valid: {
          token: 'qabs_seed_token_customer_01_secure_64_bytes_entropy_token_valid',
          user_id: 'usr_customer_01',
          role: 'merchant',
          created_at: '2026-03-01T10:00:00Z',
          expires_at: '2027-03-01T10:00:00Z'
        },
        qabs_seed_token_customer_02_secure_64_bytes_entropy_token_valid: {
          token: 'qabs_seed_token_customer_02_secure_64_bytes_entropy_token_valid',
          user_id: 'usr_customer_02',
          role: 'merchant',
          created_at: '2026-03-01T10:00:00Z',
          expires_at: '2027-03-01T10:00:00Z'
        },
        qabs_seed_token_staff_01_secure_64_bytes_entropy_token_valid_00: {
          token: 'qabs_seed_token_staff_01_secure_64_bytes_entropy_token_valid_00',
          user_id: 'usr_staff_01',
          role: 'staff',
          created_at: '2026-03-01T10:00:00Z',
          expires_at: '2027-03-01T10:00:00Z'
        }
      },
      formations: {
        comp_seed_01: {
          id: 'comp_seed_01',
          tenant_id: 'usr_customer_01',
          company_name: 'KHALEDI COMMERCE LLC',
          jurisdiction: 'US_WYOMING',
          entity_type: 'LLC',
          package_id: 'complete',
          state_file_number: null,
          ein: null,
          crn: null,
          registered_agent: 'بانتظار التعيين الرسمي بعد مراجعة الطلب (Pending Assignment)',
          registered_address: 'يحدد رسمياً بعد المراجعة وتأكيد ملف الولاية (Pending Verification)',
          filing_date: '2026-03-01',
          renewal_due_date: '2027-03-01',
          status: 'submitted',
          payment_status: 'pending_payment',
          qabs_fee: 299,
          state_fee: 100,
          addons_fee: 0,
          total_amount: 399,
          notes: 'طلب مبدئي مستلم. بانتظار استكمال التدقيق وسداد الرسوم.',
          history: [
            {
              status: 'submitted',
              changed_at: '2026-03-01T09:30:00Z',
              changed_by: 'usr_customer_01',
              note: 'Initial intake received'
            }
          ],
          created_at: '2026-03-01T09:30:00Z'
        }
      },
      quotes: {},
      invoices: {
        inv_seed_01: {
          id: 'inv_seed_01',
          invoice_number: 'QABS-INV-2026-001',
          tenant_id: 'usr_customer_01',
          formation_id: 'comp_seed_01',
          qabs_fee: 299,
          state_fee: 98,
          external_fee: 0,
          gateway_fee: 0,
          tax_amount: 0,
          amount: 397.0,
          currency: 'USD',
          description_ar: 'فاتورة تأسيس شركة وايومنغ (طلب مبدئي بانتظار السداد)',
          description_en: 'Wyoming LLC Initial Formation Intake (Pending Payment)',
          status: 'pending',
          issued_date: '2026-03-01'
        }
      },
      documents: {},
      stores: {
        store_seed_01: {
          id: 'store_seed_01',
          tenant_id: 'usr_customer_01',
          name: 'متجر الخالدي للعطور الفاخرة',
          subdomain: 'khaledi-oud.qabs1.store',
          currency: 'SAR',
          theme: 'gold_executive',
          status: 'draft',
          approval_status: 'draft',
          payment_connected: false,
          domain_verified: false,
          tax_rate: 15,
          products: [
            {
              id: 'prod_seed_01',
              store_id: 'store_seed_01',
              title: 'دهن عود كمبودي ملكي',
              sku: 'KHL-OUD-01',
              price: 450,
              stock: 25,
              category: 'Perfumes'
            }
          ],
          orders: [],
          created_at: '2026-03-01T10:00:00Z'
        },
        store_seed_02: {
          id: 'store_seed_02',
          tenant_id: 'usr_customer_02',
          name: 'أطلس للتقنية الحديثة',
          subdomain: 'atlas-tech.qabs1.store',
          currency: 'USD',
          theme: 'luxury_dark',
          status: 'draft',
          approval_status: 'draft',
          payment_connected: false,
          domain_verified: false,
          tax_rate: 0,
          products: [
            {
              id: 'prod_seed_02',
              store_id: 'store_seed_02',
              title: 'Atlas Smart Hub Pro',
              sku: 'ATL-HUB-99',
              price: 199,
              stock: 50,
              category: 'Electronics'
            }
          ],
          orders: [],
          created_at: '2026-03-02T11:00:00Z'
        }
      },
      notifications: [
        {
          id: 'notif_seed_01',
          tenant_id: 'usr_customer_01',
          title_ar: 'تم استلام طلب التأسيس المبدئي',
          title_en: 'Initial Formation Request Received',
          message_ar: 'تم حفظ طلب KHALEDI COMMERCE LLC بحالة مستلم (Submitted) بانتظار المراجعة.',
          message_en: 'Your formation request for KHALEDI COMMERCE LLC is saved as Submitted.',
          read: false,
          created_at: '2026-03-01T09:30:00Z'
        }
      ],
      ai_usage: [],
      audit_logs: [
        {
          id: 'log_boot_01',
          actor_name: 'SYSTEM',
          actor_id: 'sys',
          action_ar: 'تهيئة خادم قبس الرقمية وقاعدة البيانات التخزينية الدائمة',
          action_en: 'System kernel & persistent storage initialized',
          target_entity: 'STORAGE_KERNEL',
          status: 'success',
          timestamp: new Date().toISOString()
        }
      ]
    };

    if (saveToDisk) {
      this.saveData(seed);
    }
    return seed;
  }

  private saveData(data: PersistentStorage) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  public flush() {
    this.saveData(this.data);
  }

  public reloadFromDisk(): void {
    this.data = this.load();
  }

  public ensureSeedDefaults(): void {
    const defaults = this.initSeedDefaults();
    let changed = false;
    if (!this.data.quotes) {
      this.data.quotes = {};
      changed = true;
    }
    if (!this.data.documents) {
      this.data.documents = {};
      changed = true;
    }
    if (!this.data.stores) {
      this.data.stores = {};
      changed = true;
    }
    if (!this.data.notifications) {
      this.data.notifications = [];
      changed = true;
    }
    if (!this.data.ai_usage) {
      this.data.ai_usage = [];
      changed = true;
    }
    for (const [uid, u] of Object.entries(defaults.users)) {
      if (!this.data.users[uid] || this.data.users[uid].email !== u.email) {
        this.data.users[uid] = u;
        changed = true;
      } else if (typeof this.data.users[uid].ai_quota_limit !== 'number') {
        this.data.users[uid].ai_quota_limit = u.ai_quota_limit;
        this.data.users[uid].ai_quota_used = u.ai_quota_used || 0;
        changed = true;
      }
    }
    for (const [tok, sess] of Object.entries(defaults.sessions)) {
      if (!this.data.sessions[tok]) {
        this.data.sessions[tok] = sess;
        changed = true;
      }
    }
    for (const [fid, form] of Object.entries(defaults.formations)) {
      if (!this.data.formations[fid]) {
        this.data.formations[fid] = form;
        changed = true;
      }
    }
    for (const [sid, st] of Object.entries(defaults.stores)) {
      if (!this.data.stores[sid]) {
        this.data.stores[sid] = st;
        changed = true;
      }
    }
    if (changed) {
      this.flush();
    }
  }

  // User queries
  public findUserByEmail(email: string): UserAccount | undefined {
    const norm = email.toLowerCase().trim();
    return Object.values(this.data.users).find(u => u.email.toLowerCase() === norm);
  }

  public findUserById(id: string): UserAccount | undefined {
    return this.data.users[id];
  }

  public createUser(user: UserAccount): void {
    this.data.users[user.id] = user;
    this.flush();
  }

  public updateUser(id: string, updates: Partial<UserAccount>): UserAccount | undefined {
    const existing = this.data.users[id];
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    this.data.users[id] = updated;
    this.flush();
    return updated;
  }

  // Session queries
  public createSession(userId: string, role: string): SessionRecord {
    const token = crypto.randomBytes(32).toString('hex'); // 64-char crypto token
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session: SessionRecord = {
      token,
      user_id: userId,
      role,
      created_at: now.toISOString(),
      expires_at: expires.toISOString()
    };

    this.data.sessions[token] = session;
    this.flush();
    return session;
  }

  public getSession(token: string): SessionRecord | undefined {
    const session = this.data.sessions[token];
    if (!session) return undefined;

    if (new Date(session.expires_at) < new Date()) {
      delete this.data.sessions[token];
      this.flush();
      return undefined;
    }

    return session;
  }

  public deleteSession(token: string): void {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.flush();
    }
  }

  // Formations queries
  public getFormationsByTenant(tenantId: string): CompanyFormationRecord[] {
    return Object.values(this.data.formations).filter(f => f.tenant_id === tenantId);
  }

  public getAllFormations(): CompanyFormationRecord[] {
    return Object.values(this.data.formations);
  }

  public getFormationById(id: string): CompanyFormationRecord | undefined {
    return this.data.formations[id];
  }

  public createFormation(formation: CompanyFormationRecord): void {
    this.data.formations[formation.id] = formation;
    this.flush();
  }

  public updateFormation(id: string, updates: Partial<CompanyFormationRecord>): CompanyFormationRecord | undefined {
    const existing = this.data.formations[id];
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.data.formations[id] = updated;
    this.flush();
    return updated;
  }

  // Quotes queries
  public createQuote(quote: QuoteRecord): void {
    this.data.quotes[quote.id] = quote;
    this.flush();
  }

  public getQuoteById(id: string): QuoteRecord | undefined {
    return this.data.quotes[id];
  }

  public getQuotesByTenant(tenantId: string): QuoteRecord[] {
    return Object.values(this.data.quotes || {}).filter(q => q.tenant_id === tenantId);
  }

  public updateQuote(id: string, updates: Partial<QuoteRecord>): QuoteRecord | undefined {
    const existing = this.data.quotes[id];
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.data.quotes[id] = updated;
    this.flush();
    return updated;
  }

  // Invoices queries
  public createInvoice(invoice: InvoiceRecord): void {
    this.data.invoices[invoice.id] = invoice;
    this.flush();
  }

  public getInvoiceById(id: string): InvoiceRecord | undefined {
    return this.data.invoices[id];
  }

  public getInvoicesByTenant(tenantId: string): InvoiceRecord[] {
    return Object.values(this.data.invoices || {}).filter(inv => inv.tenant_id === tenantId);
  }

  public updateInvoice(id: string, updates: Partial<InvoiceRecord>): InvoiceRecord | undefined {
    const existing = this.data.invoices[id];
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.data.invoices[id] = updated;
    this.flush();
    return updated;
  }

  // Private Document Vault queries
  public createDocument(doc: DocumentVaultRecord): void {
    this.data.documents[doc.id] = doc;
    this.flush();
  }

  public getDocumentById(id: string): DocumentVaultRecord | undefined {
    return this.data.documents[id];
  }

  public getDocumentsByTenant(tenantId: string): DocumentVaultRecord[] {
    return Object.values(this.data.documents || {}).filter(d => d.tenant_id === tenantId);
  }

  public updateDocument(id: string, updates: Partial<DocumentVaultRecord>): DocumentVaultRecord | undefined {
    const existing = this.data.documents[id];
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    this.data.documents[id] = updated;
    this.flush();
    return updated;
  }

  public deleteDocument(id: string): boolean {
    if (!this.data.documents[id]) return false;
    delete this.data.documents[id];
    this.flush();
    return true;
  }

  // Stores Multi-Tenant queries
  public createStore(store: StoreBackendRecord): void {
    this.data.stores[store.id] = store;
    this.flush();
  }

  public getStoreById(id: string): StoreBackendRecord | undefined {
    return this.data.stores[id];
  }

  public getStoresByTenant(tenantId: string): StoreBackendRecord[] {
    return Object.values(this.data.stores || {}).filter(s => s.tenant_id === tenantId);
  }

  public updateStore(id: string, updates: Partial<StoreBackendRecord>): StoreBackendRecord | undefined {
    const existing = this.data.stores[id];
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.data.stores[id] = updated;
    this.flush();
    return updated;
  }

  // Notifications
  public createNotification(notif: Omit<NotificationRecord, 'id' | 'created_at' | 'read'>): NotificationRecord {
    const record: NotificationRecord = {
      ...notif,
      id: `notif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      read: false,
      created_at: new Date().toISOString()
    };
    this.data.notifications.unshift(record);
    this.flush();
    return record;
  }

  public getNotificationsByTenant(tenantId: string): NotificationRecord[] {
    return (this.data.notifications || []).filter(n => n.tenant_id === tenantId);
  }

  // AI Usage
  public recordAIUsage(entry: Omit<AIUsageRecord, 'id' | 'created_at'>): AIUsageRecord {
    const record: AIUsageRecord = {
      ...entry,
      id: `ai_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      created_at: new Date().toISOString()
    };
    this.data.ai_usage.unshift(record);
    this.flush();
    return record;
  }

  public getAIUsageByTenant(tenantId: string): AIUsageRecord[] {
    return (this.data.ai_usage || []).filter(a => a.tenant_id === tenantId);
  }

  public recordAudit(
    actorName: string,
    actorId: string,
    actionAr: string,
    actionEn: string,
    targetEntity: string,
    status: 'success' | 'failed' | 'blocked',
    ip?: string
  ): SecurityAuditRecord {
    const log: SecurityAuditRecord = {
      id: `log_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      actor_name: actorName,
      actor_id: actorId,
      action_ar: actionAr,
      action_en: actionEn,
      target_entity: targetEntity,
      status,
      ip_address: ip,
      timestamp: new Date().toISOString()
    };
    this.data.audit_logs.unshift(log);
    this.flush();
    return log;
  }

  public getAuditLogs(): SecurityAuditRecord[] {
    return this.data.audit_logs;
  }
}

// Instantiate Database
export const db = new PersistentDatabase();

// Extend Request type
declare global {
  namespace Express {
    interface Request {
      user?: UserAccount;
      sessionToken?: string;
    }
  }
}

// ==========================================
// AUTHENTICATION & RBAC MIDDLEWARES
// ==========================================

function authenticateSession(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1].trim();
  const session = db.getSession(token);

  if (session) {
    const user = db.findUserById(session.user_id);
    if (user) {
      req.user = user;
      req.sessionToken = token;
    }
  }

  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    db.recordAudit(
      'ANONYMOUS_VISITOR',
      'anonymous',
      'محاولة وصول غير مصرح بها لمسار محمي',
      'Unauthorized access attempt to protected route',
      req.originalUrl,
      'blocked',
      req.ip
    );
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message_ar: 'جلسة المستخدم غير صالحة أو منتهية. يرجى تسجيل الدخول مجدداً.',
      message_en: 'Authentication required. No valid active session.'
    });
    return;
  }
  next();
}

function isStaffOrAdmin(role: UserRoleType): boolean {
  return ['staff', 'admin', 'super_admin', 'compliance_officer', 'support_agent'].includes(role);
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    db.recordAudit(
      'ANONYMOUS_VISITOR',
      'anonymous',
      'محاولة غير مصرح بها للوصول إلى مسار الإدارة',
      'Unauthenticated attempt to access administrative endpoint',
      req.originalUrl,
      'blocked',
      req.ip
    );
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message_ar: 'الوصول إلى لوحة الإدارة يتطلب تسجيل دخول كمسؤول معتمد.',
      message_en: 'Administrative endpoint requires authenticated staff session.'
    });
    return;
  }

  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    db.recordAudit(
      req.user.name,
      req.user.id,
      'محاولة تصعيد صلاحيات غير مصرح بها إلى Super Admin',
      'Privilege escalation attempt to Super Admin rejected',
      req.originalUrl,
      'blocked',
      req.ip
    );
    res.status(403).json({
      error: 'FORBIDDEN',
      message_ar: 'تم حظر الطلب: لا تملك صلاحية مدير النظام Super Admin.',
      message_en: 'Access forbidden: Insufficient privileges. Privilege escalation blocked.'
    });
    return;
  }

  // Rule 6: Live mutations blocked pending external production IdP
  if (req.method !== 'GET') {
    db.recordAudit(
      req.user.name,
      req.user.id,
      'عملية إدارية مباشرة معطلة: بانتظار ربط مزود الهوية الخارجي المعتمد',
      'Direct admin write disabled: Awaiting certified production IdP integration',
      req.originalUrl,
      'blocked',
      req.ip
    );
    res.status(503).json({
      error: 'BLOCKED',
      status_code: 'BLOCKED_PENDING_PRODUCTION_IDP',
      message_ar: 'العمليات الإدارية المباشرة معطلة أمنياً (BLOCKED) لحين ربط مزود هوية رسمي موثق.',
      message_en: 'Administrative write actions are BLOCKED until a certified hosted IdP is provisioned.'
    });
    return;
  }

  next();
}

// ==========================================
// PHASE 2: SECURE AUTHENTICATION & PROFILE ROUTES
// ==========================================

app.get('/api/auth/session', authenticateSession, (req: Request, res: Response) => {
  if (!req.user) {
    res.json({
      authenticated: false,
      user: null
    });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      company_name: req.user.company_name,
      credits: req.user.credits,
      ai_quota_limit: req.user.ai_quota_limit,
      ai_quota_used: req.user.ai_quota_used,
      email_verified: req.user.email_verified
    }
  });
});

app.get('/api/auth/profile', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const u = req.user!;
  res.json({
    profile: {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      company_name: u.company_name,
      credits: u.credits,
      ai_quota_limit: u.ai_quota_limit,
      ai_quota_used: u.ai_quota_used,
      email_verified: u.email_verified,
      created_at: u.created_at
    }
  });
});

app.patch('/api/auth/profile', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const { name, company_name } = req.body;
  const u = req.user!;
  const updated = db.updateUser(u.id, {
    name: typeof name === 'string' && name.trim() ? name.trim() : u.name,
    company_name: typeof company_name === 'string' && company_name.trim() ? company_name.trim() : u.company_name
  });
  db.recordAudit(u.name, u.id, 'تحديث بيانات الملف الشخصي', 'Updated account profile settings', `users:${u.id}`, 'success', req.ip);
  res.json({ success: true, profile: updated });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, company_name, role } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'INVALID_REQUEST', message_ar: 'الاسم الكامل مطلوب.', message_en: 'Name is required.' });
    return;
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'INVALID_REQUEST', message_ar: 'البريد الإلكتروني غير صالح.', message_en: 'Valid email is required.' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    res.status(400).json({
      error: 'INVALID_REQUEST',
      message_ar: 'كلمة المرور يجب أن لا تقل عن 8 خانات وتحتوي على أرقام وحروف.',
      message_en: 'Password must be at least 8 characters long.'
    });
    return;
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    res.status(409).json({
      error: 'CONFLICT',
      message_ar: 'البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.',
      message_en: 'Email is already registered.'
    });
    return;
  }

  if (role && ['super_admin', 'admin', 'staff'].includes(role)) {
    db.recordAudit(
      name,
      'anonymous_registration',
      'محاولة محظورة لإنشاء حساب إداري عبر التسجيل العام',
      'Privilege escalation attempt during public registration blocked',
      'AUTH_REGISTER',
      'blocked',
      req.ip
    );
  }

  const userId = `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  const newUser: UserAccount = {
    id: userId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password_hash: hashPassword(password),
    company_name: company_name ? String(company_name).trim() : `${name.trim()} LLC`,
    role: 'merchant',
    credits: 25,
    ai_quota_limit: 20,
    ai_quota_used: 0,
    email_verified: false,
    created_at: now,
    updated_at: now
  };

  db.createUser(newUser);
  const session = db.createSession(newUser.id, newUser.role);

  db.recordAudit(
    newUser.name,
    newUser.id,
    'تسجيل حساب عميل جديد بنجاح',
    'Customer registration successful with hashed credentials',
    `users:${newUser.id}`,
    'success',
    req.ip
  );

  res.status(201).json({
    success: true,
    token: session.token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      company_name: newUser.company_name,
      credits: newUser.credits
    }
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'INVALID_REQUEST', message_ar: 'البريد الإلكتروني مطلوب.', message_en: 'Email is required.' });
    return;
  }

  if (!password || typeof password !== 'string') {
    res.status(400).json({
      error: 'PASSWORD_REQUIRED',
      message_ar: 'كلمة المرور مطلوبة. يُحظر الدخول بالبريد وحده لأسباب أمنية.',
      message_en: 'Password is required. Authentication with email alone is strictly prohibited.'
    });
    return;
  }

  const user = db.findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    db.recordAudit(
      email,
      'unknown',
      'فشل تسجيل الدخول: كلمة المرور أو البريد غير متطابقين',
      'Login failed: Invalid credentials or incorrect password',
      'AUTH_LOGIN',
      'failed',
      req.ip
    );
    res.status(401).json({
      error: 'INVALID_CREDENTIALS',
      message_ar: 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.',
      message_en: 'Invalid email or password.'
    });
    return;
  }

  const session = db.createSession(user.id, user.role);

  db.recordAudit(
    user.name,
    user.id,
    'تسجيل دخول ناجح وإنشاء جلسة مشفرة',
    'Successful customer login with secure session token',
    `users:${user.id}`,
    'success',
    req.ip
  );

  res.json({
    success: true,
    token: session.token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_name: user.company_name,
      credits: user.credits
    }
  });
});

app.post('/api/auth/logout', authenticateSession, (req: Request, res: Response) => {
  if (req.sessionToken) {
    db.deleteSession(req.sessionToken);
  }
  res.json({ success: true, message: 'Session terminated successfully' });
});

app.post('/api/auth/verify-email', (_req: Request, res: Response) => {
  res.status(503).json({
    error: 'BLOCKED_PENDING_SMTP',
    status_code: 'BLOCKED_PENDING_SMTP',
    status: 'BLOCKED',
    message_ar: 'خدمة التحقق من البريد الإلكتروني معطلة أمنياً لحين ربط مزود SMTP معتمد وسجلات SPF/DKIM مفعلة.',
    message_en: 'Email verification is BLOCKED pending certified SMTP integration with active SPF/DKIM.'
  });
});

app.post('/api/auth/recover-password', (_req: Request, res: Response) => {
  res.status(503).json({
    error: 'BLOCKED_PENDING_SMTP',
    status_code: 'BLOCKED_PENDING_SMTP',
    status: 'BLOCKED',
    message_ar: 'إرسال روابط الاستعادة آلياً معلق حالياً لعدم توفر خادم بريد رسمي. يرجى التواصل مع الدعم عبر WhatsApp: +159710784967.',
    message_en: 'Automated password recovery is BLOCKED pending verified SMTP. Please contact WhatsApp support (+159710784967).'
  });
});

// ==========================================
// PHASE 4: COMPANY FORMATION 14-STEP LIFECYCLE
// ==========================================

const ALLOWED_LIFECYCLE_STATUSES: FormationLifecycleStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'needs_information',
  'quote_ready',
  'approved',
  'paid',
  'processing',
  'completed',
  'cancelled',
  'rejected',
  'submitted_to_state'
];

app.get('/api/formations', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const currentTenantId = req.user!.id;
  const tenantFormations = db.getFormationsByTenant(currentTenantId);

  res.json({
    tenant_id: currentTenantId,
    total: tenantFormations.length,
    formations: tenantFormations
  });
});

app.post('/api/formations', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const currentTenantId = req.user!.id;
  const { company_name, jurisdiction, entity_type, package_id, addons_fee, notes, save_as_draft } = req.body;

  if (!company_name || typeof company_name !== 'string' || !company_name.trim()) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message_ar: 'اسم الشركة مطلوب.', message_en: 'Company name is required.' });
    return;
  }

  if (!jurisdiction || typeof jurisdiction !== 'string') {
    res.status(400).json({ error: 'VALIDATION_ERROR', message_ar: 'ولاية أو نطاق التأسيس مطلوب.', message_en: 'Jurisdiction is required.' });
    return;
  }

  const validTypes = ['LLC', 'C-CORP', 'LTD'];
  const normType = (entity_type || 'LLC').toUpperCase();
  if (!validTypes.includes(normType)) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message_ar: 'نوع الكيان غير مدعوم.', message_en: 'Invalid entity type.' });
    return;
  }

  const pkgKey = (package_id || 'complete') as 'starter' | 'complete' | 'premium';
  const pkgInfo = UNIFIED_PRICING_SOURCE.qabs_packages[pkgKey] || UNIFIED_PRICING_SOURCE.qabs_packages.complete;
  const stateFee = UNIFIED_PRICING_SOURCE.government_state_fees[jurisdiction.trim()] ?? 100;
  const extraAddons = typeof addons_fee === 'number' && addons_fee >= 0 ? addons_fee : 0;
  const totalAmount = pkgInfo.qabs_fee + stateFee + extraAddons;

  const initialStatus: FormationLifecycleStatus = save_as_draft === true ? 'draft' : 'submitted';

  const formationId = `comp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const renewalStr = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const newRecord: CompanyFormationRecord = {
    id: formationId,
    tenant_id: currentTenantId,
    company_name: company_name.trim().toUpperCase(),
    jurisdiction: jurisdiction.trim(),
    entity_type: normType as 'LLC' | 'C-CORP' | 'LTD',
    package_id: pkgKey,
    state_file_number: null,
    ein: null,
    crn: null,
    registered_agent: 'بانتظار التعيين الرسمي بعد مراجعة الطلب (Pending Assignment)',
    registered_address: 'يحدد رسمياً بعد المراجعة وتأكيد ملف الولاية (Pending Verification)',
    filing_date: todayStr,
    renewal_due_date: renewalStr,
    status: initialStatus,
    payment_status: 'pending_payment',
    qabs_fee: pkgInfo.qabs_fee,
    state_fee: stateFee,
    addons_fee: extraAddons,
    total_amount: totalAmount,
    notes: notes ? String(notes).slice(0, 500) : 'طلب مبدئي جديد تم استلامه عبر بوابة قبس',
    history: [
      {
        status: initialStatus,
        changed_at: now.toISOString(),
        changed_by: req.user!.id,
        note: initialStatus === 'draft' ? 'Saved as draft by client' : 'Initial intake submitted by client'
      }
    ],
    created_at: now.toISOString()
  };

  db.createFormation(newRecord);

  // Create quote and pending invoice
  const invoiceId = `inv_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
  const invoiceRecord: InvoiceRecord = {
    id: invoiceId,
    invoice_number: `QABS-INV-${Date.now().toString().slice(-6)}`,
    tenant_id: currentTenantId,
    formation_id: formationId,
    qabs_fee: pkgInfo.qabs_fee,
    state_fee: stateFee,
    external_fee: extraAddons,
    gateway_fee: 0,
    tax_amount: 0,
    amount: totalAmount,
    currency: 'USD',
    description_ar: `طلب تأسيس شركة ${newRecord.company_name} (بانتظار السداد)`,
    description_en: `Formation intake for ${newRecord.company_name} (Pending Payment)`,
    status: 'pending',
    issued_date: todayStr
  };
  db.createInvoice(invoiceRecord);

  // Notify customer
  db.createNotification({
    tenant_id: currentTenantId,
    title_ar: initialStatus === 'draft' ? 'تم حفظ مسودة طلب التأسيس' : 'تم استلام طلب التأسيس للمراجعة',
    title_en: initialStatus === 'draft' ? 'Formation Draft Saved' : 'Formation Request Submitted',
    message_ar: `تم تسجيل طلب ${newRecord.company_name} بحالة (${initialStatus}).`,
    message_en: `Formation request for ${newRecord.company_name} recorded with status (${initialStatus}).`
  });

  db.recordAudit(
    req.user!.name,
    currentTenantId,
    `إنشاء طلب تأسيس (${newRecord.company_name}) بحالة ${initialStatus}`,
    `Created formation intake (${newRecord.company_name}) with status ${initialStatus} and Pending Payment`,
    `company_formations:${formationId}`,
    'success',
    req.ip
  );

  res.status(201).json({
    success: true,
    message_ar: 'تم حفظ طلب التأسيس بنجاح وربطه بحسابك.',
    message_en: 'Company formation intake saved successfully and linked to your account.',
    formation: newRecord,
    invoice: invoiceRecord
  });
});

app.get('/api/formations/:id', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const currentTenantId = req.user!.id;
  const formation = db.getFormationById(req.params.id);

  if (!formation) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Formation request not found' });
    return;
  }

  if (formation.tenant_id !== currentTenantId && !isStaffOrAdmin(req.user!.role)) {
    db.recordAudit(
      req.user!.name,
      currentTenantId,
      `محاولة غير مصرح بها للوصول لطلب تأسيس عميل آخر (${req.params.id})`,
      `Cross-tenant formation access attempt blocked (${req.params.id})`,
      `company_formations:${req.params.id}`,
      'blocked',
      req.ip
    );
    res.status(403).json({
      error: 'FORBIDDEN',
      message_ar: 'غير مصرح لك بالوصول إلى بيانات طلب تأسيس خاص بمستخدم آخر.',
      message_en: 'Access forbidden: You cannot view another client’s formation record.'
    });
    return;
  }

  res.json({ formation });
});

// Lifecycle Transition Endpoint (Supports all 11 states + audit log + customer notification)
app.patch('/api/formations/:id/status', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const formation = db.getFormationById(req.params.id);
  if (!formation) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Formation not found' });
    return;
  }

  const user = req.user!;
  const isOwner = formation.tenant_id === user.id;
  const isStaff = isStaffOrAdmin(user.role);

  if (!isOwner && !isStaff) {
    db.recordAudit(
      user.name,
      user.id,
      `محاولة غير مصرح بها لتغيير حالة طلب عميل آخر (${formation.id})`,
      `Unauthorized cross-tenant status update blocked (${formation.id})`,
      `company_formations:${formation.id}`,
      'blocked',
      req.ip
    );
    res.status(403).json({ error: 'FORBIDDEN', message: 'Cannot modify another tenant formation' });
    return;
  }

  const { status, note } = req.body;
  if (!status || !ALLOWED_LIFECYCLE_STATUSES.includes(status)) {
    res.status(400).json({
      error: 'INVALID_STATUS',
      message_en: `Status must be one of: ${ALLOWED_LIFECYCLE_STATUSES.join(', ')}`
    });
    return;
  }

  // Customers can only transition their own draft -> submitted, quote_ready -> approved, or cancel
  const customerAllowed: FormationLifecycleStatus[] = ['draft', 'submitted', 'approved', 'cancelled'];
  if (!isStaff && !customerAllowed.includes(status)) {
    res.status(403).json({
      error: 'FORBIDDEN_TRANSITION',
      message_ar: 'هذا التحديث يتطلب صلاحية موظف المراجعة أو الامتثال.',
      message_en: 'This lifecycle state transition requires compliance staff privileges.'
    });
    return;
  }

  const nowIso = new Date().toISOString();
  const updatedHistory = [
    ...formation.history,
    {
      status,
      changed_at: nowIso,
      changed_by: user.id,
      note: note ? String(note) : `Status updated to ${status}`
    }
  ];

  const updated = db.updateFormation(formation.id, {
    status,
    payment_status: status === 'paid' ? 'paid' : formation.payment_status,
    history: updatedHistory
  });

  const notif = db.createNotification({
    tenant_id: formation.tenant_id,
    title_ar: `تحديث حالة طلب التأسيس: ${formation.company_name}`,
    title_en: `Formation Status Updated: ${formation.company_name}`,
    message_ar: `تم تحديث حالة الطلب إلى (${status}). ${note || ''}`,
    message_en: `Request status transitioned to (${status}). ${note || ''}`
  });

  const audit = db.recordAudit(
    user.name,
    user.id,
    `تحديث حالة طلب التأسيس (${formation.company_name}) إلى ${status}`,
    `Updated formation (${formation.company_name}) status to ${status}`,
    `company_formations:${formation.id}`,
    'success',
    req.ip
  );

  res.json({
    success: true,
    formation: updated,
    notification: notif,
    audit_id: audit.id
  });
});

// ==========================================
// PHASE 5: PRIVATE ENCRYPTED DOCUMENT VAULT
// ==========================================

const ALLOWED_DOC_MIMES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_DOC_BYTES = 5 * 1024 * 1024; // 5 MB

app.get('/api/documents', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const docs = db.getDocumentsByTenant(req.user!.id).map(d => ({
    id: d.id,
    tenant_id: d.tenant_id,
    formation_id: d.formation_id,
    filename: d.filename,
    mime_type: d.mime_type,
    size_bytes: d.size_bytes,
    checksum_sha256: d.checksum_sha256,
    created_at: d.created_at,
    updated_at: d.updated_at
  }));
  res.json({ total: docs.length, documents: docs });
});

app.post('/api/documents', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const { filename, mime_type, content_base64, formation_id } = req.body;
  const user = req.user!;

  if (!filename || typeof filename !== 'string') {
    res.status(400).json({ error: 'INVALID_FILENAME', message_en: 'Valid filename is required.' });
    return;
  }

  if (!mime_type || !ALLOWED_DOC_MIMES.includes(mime_type)) {
    res.status(400).json({
      error: 'UNSUPPORTED_FILE_TYPE',
      message_ar: 'نوع الملف غير مسموح. الأنواع المسموحة: PDF, PNG, JPEG فقط.',
      message_en: 'Unsupported MIME type. Allowed: application/pdf, image/png, image/jpeg.'
    });
    return;
  }

  if (!content_base64 || typeof content_base64 !== 'string') {
    res.status(400).json({ error: 'EMPTY_CONTENT', message_en: 'Document content is required.' });
    return;
  }

  const sizeBytes = Buffer.byteLength(content_base64, 'base64');
  if (sizeBytes <= 0 || sizeBytes > MAX_DOC_BYTES) {
    res.status(400).json({
      error: 'FILE_SIZE_EXCEEDED',
      message_ar: 'حجم الملف يتجاوز الحد الأقصى المسموح به (5 ميجابايت).',
      message_en: 'File size exceeds maximum 5MB limit.'
    });
    return;
  }

  const encryptedPayload = encryptDocumentContent(content_base64);
  const checksum = crypto.createHash('sha256').update(content_base64).digest('hex');
  const nowIso = new Date().toISOString();
  const docId = `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const docRecord: DocumentVaultRecord = {
    id: docId,
    tenant_id: user.id,
    formation_id: formation_id || undefined,
    filename: filename.trim(),
    mime_type: mime_type as 'application/pdf' | 'image/png' | 'image/jpeg',
    size_bytes: sizeBytes,
    encrypted_payload: encryptedPayload,
    checksum_sha256: checksum,
    signed_tokens: [],
    access_log: [
      {
        actor_id: user.id,
        action: 'upload',
        timestamp: nowIso
      }
    ],
    created_at: nowIso,
    updated_at: nowIso
  };

  db.createDocument(docRecord);

  db.recordAudit(
    user.name,
    user.id,
    `رفع وتشفير مستند خاص (${docRecord.filename})`,
    `Uploaded and AES-256-GCM encrypted private document (${docRecord.filename})`,
    `documents:${docId}`,
    'success',
    req.ip
  );

  res.status(201).json({
    success: true,
    document: {
      id: docRecord.id,
      tenant_id: docRecord.tenant_id,
      formation_id: docRecord.formation_id,
      filename: docRecord.filename,
      mime_type: docRecord.mime_type,
      size_bytes: docRecord.size_bytes,
      checksum_sha256: docRecord.checksum_sha256,
      encrypted: true,
      public_url: null, // Strictly no public links
      created_at: docRecord.created_at
    }
  });
});

// Read document metadata & decrypted content (Strictly Tenant Isolated)
app.get('/api/documents/:id', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const doc = db.getDocumentById(req.params.id);
  const user = req.user!;

  if (!doc) {
    res.status(404).json({ error: 'NOT_FOUND', message_en: 'Document not found' });
    return;
  }

  if (doc.tenant_id !== user.id && !isStaffOrAdmin(user.role)) {
    doc.access_log.push({
      actor_id: user.id,
      action: 'unauthorized_attempt',
      timestamp: new Date().toISOString()
    });
    db.updateDocument(doc.id, { access_log: doc.access_log });

    db.recordAudit(
      user.name,
      user.id,
      `محاولة غير مصرح بها لقراءة مستند خاص لعميل آخر (${doc.id})`,
      `Blocked cross-tenant attempt to read private document (${doc.id})`,
      `documents:${doc.id}`,
      'blocked',
      req.ip
    );

    res.status(403).json({
      error: 'FORBIDDEN',
      message_ar: 'تم حظر الوصول: هذا المستند مشفر ومملوك لمستأجر آخر.',
      message_en: 'Access denied: You cannot read another tenant’s private document.'
    });
    return;
  }

  doc.access_log.push({
    actor_id: user.id,
    action: 'read',
    timestamp: new Date().toISOString()
  });
  db.updateDocument(doc.id, { access_log: doc.access_log });

  const decryptedBase64 = decryptDocumentContent(doc.encrypted_payload);

  res.json({
    document: {
      id: doc.id,
      tenant_id: doc.tenant_id,
      filename: doc.filename,
      mime_type: doc.mime_type,
      size_bytes: doc.size_bytes,
      checksum_sha256: doc.checksum_sha256,
      content_base64: decryptedBase64,
      access_log_count: doc.access_log.length
    }
  });
});

// Generate temporary signed URL token (15 minutes TTL)
app.post('/api/documents/:id/signed-url', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const doc = db.getDocumentById(req.params.id);
  const user = req.user!;

  if (!doc) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  if (doc.tenant_id !== user.id && !isStaffOrAdmin(user.role)) {
    res.status(403).json({ error: 'FORBIDDEN' });
    return;
  }

  const tempToken = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  doc.signed_tokens.push({ token: tempToken, expires_at: expiresAt });
  doc.access_log.push({ actor_id: user.id, action: 'sign_url', timestamp: new Date().toISOString() });
  db.updateDocument(doc.id, { signed_tokens: doc.signed_tokens, access_log: doc.access_log });

  res.json({
    success: true,
    signed_url: `/api/documents/${doc.id}/download?token=${tempToken}`,
    expires_at: expiresAt
  });
});

// Safe Delete Document
app.delete('/api/documents/:id', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const doc = db.getDocumentById(req.params.id);
  const user = req.user!;

  if (!doc) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  if (doc.tenant_id !== user.id && !isStaffOrAdmin(user.role)) {
    db.recordAudit(user.name, user.id, 'محاولة حذف مستند لعميل آخر محظورة', 'Blocked cross-tenant document deletion', `documents:${doc.id}`, 'blocked', req.ip);
    res.status(403).json({ error: 'FORBIDDEN' });
    return;
  }

  db.deleteDocument(doc.id);
  db.recordAudit(user.name, user.id, `حذف آمن لمستند (${doc.filename})`, `Safely deleted document (${doc.filename})`, `documents:${doc.id}`, 'success', req.ip);

  res.json({ success: true, deleted_id: doc.id });
});

// ==========================================
// PHASE 6: UNIFIED PRICING, QUOTES & SANDBOX BILLING
// ==========================================

app.get('/api/pricing', (_req: Request, res: Response) => {
  res.json({
    source: 'QABS_UNIFIED_PRICING_ENGINE_V2',
    pricing: UNIFIED_PRICING_SOURCE
  });
});

app.get('/api/invoices', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const currentTenantId = req.user!.id;
  const tenantInvoices = db.getInvoicesByTenant(currentTenantId);
  res.json({
    tenant_id: currentTenantId,
    total: tenantInvoices.length,
    invoices: tenantInvoices
  });
});

// Sandbox Quote Creation
app.post('/api/billing/sandbox/quotes', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { formation_id, package_id, jurisdiction, external_fee } = req.body;

  const pkgKey = (package_id || 'complete') as 'starter' | 'complete' | 'premium';
  const pkg = UNIFIED_PRICING_SOURCE.qabs_packages[pkgKey] || UNIFIED_PRICING_SOURCE.qabs_packages.complete;
  const stateFee = UNIFIED_PRICING_SOURCE.government_state_fees[jurisdiction || 'US_WYOMING'] ?? 100;
  const extFee = typeof external_fee === 'number' && external_fee >= 0 ? external_fee : 0;
  const subtotal = pkg.qabs_fee + stateFee + extFee;
  const gatewayFee = Math.round((subtotal * 0.029 + 0.3) * 100) / 100;
  const taxAmount = 0;
  const totalAmount = subtotal + gatewayFee + taxAmount;

  const quoteId = `qt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const quote: QuoteRecord = {
    id: quoteId,
    quote_number: `QABS-QT-${Date.now().toString().slice(-6)}`,
    tenant_id: user.id,
    formation_id,
    qabs_fee: pkg.qabs_fee,
    state_fee: stateFee,
    external_fee: extFee,
    gateway_fee: gatewayFee,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    currency: 'USD',
    status: 'quote_ready',
    created_at: new Date().toISOString()
  };

  db.createQuote(quote);

  if (formation_id) {
    const form = db.getFormationById(formation_id);
    if (form && form.tenant_id === user.id) {
      db.updateFormation(formation_id, {
        status: 'quote_ready',
        history: [
          ...form.history,
          { status: 'quote_ready', changed_at: new Date().toISOString(), changed_by: user.id, note: `Quote ${quote.quote_number} generated` }
        ]
      });
    }
  }

  db.recordAudit(user.name, user.id, `إنشاء عرض سعر مالي (${quote.quote_number})`, `Created sandbox financial quote (${quote.quote_number})`, `quotes:${quoteId}`, 'success', req.ip);

  res.status(201).json({ success: true, sandbox: true, quote });
});

// Sandbox Quote Approval -> Generates Pending Invoice
app.post('/api/billing/sandbox/quotes/:id/approve', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const quote = db.getQuoteById(req.params.id);

  if (!quote) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  if (quote.tenant_id !== user.id) {
    res.status(403).json({ error: 'FORBIDDEN' });
    return;
  }

  const nowIso = new Date().toISOString();
  const updatedQuote = db.updateQuote(quote.id, { status: 'approved', approved_at: nowIso });

  const invoiceId = `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const invoice: InvoiceRecord = {
    id: invoiceId,
    invoice_number: `QABS-INV-${Date.now().toString().slice(-6)}`,
    tenant_id: user.id,
    quote_id: quote.id,
    formation_id: quote.formation_id,
    qabs_fee: quote.qabs_fee,
    state_fee: quote.state_fee,
    external_fee: quote.external_fee,
    gateway_fee: quote.gateway_fee,
    tax_amount: quote.tax_amount,
    amount: quote.total_amount,
    currency: quote.currency,
    description_ar: `فاتورة معتمدة لعرض السعر ${quote.quote_number}`,
    description_en: `Approved Invoice for Quote ${quote.quote_number}`,
    status: 'pending',
    issued_date: nowIso.split('T')[0]
  };

  db.createInvoice(invoice);

  if (quote.formation_id) {
    const form = db.getFormationById(quote.formation_id);
    if (form && form.tenant_id === user.id) {
      db.updateFormation(form.id, {
        status: 'approved',
        history: [
          ...form.history,
          { status: 'approved', changed_at: nowIso, changed_by: user.id, note: `Quote approved, invoice ${invoice.invoice_number} issued` }
        ]
      });
    }
  }

  db.recordAudit(user.name, user.id, `اعتماد عرض السعر (${quote.quote_number}) وإصدار فاتورة`, `Approved quote (${quote.quote_number}) and generated pending invoice`, `invoices:${invoiceId}`, 'success', req.ip);

  res.json({ success: true, sandbox: true, quote: updatedQuote, invoice });
});

// Sandbox Webhook / Payment Settlement Simulation (Strictly Sandbox Only)
app.post('/api/billing/sandbox/webhook', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { invoice_id, event_type } = req.body;

  const invoice = db.getInvoiceById(invoice_id);
  if (!invoice) {
    res.status(404).json({ error: 'INVOICE_NOT_FOUND' });
    return;
  }

  if (invoice.tenant_id !== user.id && !isStaffOrAdmin(user.role)) {
    res.status(403).json({ error: 'FORBIDDEN' });
    return;
  }

  const nowIso = new Date().toISOString();

  if (event_type === 'payment_intent.succeeded') {
    const updatedInvoice = db.updateInvoice(invoice.id, { status: 'paid', paid_at: nowIso });
    if (invoice.formation_id) {
      const form = db.getFormationById(invoice.formation_id);
      if (form) {
        db.updateFormation(form.id, {
          status: 'paid',
          payment_status: 'paid',
          history: [
            ...form.history,
            { status: 'paid', changed_at: nowIso, changed_by: 'SANDBOX_WEBHOOK', note: `Sandbox payment recorded for ${invoice.invoice_number}` }
          ]
        });
      }
    }
    db.recordAudit(user.name, user.id, `تسجيل دفعة Sandbox للفاتورة (${invoice.invoice_number})`, `Sandbox webhook payment settled for (${invoice.invoice_number})`, `invoices:${invoice.id}`, 'success', req.ip);
    res.json({ success: true, sandbox_only: true, invoice: updatedInvoice });
    return;
  }

  if (event_type === 'charge.refunded') {
    const updatedInvoice = db.updateInvoice(invoice.id, { status: 'refunded', refunded_at: nowIso });
    if (invoice.formation_id) {
      const form = db.getFormationById(invoice.formation_id);
      if (form) {
        db.updateFormation(form.id, {
          status: 'cancelled',
          payment_status: 'refunded',
          history: [
            ...form.history,
            { status: 'cancelled', changed_at: nowIso, changed_by: 'SANDBOX_WEBHOOK', note: `Sandbox refund processed for ${invoice.invoice_number}` }
          ]
        });
      }
    }
    db.recordAudit(user.name, user.id, `استرداد Sandbox للفاتورة (${invoice.invoice_number})`, `Sandbox refund processed for (${invoice.invoice_number})`, `invoices:${invoice.id}`, 'success', req.ip);
    res.json({ success: true, sandbox_only: true, invoice: updatedInvoice });
    return;
  }

  res.status(400).json({ error: 'UNSUPPORTED_SANDBOX_EVENT' });
});

// ==========================================
// PHASE 8: MULTI-TENANT STORES ISOLATION
// ==========================================

app.get('/api/stores', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const stores = db.getStoresByTenant(req.user!.id);
  res.json({ tenant_id: req.user!.id, total: stores.length, stores });
});

app.post('/api/stores', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { name, subdomain, currency, theme, tax_rate } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'NAME_REQUIRED' });
    return;
  }

  const storeId = `store_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  // Rule: Never auto-publish store, activate domain, or connect payment automatically
  const newStore: StoreBackendRecord = {
    id: storeId,
    tenant_id: user.id,
    name: name.trim(),
    subdomain: subdomain ? String(subdomain).trim() : `${name.trim().toLowerCase().replace(/\s+/g, '-')}.qabs1.store`,
    currency: currency || 'SAR',
    theme: theme || 'gold_executive',
    status: 'draft',
    approval_status: 'draft',
    payment_connected: false,
    domain_verified: false,
    tax_rate: typeof tax_rate === 'number' ? tax_rate : 15,
    products: [],
    orders: [],
    created_at: new Date().toISOString()
  };

  db.createStore(newStore);
  db.recordAudit(user.name, user.id, `إنشاء متجر جديد كمسودة (${newStore.name})`, `Created new multi-tenant store in draft mode (${newStore.name})`, `stores:${storeId}`, 'success', req.ip);

  res.status(201).json({ success: true, store: newStore });
});

app.get('/api/stores/:id', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const store = db.getStoreById(req.params.id);
  const user = req.user!;

  if (!store) {
    res.status(404).json({ error: 'STORE_NOT_FOUND' });
    return;
  }

  if (store.tenant_id !== user.id && !isStaffOrAdmin(user.role)) {
    db.recordAudit(
      user.name,
      user.id,
      `محاولة غير مصرح بها للوصول إلى متجر مستأجر آخر (${store.id})`,
      `Cross-tenant store access blocked (${store.id})`,
      `stores:${store.id}`,
      'blocked',
      req.ip
    );
    res.status(403).json({
      error: 'FORBIDDEN',
      message_ar: 'غير مصرح لك بعرض أو إدارة متجر يخص مستأجراً آخر.',
      message_en: 'Access forbidden: Store belongs to another tenant.'
    });
    return;
  }

  res.json({ store });
});

app.post('/api/stores/:id/products', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const store = db.getStoreById(req.params.id);
  const user = req.user!;

  if (!store) {
    res.status(404).json({ error: 'STORE_NOT_FOUND' });
    return;
  }

  if (store.tenant_id !== user.id) {
    res.status(403).json({ error: 'FORBIDDEN' });
    return;
  }

  const { title, sku, price, stock, category } = req.body;
  const prod = {
    id: `prod_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    store_id: store.id,
    title: String(title || 'New Product'),
    sku: String(sku || `SKU-${Date.now()}`),
    price: Number(price || 100),
    stock: Number(stock ?? 10),
    category: String(category || 'General')
  };

  store.products.push(prod);
  db.updateStore(store.id, { products: store.products });

  res.status(201).json({ success: true, product: prod });
});

// ==========================================
// PHASE 9: SHOPIFY INTEGRATION (HONESTLY BLOCKED)
// ==========================================

app.get('/api/integrations/shopify/status', authenticateSession, (_req: Request, res: Response) => {
  res.status(503).json({
    integration: 'shopify',
    status: 'BLOCKED',
    status_code: 'BLOCKED_MISSING_SHOPIFY_ADMIN_TOKEN',
    read_only_inspection: {
      products_sync: 'BLOCKED',
      orders_sync: 'BLOCKED',
      inventory_sync: 'BLOCKED',
      webhooks: 'BLOCKED'
    },
    message_ar: 'تكامل Shopify مصنف كـ BLOCKED لعدم توفر رموز الوصول (SHOPIFY_ADMIN_ACCESS_TOKEN) وصلاحيات المتجر الحي.',
    message_en: 'Shopify synchronization is BLOCKED pending live SHOPIFY_ADMIN_ACCESS_TOKEN and webhook signing credentials.'
  });
});

// ==========================================
// PHASE 10: SERVER-SIDE GEMINI AI STUDIO
// ==========================================

app.post('/api/ai/generate', authenticateSession, requireAuth, async (req: Request, res: Response) => {
  const user = req.user!;
  const { prompt, language } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'PROMPT_REQUIRED', message_en: 'Prompt text is required.' });
    return;
  }

  if (user.ai_quota_used >= user.ai_quota_limit || user.credits <= 0) {
    res.status(429).json({
      error: 'QUOTA_EXCEEDED',
      message_ar: 'تم استنفاد رصيد استخدام الذكاء الاصطناعي المتاح في باقتك.',
      message_en: 'AI usage quota or credit balance exhausted.'
    });
    return;
  }

  const sanitizedPrompt = prompt.trim().slice(0, 2000);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.status(503).json({
      error: 'AI_KEY_UNAVAILABLE',
      status: 'BLOCKED',
      message_ar: 'مفتاح خدمة الذكاء الاصطناعي (GEMINI_API_KEY) غير مهيأ على الخادم حالياً.',
      message_en: 'Server-side GEMINI_API_KEY is not configured in environment secrets.'
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: sanitizedPrompt,
      config: {
        systemInstruction:
          language === 'en'
            ? 'You are QABS Digital Business Advisor. Provide concise, accurate corporate formation, compliance, and e-commerce guidance. Include a brief legal disclaimer that you provide informational guidance, not formal legal counsel.'
            : 'أنت مستشار قبس الرقمية للأعمال وتأسيس الشركات والتجارة الإلكترونية. قدم إجابات دقيقة ومنظمة واحترافية باللغة العربية مع تنبيه بأن المعلومات استشارية وليست فتوى قانونية رسمية.'
      }
    });

    const outputText = response.text || '';
    const updatedUser = db.updateUser(user.id, {
      ai_quota_used: user.ai_quota_used + 1,
      credits: Math.max(0, user.credits - 1)
    });

    const usageEntry = db.recordAIUsage({
      tenant_id: user.id,
      model: 'gemini-3.8-flash',
      prompt_preview: sanitizedPrompt.slice(0, 80),
      tokens_estimated: Math.ceil((sanitizedPrompt.length + outputText.length) / 4),
      credits_deducted: 1,
      status: 'success'
    });

    db.recordAudit(user.name, user.id, 'استخدام مساعد قبس الذكي (Gemini Server SDK)', 'Executed server-side Gemini AI generation', `ai_usage:${usageEntry.id}`, 'success', req.ip);

    res.json({
      success: true,
      model: 'gemini-3.8-flash',
      text: outputText,
      quota: {
        used: updatedUser?.ai_quota_used,
        limit: updatedUser?.ai_quota_limit,
        credits_remaining: updatedUser?.credits
      }
    });
  } catch (err: any) {
    db.recordAIUsage({
      tenant_id: user.id,
      model: 'gemini-3.8-flash',
      prompt_preview: sanitizedPrompt.slice(0, 80),
      tokens_estimated: 0,
      credits_deducted: 0,
      status: 'error'
    });
    res.status(502).json({
      error: 'AI_UPSTREAM_ERROR',
      message_ar: 'تعذر إتمام الطلب عبر نموذج الذكاء الاصطناعي الخادمي.',
      message_en: err?.message || 'Failed to generate AI response from upstream model.'
    });
  }
});

app.get('/api/ai/usage', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const history = db.getAIUsageByTenant(user.id);
  res.json({
    quota_limit: user.ai_quota_limit,
    quota_used: user.ai_quota_used,
    credits_remaining: user.credits,
    history
  });
});

// ==========================================
// ADMIN CONTROL CENTER API ROUTES
// ==========================================

app.get('/api/admin/status', authenticateSession, (req: Request, res: Response) => {
  if (!req.user || (req.user.role !== 'super_admin' && req.user.role !== 'admin')) {
    res.json({
      admin_access_allowed: false,
      status: 'BLOCKED',
      reason_ar: 'الوصول الإداري مقفل. يتطلب جلسة خادمية مصادق عليها بصلاحية super_admin ومزود هوية مؤسسي.',
      reason_en: 'Admin access BLOCKED. Requires verified server session with super_admin role.'
    });
    return;
  }

  res.json({
    admin_access_allowed: true,
    status: 'ACTIVE_SUPER_ADMIN_SESSION',
    user: req.user.name
  });
});

app.get('/api/admin/audit-logs', authenticateSession, requireAdmin, (_req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({
    total: logs.length,
    logs
  });
});

app.get('/api/admin/formations', authenticateSession, requireAdmin, (_req: Request, res: Response) => {
  const allFormations = db.getAllFormations();
  res.json({
    total: allFormations.length,
    formations: allFormations
  });
});

app.all('/api/admin/*', authenticateSession, requireAdmin, (_req: Request, res: Response) => {
  res.status(503).json({
    error: 'BLOCKED',
    status_code: 'BLOCKED_PENDING_PRODUCTION_IDP',
    message_ar: 'العملية الإدارية معطلة أمنياً (BLOCKED). تتطلب ربط مزود هوية رسمي وخادم جلسات معتمد.',
    message_en: 'Administrative action is BLOCKED pending verified hosted IdP integration.'
  });
});

// ==========================================
// PHASE 11: CLOUDFLARE & HEALTH ENDPOINT
// ==========================================
// Strictly outputs ONLY status, environment, and version without exposing DB names, R2 buckets, or resource IDs.
const handleHealthCheck = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: 'staging',
    version: '1.4.0'
  });
};

app.get('/api/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

export { app, hashPassword, verifyPassword };

// ==========================================
// START SERVER & VITE INTEGRATION
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QABS Full-Stack Unified Server listening on http://0.0.0.0:${PORT}`);
  });
}

const isDirectEntry = process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));
if (isDirectEntry && process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  start().catch(err => {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  });
}
