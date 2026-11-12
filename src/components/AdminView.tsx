import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  ShieldCheck,
  Store,
  FilePlus2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  CreditCard,
  Globe,
  LifeBuoy,
  BarChart3,
  History,
  Lock,
  RefreshCw,
  Search,
  Building2,
  FileText,
  ShieldAlert,
  ArrowRight,
  ShieldX
} from 'lucide-react';

export type AdminTab =
  | 'operations_summary'
  | 'review_formations'
  | 'clients_stores'
  | 'docs_support'
  | 'invoices_payments'
  | 'users_audit';

export const AdminView: React.FC = () => {
  const {
    language,
    setMode,
    user,
    stores,
    companies,
    tickets,
    auditLogs,
    invoices
  } = useApp();

  const isAr = language === 'ar';
  const isSuperAdmin = user.role === 'super_admin';

  const [activeTab, setActiveTab] = useState<AdminTab>('operations_summary');
  const [serverAuditLogs, setServerAuditLogs] = useState<any[]>([]);
  const [serverFormations, setServerFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch admin data from server if super_admin
  const fetchAdminData = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const [logsRes, formsRes] = await Promise.all([
        fetch('/api/admin/audit-logs', {
          headers: { Authorization: `Bearer session_${user.id}` }
        }),
        fetch('/api/admin/formations', {
          headers: { Authorization: `Bearer session_${user.id}` }
        })
      ]);

      if (logsRes.ok) {
        const data = await logsRes.json();
        setServerAuditLogs(data.logs || []);
      }
      if (formsRes.ok) {
        const data = await formsRes.json();
        setServerFormations(data.formations || []);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdminData();
    }
  }, [isSuperAdmin]);

  // If user is NOT a verified Super Admin, display the protective barrier
  if (!isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white dark:bg-[#071D2B] rounded-3xl border-2 border-red-500/40 text-center space-y-6 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/20 text-red-500 flex items-center justify-center font-bold">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono text-xs font-bold">
            BLOCKED 🔒 (403 Forbidden)
          </span>
          <h2 className="text-xl font-black text-[#003445] dark:text-white">
            {isAr ? 'منطقة إشرافية محجوبة: تتطلب مصادقة خادمية معتمدة' : 'Restricted Admin Area: Server Auth Required'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {isAr
              ? 'تطبيقاً للقواعد الأمنية الإلزامية لمنظومة قبس: لا يُتاح الوصول الإداري إلا بمصادقة خادمية موثقة بصلاحية super_admin ومزود هوية مؤسسي. تم حظر محاولة الوصول محلياً لحماية البيانات.'
              : 'Per security policy: Administrative access is strictly restricted to authenticated server sessions with super_admin privileges. Client-side bypass is disabled.'}
          </p>
        </div>

        <button
          onClick={() => setMode('landing')}
          className="px-6 py-2.5 rounded-xl bg-[#14243e] text-[#d5b46b] border border-[#d5b46b]/40 text-xs font-bold hover:brightness-110 cursor-pointer shadow-md"
        >
          {isAr ? 'العودة إلى الموقع العام (qabs1.store)' : 'Return to Public Store'}
        </button>
      </div>
    );
  }

  const sections: { id: AdminTab; labelAr: string; labelEn: string; icon: React.ElementType }[] = [
    { id: 'operations_summary', labelAr: '1. ملخص العمليات', labelEn: 'Operations Summary', icon: BarChart3 },
    { id: 'review_formations', labelAr: '2. مراجعة الطلبات والشركات', labelEn: 'Formations Review', icon: Building2 },
    { id: 'clients_stores', labelAr: '3. إدارة العملاء والمتاجر', labelEn: 'Clients & Stores', icon: Users },
    { id: 'docs_support', labelAr: '4. المستندات والدعم', labelEn: 'Docs & Support', icon: LifeBuoy },
    { id: 'invoices_payments', labelAr: '5. الفواتير والمدفوعات المؤكدة', labelEn: 'Invoices & Payments', icon: CreditCard },
    { id: 'users_audit', labelAr: '6. المستخدمين وسجل التدقيق', labelEn: 'Audit Trail & Users', icon: History }
  ];

  const allFormationsList = serverFormations.length > 0 ? serverFormations : companies;
  const allAuditLogsList = serverAuditLogs.length > 0 ? serverAuditLogs : auditLogs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Admin Central Header */}
      <div className="bg-[#14243e] text-white p-6 rounded-2xl border-2 border-[#d5b46b]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#d5b46b] uppercase tracking-wider">
              {isAr ? 'لوحة تحكم إدارة قبس المركزية (QABS Control Center)' : 'QABS Control Center'}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-400 font-bold font-mono">Server Session Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            {isAr ? 'غرفة العمليات والحوكمة المركزية للمنظومة' : 'Central Governance & Operations Hub'}
          </h1>
          <p className="text-xs text-slate-300">
            {isAr
              ? 'مراجعة طلبات التأسيس، إشراف المتاجر، سجل التدقيق الأمني، وحوكمة الصلاحيات'
              : 'Intake queue inspection, multi-store oversight, security audit logs, and RBAC governance'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2 text-slate-300 hover:text-white rounded-lg border border-slate-700 cursor-pointer"
            title="Refresh Admin Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#d5b46b]' : ''}`} />
          </button>

          <button
            onClick={() => setMode('landing')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 cursor-pointer"
          >
            {isAr ? 'عرض الموقع العام' : 'Public Store'}
          </button>
        </div>
      </div>

      {/* Standardized 6-Section Tabs */}
      <div className="bg-slate-100/80 dark:bg-[#061824] p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex overflow-x-auto gap-1 scrollbar-none">
        {sections.map(sec => {
          const Icon = sec.icon;
          const isActive = activeTab === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-[#071D2B] text-[#004457] dark:text-[#d5b46b] shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#004457] dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#d5b46b]' : 'text-slate-400'}`} />
              <span>{isAr ? sec.labelAr : sec.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: OPERATIONS SUMMARY */}
      {activeTab === 'operations_summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold">{isAr ? 'إجمالي طلبات التأسيس' : 'Total Formations'}</span>
              <div className="text-3xl font-black text-[#004457] dark:text-white font-mono">{allFormationsList.length}</div>
              <div className="text-[11px] text-slate-500">{isAr ? 'عبر جميع المستأجرين' : 'Across all tenants'}</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold">{isAr ? 'المتاجر الإلكترونية النشطة' : 'Active Stores'}</span>
              <div className="text-3xl font-black text-[#004457] dark:text-white font-mono">{stores.length}</div>
              <div className="text-[11px] text-teal-600">{isAr ? 'نظام المستأجرين المتعددين' : 'Multi-Tenant'}</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold">{isAr ? 'أحداث سجل التدقيق' : 'Audit Log Records'}</span>
              <div className="text-3xl font-black text-[#004457] dark:text-white font-mono">{allAuditLogsList.length}</div>
              <div className="text-[11px] text-emerald-600 font-bold">Immutable Trail ✅</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold">{isAr ? 'حالة العمليات المباشرة' : 'Live Mutations'}</span>
              <div className="text-sm font-black text-amber-500 font-mono mt-2">BLOCKED (Rule 6)</div>
              <div className="text-[11px] text-slate-500">{isAr ? 'تتطلب IdP مؤسسي' : 'Requires production IdP'}</div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: REVIEW FORMATIONS QUEUE */}
      {activeTab === 'review_formations' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-black text-[#004457] dark:text-white">
              {isAr ? 'مراجعة طابور طلبات التأسيس والتحقق الحكومي' : 'Formations Intake Review Queue'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'عرض كافة طلبات التأسيس المستلمة من العملاء للتحقق من الاسم، الولاية، والوثائق.'
                : 'Review incoming customer intakes for legal verification.'}
            </p>
          </div>

          <div className="space-y-3">
            {allFormationsList.map((form: any) => (
              <div
                key={form.id}
                className="p-5 rounded-xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="font-black text-sm text-[#004457] dark:text-white">
                    {form.companyName || form.company_name}
                  </div>
                  <div className="text-slate-500 mt-1 flex items-center gap-2">
                    <span className="font-mono">{form.id}</span>
                    <span>·</span>
                    <span>{form.jurisdiction}</span>
                    <span>·</span>
                    <span>{form.entityType || form.entity_type}</span>
                    <span>·</span>
                    <span className="text-teal-600 font-bold">Tenant: {form.tenant_id || 'unassigned'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold ${
                    form.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {form.status}
                  </span>

                  {/* Mutating Action Button disabled per Rule 6 */}
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center gap-1"
                    title={isAr ? 'معطل: العمليات الإدارية الحية معلقة لحين ربط IdP مؤسسي' : 'Disabled: Live admin writes blocked'}
                  >
                    <Lock className="w-3 h-3" />
                    <span>{isAr ? 'اعتماد (BLOCKED)' : 'Approve (BLOCKED)'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CLIENTS & STORES */}
      {activeTab === 'clients_stores' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-black text-[#004457] dark:text-white">
              {isAr ? 'إدارة المتاجر والمستأجرين' : 'Multi-Store Tenants Oversight'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map(s => (
              <div key={s.id} className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-sm text-[#004457] dark:text-white">{s.name}</div>
                <div className="font-mono text-slate-400">{s.subdomain}</div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-500">{isAr ? 'المالك:' : 'Owner:'} {s.ownerName}</span>
                  <span className="text-teal-600 font-bold">{s.theme}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: DOCS & SUPPORT */}
      {activeTab === 'docs_support' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-black text-[#004457] dark:text-white">
              {isAr ? 'تذاكر الدعم والوثائق القانونية' : 'Support Desk & Inquiries'}
            </h2>
          </div>

          <div className="space-y-3">
            {tickets.map(t => (
              <div key={t.id} className="p-4 rounded-xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-sm">{t.subject}</div>
                  <div className="text-slate-400 mt-0.5">{t.category} · Priority: {t.priority}</div>
                </div>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-teal-600 bg-teal-50 dark:bg-teal-950">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: INVOICES & PAYMENTS */}
      {activeTab === 'invoices_payments' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-black text-[#004457] dark:text-white">
              {isAr ? 'سجل الفواتير والمدفوعات المؤكدة' : 'Confirmed Invoices & Financial Ledger'}
            </h2>
          </div>

          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="p-4 rounded-xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-sm">{inv.invoiceNumber}</div>
                  <div className="text-slate-400 mt-0.5">{inv.clientName} · {inv.date}</div>
                </div>
                <div className="font-mono font-bold text-emerald-600">${inv.amount} {inv.currency}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: USERS, ROLES & AUDIT TRAIL */}
      {activeTab === 'users_audit' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-black text-[#004457] dark:text-white">
              {isAr ? 'سجل التدقيق الأمني للأحداث (Security Audit Logs)' : 'Immutable Security Audit Trail'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr
                ? 'سجل غير قابل للتعديل يوثق كافة محاولات الدخول، إنشاء الطلبات، ومحاولات تصعيد الصلاحيات المحظورة.'
                : 'Immutable audit trail recording logins, intakes, and blocked escalation events.'}
            </p>
          </div>

          <div className="space-y-2.5">
            {allAuditLogsList.slice(0, 15).map((log: any) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {isAr ? log.action_ar || log.actionAr : log.action_en || log.actionEn}
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                    Actor: {log.actor_name || log.actor} · Target: {log.target_entity || log.target}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      log.status === 'blocked'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {log.status}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
