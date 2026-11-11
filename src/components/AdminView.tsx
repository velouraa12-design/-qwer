import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { SUBSCRIPTION_PLANS } from '../data/mockData.ts';
import {
  ShieldCheck,
  Store,
  FilePlus2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Palette,
  Users,
  CreditCard,
  Globe,
  LifeBuoy,
  BarChart3,
  History,
  Database,
  Plus,
  Eye
} from 'lucide-react';

type CentralAdminTab =
  | 'all_stores'
  | 'creation_requests'
  | 'approvals'
  | 'templates'
  | 'clients'
  | 'subscriptions'
  | 'payments'
  | 'domains'
  | 'support'
  | 'reports'
  | 'audit_logs';

export const AdminView: React.FC = () => {
  const {
    language,
    setMode,
    stores,
    setActiveStoreId,
    reviewStoreApproval,
    approveStorePayment,
    verifyStoreDomain,
    storeTemplates,
    addStoreTemplate,
    tickets,
    resolveTicket,
    auditLogs,
    triggerSystemBackup,
    products,
    orders,
    invoices
  } = useApp();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<CentralAdminTab>('all_stores');
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});

  // Add Template state
  const [tplNameAr, setTplNameAr] = useState('');
  const [tplCategoryAr, setTplCategoryAr] = useState('متاجر التجزئة والماركات');
  const [tplPrimary, setTplPrimary] = useState('#004457');
  const [tplAccent, setTplAccent] = useState('#C8A24A');

  const pendingCreationStores = stores.filter(
    s => s.approvalStatus === 'pending_review' || s.approvalStatus === 'draft' || s.approvalStatus === 'changes_requested'
  );
  const pendingPaymentStores = stores.filter(s => s.paymentApprovalStatus === 'pending_admin_approval');

  const adminSections: {
    id: CentralAdminTab;
    labelAr: string;
    labelEn: string;
    descAr: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'all_stores', labelAr: 'جميع المتاجر', labelEn: 'All Stores', descAr: 'عرض المتاجر وحالتها', icon: Store, badge: stores.length },
    { id: 'creation_requests', labelAr: 'طلبات الإنشاء', labelEn: 'Creation Requests', descAr: 'مراجعة المتاجر الجديدة', icon: FilePlus2, badge: pendingCreationStores.length },
    { id: 'approvals', labelAr: 'الموافقات', labelEn: 'Approvals', descAr: 'قبول أو رفض أو طلب تعديلات', icon: ShieldCheck, badge: stores.filter(s => s.approvalStatus === 'pending_review').length },
    { id: 'templates', labelAr: 'القوالب', labelEn: 'Templates', descAr: 'إضافة وتعديل قوالب المتاجر', icon: Palette, badge: storeTemplates.length },
    { id: 'clients', labelAr: 'العملاء', labelEn: 'Clients', descAr: 'إدارة حسابات العملاء', icon: Users, badge: stores.length },
    { id: 'subscriptions', labelAr: 'الاشتراكات', labelEn: 'Subscriptions', descAr: 'الباقات والتجديدات', icon: CreditCard },
    { id: 'payments', labelAr: 'المدفوعات', labelEn: 'Payments', descAr: 'مراجعة وتفعيل بوابات الدفع', icon: CreditCard, badge: pendingPaymentStores.length },
    { id: 'domains', labelAr: 'النطاقات', labelEn: 'Domains', descAr: 'مراجعة وتأكيد النطاقات', icon: Globe },
    { id: 'support', labelAr: 'الدعم', labelEn: 'Support', descAr: 'تذاكر الدعم الفني', icon: LifeBuoy, badge: tickets.filter(t => t.status !== 'resolved').length },
    { id: 'reports', labelAr: 'التقارير', labelEn: 'Reports', descAr: 'إحصائيات المنصة', icon: BarChart3 },
    { id: 'audit_logs', labelAr: 'سجل العمليات', labelEn: 'Audit Logs', descAr: 'تتبع جميع التغييرات والنسخ الاحتياطي', icon: History, badge: auditLogs.length }
  ];

  const totalPlatformGMV = stores.reduce((acc, s) => acc + s.totalRevenue, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Central Control Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#03131D] via-[#004457] to-[#03131D] text-white p-6 border border-cyan-900 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A24A]/20 border border-[#C8A24A]/40 text-[#E5C158] text-xs font-black">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isAr
                ? '4. لوحة إدارة قبس المركزية (QABS Control Center)'
                : '4. QABS Central Control Center'}
            </span>
          </div>
          <h1 className="text-2xl font-black">
            {isAr
              ? 'الإدارة المركزية لجميع متاجر العملاء، الموافقات، بوابات الدفع، والقوالب'
              : 'Central Governance for All Client Stores, Approvals, Payments & Templates'}
          </h1>
          <p className="text-xs text-teal-100">
            {isAr
              ? 'حوكمة كاملة: لا يتم نشر أي متجر أو تفعيل بوابة دفع إلا باعتماد يدوي مباشر من هذه اللوحة'
              : 'Strict governance: No store is published and no payment gateway is activated without explicit approval here'}
          </p>
        </div>

        <button
          onClick={() => triggerSystemBackup('جميع متاجر منصة قبس')}
          className="px-4 py-2.5 rounded-xl bg-[#E5C158] text-slate-950 font-black text-xs hover:bg-[#d8b348] transition-all flex items-center gap-2 cursor-pointer self-start lg:self-center"
        >
          <Database className="w-4 h-4" />
          <span>{isAr ? 'نسخ احتياطي شامل لبيانات المتاجر' : 'Full Multi-Store Backup'}</span>
        </button>
      </div>

      {/* Main Layout: 11-Section Sidebar + Active Admin Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: 11 Required Admin Sections */}
        <aside className="lg:col-span-3">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-1 shadow-sm">
            <div className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 mb-1">
              {isAr ? 'أقسام لوحة قبس (11 قسماً)' : 'QABS Central Admin (11)'}
            </div>
            {adminSections.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#004457] text-white font-bold shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-teal-50/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E5C158]' : 'text-[#00A896]'}`} />
                    <div className="truncate">
                      <div className="text-xs font-bold leading-tight">{isAr ? item.labelAr : item.labelEn}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-teal-200' : 'text-slate-400'}`}>
                        {item.descAr}
                      </div>
                    </div>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Workspace (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* 1. ALL STORES (جميع المتاجر — عرض المتاجر وحالتها) */}
          {activeTab === 'all_stores' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#004457] dark:text-white">
                    {isAr ? 'جميع متاجر العملاء المسجلة في المنصة' : 'All Client Stores on Platform'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? 'عرض حالة كل متجر، مالكه، عدد منتجاته المعزولة، وحالة اعتماده وبوابة الدفع'
                      : 'Overview of all tenant stores, owners, isolated product counts, and approval states'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-50 text-[#004457] text-xs font-black">
                  {stores.length} {isAr ? 'متجر' : 'Stores'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">{isAr ? 'المتجر والنطاق' : 'Store & Subdomain'}</th>
                      <th className="p-3.5">{isAr ? 'المالك والنشاط' : 'Owner & Activity'}</th>
                      <th className="p-3.5">{isAr ? 'المنتجات / الطلبات' : 'Products / Orders'}</th>
                      <th className="p-3.5">{isAr ? 'حالة اعتماد المتجر' : 'Publication Approval'}</th>
                      <th className="p-3.5">{isAr ? 'بوابة الدفع' : 'Payment Status'}</th>
                      <th className="p-3.5">{isAr ? 'معاينة' : 'Inspect'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stores.map(st => {
                      const prodCount = products.filter(p => p.storeId === st.id).length;
                      const ordCount = orders.filter(o => o.storeId === st.id).length;
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                          <td className="p-3.5">
                            <div className="font-black text-[#004457] dark:text-white">{st.name}</div>
                            <div className="font-mono text-[11px] text-[#00A896]">{st.subdomain}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold">{st.ownerName || 'تاجر قبس'}</div>
                            <div className="text-[11px] text-slate-500">{isAr ? st.activityAr : st.activityEn}</div>
                          </td>
                          <td className="p-3.5 font-bold">
                            {prodCount} {isAr ? 'منتج' : 'prods'} / {ordCount} {isAr ? 'طلب' : 'orders'}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                st.approvalStatus === 'approved_published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : st.approvalStatus === 'pending_review'
                                  ? 'bg-amber-100 text-amber-800'
                                  : st.approvalStatus === 'changes_requested'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {st.approvalStatus === 'approved_published'
                                ? isAr
                                  ? 'معتمد ومنشور'
                                  : 'Approved'
                                : st.approvalStatus === 'pending_review'
                                ? isAr
                                  ? 'بانتظار الموافقة'
                                  : 'Pending Review'
                                : st.approvalStatus === 'changes_requested'
                                ? isAr
                                  ? 'مطلوب تعديلات'
                                  : 'Changes Requested'
                                : isAr
                                ? 'مسودة'
                                : 'Draft'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                st.paymentApprovalStatus === 'approved_active'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {st.gatewayType} ({st.paymentApprovalStatus === 'approved_active' ? (isAr ? 'مفعل' : 'Active') : isAr ? 'غير مفعل' : 'Pending'})
                            </span>
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => {
                                setActiveStoreId(st.id);
                                setMode('portal');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#004457] text-white text-[11px] font-bold cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{isAr ? 'فتح لوحة المتجر' : 'Open Store'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. CREATION REQUESTS (طلبات الإنشاء — مراجعة المتاجر الجديدة) */}
          {activeTab === 'creation_requests' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'طلبات إنشاء المتاجر الجديدة' : 'New Store Creation Requests'}
              </h2>
              <div className="space-y-3">
                {stores.map(st => (
                  <div
                    key={st.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-black text-[#004457] dark:text-white">
                        {st.name} ({st.subdomain})
                      </div>
                      <div className="text-xs text-slate-500">
                        {isAr ? 'المالك:' : 'Owner:'} {st.ownerName} ({st.ownerEmail}) •{' '}
                        {isAr ? 'تاريخ الإنشاء:' : 'Created:'} {st.createdAt}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('approvals')}
                      className="px-4 py-2 rounded-xl bg-[#004457] text-white text-xs font-bold cursor-pointer"
                    >
                      {isAr ? 'الانتقال لاتخاذ قرار الاعتماد ←' : 'Go to Approval Decision →'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. APPROVALS (الموافقات — قبول أو رفض أو طلب تعديلات — عدم نشر متجر قبل الاعتماد) */}
          {activeTab === 'approvals' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr
                    ? 'بوابة الموافقات واعتماد نشر المتاجر (قبول / رفض / طلب تعديلات)'
                    : 'Store Publication Approvals (Approve / Request Changes / Reject)'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'قاعدة حاكمة: لا يتم نشر أي متجر للجمهور قبل مراجعته واعتماده هنا من إدارة قبس'
                    : 'Governance rule: No client store is published publicly prior to explicit approval here'}
                </p>
              </div>

              <div className="space-y-4">
                {stores.map(st => (
                  <div
                    key={st.id}
                    className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-[#004457] dark:text-white">{st.name}</h3>
                          <span className="text-xs font-mono text-[#00A896]">{st.subdomain}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {isAr ? st.activityAr : st.activityEn} • {st.ownerName}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black ${
                          st.approvalStatus === 'approved_published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : st.approvalStatus === 'pending_review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {st.approvalStatus}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder={
                          isAr
                            ? 'ملاحظات المراجعة أو التعديلات المطلوبة من العميل...'
                            : 'Admin feedback or required changes...'
                        }
                        value={feedbackNotes[st.id] || ''}
                        onChange={e => setFeedbackNotes({ ...feedbackNotes, [st.id]: e.target.value })}
                        className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => reviewStoreApproval(st.id, 'approved_published')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'قبول ونشر المتجر' : 'Approve & Publish'}</span>
                        </button>

                        <button
                          onClick={() =>
                            reviewStoreApproval(
                              st.id,
                              'changes_requested',
                              feedbackNotes[st.id] || 'يرجى استكمال صفحة سياسة الاسترجاع وصور المنتجات قبل النشر'
                            )
                          }
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{isAr ? 'طلب تعديلات' : 'Request Changes'}</span>
                        </button>

                        <button
                          onClick={() =>
                            reviewStoreApproval(st.id, 'rejected', feedbackNotes[st.id] || 'مخالفة شروط المتاجر')
                          }
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isAr ? 'رفض' : 'Reject'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. TEMPLATES (القوالب — إضافة وتعديل قوالب المتاجر) */}
          {activeTab === 'templates' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'إدارة قوالب المتاجر في QABS Studio' : 'Manage QABS Studio Store Templates'}
              </h2>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!tplNameAr.trim()) return;
                  addStoreTemplate({
                    nameAr: tplNameAr,
                    nameEn: tplNameAr,
                    categoryAr: tplCategoryAr,
                    categoryEn: tplCategoryAr,
                    theme: 'gold_executive',
                    primaryColor: tplPrimary,
                    accentColor: tplAccent,
                    fontFamily: 'Cairo',
                    previewImage:
                      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
                    active: true
                  });
                  setTplNameAr('');
                }}
                className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'اسم القالب الجديد *' : 'Template Name *'}
                  value={tplNameAr}
                  onChange={e => setTplNameAr(e.target.value)}
                  className="sm:col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  placeholder={isAr ? 'النشاط' : 'Category'}
                  value={tplCategoryAr}
                  onChange={e => setTplCategoryAr(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tplPrimary}
                    onChange={e => setTplPrimary(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="color"
                    value={tplAccent}
                    onChange={e => setTplAccent(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-[#004457] text-white text-xs font-black py-2 px-4 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? 'نشر القالب' : 'Publish Template'}</span>
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {storeTemplates.map(tpl => (
                  <div
                    key={tpl.id}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <img src={tpl.previewImage} alt="" className="w-full h-28 object-cover rounded-xl" />
                    <div className="text-xs font-black text-[#004457] dark:text-white">
                      {isAr ? tpl.nameAr : tpl.nameEn}
                    </div>
                    <div className="text-[11px] text-slate-500">{isAr ? tpl.categoryAr : tpl.categoryEn}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. CLIENTS (العملاء — إدارة حسابات العملاء ومالكي المتاجر) */}
          {activeTab === 'clients' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'إدارة حسابات العملاء ومالكي المتاجر' : 'Merchant Accounts & Store Owners'}
              </h2>
              <div className="space-y-3">
                {stores.map(st => (
                  <div
                    key={st.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-black text-[#004457] dark:text-white">{st.ownerName}</div>
                      <div className="text-slate-500">
                        {st.ownerEmail} • {isAr ? 'يدير متجر:' : 'Owns:'} {st.name}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-teal-50 text-[#004457] font-bold">
                      {st.country} / {st.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. SUBSCRIPTIONS (الاشتراكات — الباقات والتجديدات) */}
          {activeTab === 'subscriptions' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'إدارة باقات واشتراكات متاجر قبس' : 'QABS Store Subscription Plans & Renewals'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBSCRIPTION_PLANS.map(pl => (
                  <div key={pl.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-sm font-black text-[#004457] dark:text-white">
                      {isAr ? pl.nameAr : pl.nameEn}
                    </div>
                    <div className="text-xl font-black text-[#00A896]">${pl.priceMonthly}/mo</div>
                    <p className="text-xs text-slate-500">{isAr ? pl.descriptionAr : pl.descriptionEn}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-black text-slate-500">
                  {isAr ? 'أحدث فواتير وتجديدات المتاجر:' : 'Recent Store Subscription Invoices:'}
                </h3>
                {invoices.map(inv => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold">{inv.invoiceNumber}</span> — {inv.clientName}
                    </div>
                    <div className="font-black text-emerald-600">${inv.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. PAYMENTS (المدفوعات — مراجعة وتفعيل بوابات الدفع يدوياً) */}
          {activeTab === 'payments' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr
                    ? 'مراجعة وتفعيل بوابات الدفع للمتاجر (التحقق اليدوي الإلزامي)'
                    : 'Manual Verification & Activation of Store Payment Gateways'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'قاعدة عدم تفعيل بوابة دفع تلقائيًا: تظل بوابات الدفع معلقة حتى تعتمدها إدارة قبس هنا'
                    : 'No automatic payment gateway activation: Admin must verify KYC and approve below'}
                </p>
              </div>

              <div className="space-y-3">
                {stores.map(st => (
                  <div
                    key={st.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-black text-[#004457] dark:text-white">
                        {st.name} — <span className="text-[#00A896]">{st.gatewayType}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {isAr ? 'حالة التفعيل:' : 'Gateway Status:'} {st.paymentApprovalStatus}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveStorePayment(st.id, true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black cursor-pointer"
                      >
                        {isAr ? 'اعتماد وتفعيل البوابة' : 'Approve & Activate'}
                      </button>
                      <button
                        onClick={() => approveStorePayment(st.id, false)}
                        className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                      >
                        {isAr ? 'إيقاف' : 'Suspend'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. DOMAINS (النطاقات — مراجعة وتأكيد النطاقات) */}
          {activeTab === 'domains' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'مراجعة وتأكيد النطاقات المستقلة للمتاجر (DNS & SSL)' : 'Verify Store Custom Domains'}
              </h2>
              <div className="space-y-3">
                {stores.map(st => (
                  <div
                    key={st.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-black text-[#004457] dark:text-white">{st.name}</div>
                      <div className="font-mono text-slate-500">
                        {st.customDomain || st.subdomain}
                      </div>
                    </div>
                    <button
                      onClick={() => verifyStoreDomain(st.id)}
                      className={`px-4 py-2 rounded-xl font-black cursor-pointer ${
                        st.domainVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#004457] text-white'
                      }`}
                    >
                      {st.domainVerified
                        ? isAr
                          ? 'النطاق موثق و SSL فعال ✓'
                          : 'Verified ✓'
                        : isAr
                        ? 'تأكيد CNAME وتفعيل SSL'
                        : 'Verify DNS & SSL'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. SUPPORT (الدعم — تذاكر الدعم الفني) */}
          {activeTab === 'support' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'تذاكر الدعم الفني للمتاجر' : 'Stores Technical Support Tickets'}
              </h2>
              <div className="space-y-3">
                {tickets.map(t => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-black text-[#004457] dark:text-white">
                        {t.ticketNumber} — {t.subject}
                      </div>
                      <div className="text-slate-500">
                        {t.clientName} • {t.updatedAt}
                      </div>
                    </div>
                    {t.status !== 'resolved' ? (
                      <button
                        onClick={() => resolveTicket(t.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                      >
                        {isAr ? 'إغلاق وحل التذكرة' : 'Resolve'}
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">
                        {isAr ? 'تم الحل' : 'Resolved'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. REPORTS (التقارير — إحصائيات المنصة) */}
          {activeTab === 'reports' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'تقارير وإحصائيات منصة متاجر قبس' : 'QABS Stores Platform Reports'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border">
                  <div className="text-xs text-slate-500">{isAr ? 'إجمالي المتاجر' : 'Total Stores'}</div>
                  <div className="text-2xl font-black text-[#004457] dark:text-white mt-1">{stores.length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border">
                  <div className="text-xs text-slate-500">{isAr ? 'إجمالي المنتجات المعزولة' : 'Total Products'}</div>
                  <div className="text-2xl font-black text-[#004457] dark:text-white mt-1">{products.length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border">
                  <div className="text-xs text-slate-500">{isAr ? 'إجمالي الطلبات' : 'Total Orders'}</div>
                  <div className="text-2xl font-black text-[#004457] dark:text-white mt-1">{orders.length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
                  <div className="text-xs text-emerald-800 font-bold">{isAr ? 'حجم مبيعات المتاجر GMV' : 'Platform GMV'}</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">${totalPlatformGMV.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* 11. AUDIT LOGS (سجل العمليات — تتبع جميع التغييرات) */}
          {activeTab === 'audit_logs' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'سجل العمليات المركزي والنسخ الاحتياطي' : 'Central Audit Logs & Backups'}
                </h2>
                <button
                  onClick={() => triggerSystemBackup('نسخة فورية شاملة')}
                  className="px-3.5 py-2 rounded-xl bg-[#004457] text-white text-xs font-bold cursor-pointer"
                >
                  {isAr ? '+ أخذ نسخة احتياطية الآن' : '+ Run Backup Now'}
                </button>
              </div>
              <div className="space-y-2.5">
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#004457] dark:text-white">
                        {isAr ? log.actionAr : log.actionEn}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {log.actor} • <span className="font-mono">{log.target}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
