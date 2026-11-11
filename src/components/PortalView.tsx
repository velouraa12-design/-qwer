import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  Palette,
  FileText,
  ShoppingBag,
  Package,
  Truck,
  Users,
  Tag,
  CreditCard,
  Globe,
  Puzzle,
  BarChart3,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Lock,
  ShieldCheck,
  Database,
  RefreshCw,
  Barcode,
  Building2,
  Download,
  Copy,
  ExternalLink,
  X,
  FileCheck
} from 'lucide-react';

interface PortalViewProps {
  onOpenFormationModal: () => void;
  onOpenStoreModal: () => void;
}

type ClientTab =
  | 'overview'
  | 'my_stores'
  | 'create_store'
  | 'store_design'
  | 'pages'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'discounts'
  | 'payments'
  | 'shipping'
  | 'domains'
  | 'apps'
  | 'analytics'
  | 'settings'
  | 'company_formation';

export const PortalView: React.FC<PortalViewProps> = ({ onOpenStoreModal, onOpenFormationModal }) => {
  const {
    language,
    setMode,
    stores,
    activeStoreId,
    setActiveStoreId,
    addStore,
    updateStoreDetails,
    submitStoreForApproval,
    requestPaymentActivation,
    requestDomainVerification,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    issueRefund,
    customers,
    addCustomer,
    discounts,
    addDiscount,
    toggleDiscountStatus,
    shippingZones,
    addShippingZone,
    storePages,
    saveStorePage,
    deleteStorePage,
    storeApps,
    toggleStoreApp,
    storeTemplates,
    staff,
    addStaff,
    triggerSystemBackup,
    user,
    companies
  } = useApp();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<ClientTab>('overview');

  // Strictly isolated data for the active store (`storeId === activeStoreId`)
  const currentStore = stores.find(s => s.id === activeStoreId) || stores[0];
  const storeProducts = products.filter(p => p.storeId === currentStore?.id);
  const storeOrders = orders.filter(o => o.storeId === currentStore?.id);
  const storeCustomers = customers.filter(c => c.storeId === currentStore?.id);
  const storeDiscounts = discounts.filter(d => d.storeId === currentStore?.id);
  const storeShipping = shippingZones.filter(z => z.storeId === currentStore?.id);
  const currentStorePages = storePages.filter(p => p.storeId === currentStore?.id);

  // Local state for Section 3: Inline Create Store form
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreSubdomain, setNewStoreSubdomain] = useState('');
  const [newStoreActivity, setNewStoreActivity] = useState('الأزياء والعطور والمنتجات الفاخرة');
  const [newStoreCountry, setNewStoreCountry] = useState('SA');
  const [newStoreLang, setNewStoreLang] = useState<'ar' | 'en' | 'both'>('both');
  const [newStoreCurrency, setNewStoreCurrency] = useState('SAR');
  const [newStoreTemplate, setNewStoreTemplate] = useState(storeTemplates[0]?.id || 'tpl_luxury_gold');

  // Local state for Section 6: Add Product
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodPrice, setProdPrice] = useState('290');
  const [prodCost, setProdCost] = useState('140');
  const [prodSku, setProdSku] = useState('QBS-ITEM-101');
  const [prodBarcode, setProdBarcode] = useState('6281000991201');
  const [prodStock, setProdStock] = useState('25');
  const [prodCategory, setProdCategory] = useState('العطور الفاخرة');
  const [prodType, setProdType] = useState<'physical' | 'digital'>('physical');
  const [prodWarehouse, setProdWarehouse] = useState('مستودع الرياض الرئيسي');
  const [prodVariantLabel, setProdVariantLabel] = useState('100 مل / إصدار ملكي');

  // Local state for Section 5: Pages
  const [pageTitleAr, setPageTitleAr] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContentAr, setPageContentAr] = useState('');

  // Local state for Section 9: Add Customer
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('+966 50 000 0000');
  const [custCity, setCustCity] = useState('الرياض');

  // Local state for Section 10: Add Discount
  const [discCode, setDiscCode] = useState('');
  const [discValue, setDiscValue] = useState('15');
  const [discType, setDiscType] = useState<'percentage' | 'fixed'>('percentage');

  // Local state for Section 12: Add Shipping Zone
  const [shipRegionAr, setShipRegionAr] = useState('');
  const [shipCarrier, setShipCarrier] = useState('DHL Express / SMSA');
  const [shipRate, setShipRate] = useState('25');
  const [shipTime, setShipTime] = useState('1 - 3 أيام عمل');

  // Local state for Section 13: Custom Domain
  const [domainInput, setDomainInput] = useState(currentStore?.customDomain || '');

  // Local state for Section 16: Add Store Staff
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');

  // Local state for Company Formation Section
  const [companyFilter, setCompanyFilter] = useState<'all' | 'approved' | 'in_progress'>('all');
  const [viewingDoc, setViewingDoc] = useState<{ docName: string; companyName: string; type: string; date: string; jurisdiction?: string; ein?: string; fileNumber?: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sidebarItems: { id: ClientTab; labelAr: string; labelEn: string; descAr: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'overview', labelAr: 'الرئيسية', labelEn: 'Overview', descAr: 'ملخص المبيعات والطلبات', icon: LayoutDashboard },
    { id: 'my_stores', labelAr: 'متاجري', labelEn: 'My Stores', descAr: 'إنشاء عدة متاجر وإدارتها', icon: Store, badge: stores.length },
    { id: 'create_store', labelAr: 'إنشاء متجر', labelEn: 'Create Store', descAr: 'الاسم والنشاط واللغة والعملة', icon: PlusCircle },
    { id: 'store_design', labelAr: 'تصميم المتجر', labelEn: 'Store Design', descAr: 'القوالب والألوان والخطوط', icon: Palette },
    { id: 'pages', labelAr: 'الصفحات', labelEn: 'Pages', descAr: 'الرئيسية، من نحن، اتصل بنا', icon: FileText, badge: currentStorePages.length },
    { id: 'products', labelAr: 'المنتجات', labelEn: 'Products', descAr: 'إضافة وتعديل وحذف وتصنيف', icon: ShoppingBag, badge: storeProducts.length },
    { id: 'inventory', labelAr: 'المخزون', labelEn: 'Inventory', descAr: 'الكميات والتنبيهات', icon: Package },
    { id: 'orders', labelAr: 'الطلبات', labelEn: 'Orders', descAr: 'متابعة وتجهيز وشحن', icon: Truck, badge: storeOrders.length },
    { id: 'customers', labelAr: 'العملاء', labelEn: 'Customers', descAr: 'بيانات العملاء وسجل مشترياتهم', icon: Users, badge: storeCustomers.length },
    { id: 'discounts', labelAr: 'الخصومات', labelEn: 'Discounts', descAr: 'كوبونات وعروض', icon: Tag, badge: storeDiscounts.length },
    { id: 'payments', labelAr: 'الدفع', labelEn: 'Payments', descAr: 'إعداد وربط بوابات الدفع', icon: CreditCard },
    { id: 'shipping', labelAr: 'الشحن', labelEn: 'Shipping', descAr: 'المناطق والأسعار وطرق التوصيل', icon: Truck, badge: storeShipping.length },
    { id: 'domains', labelAr: 'النطاقات', labelEn: 'Domains', descAr: 'ربط نطاق مستقل', icon: Globe },
    { id: 'apps', labelAr: 'التطبيقات', labelEn: 'Apps', descAr: 'تكاملات وإضافات', icon: Puzzle },
    { id: 'analytics', labelAr: 'التحليلات', labelEn: 'Analytics', descAr: 'المبيعات والأداء', icon: BarChart3 },
    { id: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', descAr: 'بيانات المتجر والصلاحيات', icon: Settings },
    { id: 'company_formation', labelAr: 'تأسيس الشركات', labelEn: 'Company Formation', descAr: 'تأسيس الكيانات وإدارة الملفات والوثائق', icon: Building2, badge: companies.length }
  ];

  const handleInlineCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    const tpl = storeTemplates.find(t => t.id === newStoreTemplate) || storeTemplates[0];
    addStore({
      name: newStoreName,
      ownerName: user.name,
      ownerEmail: user.email,
      activityAr: newStoreActivity,
      activityEn: newStoreActivity,
      country: newStoreCountry,
      defaultLanguage: newStoreLang,
      subdomain: `${newStoreSubdomain || 'mystore'}.qabs1.store`,
      currency: newStoreCurrency,
      taxRate: newStoreCountry === 'SA' ? 15 : newStoreCountry === 'AE' ? 5 : 0,
      theme: tpl?.theme || 'gold_executive',
      templateId: tpl?.id || 'tpl_luxury_gold',
      primaryColor: tpl?.primaryColor || '#004457',
      accentColor: tpl?.accentColor || '#C8A24A',
      fontFamily: tpl?.fontFamily || 'Cairo',
      status: 'draft',
      approvalStatus: 'draft',
      paymentConnected: false,
      paymentApprovalStatus: 'unconfigured',
      gatewayType: 'Tap'
    });
    setNewStoreName('');
    setNewStoreSubdomain('');
    setActiveTab('overview');
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNameAr.trim() || !currentStore) return;
    addProduct({
      storeId: currentStore.id,
      nameAr: prodNameAr,
      nameEn: prodNameEn || prodNameAr,
      descriptionAr: `منتج أصلي معتمد في ${currentStore.name}`,
      descriptionEn: `Verified product in ${currentStore.name}`,
      price: Number(prodPrice) || 100,
      costPrice: Number(prodCost) || 50,
      sku: prodSku,
      barcode: prodBarcode,
      stock: Number(prodStock) || 10,
      lowStockThreshold: 5,
      warehouse: prodWarehouse,
      category: prodCategory,
      productType: prodType,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
      variants: [
        {
          id: `var_${Date.now()}`,
          nameAr: prodVariantLabel,
          nameEn: prodVariantLabel,
          sku: `${prodSku}-V1`,
          price: Number(prodPrice) || 100,
          stock: Number(prodStock) || 10
        }
      ]
    });
    setProdNameAr('');
    setProdNameEn('');
  };

  if (!currentStore) return null;

  const totalCostValue = storeProducts.reduce((acc, p) => acc + (p.costPrice || p.price * 0.5) * p.salesCount, 0);
  const totalSalesRevenue = storeOrders
    .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((acc, o) => acc + o.total, 0);
  const estimatedTax = Math.round(totalSalesRevenue * ((currentStore.taxRate || 15) / 100));
  const netProfit = Math.max(0, totalSalesRevenue - totalCostValue - estimatedTax);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Active Store Banner & Multi-Store Switcher */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#004457] via-[#005B70] to-[#004457] text-white p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border border-white/20 shrink-0 shadow-inner"
            style={{ backgroundColor: currentStore.accentColor || '#00A896' }}
          >
            {currentStore.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#E5C158]">
                {isAr ? '1. لوحة العميل — متجر مستقل معزول البيانات' : '1. Client Dashboard — Isolated Store Instance'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                  currentStore.approvalStatus === 'approved_published'
                    ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/40'
                    : currentStore.approvalStatus === 'pending_review'
                    ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                    : 'bg-white/15 text-slate-200 border border-white/20'
                }`}
              >
                {currentStore.approvalStatus === 'approved_published'
                  ? isAr
                    ? 'معتمد ومنشور رسمياً'
                    : 'Approved & Published'
                  : currentStore.approvalStatus === 'pending_review'
                  ? isAr
                    ? 'قيد مراجعة إدارة قبس'
                    : 'Pending QABS Approval'
                  : currentStore.approvalStatus === 'changes_requested'
                  ? isAr
                    ? 'مطلوب تعديلات قبل النشر'
                    : 'Changes Requested'
                  : isAr
                  ? 'مسودة (غير منشور بعد)'
                  : 'Draft (Unpublished)'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">{currentStore.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-teal-100 mt-1">
              <span className="font-mono">{currentStore.subdomain}</span>
              <span>•</span>
              <span>{isAr ? currentStore.activityAr : currentStore.activityEn}</span>
              <span>•</span>
              <span>
                {isAr ? 'العملة:' : 'Currency:'} {currentStore.currency} ({currentStore.country})
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Switch Store Selector */}
          <select
            value={activeStoreId}
            onChange={e => setActiveStoreId(e.target.value)}
            className="bg-white/10 border border-white/25 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
          >
            {stores.map(s => (
              <option key={s.id} value={s.id} className="text-slate-900">
                {s.name} ({s.subdomain})
              </option>
            ))}
          </select>

          <button
            onClick={() => setMode('store_builder')}
            className="px-4 py-2 rounded-xl bg-[#E5C158] text-slate-950 font-black text-xs hover:bg-[#d8b44c] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Palette className="w-4 h-4" />
            <span>{isAr ? 'فتح منشئ المتاجر QABS Studio' : 'Open QABS Studio'}</span>
          </button>

          {currentStore.approvalStatus !== 'approved_published' &&
            currentStore.approvalStatus !== 'pending_review' && (
              <button
                onClick={() => submitStoreForApproval(currentStore.id)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? 'إرسال المتجر للاعتماد والنشر' : 'Submit Store for Approval'}</span>
              </button>
            )}
        </div>
      </div>

      {/* Admin Feedback Alert if changes requested */}
      {currentStore.adminFeedback && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-black">
                {isAr ? 'ملاحظات مراجعة إدارة قبس المركزية:' : 'QABS Central Admin Review Notes:'}
              </span>{' '}
              {currentStore.adminFeedback}
            </div>
          </div>
          <button
            onClick={() => submitStoreForApproval(currentStore.id)}
            className="px-3 py-1.5 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 cursor-pointer shrink-0"
          >
            {isAr ? 'إعادة الإرسال بعد التعديل' : 'Resubmit Store'}
          </button>
        </div>
      )}

      {/* Main Layout: 16-Section Sidebar + Active Section Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: All 16 Required Client Dashboard Sections */}
        <aside className="lg:col-span-3">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
              {isAr ? 'أقسام لوحة العميل (16 قسماً)' : 'Client Store Sections (16)'}
            </div>
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#004457] text-white font-bold shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-teal-50/60 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E5C158]' : 'text-[#00A896]'}`} />
                    <div className="truncate">
                      <div className="text-xs font-bold leading-tight">{isAr ? item.labelAr : item.labelEn}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
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

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* SECTION 1: OVERVIEW (الرئيسية) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Store KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs text-slate-500 font-bold">
                    {isAr ? 'إجمالي مبيعات المتجر' : 'Store Total Sales'}
                  </div>
                  <div className="text-2xl font-black text-[#004457] dark:text-white mt-1">
                    {totalSalesRevenue.toLocaleString()} <span className="text-xs">{currentStore.currency}</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-2">
                    {isAr ? 'معزول بالكامل لهذا المتجر' : 'Isolated to this store'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs text-slate-500 font-bold">
                    {isAr ? 'الطلبات المسجلة' : 'Store Orders'}
                  </div>
                  <div className="text-2xl font-black text-[#004457] dark:text-white mt-1">
                    {storeOrders.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    {isAr ? 'شاملة التجهيز والشحن والتتبع' : 'Fulfillment & tracking active'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs text-slate-500 font-bold">
                    {isAr ? 'منتجات المتجر النشطة' : 'Store Products'}
                  </div>
                  <div className="text-2xl font-black text-[#004457] dark:text-white mt-1">
                    {storeProducts.length}
                  </div>
                  <div className="text-[11px] text-[#00A896] font-bold mt-2">
                    {isAr ? 'لا تظهر لأي متجر آخر' : 'Zero cross-store leakage'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs text-slate-500 font-bold">
                    {isAr ? 'بوابة الدفع والاعتماد' : 'Payment & Publication'}
                  </div>
                  <div className="text-sm font-black text-[#004457] dark:text-white mt-2">
                    {currentStore.paymentApprovalStatus === 'approved_active'
                      ? `${currentStore.gatewayType} (${isAr ? 'مفعل' : 'Active'})`
                      : currentStore.paymentApprovalStatus === 'pending_admin_approval'
                      ? isAr
                        ? 'بانتظار موافقة قبس'
                        : 'Pending Admin Approval'
                      : isAr
                      ? 'غير مفعل بعد'
                      : 'Not Configured'}
                  </div>
                  <div className="text-[11px] text-amber-600 font-bold mt-2">
                    {isAr ? 'يتطلب اعتماد إدارة قبس' : 'Requires QABS verification'}
                  </div>
                </div>
              </div>

              {/* 8-Step Store Lifecycle Checklist for Current Store */}
              <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#004457] dark:text-white">
                      {isAr ? 'مسار جاهزية واعتماد المتجر (8 خطوات)' : 'Store Launch & Approval Checklist (8 Steps)'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? 'لا يتم نشر المتجر للجمهور أو تفعيل الدفع الإلكتروني إلا بعد استكمال الخطوات واعتماد قبس'
                        : 'Store publication and live payment processing require completing these steps and QABS approval'}
                    </p>
                  </div>
                  {currentStore.approvalStatus !== 'approved_published' && (
                    <button
                      onClick={() => submitStoreForApproval(currentStore.id)}
                      className="px-4 py-2 rounded-xl bg-[#004457] text-white text-xs font-black hover:bg-[#003342] cursor-pointer"
                    >
                      {isAr ? 'طلب اعتماد ونشر المتجر الآن' : 'Request Publication Approval'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { step: 1, title: isAr ? '1. تسجيل العميل' : '1. Client Registered', done: true, tab: 'settings' as ClientTab },
                    { step: 2, title: isAr ? '2. إنشاء متجر جديد' : '2. Store Created', done: true, tab: 'my_stores' as ClientTab },
                    { step: 3, title: isAr ? '3. اختيار القالب' : '3. Template Selected', done: !!currentStore.templateId, tab: 'store_design' as ClientTab },
                    { step: 4, title: isAr ? '4. تخصيص التصميم' : '4. Design Customized', done: true, tab: 'store_design' as ClientTab },
                    { step: 5, title: isAr ? '5. إضافة المنتجات' : '5. Products Added', done: storeProducts.length > 0, tab: 'products' as ClientTab },
                    { step: 6, title: isAr ? '6. إعداد الدفع والشحن' : '6. Payment & Shipping', done: currentStore.paymentApprovalStatus !== 'unconfigured', tab: 'payments' as ClientTab },
                    { step: 7, title: isAr ? '7. إرسال للاعتماد' : '7. Submitted for Review', done: currentStore.approvalStatus === 'pending_review' || currentStore.approvalStatus === 'approved_published', tab: 'overview' as ClientTab },
                    { step: 8, title: isAr ? '8. نشر المتجر بموافقة قبس' : '8. Published by QABS', done: currentStore.approvalStatus === 'approved_published', tab: 'overview' as ClientTab }
                  ].map(st => (
                    <div
                      key={st.step}
                      onClick={() => setActiveTab(st.tab)}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        st.done
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {st.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-[#004457] dark:text-white">{st.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Store Orders & Products Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-[#004457] dark:text-white">
                      {isAr ? 'أحدث طلبات هذا المتجر' : 'Recent Store Orders'}
                    </h4>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#00A896] cursor-pointer"
                    >
                      {isAr ? 'عرض الكل' : 'View All'}
                    </button>
                  </div>
                  {storeOrders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      {isAr ? 'لا توجد طلبات مسجلة في هذا المتجر بعد' : 'No orders for this store yet'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {storeOrders.slice(0, 4).map(ord => (
                        <div
                          key={ord.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#004457] dark:text-white">
                              {ord.orderNumber} — {ord.customerName}
                            </div>
                            <div className="text-[11px] text-slate-500">{ord.date}</div>
                          </div>
                          <div className="text-left">
                            <div className="font-black text-[#004457] dark:text-teal-300">
                              {ord.total} {currentStore.currency}
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-[#004457] dark:text-white">
                      {isAr ? 'منتجات المتجر المعزولة' : 'Isolated Store Products'}
                    </h4>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-bold text-[#00A896] cursor-pointer"
                    >
                      {isAr ? '+ إضافة منتج' : '+ Add Product'}
                    </button>
                  </div>
                  {storeProducts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      {isAr ? 'لم تتم إضافة منتجات لهذا المتجر بعد' : 'No products in this store yet'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {storeProducts.slice(0, 4).map(prod => (
                        <div
                          key={prod.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img src={prod.image || prod.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                            <div>
                              <div className="font-bold text-[#004457] dark:text-white">
                                {isAr ? prod.nameAr || prod.titleAr : prod.nameEn || prod.titleEn}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">SKU: {prod.sku}</div>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-black text-[#004457] dark:text-white">
                              {prod.price} {currentStore.currency}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {isAr ? `المخزون: ${prod.stock}` : `Stock: ${prod.stock}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: MY STORES (متاجري — إنشاء عدة متاجر وإدارتها) */}
          {activeTab === 'my_stores' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#004457] dark:text-white">
                    {isAr ? 'متاجري المستقلة (إدارة عدة متاجر بحساب واحد)' : 'My Independent Stores'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? 'كل متجر يمتلك قاعدة منتجات وطلبات وعملاء ونطاق فرعي مستقل تماماً عن المتاجر الأخرى'
                      : 'Each store has its own isolated products, orders, customers, and domain'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('create_store')}
                  className="px-4 py-2.5 rounded-xl bg-[#004457] text-white text-xs font-black hover:bg-[#003342] cursor-pointer flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إنشاء متجر جديد' : 'Create New Store'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stores.map(st => {
                  const stProds = products.filter(p => p.storeId === st.id).length;
                  const stOrders = orders.filter(o => o.storeId === st.id).length;
                  const isCurrent = st.id === activeStoreId;
                  return (
                    <div
                      key={st.id}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'border-[#00A896] bg-teal-50/30 dark:bg-teal-950/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-black text-[#004457] dark:text-white">{st.name}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              st.approvalStatus === 'approved_published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : st.approvalStatus === 'pending_review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {st.approvalStatus === 'approved_published'
                              ? isAr
                                ? 'معتمد ومنشور'
                                : 'Published'
                              : st.approvalStatus === 'pending_review'
                              ? isAr
                                ? 'بانتظار الاعتماد'
                                : 'Pending Review'
                              : isAr
                              ? 'مسودة'
                              : 'Draft'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">{isAr ? st.activityAr : st.activityEn}</div>
                        <div className="text-xs font-mono text-[#00A896]">{st.subdomain}</div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span>
                            {stProds} {isAr ? 'منتجات معزولة' : 'Products'}
                          </span>
                          <span>•</span>
                          <span>
                            {stOrders} {isAr ? 'طلبات' : 'Orders'}
                          </span>
                          <span>•</span>
                          <span>{st.currency}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => setActiveStoreId(st.id)}
                          className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer ${
                            isCurrent
                              ? 'bg-[#00A896] text-white'
                              : 'bg-[#004457] text-white hover:bg-[#003342]'
                          }`}
                        >
                          {isCurrent
                            ? isAr
                              ? 'المتجر النشط حالياً ✓'
                              : 'Active Store ✓'
                            : isAr
                            ? 'التبديل لإدارة هذا المتجر'
                            : 'Switch to This Store'}
                        </button>
                        <button
                          onClick={() => {
                            setActiveStoreId(st.id);
                            setMode('store_builder');
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-[#004457] dark:text-teal-300 cursor-pointer"
                        >
                          {isAr ? 'استوديو التصميم' : 'Studio'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: CREATE STORE (إنشاء متجر — الاسم والنشاط واللغة والعملة) */}
          {activeTab === 'create_store' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'إنشاء متجر إلكتروني مستقل جديد' : 'Create New Independent Store'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'حدد الاسم والنشاط واللغة والعملة والقالب المبدئي لمتجرك الجديد'
                    : 'Configure store name, business activity, language, currency, and starting template'}
                </p>
              </div>

              <form onSubmit={handleInlineCreateStore} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'اسم المتجر *' : 'Store Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newStoreName}
                      onChange={e => {
                        setNewStoreName(e.target.value);
                        setNewStoreSubdomain(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, '-')
                            .replace(/-+/g, '-') || 'mystore'
                        );
                      }}
                      placeholder={isAr ? 'مثال: دار العود الملكي' : 'e.g. Royal Oud House'}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'النشاط التجاري *' : 'Business Activity *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newStoreActivity}
                      onChange={e => setNewStoreActivity(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'البلد' : 'Country'}
                    </label>
                    <select
                      value={newStoreCountry}
                      onChange={e => setNewStoreCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs font-bold"
                    >
                      <option value="SA">{isAr ? 'السعودية (SA)' : 'Saudi Arabia'}</option>
                      <option value="AE">{isAr ? 'الإمارات (AE)' : 'UAE'}</option>
                      <option value="KW">{isAr ? 'الكويت (KW)' : 'Kuwait'}</option>
                      <option value="US">{isAr ? 'أمريكا (US)' : 'United States'}</option>
                      <option value="UK">{isAr ? 'بريطانيا (UK)' : 'United Kingdom'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'اللغة الافتراضية' : 'Store Language'}
                    </label>
                    <select
                      value={newStoreLang}
                      onChange={e => setNewStoreLang(e.target.value as 'ar' | 'en' | 'both')}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs font-bold"
                    >
                      <option value="both">{isAr ? 'العربية والإنجليزية معاً' : 'Arabic & English'}</option>
                      <option value="ar">{isAr ? 'العربية (RTL)' : 'Arabic Only'}</option>
                      <option value="en">{isAr ? 'الإنجليزية (LTR)' : 'English Only'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'العملة' : 'Currency'}
                    </label>
                    <select
                      value={newStoreCurrency}
                      onChange={e => setNewStoreCurrency(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs font-bold"
                    >
                      <option value="SAR">SAR (ر.س)</option>
                      <option value="AED">AED (د.إ)</option>
                      <option value="USD">USD ($)</option>
                      <option value="KWD">KWD (د.ك)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isAr ? 'اختر القالب الابتدائي' : 'Select Starting Template'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {storeTemplates.map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setNewStoreTemplate(tpl.id)}
                        className={`p-3 rounded-xl border text-right cursor-pointer ${
                          newStoreTemplate === tpl.id
                            ? 'border-[#00A896] bg-teal-50/50 font-bold'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="text-xs font-black text-[#004457] dark:text-white">
                          {isAr ? tpl.nameAr : tpl.nameEn}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {isAr ? tpl.categoryAr : tpl.categoryEn}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#004457] to-[#00A896] text-white font-black text-xs cursor-pointer shadow-md"
                >
                  {isAr ? 'إنشاء المتجر والانتقال لإدارته فوراً' : 'Create Store & Switch Workspace'}
                </button>
              </form>
            </div>
          )}

          {/* SECTION 4: STORE DESIGN (تصميم المتجر — القوالب والألوان والخطوط) */}
          {activeTab === 'store_design' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#004457] dark:text-white">
                    {isAr ? 'تصميم المتجر (القوالب والألوان والخطوط)' : 'Store Design (Templates, Colors & Fonts)'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? 'عدّل الهوية البصرية لمتجرك أو افتح محرر السحب والإفلات الكامل في QABS Studio'
                      : 'Customize your store colors and typography or launch full QABS Studio visual builder'}
                  </p>
                </div>
                <button
                  onClick={() => setMode('store_builder')}
                  className="px-4 py-2.5 rounded-xl bg-[#004457] text-white text-xs font-black hover:bg-[#003342] cursor-pointer flex items-center gap-2 self-start"
                >
                  <Eye className="w-4 h-4 text-[#E5C158]" />
                  <span>{isAr ? 'فتح المحرر المرئي الكامل QABS Studio' : 'Open Full QABS Studio'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isAr ? 'اللون الأساسي للمتجر' : 'Primary Brand Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentStore.primaryColor || '#004457'}
                      onChange={e => updateStoreDetails(currentStore.id, { primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{currentStore.primaryColor || '#004457'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isAr ? 'اللون الثانوي / الأزرار' : 'Accent Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentStore.accentColor || '#C8A24A'}
                      onChange={e => updateStoreDetails(currentStore.id, { accentColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{currentStore.accentColor || '#C8A24A'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isAr ? 'الخط الرسمي للمتجر' : 'Store Typography'}
                  </label>
                  <select
                    value={currentStore.fontFamily || 'Cairo'}
                    onChange={e => updateStoreDetails(currentStore.id, { fontFamily: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs font-bold"
                  >
                    <option value="Cairo">Cairo (كايرو العصري)</option>
                    <option value="Tajawal">Tajawal (تجوال للتجارة)</option>
                    <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
                    <option value="Readex Pro">Readex Pro</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-600 dark:text-slate-300 mb-3">
                  {isAr ? 'القوالب الجاهزة المتاحة لمتجرك:' : 'Ready Templates for Your Store:'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {storeTemplates.map(tpl => (
                    <div
                      key={tpl.id}
                      onClick={() =>
                        updateStoreDetails(currentStore.id, {
                          templateId: tpl.id,
                          theme: tpl.theme,
                          primaryColor: tpl.primaryColor,
                          accentColor: tpl.accentColor,
                          fontFamily: tpl.fontFamily
                        })
                      }
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        currentStore.templateId === tpl.id
                          ? 'border-[#00A896] bg-teal-50/40'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <img src={tpl.previewImage} alt="" className="w-full h-24 object-cover rounded-xl mb-2" />
                      <div className="text-xs font-black text-[#004457] dark:text-white">
                        {isAr ? tpl.nameAr : tpl.nameEn}
                      </div>
                      <div className="text-[10px] text-slate-500">{isAr ? tpl.categoryAr : tpl.categoryEn}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: PAGES (الصفحات — الرئيسية، من نحن، اتصل بنا، وصفحات مخصصة) */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'صفحات المتجر (الرئيسية، من نحن، اتصل بنا، والسياسات)' : 'Store Pages Manager'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentStorePages.map(pg => (
                    <div
                      key={pg.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-[#004457] dark:text-white">
                          {isAr ? pg.titleAr : pg.titleEn}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                            /{pg.slug}
                          </span>
                          {pg.type === 'custom' && (
                            <button
                              onClick={() => deleteStorePage(pg.id)}
                              className="text-rose-500 hover:text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {isAr ? pg.contentAr : pg.contentEn}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add Custom Page */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!pageTitleAr.trim()) return;
                    saveStorePage({
                      storeId: currentStore.id,
                      titleAr: pageTitleAr,
                      titleEn: pageTitleAr,
                      slug: pageSlug || 'custom-page',
                      type: 'custom',
                      contentAr: pageContentAr || pageTitleAr,
                      contentEn: pageContentAr || pageTitleAr,
                      published: true
                    });
                    setPageTitleAr('');
                    setPageSlug('');
                    setPageContentAr('');
                  }}
                  className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <h3 className="text-xs font-black text-[#004457] dark:text-white">
                    {isAr ? '+ بناء صفحة مخصصة جديدة في المتجر' : '+ Create Custom Store Page'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={isAr ? 'عنوان الصفحة (مثال: الأسئلة الشائعة)' : 'Page Title'}
                      value={pageTitleAr}
                      onChange={e => setPageTitleAr(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder={isAr ? 'الرابط اللطيف (مثال: faq)' : 'Slug (e.g. faq)'}
                      value={pageSlug}
                      onChange={e => setPageSlug(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder={isAr ? 'محتوى الصفحة...' : 'Page content...'}
                    value={pageContentAr}
                    onChange={e => setPageContentAr(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#004457] text-white text-xs font-bold cursor-pointer"
                  >
                    {isAr ? 'حفظ ونشر الصفحة في المتجر' : 'Save & Publish Page'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SECTION 6: PRODUCTS (المنتجات — مادية ورقمية، المتغيرات، SKU والباركود، السعر والتكلفة) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Add Product Form */}
              <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[#004457] dark:text-white">
                      {isAr ? `إدارة منتجات المتجر (${currentStore.name})` : `Store Products (${currentStore.name})`}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? 'دعم المنتجات المادية والرقمية، الخيارات والمتغيرات (Variants)، SKU والباركود، والسعر والتكلفة'
                        : 'Supports physical & digital products, variants, SKU, barcode, price & cost'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-teal-50 text-[#004457] text-xs font-black">
                    {storeProducts.length} {isAr ? 'منتج معزول' : 'Isolated Products'}
                  </span>
                </div>

                <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'اسم المنتج بالعربية *' : 'Product Name (AR) *'}
                    value={prodNameAr}
                    onChange={e => setProdNameAr(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder={isAr ? 'اسم المنتج بالإنجليزية' : 'Product Name (EN)'}
                    value={prodNameEn}
                    onChange={e => setProdNameEn(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <select
                    value={prodType}
                    onChange={e => setProdType(e.target.value as 'physical' | 'digital')}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-bold"
                  >
                    <option value="physical">{isAr ? 'منتج مادي قابل للشحن' : 'Physical Product'}</option>
                    <option value="digital">{isAr ? 'منتج رقمي (تسليم فوري)' : 'Digital Product'}</option>
                  </select>

                  <input
                    type="number"
                    placeholder={isAr ? 'سعر البيع' : 'Sale Price'}
                    value={prodPrice}
                    onChange={e => setProdPrice(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <input
                    type="number"
                    placeholder={isAr ? 'تكلفة المنتج (لحساب الأرباح)' : 'Unit Cost'}
                    value={prodCost}
                    onChange={e => setProdCost(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder={isAr ? 'التصنيف' : 'Category'}
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="SKU"
                    value={prodSku}
                    onChange={e => setProdSku(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Barcode (EAN/UPC)"
                    value={prodBarcode}
                    onChange={e => setProdBarcode(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder={isAr ? 'المتغير (مثال: مقاس L / 100 مل)' : 'Variant Option'}
                    value={prodVariantLabel}
                    onChange={e => setProdVariantLabel(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />

                  <input
                    type="number"
                    placeholder={isAr ? 'الكمية المتوفرة' : 'Initial Stock'}
                    value={prodStock}
                    onChange={e => setProdStock(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder={isAr ? 'المستودع' : 'Warehouse'}
                    value={prodWarehouse}
                    onChange={e => setProdWarehouse(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#004457] hover:bg-[#003342] text-white font-black text-xs py-2 px-4 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? 'إضافة المنتج للمتجر' : 'Add Product'}</span>
                  </button>
                </form>
              </div>

              {/* Isolated Products Table */}
              <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3.5">{isAr ? 'المنتج' : 'Product'}</th>
                        <th className="p-3.5">{isAr ? 'النوع والتصنيف' : 'Type & Category'}</th>
                        <th className="p-3.5">SKU & Barcode</th>
                        <th className="p-3.5">{isAr ? 'السعر / التكلفة' : 'Price / Cost'}</th>
                        <th className="p-3.5">{isAr ? 'المتغيرات والمخزون' : 'Variants & Stock'}</th>
                        <th className="p-3.5">{isAr ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {storeProducts.map(prod => (
                        <tr key={prod.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img src={prod.image || prod.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
                              <div>
                                <div className="font-black text-[#004457] dark:text-white">
                                  {isAr ? prod.nameAr || prod.titleAr : prod.nameEn || prod.titleEn}
                                </div>
                                <div className="text-[11px] text-slate-400">{prod.warehouse}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#004457] font-bold text-[10px]">
                              {prod.productType === 'digital' ? (isAr ? 'رقمي' : 'Digital') : isAr ? 'مادي' : 'Physical'}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-1">{prod.category || prod.categoryAr}</div>
                          </td>
                          <td className="p-3.5 font-mono text-[11px]">
                            <div className="font-bold text-slate-700 dark:text-slate-200">{prod.sku}</div>
                            <div className="text-slate-400 flex items-center gap-1">
                              <Barcode className="w-3 h-3" />
                              <span>{prod.barcode || '6281000412'}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-black text-[#004457] dark:text-white">
                              {prod.price} {currentStore.currency}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {isAr ? `التكلفة: ${prod.costPrice || Math.round(prod.price * 0.55)}` : `Cost: ${prod.costPrice || 50}`}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-emerald-600">
                              {prod.stock} {isAr ? 'وحدة' : 'units'}
                            </div>
                            {prod.variants && prod.variants.length > 0 && (
                              <div className="text-[10px] text-slate-500">
                                {prod.variants.length} {isAr ? 'متغيرات (Variants)' : 'variants'}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateProduct(prod.id, { price: prod.price + 10 })}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                title={isAr ? 'تعديل سريع للسعر' : 'Quick edit'}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteProduct(prod.id)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                                title={isAr ? 'حذف المنتج' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: INVENTORY (المخزون — الكميات والمستودعات والتنبيهات) */}
          {activeTab === 'inventory' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'إدارة المخزون والمستودعات وتنبيهات النفاذ' : 'Inventory, Warehouses & Low-Stock Alerts'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'متابعة فورية للكميات المتوفرة في مستودعات المتجر وتحديث الرصيد'
                    : 'Real-time stock levels and warehouse alerts'}
                </p>
              </div>

              <div className="space-y-3">
                {storeProducts.map(prod => {
                  const isLow = prod.stock <= (prod.lowStockThreshold || 10);
                  return (
                    <div
                      key={prod.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img src={prod.image || prod.imageUrl} alt="" className="w-11 h-11 rounded-xl object-cover" />
                        <div>
                          <div className="text-sm font-black text-[#004457] dark:text-white">
                            {isAr ? prod.nameAr || prod.titleAr : prod.nameEn || prod.titleEn}
                          </div>
                          <div className="text-xs text-slate-500">
                            {prod.warehouse || 'المستودع الرئيسي'} • SKU: <span className="font-mono">{prod.sku}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isLow && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                            {isAr ? 'تنبيه: مخزون منخفض' : 'Low Stock Alert'}
                          </span>
                        )}
                        <div className="text-sm font-black text-[#004457] dark:text-white">
                          {prod.stock} {isAr ? 'قطعة' : 'in stock'}
                        </div>
                        <button
                          onClick={() => updateProduct(prod.id, { stock: prod.stock + 10 })}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 text-[#004457] font-bold text-xs hover:bg-teal-100 cursor-pointer"
                        >
                          +10 {isAr ? 'توريد' : 'Restock'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 8: ORDERS (الطلبات — متابعة وتجهيز وشحن وإلغاء واسترجاع) */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'إدارة الطلبات والشحن والتتبع والاسترجاع' : 'Orders, Fulfillment, Tracking & Refunds'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'متابعة حالة كل طلب في متجرك، إصدار بوليصة الشحن ورقم التتبع، أو معالجة الاسترجاع'
                    : 'Manage order fulfillment, shipping carriers, tracking numbers, and refunds'}
                </p>
              </div>

              {storeOrders.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  {isAr ? 'لا توجد طلبات مسجلة في هذا المتجر حالياً' : 'No orders found for this store'}
                </div>
              ) : (
                <div className="space-y-3">
                  {storeOrders.map(ord => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#004457] dark:text-teal-300">
                            {ord.orderNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800">
                            {ord.status}
                          </span>
                          <span className="text-xs text-slate-400">{ord.date}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {ord.customerName} ({ord.customerEmail})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isAr ? 'شركة الشحن:' : 'Carrier:'} {ord.shippingCarrier || 'DHL / SMSA'} •{' '}
                          {isAr ? 'رقم التتبع:' : 'Tracking:'}{' '}
                          <span className="font-mono text-[#00A896]">{ord.trackingNumber || 'TRK-PENDING'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-black text-[#004457] dark:text-white px-2">
                          {ord.total} {currentStore.currency}
                        </div>
                        <button
                          onClick={() =>
                            updateOrderStatus(ord.id, 'shipped', `DHL-${Math.floor(10000000 + Math.random() * 90000000)}`)
                          }
                          className="px-3 py-1.5 rounded-xl bg-[#004457] text-white text-xs font-bold cursor-pointer"
                        >
                          {isAr ? 'شحن وإصدار تتبع' : 'Ship & Track'}
                        </button>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'delivered')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                        >
                          {isAr ? 'تم التوصيل' : 'Delivered'}
                        </button>
                        <button
                          onClick={() =>
                            issueRefund(ord.orderNumber, ord.total, 'طلب استرجاع من العميل', 'Customer refund request')
                          }
                          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                        >
                          {isAr ? 'استرجاع' : 'Refund'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 9: CUSTOMERS (العملاء — بيانات العملاء وسجل مشترياتهم) */}
          {activeTab === 'customers' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'عملاء المتجر وسجل مشترياتهم' : 'Store Customers & Purchase History'}
              </h2>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!custName.trim()) return;
                  addCustomer({
                    storeId: currentStore.id,
                    name: custName,
                    email: custEmail || 'customer@domain.com',
                    phone: custPhone,
                    city: custCity
                  });
                  setCustName('');
                  setCustEmail('');
                }}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'اسم العميل *' : 'Customer Name *'}
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <input
                  type="email"
                  placeholder={isAr ? 'البريد الإلكتروني' : 'Email'}
                  value={custEmail}
                  onChange={e => setCustEmail(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  placeholder={isAr ? 'المدينة' : 'City'}
                  value={custCity}
                  onChange={e => setCustCity(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#004457] text-white text-xs font-black py-2 px-4 cursor-pointer"
                >
                  {isAr ? '+ إضافة عميل للمتجر' : '+ Add Customer'}
                </button>
              </form>

              <div className="space-y-2.5">
                {storeCustomers.map(c => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-black text-[#004457] dark:text-white">{c.name}</div>
                      <div className="text-slate-500">
                        {c.email} • {c.phone} • {c.city}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-black text-emerald-600">
                        {c.totalSpent} {currentStore.currency}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.ordersCount} {isAr ? 'طلبات' : 'orders'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 10: DISCOUNTS (الخصومات — كوبونات وعروض) */}
          {activeTab === 'discounts' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'كوبونات الخصم والعروض الترويجية' : 'Discount Coupons & Promotions'}
              </h2>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!discCode.trim()) return;
                  addDiscount({
                    storeId: currentStore.id,
                    code: discCode.toUpperCase(),
                    type: discType,
                    value: Number(discValue) || 10,
                    minOrderAmount: 100,
                    expiresAt: '2026-12-31',
                    status: 'active'
                  });
                  setDiscCode('');
                }}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'كود الخصم (مثال: QABS20)' : 'Coupon Code'}
                  value={discCode}
                  onChange={e => setDiscCode(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-mono uppercase"
                />
                <select
                  value={discType}
                  onChange={e => setDiscType(e.target.value as 'percentage' | 'fixed')}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-bold"
                >
                  <option value="percentage">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                  <option value="fixed">{isAr ? 'مبلغ ثابت' : 'Fixed Amount'}</option>
                </select>
                <input
                  type="number"
                  placeholder={isAr ? 'قيمة الخصم' : 'Discount Value'}
                  value={discValue}
                  onChange={e => setDiscValue(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#004457] text-white text-xs font-black py-2 px-4 cursor-pointer"
                >
                  {isAr ? '+ إنشاء الكوبون' : '+ Create Coupon'}
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {storeDiscounts.map(d => (
                  <div
                    key={d.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-black text-sm text-[#004457] dark:text-teal-300">{d.code}</div>
                      <div className="text-xs text-slate-500">
                        {d.type === 'percentage' ? `${d.value}%` : `${d.value} ${currentStore.currency}`} •{' '}
                        {isAr ? `استخدم ${d.usedCount} مرة` : `Used ${d.usedCount} times`}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDiscountStatus(d.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                        d.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {d.status === 'active' ? (isAr ? 'نشط' : 'Active') : isAr ? 'متوقف' : 'Expired'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 11: PAYMENTS (الدفع — قاعدة عدم تفعيل بوابة دفع تلقائياً) */}
          {activeTab === 'payments' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#004457] dark:text-white">
                    {isAr ? 'إعداد وربط بوابات الدفع الإلكترونية' : 'Payment Gateways Setup'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? 'وفق سياسة الأمان في متاجر قبس: لا يتم تفعيل أي بوابة دفع تلقائياً، بل يتم التحقق منها واعتمادها من لوحة قبس المركزية'
                      : 'Per QABS governance: Payment gateways are never auto-activated; they require manual QABS Central Admin verification'}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    currentStore.paymentApprovalStatus === 'approved_active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentStore.paymentApprovalStatus === 'pending_admin_approval'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {currentStore.paymentApprovalStatus === 'approved_active'
                    ? isAr
                      ? 'بوابة الدفع معتمدة ومفعلة'
                      : 'Approved & Active'
                    : currentStore.paymentApprovalStatus === 'pending_admin_approval'
                    ? isAr
                      ? 'قيد مراجعة إدارة قبس'
                      : 'Pending QABS Verification'
                    : isAr
                    ? 'غير مفعلة'
                    : 'Unconfigured'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['Tap', 'Moyasar', 'Stripe'] as const).map(gw => (
                  <div
                    key={gw}
                    className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-4 ${
                      currentStore.gatewayType === gw
                        ? 'border-[#00A896] bg-teal-50/30 dark:bg-teal-950/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-base font-black text-[#004457] dark:text-white">{gw} Payments</div>
                      <p className="text-xs text-slate-500 mt-1">
                        {gw === 'Tap'
                          ? isAr
                            ? 'مدى، فيزا، ماستركارد، أبل باي لدول الخليج'
                            : 'Mada, Visa, Apple Pay for GCC'
                          : gw === 'Moyasar'
                          ? isAr
                            ? 'بوابة ميسر المعتمدة في السعودية (مدى وسداد)'
                            : 'Saudi Arabia Mada, SADAD & Apple Pay'
                          : isAr
                          ? 'المدفوعات الدولية بالعملات المتعددة'
                          : 'Global multi-currency card processing'}
                      </p>
                    </div>
                    <button
                      onClick={() => requestPaymentActivation(currentStore.id, gw)}
                      className="w-full py-2.5 rounded-xl bg-[#004457] hover:bg-[#003342] text-white text-xs font-black cursor-pointer"
                    >
                      {isAr ? `طلب تفعيل ${gw} من إدارة قبس` : `Request ${gw} Activation`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 12: SHIPPING (الشحن — المناطق والأسعار وطرق التوصيل) */}
          {activeTab === 'shipping' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'مناطق الشحن وأسعار وشركات التوصيل' : 'Shipping Zones, Rates & Carriers'}
              </h2>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!shipRegionAr.trim()) return;
                  addShippingZone({
                    storeId: currentStore.id,
                    regionNameAr: shipRegionAr,
                    regionNameEn: shipRegionAr,
                    carrier: shipCarrier,
                    rate: Number(shipRate) || 25,
                    deliveryTimeAr: shipTime,
                    deliveryTimeEn: shipTime,
                    active: true
                  });
                  setShipRegionAr('');
                }}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'المنطقة / المدن (مثال: كافة مدن المملكة)' : 'Region / Cities'}
                  value={shipRegionAr}
                  onChange={e => setShipRegionAr(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  placeholder={isAr ? 'شركة الشحن (DHL / Aramex / SMSA)' : 'Carrier'}
                  value={shipCarrier}
                  onChange={e => setShipCarrier(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <input
                  type="number"
                  placeholder={isAr ? 'تكلفة الشحن' : 'Rate'}
                  value={shipRate}
                  onChange={e => setShipRate(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#004457] text-white text-xs font-black py-2 px-4 cursor-pointer"
                >
                  {isAr ? '+ إضافة منطقة شحن' : '+ Add Shipping Zone'}
                </button>
              </form>

              <div className="space-y-2.5">
                {storeShipping.map(z => (
                  <div
                    key={z.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-black text-[#004457] dark:text-white">
                        {isAr ? z.regionNameAr : z.regionNameEn}
                      </div>
                      <div className="text-slate-500">
                        {z.carrier} • {isAr ? z.deliveryTimeAr : z.deliveryTimeEn}
                      </div>
                    </div>
                    <div className="font-black text-[#00A896]">
                      {z.rate} {currentStore.currency}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 13: DOMAINS (النطاقات — ربط نطاق مستقل) */}
          {activeTab === 'domains' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'النطاقات وربط النطاق المستقل (Custom Domain)' : 'Store Domains & Custom DNS'}
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">{isAr ? 'النطاق الفرعي المجاني من قبس:' : 'Default QABS Subdomain:'}</div>
                  <div className="text-sm font-mono font-black text-[#004457] dark:text-teal-300 mt-0.5">
                    https://{currentStore.subdomain}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  SSL Active
                </span>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!domainInput.trim()) return;
                  requestDomainVerification(currentStore.id, domainInput);
                }}
                className="space-y-3"
              >
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'ربط نطاق خاص بمتجرك (مثال: www.mybrand.sa)' : 'Connect Custom Domain'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="shop.yourbrand.com"
                    value={domainInput}
                    onChange={e => setDomainInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#004457] text-white text-xs font-black cursor-pointer"
                  >
                    {isAr ? 'طلب ربط وفحص DNS' : 'Verify Domain'}
                  </button>
                </div>
              </form>

              {currentStore.customDomain && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-sm">{currentStore.customDomain}</div>
                    <div className="text-slate-500">CNAME → stores.qabs1.store</div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full font-bold ${
                      currentStore.domainVerified
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {currentStore.domainVerified
                      ? isAr
                        ? 'تم التحقق وتفعيل SSL'
                        : 'Verified & Active'
                      : isAr
                      ? 'بانتظار تأكيد إدارة قبس'
                      : 'Pending DNS Verification'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* SECTION 14: APPS (التطبيقات — تكاملات وإضافات) */}
          {activeTab === 'apps' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'تطبيقات وتكاملات المتجر' : 'Store Apps & Integrations'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storeApps.map(app => {
                  const installed = (app.installedStoreIds || app.installedStores || []).includes(currentStore.id);
                  return (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-sm font-black text-[#004457] dark:text-white">
                          {isAr ? app.nameAr : app.nameEn}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {isAr ? app.descriptionAr : app.descriptionEn}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStoreApp(app.id, currentStore.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer shrink-0 ${
                          installed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[#004457] text-white'
                        }`}
                      >
                        {installed ? (isAr ? 'مُفعّل ✓' : 'Installed ✓') : isAr ? 'تثبيت' : 'Install'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 15: ANALYTICS (التحليلات — المبيعات والأرباح والضرائب حسب البلد) */}
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'تحليلات المبيعات والأرباح والضرائب' : 'Store Sales, Profit & Tax Analytics'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500">{isAr ? 'إجمالي المبيعات' : 'Gross Revenue'}</div>
                  <div className="text-xl font-black text-[#004457] dark:text-white mt-1">
                    {totalSalesRevenue.toLocaleString()} {currentStore.currency}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500">{isAr ? 'تكلفة البضاعة المباعة' : 'Product Cost (COGS)'}</div>
                  <div className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">
                    {totalCostValue.toLocaleString()} {currentStore.currency}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500">
                    {isAr ? `الضريبة (${currentStore.taxRate ?? 15}% - ${currentStore.country})` : `Tax (${currentStore.taxRate ?? 15}%)`}
                  </div>
                  <div className="text-xl font-black text-amber-600 mt-1">
                    {estimatedTax.toLocaleString()} {currentStore.currency}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                    {isAr ? 'صافي الربح التقديري' : 'Estimated Net Profit'}
                  </div>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                    {netProfit.toLocaleString()} {currentStore.currency}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 16: SETTINGS (الإعدادات — بيانات المتجر، الضرائب، الصلاحيات، والنسخ الاحتياطي) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'إعدادات المتجر والضرائب والصلاحيات والنسخ الاحتياطي' : 'Store Settings, Tax, Staff Permissions & Backup'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      {isAr ? 'اسم المتجر' : 'Store Name'}
                    </label>
                    <input
                      type="text"
                      value={currentStore.name}
                      onChange={e => updateStoreDetails(currentStore.id, { name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      {isAr ? 'نسبة الضريبة حسب البلد (%)' : 'Country Tax Rate (%)'}
                    </label>
                    <input
                      type="number"
                      value={currentStore.taxRate ?? 15}
                      onChange={e => updateStoreDetails(currentStore.id, { taxRate: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => triggerSystemBackup(currentStore.name)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#004457] text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Database className="w-4 h-4 text-[#E5C158]" />
                      <span>{isAr ? 'حفظ نسخة احتياطية لبيانات المتجر' : 'Backup Store Data'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Separate Owner & Staff Permissions */}
              <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00A896]" />
                  <h3 className="text-sm font-black text-[#004457] dark:text-white">
                    {isAr ? 'صلاحيات مالك المتجر والموظفين المنفصلة' : 'Store Owner & Staff Role Permissions'}
                  </h3>
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!staffName.trim()) return;
                    addStaff({
                      name: staffName,
                      email: staffEmail || 'staff@store.com',
                      role: 'support_agent',
                      departmentAr: `موظف مبيعات وتجهيز طلبات (${currentStore.name})`,
                      departmentEn: `Store Fulfillment Staff (${currentStore.name})`,
                      permissions: ['إدارة المنتجات', 'تجهيز الطلبات']
                    });
                    setStaffName('');
                    setStaffEmail('');
                  }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <input
                    type="text"
                    placeholder={isAr ? 'اسم الموظف' : 'Staff Name'}
                    value={staffName}
                    onChange={e => setStaffName(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <input
                    type="email"
                    placeholder={isAr ? 'البريد الإلكتروني للموظف' : 'Staff Email'}
                    value={staffEmail}
                    onChange={e => setStaffEmail(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#00A896] text-white text-xs font-black py-2 px-4 cursor-pointer"
                  >
                    {isAr ? '+ إضافة موظف بصلاحيات محددة' : '+ Invite Store Staff'}
                  </button>
                </form>

                <div className="space-y-2">
                  {staff.map(member => (
                    <div
                      key={member.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#004457] dark:text-white">{member.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {isAr ? member.departmentAr : member.departmentEn}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.map((perm, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-[#004457] dark:text-teal-300 text-[10px] font-bold"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: COMPANY FORMATION (تأسيس الشركات والوثائق الرسمية) */}
          {activeTab === 'company_formation' && (
            <div className="space-y-6">
              {/* Top Banner & Corporate KPIs */}
              <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#00A896] uppercase tracking-wider">
                        {isAr ? 'الخدمات الرقمية وحوكمة الشركات' : 'Corporate Governance'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5C158]/20 text-[#004457] dark:text-[#E5C158]">
                        US & UK Portfolios
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-[#004457] dark:text-white mt-1">
                      {isAr ? 'إدارة الكيانات والشركات والوثائق الرسمية' : 'Corporate Entities & Legal Documents Vault'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isAr
                        ? 'متابعة ملفات تأسيس الشركات الأمريكية والبريطانية، أرقام EIN الفيدرالية، والوكيل المسجل وخزينة الوثائق'
                        : 'Track US & UK company filings, IRS EIN letters, registered agent records & document vault'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={onOpenFormationModal}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#004457] to-[#00A896] text-white text-xs font-black hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'تأسيس شركة جديدة' : 'Form New Company'}</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500 font-bold">{isAr ? 'إجمالي الكيانات' : 'Total Entities'}</div>
                    <div className="text-2xl font-black text-[#004457] dark:text-white font-mono mt-1">
                      {companies.length}
                    </div>
                    <div className="text-[11px] text-teal-600 font-bold mt-1">
                      {isAr ? 'أمريكية وبريطانية' : 'US & UK Entities'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500 font-bold">{isAr ? 'معتمدة وفعالة' : 'Active & Approved'}</div>
                    <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
                      {companies.filter(c => c.status === 'approved').length}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-1">
                      {isAr ? 'جاهزة للحسابات والمدفوعات' : 'Ready for Banking'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500 font-bold">{isAr ? 'أرقام EIN الصادرة' : 'Issued EINs'}</div>
                    <div className="text-2xl font-black text-[#004457] dark:text-white font-mono mt-1">
                      {companies.filter(c => c.ein).length}
                    </div>
                    <div className="text-[11px] text-teal-600 font-bold mt-1">
                      {isAr ? 'خطاب CP575 معتمد' : 'CP575 Certified'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500 font-bold">{isAr ? 'الامتثال السنوي' : 'Compliance Calendar'}</div>
                    <div className="text-sm font-black text-emerald-600 mt-2 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{isAr ? 'ساري ومنتظم' : 'Good Standing'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {isAr ? 'الوكيل المسجل نشط' : 'Agent Active'}
                    </div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setCompanyFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      companyFilter === 'all'
                        ? 'bg-[#004457] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isAr ? 'جميع الشركات' : 'All Companies'} ({companies.length})
                  </button>
                  <button
                    onClick={() => setCompanyFilter('approved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      companyFilter === 'approved'
                        ? 'bg-[#004457] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isAr ? 'المعتمدة رسمياً' : 'Approved'} ({companies.filter(c => c.status === 'approved').length})
                  </button>
                  <button
                    onClick={() => setCompanyFilter('in_progress')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      companyFilter === 'in_progress'
                        ? 'bg-[#004457] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isAr ? 'قيد الإيداع والمراجعة' : 'In Progress'} ({companies.filter(c => c.status !== 'approved').length})
                  </button>
                </div>
              </div>

              {/* Companies List Cards */}
              <div className="space-y-5">
                {companies
                  .filter(comp => {
                    if (companyFilter === 'approved') return comp.status === 'approved';
                    if (companyFilter === 'in_progress') return comp.status !== 'approved';
                    return true;
                  })
                  .map(comp => (
                    <div
                      key={comp.id}
                      className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5"
                    >
                      {/* Company Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#004457] to-[#00A896] text-[#E5C158] font-black text-lg flex items-center justify-center font-mono shadow-sm">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base sm:text-lg font-black text-[#004457] dark:text-white">
                                {comp.companyName}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200">
                                {comp.entityType}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {comp.jurisdiction.replace('US_', '').replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {isAr ? 'تاريخ التأسيس والإيداع:' : 'Filing Date:'} <span className="font-mono">{comp.filingDate}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-center ${
                            comp.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {comp.status === 'approved'
                            ? isAr
                              ? 'معتمدة ومسجلة رسمياً ✓'
                              : 'Approved & Active ✓'
                            : isAr
                            ? 'قيد الإيداع والمراجعة الحكومية'
                            : 'Submitted to State'}
                        </span>
                      </div>

                      {/* Official Registration Data Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">
                            {isAr ? 'رقم قيد الولاية / CRN' : 'State File / CRN'}
                          </span>
                          <span className="font-mono font-bold text-[#004457] dark:text-teal-300 mt-0.5 block">
                            {comp.stateFileNumber || comp.crn || 'قيد الإصدار'}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">
                              {isAr ? 'الرقم الضريبي الفيدرالي EIN' : 'IRS Federal EIN'}
                            </span>
                            {comp.ein && (
                              <button
                                onClick={() => copyToClipboard(comp.ein!, comp.id + '_ein')}
                                className="text-[10px] text-[#00A896] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedText === comp.id + '_ein' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}</span>
                              </button>
                            )}
                          </div>
                          <span className="font-mono font-bold text-[#004457] dark:text-teal-300 mt-0.5 block">
                            {comp.ein || (isAr ? 'بانتظار خطاب IRS' : 'Pending CP575')}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px]">
                            {isAr ? 'الوكيل المسجل والعنوان' : 'Registered Agent'}
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block truncate" title={comp.registeredAddress}>
                            {comp.registeredAddress}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px]">
                            {isAr ? 'موعد التجديد السنوي' : 'Annual Renewal Due'}
                          </span>
                          <span className="font-mono font-bold text-amber-600 mt-0.5 block">
                            {comp.renewalDueDate}
                          </span>
                        </div>
                      </div>

                      {/* Official Documents Vault */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-[#004457] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                            <FileCheck className="w-4 h-4 text-[#00A896]" />
                            <span>{isAr ? 'خزينة الوثائق القانونية والشهادات الرسمية' : 'Official Legal Documents Vault'}</span>
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {comp.documents.length} {isAr ? 'وثائق معتمدة' : 'Documents'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {comp.documents.map((doc, dIdx) => (
                            <div
                              key={dIdx}
                              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#061824] flex items-center justify-between gap-3 shadow-2xs hover:border-[#00A896] transition-colors"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#004457] dark:text-white truncate">
                                  {doc.name}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                  {doc.date} • {doc.status === 'ready' ? (isAr ? 'معتمد رسمي' : 'Certified') : (isAr ? 'قيد التوليد' : 'Generating')}
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  setViewingDoc({
                                    docName: doc.name,
                                    companyName: comp.companyName,
                                    type: doc.type,
                                    date: doc.date,
                                    jurisdiction: comp.jurisdiction,
                                    ein: comp.ein,
                                    fileNumber: comp.stateFileNumber || comp.crn
                                  })
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-[#004457] dark:text-teal-300 hover:bg-teal-100 text-[11px] font-bold shrink-0 cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{isAr ? 'معاينة' : 'View'}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Linked Banking & Store Quick Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-slate-500 font-bold">{isAr ? 'الربط المالي والتجاري:' : 'Linked Services:'}</span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mercury / Wise Active</span>
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Stripe Ready</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveTab('my_stores')}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200"
                          >
                            {isAr ? 'ربط بمتجر إلكتروني' : 'Link to Store'}
                          </button>
                          <button
                            onClick={onOpenFormationModal}
                            className="px-3 py-1.5 rounded-lg bg-[#004457] text-white font-bold text-xs cursor-pointer hover:bg-[#003342]"
                          >
                            {isAr ? '+ تأسيس كيان إضافي' : '+ Add Another Entity'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {companies.length === 0 && (
                  <div className="p-12 text-center bg-white dark:bg-[#071D2B] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      {isAr ? 'لم تقم بتأسيس أي شركة بعد' : 'No corporate entities registered yet'}
                    </p>
                    <button
                      onClick={onOpenFormationModal}
                      className="px-5 py-2.5 rounded-xl bg-[#004457] text-white text-xs font-black cursor-pointer"
                    >
                      {isAr ? 'ابدأ تأسيس شركتك الأولى الآن' : 'Start Your First Formation'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DOCUMENT PREVIEW MODAL */}
          {viewingDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-[#071D2B] border-2 border-[#00A896] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
                <button
                  onClick={() => setViewingDoc(null)}
                  className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Certificate Header */}
                <div className="text-center space-y-2 border-b-2 border-[#00A896]/30 pb-5">
                  <div className="inline-block p-3 rounded-2xl bg-[#004457] text-[#E5C158] font-mono shadow-md mb-1">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="text-xs uppercase font-extrabold tracking-widest text-[#00A896]">
                    Official Certified Corporate Document
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#003445] dark:text-white">
                    {viewingDoc.docName}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    Jurisdiction: {viewingDoc.jurisdiction || 'US / UK Registry'}
                  </div>
                </div>

                {/* Simulated Certificate Body */}
                <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-slate-900/80 border border-amber-200/60 dark:border-slate-800 space-y-4 text-xs font-mono leading-relaxed">
                  <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                    <span className="font-bold text-slate-500">ENTITY LEGAL NAME:</span>
                    <span className="font-black text-[#004457] dark:text-[#E5C158]">{viewingDoc.companyName}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                    <span className="font-bold text-slate-500">REGISTRATION FILE NUMBER:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingDoc.fileNumber || 'WY-2025-00194829'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                    <span className="font-bold text-slate-500">IRS FEDERAL EIN:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingDoc.ein || '98-4720194'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                    <span className="font-bold text-slate-500">DATE OF CERTIFICATION:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingDoc.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">STATUS:</span>
                    <span className="font-bold text-emerald-600 uppercase">GOOD STANDING / FILED & VERIFIED</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Seal & Signature Verified by QABS Registrar
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#004457] dark:text-slate-200 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isAr ? 'طباعة / تصدير PDF' : 'Print / Export PDF'}</span>
                    </button>
                    <button
                      onClick={() => setViewingDoc(null)}
                      className="px-5 py-2 rounded-xl bg-[#004457] text-white text-xs font-black cursor-pointer hover:bg-[#003342]"
                    >
                      {isAr ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
