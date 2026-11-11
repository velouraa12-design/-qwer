export type Language = 'ar' | 'en';

export type AppMode = 'landing' | 'portal' | 'store_builder' | 'billing' | 'admin' | 'template_hub';

export type UserRole = 'super_admin' | 'merchant' | 'support_agent' | 'compliance_officer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  companyName?: string;
  credits: number;
}

export interface SubscriptionPlan {
  id: 'starter' | 'growth' | 'enterprise';
  nameAr: string;
  nameEn: string;
  badgeAr?: string;
  badgeEn?: string;
  priceMonthly: number;
  priceAnnual: number;
  descriptionAr: string;
  descriptionEn: string;
  featuresAr: string[];
  featuresEn: string[];
  popular?: boolean;
  maxStores: number;
  maxProducts: number;
  commissionFee: number;
}

export interface UserSubscription {
  planId: 'starter' | 'growth' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  renewalDate: string;
  status: 'active' | 'past_due' | 'canceled';
  currentPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded';
  descriptionAr: string;
  descriptionEn: string;
  clientName: string;
}

export interface CommissionRecord {
  id: string;
  storeId: string;
  storeName: string;
  orderNumber: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'settled' | 'pending';
  date: string;
}

export interface RefundRecord {
  id: string;
  orderNumber: string;
  amount: number;
  currency: string;
  reasonAr: string;
  reasonEn: string;
  status: 'processed' | 'requested' | 'rejected';
  date: string;
  customerName: string;
}

export type Jurisdiction = 'US_DELAWARE' | 'US_WYOMING' | 'US_NEW_MEXICO' | 'UK_LTD' | string;

export interface StatePricingItem {
  code: string;
  jurisdictionId: Jurisdiction;
  nameAr: string;
  nameEn: string;
  stateFilingFee: number;
  qabsServiceFee: number;
  totalPackagePrice: number;
  annualReportFee: number;
  stateTaxAr: string;
  stateTaxEn: string;
  processingTimeAr: string;
  processingTimeEn: string;
  badgeAr?: string;
  badgeEn?: string;
  recommendedForAr: string;
  recommendedForEn: string;
  tags: ('popular' | 'zero_tax' | 'zero_annual' | 'low_fee' | 'vc_ready')[];
}

export interface CompanyFormation {
  id: string;
  companyName: string;
  jurisdiction: Jurisdiction;
  entityType: 'LLC' | 'C-CORP' | 'LTD';
  stateFileNumber?: string;
  ein?: string;
  crn?: string;
  registeredAgent: string;
  registeredAddress: string;
  filingDate: string;
  renewalDueDate: string;
  status: 'draft' | 'under_review' | 'submitted_to_state' | 'approved' | 'action_required';
  documents: {
    name: string;
    type: 'articles' | 'ein_letter' | 'operating_agreement' | 'certificate_of_inc' | 'resolution';
    status: 'ready' | 'generating' | 'pending';
    date: string;
  }[];
  notes?: string;
}

// ==========================================
// QABS STORES — MULTI-TENANT COMMERCE ENGINE
// ==========================================

export type StoreThemeType =
  | 'luxury_dark'
  | 'minimal_white'
  | 'gold_executive'
  | 'aqua_petrol'
  | 'modern_boutique';

export interface StoreSectionBlock {
  id: string;
  type: 'hero' | 'featured_products' | 'categories' | 'promo_banner' | 'testimonials' | 'rich_text' | 'newsletter';
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  enabled?: boolean;
  visible?: boolean;
  accentColor?: string;
}

export interface StoreDesignSnapshot {
  id: string;
  versionName?: string;
  label?: string;
  timestamp?: string;
  savedAt?: string;
  theme: StoreThemeType;
  primaryColor: string;
  accentColor?: string;
  fontFamily: string;
  sections: StoreSectionBlock[];
}

export interface StoreTemplatePreset {
  id: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  theme: StoreThemeType;
  primaryColor: string;
  accentColor?: string;
  fontFamily?: string;
  previewImage: string;
  descriptionAr?: string;
  descriptionEn?: string;
  activeStoresCount?: number;
  active?: boolean;
}

export interface StoreProductVariant {
  id?: string;
  nameAr: string;
  nameEn: string;
  options?: string[];
  sku?: string;
  price?: number;
  stock?: number;
}

export interface StoreProduct {
  id: string;
  storeId: string; // Strict tenant isolation: product belongs exclusively to this store
  titleAr?: string;
  titleEn?: string;
  nameAr?: string;
  nameEn?: string;
  sku: string;
  barcode?: string;
  productType: 'physical' | 'digital';
  price: number;
  cost?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  warehouse?: string;
  category?: string;
  categoryAr?: string;
  categoryEn?: string;
  status: 'active' | 'draft' | 'out_of_stock';
  supplier?: string;
  salesCount: number;
  variants?: StoreProductVariant[];
  image?: string;
  imageUrl?: string;
  videoUrl?: string;
  descriptionAr?: string;
  descriptionEn?: string;
}

export interface StoreOrder {
  id: string;
  storeId: string; // Strict tenant isolation
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerCountry?: string;
  itemsCount: number;
  total: number;
  taxAmount?: number;
  shippingAmount?: number;
  shippingCost?: number;
  currency?: string;
  status: 'paid' | 'processing' | 'shipped' | 'delivered' | 'refunded' | 'canceled' | 'cancelled';
  createdAt?: string;
  date?: string;
  paymentGateway?: 'Stripe' | 'Tap' | 'Moyasar' | 'Wise' | 'PayPal' | 'COD';
  trackingNumber?: string;
  shippingCarrier?: string;
}

export interface StoreCustomer {
  id: string;
  storeId: string; // Strict tenant isolation
  name: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface StoreDiscount {
  id: string;
  storeId: string; // Strict tenant isolation
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  usageCount?: number;
  usedCount?: number;
  maxUses?: number;
  expiresAt: string;
  status: 'active' | 'expired';
}

export interface StoreShippingZone {
  id: string;
  storeId: string; // Strict tenant isolation
  regionNameAr: string;
  regionNameEn: string;
  countries?: string;
  carrier: string;
  rate: number;
  freeAbove?: number;
  estimatedDays?: string;
  deliveryTimeAr?: string;
  deliveryTimeEn?: string;
  status?: 'active' | 'paused';
  active?: boolean;
}

export interface StorePageItem {
  id: string;
  storeId: string; // Strict tenant isolation
  slug: string;
  titleAr: string;
  titleEn: string;
  type?: 'home' | 'about' | 'contact' | 'policy' | 'custom';
  contentAr: string;
  contentEn: string;
  isSystem?: boolean;
  published: boolean;
  updatedAt?: string;
}

export interface StoreAppAddon {
  id: string;
  nameAr: string;
  nameEn: string;
  categoryAr?: string;
  categoryEn?: string;
  descriptionAr: string;
  descriptionEn: string;
  installedStores?: string[];
  installedStoreIds?: string[];
}

export interface StoreInstance {
  id: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  name: string;
  activityAr?: string;
  activityEn?: string;
  country?: string;
  defaultLang?: 'ar' | 'en' | 'both';
  defaultLanguage?: 'ar' | 'en' | 'both';
  subdomain: string;
  customDomain?: string;
  domainStatus?: 'none' | 'pending_verification' | 'verified_active';
  domainVerified?: boolean;
  currency: string;
  theme: StoreThemeType;
  templateId?: string;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headerStyle?: 'centered' | 'executive' | 'minimal';
  logoText?: string;
  headerAnnouncementAr?: string;
  headerAnnouncementEn?: string;
  footerTextAr?: string;
  footerTextEn?: string;
  productsCount: number;
  ordersCount: number;
  totalRevenue: number;
  status: 'active' | 'setup' | 'paused' | 'draft' | 'pending_approval' | 'suspended';
  // Approval lifecycle (Strict rule: no store published before QABS approval)
  approvalStatus?: 'draft' | 'pending_review' | 'approved_published' | 'changes_requested' | 'rejected';
  adminReviewNotes?: string;
  adminFeedback?: string;
  // Payment gateway lifecycle (Strict rule: no payment gateway activated automatically)
  paymentConnected: boolean;
  paymentApprovalStatus?: 'unconfigured' | 'pending_admin_approval' | 'approved_active';
  gatewayType: 'Stripe' | 'Tap' | 'Moyasar' | 'PayPal';
  taxRate?: number;
  sections?: StoreSectionBlock[];
  designVersions?: StoreDesignSnapshot[];
  createdAt: string;
}

export interface BankingAccount {
  id: string;
  provider: 'Mercury' | 'Wise Business' | 'Relay' | 'Payoneer';
  accountName: string;
  accountNumberMasked: string;
  routingNumber: string;
  currency: string;
  balance: number;
  status: 'verified' | 'pending_verification' | 'needs_ein';
  linkedCompany: string;
}

export interface SupportTicket {
  id: string;
  storeId?: string;
  ticketNumber: string;
  subject?: string;
  subjectAr?: string;
  subjectEn?: string;
  category: 'formation' | 'store' | 'payments' | 'billing' | 'technical' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_on_client' | 'resolved';
  createdAt: string;
  updatedAt: string;
  clientName: string;
  assignedTo?: string;
  lastMessage?: string;
}

export interface StaffMember {
  id: string;
  storeId?: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  departmentAr?: string;
  departmentEn?: string;
  permissions: string[];
  status: 'active' | 'suspended';
  lastActive: string;
}

export interface AuditLogItem {
  id: string;
  storeId?: string;
  timestamp: string;
  actor: string;
  actionAr: string;
  actionEn: string;
  target: string;
  status: 'success' | 'warning' | 'info';
}
