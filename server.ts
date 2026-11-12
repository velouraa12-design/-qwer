import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-memory data structures modeled strictly on DATABASE_SCHEMA.sql
// Table 1: tenants
export interface TenantRecord {
  id: string;
  owner_name: string;
  email: string;
  company_legal_name?: string;
  role: 'merchant' | 'super_admin' | 'compliance_officer' | 'support_agent';
  credits_balance: number;
  created_at: string;
  updated_at: string;
}

// Table 2: company_formations
export interface CompanyFormationRecord {
  id: string;
  tenant_id: string;
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
  notes: string | null;
  created_at: string;
}

// Table 11: security_audit_logs
export interface SecurityAuditLogRecord {
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

// Seed initial tenants for testing and isolation (Standard customers, NO default super admin)
const tenantsDb: Map<string, TenantRecord> = new Map([
  [
    'usr_customer_01',
    {
      id: 'usr_customer_01',
      owner_name: 'محمد الخالدي',
      email: 'customer1@qabs1.store',
      company_legal_name: 'Khaledi Retail LLC',
      role: 'merchant',
      credits_balance: 100.0,
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-01-10T10:00:00Z'
    }
  ],
  [
    'usr_customer_02',
    {
      id: 'usr_customer_02',
      owner_name: 'سارة المنصوري',
      email: 'customer2@qabs1.store',
      company_legal_name: 'Al-Mansouri Modern Ventures',
      role: 'merchant',
      credits_balance: 50.0,
      created_at: '2026-02-01T12:00:00Z',
      updated_at: '2026-02-01T12:00:00Z'
    }
  ]
]);

// Initial formations store
const formationsDb: Map<string, CompanyFormationRecord> = new Map([
  [
    'comp_seed_01',
    {
      id: 'comp_seed_01',
      tenant_id: 'usr_customer_01',
      company_name: 'KHALEDI COMMERCE LLC',
      jurisdiction: 'US_WYOMING',
      entity_type: 'LLC',
      state_file_number: null,
      ein: null,
      crn: null,
      registered_agent: 'Pending formal assignment upon state intake review',
      registered_address: 'Pending official verification with Wyoming Secretary of State',
      filing_date: '2026-03-01',
      renewal_due_date: '2027-03-01',
      status: 'submitted',
      notes: 'Initial intake received. Documents under verification.',
      created_at: '2026-03-01T09:30:00Z'
    }
  ]
]);

// Audit logs
const auditLogsDb: SecurityAuditLogRecord[] = [
  {
    id: 'log_boot_01',
    actor_name: 'SYSTEM',
    actor_id: 'sys',
    action_ar: 'بدء تشغيل خادم المنظومة وتفعيل جدار الحماية',
    action_en: 'System daemon initialized with security guard',
    target_entity: 'QABS_SECURITY_KERNEL',
    status: 'success',
    timestamp: new Date().toISOString()
  }
];

// Helper to record audit events
function recordAudit(
  actorName: string,
  actorId: string,
  actionAr: string,
  actionEn: string,
  targetEntity: string,
  status: 'success' | 'failed' | 'blocked',
  ip?: string
) {
  const log: SecurityAuditLogRecord = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    actor_name: actorName,
    actor_id: actorId,
    action_ar: actionAr,
    action_en: actionEn,
    target_entity: targetEntity,
    status,
    ip_address: ip,
    timestamp: new Date().toISOString()
  };
  auditLogsDb.unshift(log);
  return log;
}

// Extend Request type with user
declare global {
  namespace Express {
    interface Request {
      user?: TenantRecord;
    }
  }
}

// Auth Middleware: extracts bearer token or simulated session header
function authenticateSession(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const tenantHeader = req.headers['x-qabs-tenant-id'] as string | undefined;

  let tenantId: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1].trim();
    // In our structured server session model, bearer token is formatted as `session_<tenantId>` or raw tenantId
    if (token.startsWith('session_')) {
      tenantId = token.replace('session_', '');
    } else if (tenantsDb.has(token)) {
      tenantId = token;
    }
  } else if (tenantHeader && tenantsDb.has(tenantHeader)) {
    tenantId = tenantHeader;
  }

  if (tenantId && tenantsDb.has(tenantId)) {
    req.user = tenantsDb.get(tenantId);
  }

  next();
}

// Require Authenticated User Middleware
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    recordAudit(
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
      message_ar: 'جلسة المستخدم غير صالحة أو غير مسجلة. يرجى تسجيل الدخول أولاً.',
      message_en: 'Authentication required. No valid session found.'
    });
    return;
  }
  next();
}

// Strict Server-Side Super Admin Enforcement Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    recordAudit(
      'ANONYMOUS_VISITOR',
      'anonymous',
      'محاولة غير مصرح بها لاختراق لوحة الإدارة',
      'Unauthenticated attempt to access administrative endpoint',
      req.originalUrl,
      'blocked',
      req.ip
    );
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message_ar: 'الوصول إلى لوحة الإدارة يتطلب تسجيل دخول كمسؤول معتمد.',
      message_en: 'Authentication required for administrative endpoints.'
    });
    return;
  }

  if (req.user.role !== 'super_admin') {
    recordAudit(
      req.user.owner_name,
      req.user.id,
      'محاولة تصعيد صلاحيات غير مصرح بها إلى Super Admin',
      'Privilege escalation attempt to Super Admin rejected',
      req.originalUrl,
      'blocked',
      req.ip
    );
    res.status(403).json({
      error: 'FORBIDDEN',
      message_ar: 'تم حظر الطلب: صلاحيات غير كافية. لا تملك صلاحية مدير النظام Super Admin.',
      message_en: 'Access forbidden: Insufficient privileges. Privilege escalation blocked.'
    });
    return;
  }

  // Rule 6: If hosted identity provider is not yet attached, live admin mutations must be BLOCKED
  if (req.method !== 'GET') {
    recordAudit(
      req.user.owner_name,
      req.user.id,
      'عملية إدارية مباشرة معطلة: بانتظار ربط مزود الهوية الخارجي المعتمد',
      'Direct admin write disabled: Awaiting hosted identity provider integration',
      req.originalUrl,
      'blocked',
      req.ip
    );
    res.status(503).json({
      error: 'BLOCKED',
      status_code: 'BLOCKED_PENDING_PRODUCTION_IDP',
      message_ar: 'تم تعليق العمليات الإدارية المباشرة (BLOCKED) لحين ربط مزود هوية خادمي معتمد بشهادات رسمية.',
      message_en: 'Administrative write actions are BLOCKED until a certified hosted identity provider is provisioned.'
    });
    return;
  }

  next();
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check & status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    server_time: new Date().toISOString(),
    engine: 'QABS Unified Kernel v48'
  });
});

// 2. Current session inspection
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
      name: req.user.owner_name,
      email: req.user.email,
      role: req.user.role,
      company_legal_name: req.user.company_legal_name,
      credits: req.user.credits_balance
    }
  });
});

// 3. Customer Login (Strictly rejects client role escalation)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'INVALID_REQUEST', message: 'Email is required' });
    return;
  }

  // Check if tenant exists
  let tenant: TenantRecord | undefined;
  for (const t of tenantsDb.values()) {
    if (t.email.toLowerCase() === email.toLowerCase()) {
      tenant = t;
      break;
    }
  }

  if (!tenant) {
    // Automatically register as standard customer / merchant (NEVER super_admin)
    const newId = `usr_${Date.now()}`;
    tenant = {
      id: newId,
      owner_name: email.split('@')[0],
      email: email.toLowerCase(),
      company_legal_name: `${email.split('@')[0]} LLC`,
      role: 'merchant', // Standard customer role ONLY
      credits_balance: 0.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    tenantsDb.set(newId, tenant);
    recordAudit(tenant.owner_name, tenant.id, 'تسجيل حساب عميل جديد', 'New customer registration', 'tenants', 'success');
  }

  // Return session token
  res.json({
    success: true,
    token: `session_${tenant.id}`,
    user: {
      id: tenant.id,
      name: tenant.owner_name,
      email: tenant.email,
      role: tenant.role,
      company_legal_name: tenant.company_legal_name,
      credits: tenant.credits_balance
    }
  });
});

// 4. Admin Guard Check / Status Endpoint
app.get('/api/admin/status', authenticateSession, (req: Request, res: Response) => {
  // If not authenticated or not admin, return BLOCKED info
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
    user: req.user.owner_name
  });
});

// 5. Admin Protected Routes (Audit Logs & Review)
app.get('/api/admin/audit-logs', authenticateSession, requireAdmin, (_req: Request, res: Response) => {
  res.json({
    total: auditLogsDb.length,
    logs: auditLogsDb
  });
});

// All other /api/admin/* routes: enforced by requireAdmin
app.all('/api/admin/*', authenticateSession, requireAdmin, (_req: Request, res: Response) => {
  res.status(503).json({
    error: 'BLOCKED',
    status_code: 'BLOCKED_PENDING_PRODUCTION_IDP',
    message_ar: 'العملية الإدارية معطلة (BLOCKED). تتطلب ربط مزود هوية رسمي وخادم جلسات معتمد.',
    message_en: 'Administrative action is BLOCKED pending verified hosted IdP integration.'
  });
});

// 6. Company Formations: GET (Filtered strictly by authenticated tenant)
app.get('/api/formations', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const currentTenantId = req.user!.id;

  // Multi-tenant isolation: only retrieve formations belonging to this tenant
  const tenantFormations: CompanyFormationRecord[] = [];
  for (const formation of formationsDb.values()) {
    if (formation.tenant_id === currentTenantId) {
      tenantFormations.push(formation);
    }
  }

  res.json({
    tenant_id: currentTenantId,
    total: tenantFormations.length,
    formations: tenantFormations
  });
});

// 7. Company Formations: POST (Real Initial Intake submission)
app.post('/api/formations', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const currentTenantId = req.user!.id;
  const { company_name, jurisdiction, entity_type, notes } = req.body;

  // Validation
  if (!company_name || typeof company_name !== 'string' || !company_name.trim()) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message_ar: 'اسم الشركة مطلوب.',
      message_en: 'Company name is required.'
    });
    return;
  }

  if (!jurisdiction || typeof jurisdiction !== 'string') {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message_ar: 'ولاية أو نطاق التأسيس مطلوب.',
      message_en: 'Jurisdiction is required.'
    });
    return;
  }

  const validEntityTypes = ['LLC', 'C-CORP', 'LTD'];
  const normalizedEntityType = (entity_type || 'LLC').toUpperCase();
  if (!validEntityTypes.includes(normalizedEntityType)) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message_ar: 'نوع الكيان غير مدعوم. اختر LLC أو C-CORP أو LTD.',
      message_en: 'Invalid entity type. Supported: LLC, C-CORP, LTD.'
    });
    return;
  }

  // Mandatory Rule: State must be 'draft' or 'submitted'. NEVER 'submitted_to_state' or 'approved'
  const formationId = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const todayStr = new Date().toISOString().split('T')[0];
  const renewalStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const newRecord: CompanyFormationRecord = {
    id: formationId,
    tenant_id: currentTenantId, // Strict link to client tenant
    company_name: company_name.trim().toUpperCase(),
    jurisdiction: jurisdiction.trim(),
    entity_type: normalizedEntityType as 'LLC' | 'C-CORP' | 'LTD',
    state_file_number: null, // Unfiled with state
    ein: null, // Unissued
    crn: null,
    // Do NOT state unverified agent addresses as facts
    registered_agent: 'بانتظار التعيين الرسمي بعد مراجعة الطلب (Pending Assignment)',
    registered_address: 'يحدد رسمياً بعد المراجعة وتأكيد ملف الولاية (Pending Verification)',
    filing_date: todayStr,
    renewal_due_date: renewalStr,
    status: 'submitted', // Strictly 'submitted' initial intake
    notes: notes ? String(notes).slice(0, 500) : 'طلب مبدئي جديد تم استلامه عبر بوابة قبس',
    created_at: new Date().toISOString()
  };

  formationsDb.set(formationId, newRecord);

  // Record audit log entry
  recordAudit(
    req.user!.owner_name,
    currentTenantId,
    `إنشاء طلب تأسيس مبدئي جديد (${newRecord.company_name}) بحالة Submitted`,
    `Created initial company formation intake (${newRecord.company_name}) with status Submitted`,
    `company_formations:${formationId}`,
    'success',
    req.ip
  );

  res.status(201).json({
    success: true,
    message_ar: 'تم حفظ طلب التأسيس المبدئي بنجاح وربطه بحسابك. بانتظار المراجعة والتحقق.',
    message_en: 'Initial company formation intake saved successfully and linked to your account.',
    formation: newRecord
  });
});

// Single formation retrieval by ID with tenant isolation
app.get('/api/formations/:id', authenticateSession, requireAuth, (req: Request, res: Response) => {
  const currentTenantId = req.user!.id;
  const formationId = req.params.id;

  const formation = formationsDb.get(formationId);
  if (!formation) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Formation request not found' });
    return;
  }

  // Cross-tenant protection: reject if not owner
  if (formation.tenant_id !== currentTenantId && req.user!.role !== 'super_admin') {
    recordAudit(
      req.user!.owner_name,
      currentTenantId,
      `محاولة غير مصرح بها للوصول لطلب تأسيس عميل آخر (${formationId})`,
      `Cross-tenant formation access attempt blocked (${formationId})`,
      `company_formations:${formationId}`,
      'blocked',
      req.ip
    );
    res.status(403).json({
      error: 'FORBIDDEN',
      message_ar: 'غير مصرح لك بالوصول إلى بيانات طلب تأسيس خاص بمستخدم آخر.',
      message_en: 'Access forbidden: You cannot view or access another client’s formation record.'
    });
    return;
  }

  res.json({ formation });
});

// Export server instance for test suites
export { app, tenantsDb, formationsDb, auditLogsDb };

// Start Server & mount Vite in development
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

// Only start daemon if run directly
const isDirectEntry = process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));
if (isDirectEntry && process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  start().catch(err => {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  });
}
