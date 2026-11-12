import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  AppMode,
  UserProfile,
  CompanyFormation,
  StoreInstance,
  StoreProduct,
  StoreOrder,
  BankingAccount,
  SupportTicket,
  StaffMember,
  AuditLogItem,
  UserRole,
  UserSubscription,
  Invoice,
  CommissionRecord,
  RefundRecord,
  StoreCustomer,
  StoreDiscount,
  StoreShippingZone,
  StorePageItem,
  StoreAppAddon,
  StoreTemplatePreset,
  StoreSectionBlock
} from '../types/index.ts';
import {
  INITIAL_USER,
  INITIAL_COMPANIES,
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_BANKING,
  INITIAL_TICKETS,
  INITIAL_STAFF,
  INITIAL_AUDIT_LOGS,
  INITIAL_USER_SUBSCRIPTION,
  INITIAL_INVOICES,
  INITIAL_COMMISSIONS,
  INITIAL_REFUNDS,
  SUBSCRIPTION_PLANS,
  INITIAL_CUSTOMERS,
  INITIAL_DISCOUNTS,
  INITIAL_SHIPPING_ZONES,
  INITIAL_STORE_PAGES,
  INITIAL_STORE_APPS,
  INITIAL_STORE_TEMPLATES,
  DEFAULT_STORE_SECTIONS
} from '../data/mockData.ts';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  user: UserProfile;
  switchRole: (role: UserRole) => void;
  companies: CompanyFormation[];
  addCompany: (comp: Omit<CompanyFormation, 'id' | 'filingDate' | 'status' | 'documents'>) => void;
  updateCompanyStatus: (id: string, status: CompanyFormation['status']) => void;
  // QABS Stores Multi-Tenant Core
  stores: StoreInstance[];
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  addStore: (store: Omit<StoreInstance, 'id' | 'productsCount' | 'ordersCount' | 'totalRevenue' | 'createdAt'>) => void;
  updateStoreTheme: (id: string, theme: StoreInstance['theme'], customDomain?: string) => void;
  updateStoreDetails: (id: string, updates: Partial<StoreInstance>) => void;
  submitStoreForApproval: (storeId: string) => void;
  reviewStoreApproval: (
    storeId: string,
    decision: 'approved_published' | 'changes_requested' | 'rejected',
    feedback?: string
  ) => void;
  requestPaymentActivation: (storeId: string, gatewayType: StoreInstance['gatewayType']) => void;
  approveStorePayment: (storeId: string, approved: boolean) => void;
  requestDomainVerification: (storeId: string, customDomain: string) => void;
  verifyStoreDomain: (storeId: string) => void;
  saveStoreSnapshot: (storeId: string, label: string) => void;
  restoreStoreSnapshot: (storeId: string, snapshotId: string) => void;
  updateStoreSections: (storeId: string, sections: StoreSectionBlock[]) => void;
  // Isolated Store Commerce Entities
  products: StoreProduct[];
  addProduct: (product: Omit<StoreProduct, 'id' | 'salesCount' | 'storeId'> & { storeId?: string }) => void;
  updateProduct: (id: string, updates: Partial<StoreProduct>) => void;
  deleteProduct: (id: string) => void;
  orders: StoreOrder[];
  addOrder: (order: Omit<StoreOrder, 'id' | 'orderNumber' | 'date'>) => void;
  updateOrderStatus: (id: string, status: StoreOrder['status'], trackingNumber?: string) => void;
  customers: StoreCustomer[];
  addCustomer: (customer: Omit<StoreCustomer, 'id' | 'ordersCount' | 'totalSpent' | 'lastOrderDate'>) => void;
  discounts: StoreDiscount[];
  addDiscount: (discount: Omit<StoreDiscount, 'id' | 'usedCount'>) => void;
  toggleDiscountStatus: (id: string) => void;
  shippingZones: StoreShippingZone[];
  addShippingZone: (zone: Omit<StoreShippingZone, 'id'>) => void;
  storePages: StorePageItem[];
  saveStorePage: (page: Omit<StorePageItem, 'id' | 'updatedAt'> & { id?: string }) => void;
  deleteStorePage: (id: string) => void;
  storeApps: StoreAppAddon[];
  toggleStoreApp: (appId: string, storeId: string) => void;
  storeTemplates: StoreTemplatePreset[];
  addStoreTemplate: (tpl: Omit<StoreTemplatePreset, 'id'>) => void;
  triggerSystemBackup: (targetLabel?: string) => void;
  // Support, Staff, Audit & Subscriptions
  banking: BankingAccount[];
  addBankAccount: (bank: Omit<BankingAccount, 'id' | 'balance' | 'status'>) => void;
  tickets: SupportTicket[];
  addTicket: (t: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  resolveTicket: (id: string) => void;
  staff: StaffMember[];
  addStaff: (s: Omit<StaffMember, 'id' | 'lastActive' | 'status'>) => void;
  auditLogs: AuditLogItem[];
  subscription: UserSubscription;
  changeSubscriptionPlan: (planId: 'starter' | 'growth' | 'enterprise', cycle: 'monthly' | 'annual') => void;
  invoices: Invoice[];
  commissions: CommissionRecord[];
  refunds: RefundRecord[];
  issueRefund: (orderNumber: string, amount: number, reasonAr: string, reasonEn: string) => void;
  topUpCredits: (amount: number) => void;
  // Auth state & modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register' | 'recover';
  setAuthMode: (mode: 'login' | 'register' | 'recover') => void;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password?: string, companyName?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('qabs_lang') as Language) || 'ar';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('qabs_theme_v2') as 'dark' | 'light') || 'light';
  });

  const [mode, setMode] = useState<AppMode>('landing');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [companies, setCompanies] = useState<CompanyFormation[]>(INITIAL_COMPANIES);
  const [stores, setStores] = useState<StoreInstance[]>(INITIAL_STORES);
  const [activeStoreId, setActiveStoreId] = useState<string>(INITIAL_STORES[0]?.id || 'store_01');
  const [products, setProducts] = useState<StoreProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<StoreOrder[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<StoreCustomer[]>(INITIAL_CUSTOMERS);
  const [discounts, setDiscounts] = useState<StoreDiscount[]>(INITIAL_DISCOUNTS);
  const [shippingZones, setShippingZones] = useState<StoreShippingZone[]>(INITIAL_SHIPPING_ZONES);
  const [storePages, setStorePages] = useState<StorePageItem[]>(INITIAL_STORE_PAGES);
  const [storeApps, setStoreApps] = useState<StoreAppAddon[]>(INITIAL_STORE_APPS);
  const [storeTemplates, setStoreTemplates] = useState<StoreTemplatePreset[]>(INITIAL_STORE_TEMPLATES);

  const [banking, setBanking] = useState<BankingAccount[]>(INITIAL_BANKING);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscription & Billing states
  const [subscription, setSubscription] = useState<UserSubscription>(INITIAL_USER_SUBSCRIPTION);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [commissions] = useState<CommissionRecord[]>(INITIAL_COMMISSIONS);
  const [refunds, setRefunds] = useState<RefundRecord[]>(INITIAL_REFUNDS);

  // Auth modal states
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>('login');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('qabs_lang', language);
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('qabs_theme_v2', theme);
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const appendAudit = (actionAr: string, actionEn: string, target: string, status: AuditLogItem['status'] = 'success') => {
    setAuditLogs(prev => [
      {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        actor: user.name,
        actionAr,
        actionEn,
        target,
        status
      },
      ...prev
    ]);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'super_admin') {
      appendAudit(
        'محاولة تصعيد محلي إلى Super Admin محظورة',
        'Local Super Admin escalation blocked by security guard',
        'RBAC_KERNEL',
        'blocked'
      );
      showToast(
        language === 'ar'
          ? 'تم حظر الصلاحية (BLOCKED): لا يمكن تفعيل Super Admin محلياً دون جلسة خادمية موثقة.'
          : 'Privilege blocked: Super Admin cannot be activated locally without a verified server session.'
      );
      return;
    }

    setUser(prev => ({
      ...prev,
      role: newRole,
      name:
        newRole === 'merchant'
          ? 'محمد الخالدي (مالك متجر قبس)'
          : newRole === 'compliance_officer'
          ? 'سارة المنصوري (مراجعة واعتماد المتاجر)'
          : 'كريم عادل (دعم المتاجر)'
    }));
    showToast(
      language === 'ar'
        ? `تم التبديل إلى منظور: ${newRole === 'merchant' ? 'مالك المتجر' : newRole}`
        : `Switched perspective to: ${newRole}`
    );
  };

  const addCompany = (comp: Omit<CompanyFormation, 'id' | 'filingDate' | 'status' | 'documents'>) => {
    const newComp: CompanyFormation = {
      ...comp,
      id: `comp_${Date.now()}`,
      tenant_id: user.id, // Strictly linked to customer's account
      filingDate: new Date().toISOString().split('T')[0],
      status: 'submitted', // Strictly 'submitted' initial intake (never submitted_to_state without verified filing)
      renewalDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      documents: [],
      registeredAgent: 'بانتظار التعيين الرسمي بعد مراجعة الطلب (Pending Assignment)',
      registeredAddress: 'يحدد رسمياً بعد المراجعة وتأكيد ملف الولاية (Pending Verification)'
    };
    setCompanies(prev => [newComp, ...prev]);

    appendAudit(
      `إنشاء طلب تأسيس مبدئي (${newComp.companyName}) بحالة Submitted`,
      `Created initial formation intake (${newComp.companyName}) with status Submitted`,
      `company_formations:${newComp.id}`,
      'success'
    );

    showToast(
      language === 'ar'
        ? 'تم حفظ طلب التأسيس المبدئي بنجاح بحالة (مستلم) بانتظار المراجعة ✅'
        : 'Initial company formation intake saved as (Submitted) pending review ✅'
    );
  };

  const updateCompanyStatus = (id: string, status: CompanyFormation['status']) => {
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
  };

  // --- QABS STORES MULTI-TENANT ACTIONS ---
  const addStore = (
    storeData: Omit<StoreInstance, 'id' | 'productsCount' | 'ordersCount' | 'totalRevenue' | 'createdAt'>
  ) => {
    const newStoreId = `store_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newStore: StoreInstance = {
      ...storeData,
      id: newStoreId,
      ownerName: storeData.ownerName || user.name,
      ownerEmail: storeData.ownerEmail || user.email,
      activityAr: storeData.activityAr || 'تجارة إلكترونية عامة',
      activityEn: storeData.activityEn || 'General Commerce',
      country: storeData.country || 'SA',
      defaultLanguage: storeData.defaultLanguage || 'both',
      taxRate: storeData.taxRate ?? 15,
      productsCount: 0,
      ordersCount: 0,
      totalRevenue: 0,
      createdAt: today,
      status: 'draft',
      approvalStatus: 'draft',
      paymentConnected: false,
      paymentApprovalStatus: 'unconfigured',
      domainVerified: false,
      templateId: storeData.templateId || 'tpl_luxury_gold',
      primaryColor: storeData.primaryColor || '#004457',
      accentColor: storeData.accentColor || '#C8A24A',
      fontFamily: storeData.fontFamily || 'Cairo',
      headerStyle: storeData.headerStyle || 'executive',
      footerTextAr: storeData.footerTextAr || `جميع الحقوق محفوظة © ${storeData.name} — يعمل عبر منصة متاجر قبس QABS Stores`,
      footerTextEn: storeData.footerTextEn || `All rights reserved © ${storeData.name} — Powered by QABS Stores`,
      sections: storeData.sections || DEFAULT_STORE_SECTIONS.map(sec => ({ ...sec })),
      designVersions: [
        {
          id: `ver_${Date.now()}`,
          label: 'النسخة التأسيسية 1.0',
          savedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          theme: storeData.theme || 'gold_executive',
          primaryColor: storeData.primaryColor || '#004457',
          accentColor: storeData.accentColor || '#C8A24A',
          fontFamily: storeData.fontFamily || 'Cairo',
          sections: (storeData.sections || DEFAULT_STORE_SECTIONS).map(s => ({ ...s }))
        }
      ]
    };

    setStores(prev => [newStore, ...prev]);
    setActiveStoreId(newStore.id);

    // Seed default isolated pages for the new store
    const defaultPages: StorePageItem[] = [
      {
        id: `pg_${Date.now()}_1`,
        storeId: newStoreId,
        slug: 'home',
        titleAr: 'الصفحة الرئيسية',
        titleEn: 'Home Page',
        type: 'home',
        contentAr: `مرحباً بكم في ${storeData.name} — وجهتكم الأولى للتسوق الإلكتروني الموثوق.`,
        contentEn: `Welcome to ${storeData.name} — your premier online shopping destination.`,
        published: true,
        updatedAt: today
      },
      {
        id: `pg_${Date.now()}_2`,
        storeId: newStoreId,
        slug: 'about',
        titleAr: 'من نحن',
        titleEn: 'About Us',
        type: 'about',
        contentAr: `نحن في ${storeData.name} نلتزم بتقديم منتجات عالية الجودة وخدمة عملاء استثنائية.`,
        contentEn: `At ${storeData.name}, we are committed to top-tier quality and customer care.`,
        published: true,
        updatedAt: today
      },
      {
        id: `pg_${Date.now()}_3`,
        storeId: newStoreId,
        slug: 'contact',
        titleAr: 'اتصل بنا',
        titleEn: 'Contact Us',
        type: 'contact',
        contentAr: `للتواصل مع فريق خدمة العملاء في ${storeData.name}: البريد الإلكتروني ${user.email}`,
        contentEn: `Contact ${storeData.name} support via email: ${user.email}`,
        published: true,
        updatedAt: today
      },
      {
        id: `pg_${Date.now()}_4`,
        storeId: newStoreId,
        slug: 'policy',
        titleAr: 'سياسة الاستبدال والاسترجاع',
        titleEn: 'Return & Refund Policy',
        type: 'policy',
        contentAr: 'يحق للعميل طلب الاستبدال أو الاسترجاع خلال 14 يوماً من تاريخ استلام الطلب.',
        contentEn: 'Customers may request a return or exchange within 14 days of delivery.',
        published: true,
        updatedAt: today
      }
    ];
    setStorePages(prev => [...defaultPages, ...prev]);

    appendAudit(
      `إنشاء متجر إلكتروني مستقل جديد (${storeData.name}) بانتظار التجهيز والاعتماد`,
      `Created new isolated store (${storeData.name}) in draft state`,
      `${storeData.subdomain}`
    );

    showToast(
      language === 'ar'
        ? `تم إنشاء متجر "${storeData.name}" بنجاح! يمكنك الآن تخصيصه وإضافة منتجاته.`
        : `Store "${storeData.name}" created! Customize and add products now.`
    );
  };

  const updateStoreTheme = (id: string, newTheme: StoreInstance['theme'], customDomain?: string) => {
    setStores(prev =>
      prev.map(s => (s.id === id ? { ...s, theme: newTheme, customDomain: customDomain ?? s.customDomain } : s))
    );
    showToast(language === 'ar' ? 'تم تحديث مظهر المتجر بنجاح' : 'Store theme updated successfully');
  };

  const updateStoreDetails = (id: string, updates: Partial<StoreInstance>) => {
    setStores(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    showToast(language === 'ar' ? 'تم حفظ إعدادات وتصميم المتجر بنجاح' : 'Store settings & design saved');
  };

  const submitStoreForApproval = (storeId: string) => {
    const targetStore = stores.find(s => s.id === storeId);
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              status: 'pending_approval',
              approvalStatus: 'pending_review',
              adminFeedback: undefined
            }
          : s
      )
    );
    appendAudit(
      `إرسال المتجر (${targetStore?.name || storeId}) إلى إدارة قبس للمراجعة والاعتماد قبل النشر`,
      `Submitted store (${targetStore?.name || storeId}) to QABS Admin for publication review`,
      targetStore?.subdomain || storeId,
      'info'
    );
    showToast(
      language === 'ar'
        ? 'تم إرسال المتجر إلى لوحة إدارة قبس للمراجعة والاعتماد!'
        : 'Store submitted to QABS Central Admin for approval!'
    );
  };

  const reviewStoreApproval = (
    storeId: string,
    decision: 'approved_published' | 'changes_requested' | 'rejected',
    feedback?: string
  ) => {
    const targetStore = stores.find(s => s.id === storeId);
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              approvalStatus: decision,
              status: decision === 'approved_published' ? 'active' : decision === 'rejected' ? 'suspended' : 'draft',
              adminFeedback: feedback
            }
          : s
      )
    );

    const statusLabelAr =
      decision === 'approved_published'
        ? 'اعتماد ونشر المتجر رسمياً'
        : decision === 'changes_requested'
        ? 'طلب تعديلات على المتجر قبل النشر'
        : 'رفض طلب نشر المتجر';

    appendAudit(
      `${statusLabelAr}: ${targetStore?.name || storeId}`,
      `Store review decision (${decision}): ${targetStore?.name || storeId}`,
      targetStore?.subdomain || storeId,
      decision === 'approved_published' ? 'success' : 'warning'
    );

    showToast(
      language === 'ar'
        ? `تم تحديث حالة اعتماد المتجر: ${statusLabelAr}`
        : `Store approval status updated: ${decision}`
    );
  };

  const requestPaymentActivation = (storeId: string, gatewayType: StoreInstance['gatewayType']) => {
    const targetStore = stores.find(s => s.id === storeId);
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              gatewayType,
              paymentConnected: false,
              paymentApprovalStatus: 'pending_admin_approval'
            }
          : s
      )
    );
    appendAudit(
      `طلب تفعيل بوابة الدفع (${gatewayType}) للمتجر ${targetStore?.name} — بانتظار التحقق اليدوي من قبس`,
      `Requested payment gateway (${gatewayType}) activation for ${targetStore?.name} — pending manual admin verification`,
      targetStore?.subdomain || storeId,
      'info'
    );
    showToast(
      language === 'ar'
        ? `تم رفع طلب ربط بوابة ${gatewayType} إلى إدارة قبس (لا يتم التفعيل التلقائي إلا بعد الاعتماد)`
        : `Payment gateway ${gatewayType} request sent to QABS Admin for manual approval`
    );
  };

  const approveStorePayment = (storeId: string, approved: boolean) => {
    const targetStore = stores.find(s => s.id === storeId);
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              paymentConnected: approved,
              paymentApprovalStatus: approved ? 'approved_active' : 'unconfigured'
            }
          : s
      )
    );
    appendAudit(
      approved
        ? `اعتماد وتفعيل بوابة الدفع (${targetStore?.gatewayType}) للمتجر ${targetStore?.name}`
        : `إيقاف/رفض تفعيل بوابة الدفع للمتجر ${targetStore?.name}`,
      approved
        ? `Approved & activated payment gateway (${targetStore?.gatewayType}) for ${targetStore?.name}`
        : `Rejected payment gateway for ${targetStore?.name}`,
      targetStore?.subdomain || storeId,
      approved ? 'success' : 'warning'
    );
    showToast(
      language === 'ar'
        ? approved
          ? 'تم اعتماد وتفعيل بوابة الدفع للمتجر بنجاح!'
          : 'تم رفض طلب بوابة الدفع'
        : approved
        ? 'Payment gateway approved and activated!'
        : 'Payment gateway request rejected'
    );
  };

  const requestDomainVerification = (storeId: string, customDomain: string) => {
    const cleanDomain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '');
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              customDomain: cleanDomain,
              domainVerified: false
            }
          : s
      )
    );
    appendAudit(
      `طلب ربط نطاق مخصص (${cleanDomain}) بانتظار فحص DNS من قبس`,
      `Requested custom domain (${cleanDomain}) DNS verification`,
      cleanDomain,
      'info'
    );
    showToast(
      language === 'ar'
        ? `تم تسجيل النطاق ${cleanDomain} وإرسال طلب فحص DNS إلى لوحة قبس`
        : `Domain ${cleanDomain} registered and queued for DNS verification`
    );
  };

  const verifyStoreDomain = (storeId: string) => {
    const targetStore = stores.find(s => s.id === storeId);
    setStores(prev => prev.map(s => (s.id === storeId ? { ...s, domainVerified: true } : s)));
    appendAudit(
      `تأكيد فحص CNAME وتفعيل شهادة SSL للنطاق ${targetStore?.customDomain}`,
      `Verified DNS & provisioned SSL for ${targetStore?.customDomain}`,
      targetStore?.customDomain || storeId,
      'success'
    );
    showToast(
      language === 'ar'
        ? 'تم التحقق من النطاق وتفعيل شهادة SSL بنجاح!'
        : 'Custom domain verified and SSL activated!'
    );
  };

  const saveStoreSnapshot = (storeId: string, label: string) => {
    setStores(prev =>
      prev.map(s => {
        if (s.id !== storeId) return s;
        const newSnap = {
          id: `ver_${Date.now()}`,
          label: label || `نسخة محفوظة (${new Date().toLocaleTimeString()})`,
          savedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          theme: s.theme,
          primaryColor: s.primaryColor || '#004457',
          accentColor: s.accentColor || '#C8A24A',
          fontFamily: s.fontFamily || 'Cairo',
          sections: (s.sections || DEFAULT_STORE_SECTIONS).map(sec => ({ ...sec }))
        };
        return {
          ...s,
          designVersions: [newSnap, ...(s.designVersions || [])]
        };
      })
    );
    showToast(
      language === 'ar'
        ? 'تم حفظ نسخة التصميم في سجل استوديو قبس بنجاح'
        : 'Saved design snapshot in QABS Studio history'
    );
  };

  const restoreStoreSnapshot = (storeId: string, snapshotId: string) => {
    setStores(prev =>
      prev.map(s => {
        if (s.id !== storeId) return s;
        const snap = (s.designVersions || []).find(v => v.id === snapshotId);
        if (!snap) return s;
        return {
          ...s,
          theme: snap.theme,
          primaryColor: snap.primaryColor,
          accentColor: snap.accentColor,
          fontFamily: snap.fontFamily,
          sections: snap.sections.map(sec => ({ ...sec }))
        };
      })
    );
    showToast(
      language === 'ar' ? 'تم استعادة نسخة التصميم بنجاح!' : 'Design version restored successfully!'
    );
  };

  const updateStoreSections = (storeId: string, sections: StoreSectionBlock[]) => {
    setStores(prev => prev.map(s => (s.id === storeId ? { ...s, sections } : s)));
  };

  // --- PRODUCTS (Strictly isolated by storeId) ---
  const addProduct = (p: Omit<StoreProduct, 'id' | 'salesCount' | 'storeId'> & { storeId?: string }) => {
    const targetStoreId = p.storeId || activeStoreId;
    const newProduct: StoreProduct = {
      ...p,
      storeId: targetStoreId,
      id: `prod_${Date.now()}`,
      salesCount: 0
    };
    setProducts(prev => [newProduct, ...prev]);
    setStores(prev =>
      prev.map(s => (s.id === targetStoreId ? { ...s, productsCount: s.productsCount + 1 } : s))
    );
    showToast(language === 'ar' ? 'تم إضافة المنتج إلى المتجر بنجاح' : 'Product added to store catalog');
  };

  const updateProduct = (id: string, updates: Partial<StoreProduct>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    showToast(language === 'ar' ? 'تم تعديل بيانات المنتج والمخزون' : 'Product & inventory updated');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    if (prod) {
      setStores(prev =>
        prev.map(s => (s.id === prod.storeId ? { ...s, productsCount: Math.max(0, s.productsCount - 1) } : s))
      );
    }
    showToast(language === 'ar' ? 'تم حذف المنتج من المتجر' : 'Product deleted from store');
  };

  // --- ORDERS ---
  const addOrder = (orderData: Omit<StoreOrder, 'id' | 'orderNumber' | 'date'>) => {
    const newOrder: StoreOrder = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber: `QBS-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0]
    };
    setOrders(prev => [newOrder, ...prev]);
    setStores(prev =>
      prev.map(s =>
        s.id === orderData.storeId
          ? { ...s, ordersCount: s.ordersCount + 1, totalRevenue: s.totalRevenue + orderData.total }
          : s
      )
    );
    showToast(
      language === 'ar'
        ? `تم إنشاء الطلب ${newOrder.orderNumber} بنجاح!`
        : `Order ${newOrder.orderNumber} placed successfully!`
    );
  };

  const updateOrderStatus = (id: string, status: StoreOrder['status'], trackingNumber?: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === id
          ? {
              ...o,
              status,
              trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber
            }
          : o
      )
    );
    showToast(language === 'ar' ? 'تم تحديث حالة الطلب والشحنة' : 'Order & shipment status updated');
  };

  // --- CUSTOMERS ---
  const addCustomer = (c: Omit<StoreCustomer, 'id' | 'ordersCount' | 'totalSpent' | 'lastOrderDate'>) => {
    const newCustomer: StoreCustomer = {
      ...c,
      id: `cust_${Date.now()}`,
      ordersCount: 1,
      totalSpent: 0,
      lastOrderDate: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCustomer, ...prev]);
    showToast(language === 'ar' ? 'تم إضافة العميل إلى قاعدة بيانات المتجر' : 'Customer added to store CRM');
  };

  // --- DISCOUNTS ---
  const addDiscount = (d: Omit<StoreDiscount, 'id' | 'usedCount'>) => {
    const newDiscount: StoreDiscount = {
      ...d,
      id: `dsc_${Date.now()}`,
      usedCount: 0
    };
    setDiscounts(prev => [newDiscount, ...prev]);
    showToast(language === 'ar' ? `تم إنشاء كود الخصم ${d.code} بنجاح` : `Discount code ${d.code} created`);
  };

  const toggleDiscountStatus = (id: string) => {
    setDiscounts(prev =>
      prev.map(d => (d.id === id ? { ...d, status: d.status === 'active' ? 'expired' : 'active' } : d))
    );
    showToast(language === 'ar' ? 'تم تحديث حالة الكوبون' : 'Coupon status updated');
  };

  // --- SHIPPING ZONES ---
  const addShippingZone = (z: Omit<StoreShippingZone, 'id'>) => {
    const newZone: StoreShippingZone = {
      ...z,
      id: `shp_${Date.now()}`
    };
    setShippingZones(prev => [newZone, ...prev]);
    showToast(language === 'ar' ? 'تم إضافة منطقة وطريقة الشحن للمتجر' : 'Shipping zone added to store');
  };

  // --- STORE PAGES ---
  const saveStorePage = (page: Omit<StorePageItem, 'id' | 'updatedAt'> & { id?: string }) => {
    const today = new Date().toISOString().split('T')[0];
    if (page.id) {
      setStorePages(prev =>
        prev.map(p => (p.id === page.id ? { ...p, ...page, id: page.id, updatedAt: today } : p))
      );
      showToast(language === 'ar' ? 'تم تحديث محتوى الصفحة بنجاح' : 'Store page updated');
    } else {
      const newPage: StorePageItem = {
        ...page,
        id: `pg_${Date.now()}`,
        updatedAt: today
      };
      setStorePages(prev => [newPage, ...prev]);
      showToast(language === 'ar' ? 'تم إنشاء الصفحة المخصصة في المتجر' : 'Custom page created in store');
    }
  };

  const deleteStorePage = (id: string) => {
    setStorePages(prev => prev.filter(p => p.id !== id));
    showToast(language === 'ar' ? 'تم حذف الصفحة' : 'Page deleted');
  };

  // --- STORE APPS ---
  const toggleStoreApp = (appId: string, storeId: string) => {
    setStoreApps(prev =>
      prev.map(app => {
        if (app.id !== appId) return app;
        const currentIds = app.installedStoreIds || app.installedStores || [];
        const exists = currentIds.includes(storeId);
        const updatedIds = exists
          ? currentIds.filter(id => id !== storeId)
          : [...currentIds, storeId];
        return { ...app, installedStoreIds: updatedIds, installedStores: updatedIds };
      })
    );
    showToast(
      language === 'ar' ? 'تم تحديث حالة التطبيق في متجرك' : 'Store app integration updated'
    );
  };

  // --- CENTRAL TEMPLATES ---
  const addStoreTemplate = (tpl: Omit<StoreTemplatePreset, 'id'>) => {
    const newTpl: StoreTemplatePreset = {
      ...tpl,
      id: `tpl_${Date.now()}`
    };
    setStoreTemplates(prev => [newTpl, ...prev]);
    appendAudit(
      `إضافة قالب متجر جديد في استوديو قبس: ${tpl.nameAr}`,
      `Added new store template preset: ${tpl.nameEn}`,
      newTpl.id
    );
    showToast(language === 'ar' ? 'تم نشر القالب الجديد لجميع متاجر قبس' : 'New store template published');
  };

  const triggerSystemBackup = (targetLabel?: string) => {
    appendAudit(
      `نسخ احتياطي مشفر لبيانات المتاجر والمنتجات والطلبات (${targetLabel || 'جميع متاجر قبس'})`,
      `Encrypted multi-tenant snapshot backup completed (${targetLabel || 'All QABS Stores'})`,
      targetLabel || 'QABS-Cloud-Vault',
      'success'
    );
    showToast(
      language === 'ar'
        ? 'تم إنشاء نسخة احتياطية مشفرة كاملة وحفظها في سجل العمليات!'
        : 'Full encrypted backup snapshot created and logged!'
    );
  };

  const addBankAccount = (bank: Omit<BankingAccount, 'id' | 'balance' | 'status'>) => {
    const newAccount: BankingAccount = {
      ...bank,
      id: `bnk_${Date.now()}`,
      balance: 1000,
      status: 'verified'
    };
    setBanking(prev => [newAccount, ...prev]);
  };

  const addTicket = (t: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newTicket: SupportTicket = {
      ...t,
      id: `tkt_${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'open',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTickets(prev => [newTicket, ...prev]);
    showToast(
      language === 'ar'
        ? `تم فتح تذكرة الدعم ${newTicket.ticketNumber} بنجاح`
        : `Opened support ticket ${newTicket.ticketNumber}`
    );
  };

  const resolveTicket = (id: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'resolved', updatedAt: 'الآن' } : t))
    );
    showToast(language === 'ar' ? 'تم إغلاق التذكرة بنجاح' : 'Ticket resolved');
  };

  const addStaff = (s: Omit<StaffMember, 'id' | 'lastActive' | 'status'>) => {
    const newMember: StaffMember = {
      ...s,
      id: `stf_${Date.now()}`,
      status: 'active',
      lastActive: 'نشط الآن'
    };
    setStaff(prev => [newMember, ...prev]);
    showToast(language === 'ar' ? 'تم إضافة عضو جديد بصلاحيات مخصصة' : 'Staff member added with custom permissions');
  };

  const changeSubscriptionPlan = (planId: 'starter' | 'growth' | 'enterprise', cycle: 'monthly' | 'annual') => {
    const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[1];
    const newPrice = cycle === 'annual' ? targetPlan.priceAnnual : targetPlan.priceMonthly;
    setSubscription({
      planId,
      billingCycle: cycle,
      renewalDate: new Date(Date.now() + (cycle === 'annual' ? 365 : 30) * 86400000).toISOString().split('T')[0],
      status: 'active',
      currentPrice: newPrice
    });

    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-QBS-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      amount: newPrice * (cycle === 'annual' ? 12 : 1),
      currency: 'USD',
      status: 'paid',
      descriptionAr: `اشتراك متاجر قبس — ${targetPlan.nameAr} (${cycle === 'annual' ? 'سنوي' : 'شهري'})`,
      descriptionEn: `QABS Stores Subscription — ${targetPlan.nameEn} (${cycle})`,
      clientName: user.companyName || user.name
    };
    setInvoices(prev => [newInv, ...prev]);

    showToast(
      language === 'ar'
        ? `تم تحديث باقة متجرك إلى: ${targetPlan.nameAr}`
        : `Updated store plan to: ${targetPlan.nameEn}`
    );
  };

  const issueRefund = (orderNumber: string, amount: number, reasonAr: string, reasonEn: string) => {
    const newRefund: RefundRecord = {
      id: `ref_${Date.now()}`,
      orderNumber,
      amount,
      currency: 'USD',
      reasonAr,
      reasonEn,
      status: 'processed',
      date: new Date().toISOString().split('T')[0],
      customerName: user.name
    };
    setRefunds(prev => [newRefund, ...prev]);
    setOrders(prev => prev.map(o => (o.orderNumber === orderNumber ? { ...o, status: 'refunded' } : o)));

    showToast(
      language === 'ar'
        ? `تم تنفيذ استرجاع الطلب ${orderNumber} بقيمة $${amount}`
        : `Processed refund of $${amount} for order ${orderNumber}`
    );
  };

  const topUpCredits = (amount: number) => {
    setUser(prev => ({ ...prev, credits: prev.credits + amount }));
    showToast(
      language === 'ar'
        ? `تم شحن رصيد حساب المتجر بمبلغ +$${amount}`
        : `Recharged store account balance by +$${amount}`
    );
  };

  const login = async (email: string, password?: string, _role?: UserRole): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || '' })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('qabs_token', data.token);
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || 'merchant',
          companyName: data.user.company_name || 'QABS Merchant LLC',
          credits: data.user.credits || 0,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        });
        setAuthModalOpen(false);
        showToast(language === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Welcome to QABS!');
        return true;
      } else {
        const errorMsg = data.message_ar || data.message_en || (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed');
        showToast(errorMsg);
        return false;
      }
    } catch {
      showToast(language === 'ar' ? 'تعذر الاتصال بخدمة تسجيل الدخول. حاول مجدداً.' : 'Unable to reach the sign-in service. Please try again.');
      return false;
    }
  };

  const register = async (name: string, email: string, password?: string, companyName?: string, _role?: UserRole): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: password || '',
          company_name: companyName || `${name} LLC`
        })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('qabs_token', data.token);
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || 'merchant',
          companyName: data.user.company_name || companyName || 'QABS Merchant LLC',
          credits: data.user.credits || 0,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        });
        setAuthModalOpen(false);
        showToast(language === 'ar' ? 'تم إنشاء حساب العميل بنجاح!' : 'Customer account created successfully!');
        return true;
      } else {
        const errorMsg = data.message_ar || data.message_en || (language === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed');
        showToast(errorMsg);
        return false;
      }
    } catch {
      showToast(language === 'ar' ? 'تعذر الاتصال بخدمة إنشاء الحساب. حاول مجدداً.' : 'Unable to reach the registration service. Please try again.');
      return false;
    }
  };

  const logout = () => {
    const token = localStorage.getItem('qabs_token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('qabs_token');
    setUser({
      id: 'guest',
      name: 'زائر متاجر قبس',
      email: 'guest@qabs1.store',
      role: 'merchant',
      avatar: '',
      credits: 0
    });
    showToast(language === 'ar' ? 'تم تسجيل الخروج' : 'Logged out');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        mode,
        setMode,
        user,
        switchRole,
        companies,
        addCompany,
        updateCompanyStatus,
        stores,
        activeStoreId,
        setActiveStoreId,
        addStore,
        updateStoreTheme,
        updateStoreDetails,
        submitStoreForApproval,
        reviewStoreApproval,
        requestPaymentActivation,
        approveStorePayment,
        requestDomainVerification,
        verifyStoreDomain,
        saveStoreSnapshot,
        restoreStoreSnapshot,
        updateStoreSections,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        addOrder,
        updateOrderStatus,
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
        addStoreTemplate,
        triggerSystemBackup,
        banking,
        addBankAccount,
        tickets,
        addTicket,
        resolveTicket,
        staff,
        addStaff,
        auditLogs,
        subscription,
        changeSubscriptionPlan,
        invoices,
        commissions,
        refunds,
        issueRefund,
        topUpCredits,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        login,
        register,
        logout,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
