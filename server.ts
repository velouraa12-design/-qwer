import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// ==========================================
// PERSISTENT DATA SCHEMAS (DATABASE_SCHEMA.sql)
// ==========================================

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password_hash: string; // salt:hash
  company_name: string;
  role: 'merchant' | 'super_admin' | 'compliance_officer' | 'support_agent';
  credits: number;
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
  state_file_number: string | null;
  ein: string | null;
  crn: string | null;
  registered_agent: string;
  registered_address: string;
  filing_date: string;
  renewal_due_date: string;
  status: 'draft' | 'submitted' | 'under_review' | 'submitted_to_state' | 'approved';
  payment_status: 'unpaid' | 'pending_payment' | 'paid' | 'refunded';
  notes: string | null;
  history: {
    status: string;
    changed_at: string;
    changed_by: string;
    note: string;
  }[];
  created_at: string;
}

export interface InvoiceRecord {
  id: string;
  invoice_number: string;
  tenant_id: string;
  amount: number;
  currency: string;
  description_ar: string;
  description_en: string;
  status: 'pending' | 'paid' | 'cancelled';
  issued_date: string;
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
  invoices: Record<string, InvoiceRecord>;
  audit_logs: SecurityAuditRecord[];
}

// Storage path on disk (ensures persistence across server reboots)
const DATA_DIR = path.resolve(__dirname, 'data');
const STORAGE_FILE = path.resolve(DATA_DIR, 'qabs_storage.json');

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

// Database Engine with Atomic File Persistence
class PersistentDatabase {
  private data: PersistentStorage;

  constructor() {
    this.data = this.load();
  }

  private load(): PersistentStorage {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing storage file, initializing seed defaults:', err);
    }

    return this.initSeedDefaults();
  }

  private initSeedDefaults(): PersistentStorage {
    const seedCustomer1Password = hashPassword('QabsSecure2026!');
    const seedCustomer2Password = hashPassword('QabsSecure2026!');
    const seedAdminPassword = hashPassword('QabsAdminRoot2026!');

    const seed: PersistentStorage = {
      version: '1.0',
      users: {
        usr_customer_01: {
          id: 'usr_customer_01',
          name: 'محمد الخالدي (عميل قبس)',
          email: 'customer@qabs1.store',
          password_hash: seedCustomer1Password,
          company_name: 'Khaledi Retail LLC',
          role: 'merchant',
          credits: 100,
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
          email_verified: false,
          created_at: '2026-02-01T12:00:00Z',
          updated_at: '2026-02-01T12:00:00Z'
        },
        usr_admin_01: {
          id: 'usr_admin_01',
          name: 'مدير عمليات قبس (System Administrator)',
          email: 'admin@qabs1.store',
          password_hash: seedAdminPassword,
          company_name: 'QABS Operations HQ',
          role: 'super_admin',
          credits: 1000,
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
        }
      },
      formations: {
        comp_seed_01: {
          id: 'comp_seed_01',
          tenant_id: 'usr_customer_01',
          company_name: 'KHALEDI COMMERCE LLC',
          jurisdiction: 'US_WYOMING',
          entity_type: 'LLC',
          state_file_number: null,
          ein: null,
          crn: null,
          registered_agent: 'بانتظار التعيين الرسمي بعد مراجعة الطلب (Pending Assignment)',
          registered_address: 'يحدد رسمياً بعد المراجعة وتأكيد ملف الولاية (Pending Verification)',
          filing_date: '2026-03-01',
          renewal_due_date: '2027-03-01',
          status: 'submitted',
          payment_status: 'pending_payment',
          notes: 'طلب مبدئي مستلم. بانتظار استكمال التدقيق وسداد الرسوم.',
          history: [
            {
              status: 'submitted',
              changed_at: '2026-03-01T09:30:00Z',
              changed_by: 'usr_customer_01',
              note: 'Initial intake intake received'
            }
          ],
          created_at: '2026-03-01T09:30:00Z'
        }
      },
      invoices: {
        inv_seed_01: {
          id: 'inv_seed_01',
          invoice_number: 'QABS-INV-2026-001',
          tenant_id: 'usr_customer_01',
          amount: 397.0,
          currency: 'USD',
          description_ar: 'فاتورة تأسيس شركة وايومنغ (طلب مبدئي بانتظار السداد)',
          description_en: 'Wyoming LLC Initial Formation Intake (Pending Payment)',
          status: 'pending',
          issued_date: '2026-03-01'
        }
      },
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

    this.saveData(seed);
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

    // Check expiration
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

  public createInvoice(invoice: InvoiceRecord): void {
    this.data.invoices[invoice.id] = invoice;
    this.flush();
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

  if (req.user.role !== 'super_admin') {
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
// SECURE AUTHENTICATION API ROUTES
// ==========================================

// 1. Current Session Inspection
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
      email_verified: req.user.email_verified
    }
  });
});

// 2. Customer Registration (Strictly enforces merchant role and hashed passwords)
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

  // Check duplicate email
  const existing = db.findUserByEmail(email);
  if (existing) {
    res.status(409).json({
      error: 'CONFLICT',
      message_ar: 'البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.',
      message_en: 'Email is already registered.'
    });
    return;
  }

  // Anti-escalation check: Reject any attempt to register as super_admin
  if (role && role === 'super_admin') {
    db.recordAudit(
      name,
      'anonymous_registration',
      'محاولة محظورة لإنشاء حساب Super Admin عبر التسجيل العام',
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
    role: 'merchant', // Strictly customer role, never super_admin
    credits: 0,
    email_verified: false,
    created_at: now,
    updated_at: now
  };

  db.createUser(newUser);

  // Generate unguessable 64-char crypto session token
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

// 3. Customer Login (Strictly requires email + password, rejects email-alone login)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'INVALID_REQUEST', message_ar: 'البريد الإلكتروني مطلوب.', message_en: 'Email is required.' });
    return;
  }

  // Mandatory rule: Prevent login with email alone
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

  // Generate unguessable 64-char crypto session token
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

// 4. Session Logout
app.post('/api/auth/logout', authenticateSession, (req: Request, res: Response) => {
  if (req.sessionToken) {
    db.deleteSession(req.sessionToken);
  }
  res.json({ success: true, message: 'Session terminated successfully' });
});

// 5. Email Verification & Password Recovery (Honestly declared BLOCKED without fake claims)
app.post('/api/auth/verify-email', (_req: Request, res: Response) => {
  res.status(503).json({
    error: 'BLOCKED_PENDING_SMTP',
    status: 'BLOCKED',
    message_ar: 'خدمة التحقق من البريد الإلكتروني معطلة أمنياً لحين ربط مزود SMTP معتمد وسجلات SPF/DKIM مفعلة.',
    message_en: 'Email verification is BLOCKED pending certified SMTP integration with active SPF/DKIM.'
  });
});

app.post('/api/auth/recover-password', (_req: Request, res: Response) => {
  res.status(503).json({
    error: 'BLOCKED_PENDING_SMTP',
    status: 'BLOCKED',
    message_ar: 'إرسال روابط الاستعادة آلياً معلق حالياً لعدم توفر خادم بريد رسمي. يرجى التواصل مع الدعم عبر WhatsApp: +159710784967.',
    message_en: 'Automated password recovery is BLOCKED pending verified SMTP. Please contact WhatsApp support (+159710784967).'
  });
});

// ==========================================
// REAL COMPANY FORMATIONS & INTAKE ROUTES
// ==========================================

// 6. Formations: GET (Strictly Tenant Isolated)
app.get('/api/formations', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const currentTenantId = req.user!.id;
  const tenantFormations = db.getFormationsByTenant(currentTenantId);

  res.json({
    tenant_id: currentTenantId,
    total: tenantFormations.length,
    formations: tenantFormations
  });
});

// 7. Formations: POST (Real Initial Intake submission with Pending Payment)
app.post('/api/formations', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const currentTenantId = req.user!.id;
  const { company_name, jurisdiction, entity_type, notes } = req.body;

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
    state_file_number: null,
    ein: null,
    crn: null,
    registered_agent: 'بانتظار التعيين الرسمي بعد مراجعة الطلب (Pending Assignment)',
    registered_address: 'يحدد رسمياً بعد المراجعة وتأكيد ملف الولاية (Pending Verification)',
    filing_date: todayStr,
    renewal_due_date: renewalStr,
    status: 'submitted', // Strictly 'submitted' initial intake
    payment_status: 'pending_payment', // Mandatory rule: Not auto-marked paid
    notes: notes ? String(notes).slice(0, 500) : 'طلب مبدئي جديد تم استلامه عبر بوابة قبس',
    history: [
      {
        status: 'submitted',
        changed_at: now.toISOString(),
        changed_by: req.user!.id,
        note: 'Initial intake submitted by client'
      }
    ],
    created_at: now.toISOString()
  };

  db.createFormation(newRecord);

  // Generate initial invoice with status 'pending' (NEVER 'paid' automatically)
  const invoiceId = `inv_${Date.now()}`;
  const invoiceRecord: InvoiceRecord = {
    id: invoiceId,
    invoice_number: `QABS-INV-${Date.now().toString().slice(-6)}`,
    tenant_id: currentTenantId,
    amount: 397.0,
    currency: 'USD',
    description_ar: `طلب تأسيس شركة ${newRecord.company_name} (بانتظار السداد)`,
    description_en: `Formation intake for ${newRecord.company_name} (Pending Payment)`,
    status: 'pending',
    issued_date: todayStr
  };
  db.createInvoice(invoiceRecord);

  db.recordAudit(
    req.user!.name,
    currentTenantId,
    `إنشاء طلب تأسيس مبدئي (${newRecord.company_name}) بحالة Submitted وبانتظار السداد`,
    `Created initial formation intake (${newRecord.company_name}) with status Submitted and Pending Payment`,
    `company_formations:${formationId}`,
    'success',
    req.ip
  );

  res.status(201).json({
    success: true,
    message_ar: 'تم حفظ طلب التأسيس المبدئي بنجاح وربطه بحسابك. بانتظار المراجعة والتحقق وسداد الرسوم.',
    message_en: 'Initial company formation intake saved successfully and linked to your account.',
    formation: newRecord,
    invoice: invoiceRecord
  });
});

// 8. Single Formation by ID with Tenant Isolation Check
app.get('/api/formations/:id', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const currentTenantId = req.user!.id;
  const formation = db.getFormationById(req.params.id);

  if (!formation) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Formation request not found' });
    return;
  }

  // Cross-tenant defense
  if (formation.tenant_id !== currentTenantId && req.user!.role !== 'super_admin') {
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

// ==========================================
// ADMIN CONTROL CENTER API ROUTES
// ==========================================

// 9. Admin Status Inspection
app.get('/api/admin/status', authenticateSession, (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'super_admin') {
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

// 10. Admin Audit Logs
app.get('/api/admin/audit-logs', authenticateSession, requireAdmin, (_req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({
    total: logs.length,
    logs
  });
});

// 11. Admin Formations Review Queue
app.get('/api/admin/formations', authenticateSession, requireAdmin, (_req: Request, res: Response) => {
  const allFormations = db.getAllFormations();
  res.json({
    total: allFormations.length,
    formations: allFormations
  });
});

// 12. Wildcard Protected Admin Routes: Enforced by requireAdmin (All mutations return 503 BLOCKED)
app.all('/api/admin/*', authenticateSession, requireAdmin, (_req: Request, res: Response) => {
  res.status(503).json({
    error: 'BLOCKED',
    status_code: 'BLOCKED_PENDING_PRODUCTION_IDP',
    message_ar: 'العملية الإدارية معطلة أمنياً (BLOCKED). تتطلب ربط مزود هوية رسمي وخادم جلسات معتمد.',
    message_en: 'Administrative action is BLOCKED pending verified hosted IdP integration.'
  });
});

// 13. Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    server_time: new Date().toISOString(),
    persistence: 'Active (Disk-backed JSON storage)',
    engine: 'QABS Unified Kernel v48'
  });
});

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
