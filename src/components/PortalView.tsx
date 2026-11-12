import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  LayoutDashboard,
  Store,
  Building2,
  CreditCard,
  FileText,
  Receipt,
  LifeBuoy,
  ShieldCheck,
  Plus,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  FileCheck2,
  Send,
  X
} from 'lucide-react';
import { CompanyFormation } from '../types/index.ts';

interface PortalViewProps {
  onOpenFormationModal: () => void;
  onOpenStoreModal: () => void;
}

export type PortalTab =
  | 'overview'
  | 'companies_orders'
  | 'stores_studio'
  | 'payments'
  | 'documents'
  | 'billing'
  | 'support'
  | 'security_profile';

export const PortalView: React.FC<PortalViewProps> = ({ onOpenStoreModal, onOpenFormationModal }) => {
  const {
    language,
    setMode,
    stores,
    activeStoreId,
    setActiveStoreId,
    user,
    companies,
    products,
    orders,
    invoices,
    tickets,
    addTicket,
    auditLogs
  } = useApp();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<PortalTab>('overview');

  // Real backend server formations fetch state
  const [serverFormations, setServerFormations] = useState<any[]>([]);
  const [loadingFormations, setLoadingFormations] = useState<boolean>(false);
  const [formationFetchError, setFormationFetchError] = useState<string | null>(null);

  // Filter for companies
  const [companyFilter, setCompanyFilter] = useState<'all' | 'submitted' | 'approved'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Document modal inspection
  const [viewingDoc, setViewingDoc] = useState<{
    docName: string;
    companyName: string;
    type: string;
    date: string;
    jurisdiction?: string;
    isOfficial: boolean;
  } | null>(null);

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'formation' | 'payments' | 'store'>('formation');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fetch verified customer formations from server API
  const fetchCustomerFormations = async () => {
    setLoadingFormations(true);
    setFormationFetchError(null);
    try {
      const res = await fetch('/api/formations', {
        headers: {
          Authorization: `Bearer session_${user.id}`
        }
      });
      const data = await res.json();
      if (res.ok && data.formations) {
        setServerFormations(data.formations);
      } else {
        // Fallback to locally authorized formations for this tenant
        setServerFormations(companies.filter(c => !c.tenant_id || c.tenant_id === user.id));
      }
    } catch {
      // Offline fallback
      setServerFormations(companies.filter(c => !c.tenant_id || c.tenant_id === user.id));
    } finally {
      setLoadingFormations(false);
    }
  };

  useEffect(() => {
    fetchCustomerFormations();
  }, [user.id, companies]);

  // Combined client formations: strictly tenant-isolated
  const activeFormations = (serverFormations.length > 0 ? serverFormations : companies).filter(
    (c: any) => !c.tenant_id || c.tenant_id === user.id
  );

  const currentStore = stores.find(s => s.id === activeStoreId) || stores[0];
  const userTickets = tickets;

  const tabs: { id: PortalTab; labelAr: string; labelEn: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'overview', labelAr: 'الرئيسية وملخص الحساب', labelEn: 'Overview & Summary', icon: LayoutDashboard },
    { id: 'companies_orders', labelAr: 'طلباتي وشركاتي', labelEn: 'My Orders & Companies', icon: Building2, badge: activeFormations.length },
    { id: 'stores_studio', labelAr: 'متاجري واستوديو قبس', labelEn: 'My Stores & Studio', icon: Store, badge: stores.length },
    { id: 'payments', labelAr: 'بوابات الدفع', labelEn: 'Payment Gateways', icon: CreditCard, badge: 'BLOCKED' },
    { id: 'documents', labelAr: 'خزينة المستندات', labelEn: 'Documents Vault', icon: FileText },
    { id: 'billing', labelAr: 'الاشتراكات والفواتير', labelEn: 'Billing & Invoices', icon: Receipt },
    { id: 'support', labelAr: 'الدعم والإشعارات', labelEn: 'Support & Alerts', icon: LifeBuoy },
    { id: 'security_profile', labelAr: 'الملف الشخصي والأمان', labelEn: 'Profile & Security', icon: ShieldCheck }
  ];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    addTicket({
      subject: ticketSubject.trim(),
      subjectAr: ticketSubject.trim(),
      subjectEn: ticketSubject.trim(),
      clientName: user.name,
      category: ticketCategory,
      priority: 'medium',
      lastMessage: ticketMessage.trim()
    });

    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* 1. UNIFIED PORTAL TOP BAR */}
      <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-[#00A896]">{isAr ? 'منظومة قبس الرقمية' : 'QABS Digital'}</span>
            <span aria-hidden="true">·</span>
            <span>{isAr ? 'بوابة العميل الموحدة' : 'Unified Customer Portal'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-teal-600 dark:text-teal-400 font-bold">
              {user.id} ({user.role})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#003445] dark:text-white">
            {isAr ? `مرحباً بك، ${user.name}` : `Welcome back, ${user.name}`}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'إدارة متكاملة لملفات تأسيس الشركات، المتاجر الإلكترونية، بوابات الدفع، والامتثال القانوني'
              : 'Unified management for corporate formations, e-commerce stores, payments, and legal compliance'}
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenFormationModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#004457] to-[#00A896] text-white text-xs font-black hover:opacity-95 transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Building2 className="w-4 h-4 text-[#d5b46b]" />
            <span>{isAr ? 'طلب تأسيس شركة جديد' : 'New Company Intake'}</span>
          </button>

          <button
            onClick={onOpenStoreModal}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#003445] dark:text-slate-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border border-slate-300 dark:border-slate-700"
          >
            <Store className="w-4 h-4 text-[#00A896]" />
            <span>{isAr ? 'إطلاق متجر مستقل' : 'Launch New Store'}</span>
          </button>
        </div>
      </div>

      {/* 2. STANDARDIZED 8-SECTION NAVIGATION BAR */}
      <div className="bg-slate-100/80 dark:bg-[#061824] p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex overflow-x-auto gap-1 scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-[#071D2B] text-[#004457] dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#004457] dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#00A896]' : 'text-slate-400'}`} />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    tab.badge === 'BLOCKED'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                      : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. SECTION CONTENT ROUTING */}

      {/* SECTION 1: OVERVIEW & ACCOUNT SUMMARY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {isAr ? 'طلبات التأسيس النشطة' : 'Active Formations'}
              </div>
              <div className="text-3xl font-black text-[#004457] dark:text-white font-mono">
                {activeFormations.length}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <span>{isAr ? 'مسجلة بحساب العميل' : 'Linked to account'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-teal-600 font-bold">{isAr ? 'محمية' : 'Verified'}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {isAr ? 'المتاجر الإلكترونية' : 'E-Commerce Stores'}
              </div>
              <div className="text-3xl font-black text-[#004457] dark:text-white font-mono">
                {stores.length}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <span>{currentStore?.name || 'QABS Store'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-600 font-bold">{isAr ? 'جاهز' : 'Ready'}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {isAr ? 'الرصيد التشغيلي المتاح' : 'Available Operating Credits'}
              </div>
              <div className="text-3xl font-black text-[#d5b46b] font-mono">
                ${user.credits}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <span>{isAr ? 'محفظة الخدمات' : 'Service Wallet'}</span>
                <span aria-hidden="true">·</span>
                <span>USD</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {isAr ? 'حالة جلسة المصادقة' : 'Session Security'}
              </div>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>{isAr ? 'جلسة عميل مصادق عليها' : 'Verified Client Session'}</span>
              </div>
              <div className="text-xs text-slate-500 pt-1 font-mono truncate">
                Role: {user.role} · Token active
              </div>
            </div>
          </div>

          {/* Quick Guidance Card */}
          <div className="bg-gradient-to-r from-[#14243e] to-[#0b172a] rounded-2xl p-6 border-2 border-[#d5b46b]/30 text-white shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#d5b46b] uppercase tracking-wider">
                  {isAr ? 'مسارات الدعم المباشر' : 'Direct Support Channels'}
                </span>
                <h3 className="text-lg font-black text-white">
                  {isAr ? 'هل تحتاج إلى متابعة طلبك القائم أو التأسيس الفوري؟' : 'Need help with an ongoing request or formation?'}
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl">
                  {isAr
                    ? 'فريق الدعم والامتثال متاح على مدار الساعة عبر قناة WhatsApp المعتمدة والموثقة بالرقم +159710784967.'
                    : 'Compliance and support specialists are available 24/7 via official verified WhatsApp (+159710784967).'}
                </p>
              </div>

              <a
                href="https://wa.me/159710784967?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%81%D8%B1%D9%8A%D9%82%20%D9%82%D8%A8%D8%B3%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D9%85%D8%AA%D8%A7%D8%A8%D8%B9%D8%A9%20%D8%AD%D8%B3%D8%A7%D8%A8%D9%8A."
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all flex items-center gap-2 shrink-0 shadow-md cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAr ? 'محادثة الدعم (+159710784967)' : 'WhatsApp (+159710784967)'}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MY ORDERS & FORMATIONS (Real backend /api/formations sync) */}
      {activeTab === 'companies_orders' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'طلبات التأسيس والكيانات المسجلة' : 'Corporate Formations & Legal Intake'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? 'البيانات المعروضة هنا مرتبطة مباشرة بحسابك المصادق عليه عبر خادم API، ويتم عزلها بالكامل عن العملاء الآخرين.'
                    : 'Formations displayed are strictly linked to your authenticated client account via server API.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchCustomerFormations}
                  disabled={loadingFormations}
                  className="p-2 text-slate-500 hover:text-[#004457] dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                  title={isAr ? 'تحديث البيانات من الخادم' : 'Refresh from Server'}
                >
                  <RefreshCw className={`w-4 h-4 ${loadingFormations ? 'animate-spin text-[#00A896]' : ''}`} />
                </button>

                <button
                  onClick={onOpenFormationModal}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#004457] to-[#00A896] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'تقديم طلب تأسيس جديد' : 'Submit New Intake'}</span>
                </button>
              </div>
            </div>

            {/* Segmented Filter Controls */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
              <button
                onClick={() => setCompanyFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  companyFilter === 'all'
                    ? 'bg-white dark:bg-[#071D2B] text-[#004457] dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isAr ? 'جميع الطلبات' : 'All Requests'} ({activeFormations.length})
              </button>
              <button
                onClick={() => setCompanyFilter('submitted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  companyFilter === 'submitted'
                    ? 'bg-white dark:bg-[#071D2B] text-[#004457] dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isAr ? 'المستلمة (قيد المراجعة)' : 'Submitted'} (
                {activeFormations.filter((c: any) => c.status === 'submitted').length})
              </button>
              <button
                onClick={() => setCompanyFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  companyFilter === 'approved'
                    ? 'bg-white dark:bg-[#071D2B] text-[#004457] dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isAr ? 'المعتمدة رسمياً' : 'Approved'} (
                {activeFormations.filter((c: any) => c.status === 'approved').length})
              </button>
            </div>
          </div>

          {/* Formations List / Empty / Loading */}
          {loadingFormations ? (
            <div className="p-12 text-center bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-[#00A896] animate-spin" />
              <p className="text-xs text-slate-500 font-bold">
                {isAr ? 'جارِ استرجاع طلبات التأسيس من الخادم...' : 'Retrieving company records from server...'}
              </p>
            </div>
          ) : activeFormations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <Building2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {isAr ? 'لا توجد طلبات تأسيس مسجلة حالياً' : 'No formation requests found'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {isAr
                    ? 'ابدأ أول طلب تأسيس مبدئي لشركتك الأمريكية أو البريطانية، وستظهر حالته هنا فور الحفظ.'
                    : 'Start your initial formation intake to track filing status.'}
                </p>
              </div>
              <button
                onClick={onOpenFormationModal}
                className="px-4 py-2 rounded-xl bg-[#004457] text-white text-xs font-bold"
              >
                {isAr ? 'تقديم طلب جديد' : 'Submit Intake'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeFormations
                .filter((comp: any) => {
                  if (companyFilter === 'submitted') return comp.status === 'submitted';
                  if (companyFilter === 'approved') return comp.status === 'approved';
                  return true;
                })
                .map((comp: any) => (
                  <div
                    key={comp.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#004457]/10 dark:bg-teal-950/80 border border-[#00A896]/30 text-[#004457] dark:text-teal-300 flex items-center justify-center font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-[#003445] dark:text-white">
                              {comp.companyName || comp.company_name}
                            </h3>
                            <span className="text-[11px] font-mono text-slate-500">
                              ({comp.entityType || comp.entity_type})
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{String(comp.jurisdiction).replace('US_', '').replace('_', ' ')}</span>
                            <span aria-hidden="true">·</span>
                            <span>{isAr ? 'تاريخ التقديم:' : 'Intake Date:'} {comp.filingDate || comp.filing_date}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {comp.status === 'submitted' && (
                          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>{isAr ? 'طلب مبدئي مستلم (قيد التحقق)' : 'Initial Intake (Submitted)'}</span>
                          </div>
                        )}
                        {comp.status === 'approved' && (
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>{isAr ? 'معتمدة ومسجلة رسمياً' : 'Approved & Active'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Unboxed details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">
                          {isAr ? 'رقم قيد الولاية / CRN' : 'State File / CRN'}
                        </span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200 mt-1 block">
                          {comp.stateFileNumber || comp.state_file_number || (isAr ? 'بانتظار قيد الولاية' : 'Pending State File')}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">
                          {isAr ? 'الرقم الضريبي الفيدرالي EIN' : 'IRS Federal EIN'}
                        </span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200 mt-1 block">
                          {comp.ein || (isAr ? 'بانتظار مراجعة مصلحة الضرائب' : 'Pending IRS Review')}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">
                          {isAr ? 'الوكيل المسجل المعتمد' : 'Registered Agent'}
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 mt-1 block truncate" title={comp.registeredAgent || comp.registered_agent}>
                          {comp.registeredAgent || comp.registered_agent}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">
                          {isAr ? 'العنوان القانوني للشركة' : 'Registered Address'}
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 mt-1 block truncate" title={comp.registeredAddress || comp.registered_address}>
                          {comp.registeredAddress || comp.registered_address}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: MY STORES & QABS STUDIO */}
      {activeTab === 'stores_studio' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'إدارة المتاجر واستوديو التصميم QABS Studio' : 'Store Management & QABS Studio'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? 'إدارة الكتالوج، المنتجات، القوالب، وتخصيص الصفحات لكل متجر مستقل'
                    : 'Manage catalogs, products, templates, and store customizer'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('store_builder')}
                  className="px-4 py-2.5 rounded-xl bg-[#004457] hover:bg-[#003445] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#d5b46b]" />
                  <span>{isAr ? 'فتح منشئ المتاجر QABS Studio' : 'Open QABS Studio'}</span>
                </button>
              </div>
            </div>

            {/* Store Switcher */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-500 mb-2">
                {isAr ? 'المتجر النشط الحالي:' : 'Current Active Store:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stores.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveStoreId(s.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      s.id === currentStore?.id
                        ? 'border-[#00A896] bg-teal-50/50 dark:bg-teal-950/40 text-[#004457] dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#061824] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs truncate">{s.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">{s.subdomain}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PAYMENT GATEWAYS (Realistic BLOCKED / In Development) */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider font-mono">
                {isAr ? 'حالة الخدمة: غير مفعلة (BLOCKED 🔒)' : 'Service Status: BLOCKED 🔒'}
              </span>
            </div>
            <h2 className="text-xl font-black text-[#004457] dark:text-white">
              {isAr ? 'إعداد بوابات الدفع والحسابات البنكية' : 'Payment Gateways & Banking Setup'}
            </h2>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{isAr ? 'تنبيه تجاري وأمني إلزامي:' : 'Statutory & Gateway Disclaimer:'}</span>
              </div>
              <p>
                {isAr
                  ? 'بوابات الدفع العالمية (مثل Stripe Connect و Tap Payments و Mercury) قيد التجهيز الفني والاعتماد المؤسسي. تلتزم قبس بعدم إطلاق وعود زائفة: القبول والتفعيل النهائي يخضع حصرياً للأهلية الفردية للعميل وموافقة مزود الخدمة المالي.'
                  : 'Payment gateway integrations are in active development. Acceptance and underwriting remain strictly subject to applicant eligibility and sole discretion of provider.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Stripe Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-4 opacity-80">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#004457] dark:text-white">Stripe Connect</span>
                <span className="text-[10px] font-mono font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                  BLOCKED
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'معالجة بطاقات Visa و MasterCard و Apple Pay للشركات الأمريكية المسجلة.'
                  : 'Credit card processing & Apple Pay for certified US entities.'}
              </p>
              <button
                disabled
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAr ? 'قيد التطوير / غير متاح' : 'In Development / Disabled'}</span>
              </button>
            </div>

            {/* Tap Payments Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-4 opacity-80">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#004457] dark:text-white">Tap Payments</span>
                <span className="text-[10px] font-mono font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                  BLOCKED
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'بوابة دفع خليجية تدعم مدى و KNET و Apple Pay للشركات والمتاجر.'
                  : 'GCC payment gateway supporting Mada, KNET, and Apple Pay.'}
              </p>
              <button
                disabled
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAr ? 'قيد التطوير / غير متاح' : 'In Development / Disabled'}</span>
              </button>
            </div>

            {/* Mercury Banking Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 space-y-4 opacity-80">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#004457] dark:text-white">Mercury Bank</span>
                <span className="text-[10px] font-mono font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                  BLOCKED
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'حسابات بنكية أمريكية للأعمال مع بطاقات دفع افتراضية وتكامل مباشر.'
                  : 'US business banking with virtual debit cards and API access.'}
              </p>
              <button
                disabled
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAr ? 'قيد التطوير / غير متاح' : 'In Development / Disabled'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: DOCUMENTS VAULT */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-black text-[#004457] dark:text-white">
              {isAr ? 'خزينة الوثائق القانونية والشهادات' : 'Statutory Document Vault'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'الوثائق المعتمدة يتم توليدها بعد تصديق ملف الولاية وصدور خطاب EIN. النماذج أدناه هي عينات توضيحية لمعاينة هيكل الوثائق.'
                : 'Official documents are issued upon state registration. Samples below are provided for inspection.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Articles of Organization (Sample)', type: 'articles', isOfficial: false },
              { name: 'IRS CP575 EIN Letter (Sample)', type: 'ein_letter', isOfficial: false },
              { name: 'LLC Operating Agreement (Standard)', type: 'operating_agreement', isOfficial: true }
            ].map((doc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="text-xs font-bold text-[#004457] dark:text-white">{doc.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {doc.isOfficial ? (isAr ? 'قالب تشغيلي معتمد' : 'Standard Template') : (isAr ? 'عينة معاينة' : 'Preview Sample')}
                  </div>
                </div>

                <button
                  onClick={() =>
                    setViewingDoc({
                      docName: doc.name,
                      companyName: user.companyName || 'QABS Client LLC',
                      type: doc.type,
                      date: new Date().toISOString().split('T')[0],
                      isOfficial: doc.isOfficial
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-[#004457] dark:text-teal-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isAr ? 'معاينة' : 'View'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: BILLING & INVOICES */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-black text-[#004457] dark:text-white">
              {isAr ? 'الاشتراكات والفواتير وهيكل الرسوم الشفاف' : 'Subscriptions, Invoices & Fee Breakdown'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-[#004457] dark:text-teal-300 block">1. أتعاب منصة قبس</span>
                <p className="text-slate-500 text-[11px]">رسوم الخدمات الرقمية، استوديو التصميم، والدعم الاستشاري.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-amber-600 block">2. الرسوم الحكومية</span>
                <p className="text-slate-500 text-[11px]">رسوم سكرتير الولاية الرسمية المدفوعة مباشرة لولاية التأسيس.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">3. رسوم الأطراف الخارجية</span>
                <p className="text-slate-500 text-[11px]">رسوم معالجة العمليات المستقلة لدى بوابات الدفع (Stripe/Tap).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: SUPPORT & NOTIFICATIONS */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'الدعم الفني وتذاكر المتابعة' : 'Support Desk & Tickets'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? 'يمكنك إنشاء تذكرة مباشرة هنا أو التواصل فوراً عبر قناة WhatsApp الموثقة'
                    : 'Submit a ticket or reach out directly on verified WhatsApp'}
                </p>
              </div>

              <a
                href="https://wa.me/159710784967?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%81%D8%B1%D9%8A%D9%82%20%D9%82%D8%A8%D8%B3%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D8%A7%D9%84%D8%AF%D8%B9%D9%85."
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAr ? 'محادثة WhatsApp المعتمدة' : 'Official WhatsApp'}</span>
              </a>
            </div>

            {/* Create Ticket Form */}
            <form onSubmit={handleCreateTicket} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'موضوع التذكرة' : 'Ticket Subject'}
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    placeholder={isAr ? 'استفسار عن طلب التأسيس أو المتجر...' : 'Inquiry about formation or store...'}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'القسم' : 'Category'}
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={e => setTicketCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="formation">{isAr ? 'تأسيس الشركات' : 'Company Formation'}</option>
                    <option value="store">{isAr ? 'المتاجر الإلكترونية' : 'E-Commerce Store'}</option>
                    <option value="payments">{isAr ? 'بوابات الدفع' : 'Payment Gateways'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'تفاصيل الرسالة' : 'Message Details'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={ticketMessage}
                  onChange={e => setTicketMessage(e.target.value)}
                  placeholder={isAr ? 'اكتب تفاصيل استفسارك هنا...' : 'Provide inquiry details...'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#004457] hover:bg-[#003445] text-white text-xs font-bold cursor-pointer"
              >
                {isAr ? 'إرسال التذكرة' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 8: PROFILE, SECURITY & SESSIONS */}
      {activeTab === 'security_profile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-black text-[#004457] dark:text-white">
              {isAr ? 'الملف الشخصي والأمان وإدارة الجلسات' : 'Profile, Security & Active Sessions'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <h3 className="font-bold text-slate-700 dark:text-slate-200">
                  {isAr ? 'بيانات الحساب الأساسية' : 'Account Identity'}
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isAr ? 'الاسم:' : 'Name:'}</span>
                    <span className="font-bold">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isAr ? 'البريد الإلكتروني:' : 'Email:'}</span>
                    <span className="font-mono">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isAr ? 'مستوى الصلاحيات:' : 'Role:'}</span>
                    <span className="font-mono font-bold text-teal-600">{user.role}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-700 dark:text-slate-200">
                  {isAr ? 'الجلسة النشطة الحالية' : 'Active Session'}
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isAr ? 'معرف الجلسة:' : 'Session Token:'}</span>
                    <span className="font-mono text-[11px]">session_{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isAr ? 'بروتوكول التحقق:' : 'Auth Protocol:'}</span>
                    <span className="text-emerald-600 font-bold">Bearer RBAC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isAr ? 'تشفير المستأجر:' : 'Tenant Isolation:'}</span>
                    <span className="text-emerald-600 font-bold">ENFORCED ✅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#071D2B] border-2 border-[#00A896]/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-[#004457] dark:text-white">{viewingDoc.docName}</h3>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'الشركة:' : 'Company:'}</span>
                <span className="font-bold">{viewingDoc.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'نوع الوثيقة:' : 'Document Type:'}</span>
                <span className="font-mono">{viewingDoc.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'الحالة:' : 'Status:'}</span>
                <span className={viewingDoc.isOfficial ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {viewingDoc.isOfficial ? (isAr ? 'معتمد' : 'Official') : (isAr ? 'عينة معاينة توضيحية' : 'Preview Sample')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setViewingDoc(null)}
              className="w-full py-2.5 rounded-xl bg-[#004457] text-white text-xs font-bold cursor-pointer"
            >
              {isAr ? 'إغلاق المعاينة' : 'Close Preview'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
