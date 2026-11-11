import {
  CompanyFormation,
  StoreInstance,
  StoreProduct,
  StoreOrder,
  StoreCustomer,
  StoreDiscount,
  StoreShippingZone,
  StorePageItem,
  StoreTemplatePreset,
  StoreAppAddon,
  BankingAccount,
  SupportTicket,
  StaffMember,
  AuditLogItem,
  UserProfile,
  StoreSectionBlock
} from '../types/index.ts';

export const INITIAL_USER: UserProfile = {
  id: 'usr_qabs_99',
  name: 'عبدالله السعدي',
  email: 'founder@qabs1.store',
  role: 'super_admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  companyName: 'Qabs Global Ventures LLC',
  credits: 4850
};

export const DEFAULT_STORE_SECTIONS: StoreSectionBlock[] = [
  {
    id: 'sec_hero',
    type: 'hero',
    titleAr: 'البانر الرئيسي (Hero Showcase)',
    titleEn: 'Hero Banner Showcase',
    subtitleAr: 'تشكيلة الموسم الحصرية بجودة عالمية وشحن سريع',
    subtitleEn: 'Exclusive seasonal collection with worldwide express shipping',
    enabled: true,
    accentColor: '#004457'
  },
  {
    id: 'sec_categories',
    type: 'categories',
    titleAr: 'شبكة التصنيفات الرئيسية',
    titleEn: 'Featured Categories Grid',
    subtitleAr: 'تصفح أقسام المتجر حسب الفئة',
    subtitleEn: 'Browse store catalog by department',
    enabled: true,
    accentColor: '#00A896'
  },
  {
    id: 'sec_featured',
    type: 'featured_products',
    titleAr: 'المنتجات الأكثر مبيعاً',
    titleEn: 'Best Selling Products',
    subtitleAr: 'اختيارات عملائنا المفضلة لهذا الشهر',
    subtitleEn: 'Top-rated customer favorites this month',
    enabled: true,
    accentColor: '#C8A24A'
  },
  {
    id: 'sec_promo',
    type: 'promo_banner',
    titleAr: 'شريط العروض والخصومات المؤقتة',
    titleEn: 'Flash Sale Promotional Banner',
    subtitleAr: 'استخدم كود QABS15 للحصول على خصم 15% إضافي عند الدفع',
    subtitleEn: 'Use code QABS15 at checkout for an extra 15% off',
    enabled: true,
    accentColor: '#007F8B'
  },
  {
    id: 'sec_reviews',
    type: 'testimonials',
    titleAr: 'تقييمات وآراء العملاء الموثقة',
    titleEn: 'Verified Customer Reviews',
    subtitleAr: 'أكثر من 1,200 عميل يثقون بمنتجاتنا',
    subtitleEn: 'Trusted by over 1,200 happy shoppers',
    enabled: true,
    accentColor: '#004457'
  },
  {
    id: 'sec_newsletter',
    type: 'newsletter',
    titleAr: 'النشرة البريدية والعروض الخاصة',
    titleEn: 'VIP Newsletter Subscription',
    subtitleAr: 'اشترك لتصلك أحدث الإصدارات والعروض الحصرية',
    subtitleEn: 'Subscribe for early access to new drops',
    enabled: true,
    accentColor: '#00A896'
  }
];

export const INITIAL_STORE_TEMPLATES: StoreTemplatePreset[] = [
  {
    id: 'tpl_luxury_royal',
    nameAr: 'قالب قبس الملكي للعود والمجوهرات',
    nameEn: 'QABS Royal Oud & Jewelry',
    categoryAr: 'عطور ومجوهرات فاخرة',
    categoryEn: 'Luxury & Fragrances',
    theme: 'gold_executive',
    primaryColor: '#C8A24A',
    previewImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    descriptionAr: 'تصميم فخم باللون الكحلي والذهبي مخصص لمتاجر الساعات، العود، المجوهرات والهدايا الملكية.',
    descriptionEn: 'Executive navy and gold storefront crafted for luxury horology, oud, and fine jewelry.',
    activeStoresCount: 142
  },
  {
    id: 'tpl_aqua_modern',
    nameAr: 'قالب قبس تيل للتجارة العصرية',
    nameEn: 'QABS Aqua Petrol Flagship',
    categoryAr: 'متاجر شاملة وعصرية',
    categoryEn: 'General & Flagship Retail',
    theme: 'aqua_petrol',
    primaryColor: '#00A896',
    previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    descriptionAr: 'القالب الرسمي المعتمد بهوية قبس (كحلي بترولي وتركواز) مثالي للمتاجر المتنوعة والعلامات التجارية.',
    descriptionEn: 'Official QABS signature petrol and aqua-teal template built for high-conversion retail.',
    activeStoresCount: 289
  },
  {
    id: 'tpl_minimal_fashion',
    nameAr: 'قالب بوتيك الأزياء والموضة (Minimal)',
    nameEn: 'Vogue Minimal Apparel',
    categoryAr: 'أزياء وملابس وإكسسوارات',
    categoryEn: 'Fashion & Boutique',
    theme: 'minimal_white',
    primaryColor: '#004457',
    previewImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
    descriptionAr: 'واجهة بيضاء نقية تبرز صور المنتجات والموديلات مع دعم كامل لمتغيرات المقاس واللون.',
    descriptionEn: 'Clean editorial white canvas highlighting lookbooks, size variants, and color swatches.',
    activeStoresCount: 198
  },
  {
    id: 'tpl_tech_dark',
    nameAr: 'قالب تك فولت للإلكترونيات والمنتجات الرقمية',
    nameEn: 'CyberPulse Tech & Digital',
    categoryAr: 'إلكترونيات ومنتجات رقمية',
    categoryEn: 'Electronics & Digital Goods',
    theme: 'luxury_dark',
    primaryColor: '#00B8A9',
    previewImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    descriptionAr: 'واجهة داكنة احترافية لمتاجر الأجهزة الذكية، الإكسسوارات التقنية، والاشتراكات الرقمية الفورية.',
    descriptionEn: 'Sleek dark UI engineered for gadgets, hardware specs, and instant digital downloads.',
    activeStoresCount: 164
  },
  {
    id: 'tpl_specialty_cafe',
    nameAr: 'قالب القهوة المختصة والمحامص والذواقة',
    nameEn: 'Artisan Roastery & Gourmet',
    categoryAr: 'أغذية وقهوة مختصة',
    categoryEn: 'Specialty Coffee & F&B',
    theme: 'modern_boutique',
    primaryColor: '#8A5A36',
    previewImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    descriptionAr: 'مصمم لمحامص القهوة المختصة والتمور الفاخرة والمنتجات الغذائية مع خيارات الوزن والطحن.',
    descriptionEn: 'Warm artisanal layout for specialty coffee roasters, dates, and gourmet food brands.',
    activeStoresCount: 93
  }
];

export const INITIAL_STORES: StoreInstance[] = [
  {
    id: 'store_01',
    ownerId: 'usr_merchant_01',
    ownerName: 'محمد الخالدي',
    ownerEmail: 'khalidi@lux-qabs.com',
    name: 'قبس لكشري للساعات والجلديات | QABS Elite Lux',
    activityAr: 'ساعات فاخرة وجلديات إيطالية',
    activityEn: 'Luxury Watches & Italian Leather',
    country: 'SA',
    defaultLang: 'ar',
    subdomain: 'lux.qabs1.store',
    customDomain: 'www.lux-qabs.com',
    domainStatus: 'verified_active',
    currency: 'SAR',
    theme: 'gold_executive',
    primaryColor: '#C8A24A',
    fontFamily: 'Cairo',
    logoText: 'QABS ELITE LUX',
    headerAnnouncementAr: 'شحن مجاني سريع عبر DHL لكافة دول الخليج للطلبات فوق 500 ر.س',
    headerAnnouncementEn: 'Free DHL Express shipping across GCC on orders above 500 SAR',
    footerTextAr: 'جميع الحقوق محفوظة لمتجر قبس لكشري © 2026 — مشغل بواسطة منصة QABS Stores',
    footerTextEn: 'All rights reserved © 2026 QABS Elite Lux — Powered by QABS Stores',
    productsCount: 3,
    ordersCount: 1380,
    totalRevenue: 148920,
    status: 'active',
    approvalStatus: 'approved_published',
    adminReviewNotes: 'تم التحقق من السجل التجاري والمنتجات واعتماد النشر من إدارة قبس.',
    paymentConnected: true,
    paymentApprovalStatus: 'approved_active',
    gatewayType: 'Stripe',
    taxRate: 15,
    sections: DEFAULT_STORE_SECTIONS,
    designVersions: [
      {
        id: 'ver_101',
        versionName: 'النسخة المعتمدة — رمضان 2026',
        timestamp: '2026-03-01 10:30',
        theme: 'gold_executive',
        primaryColor: '#C8A24A',
        fontFamily: 'Cairo',
        sections: DEFAULT_STORE_SECTIONS
      },
      {
        id: 'ver_102',
        versionName: 'نسخة التأسيس بهوية قبس تيل',
        timestamp: '2026-02-14 18:15',
        theme: 'aqua_petrol',
        primaryColor: '#00A896',
        fontFamily: 'Cairo',
        sections: DEFAULT_STORE_SECTIONS
      }
    ],
    createdAt: '2025-03-12'
  },
  {
    id: 'store_02',
    ownerId: 'usr_merchant_02',
    ownerName: 'سلطان القاسمي',
    ownerEmail: 'sultan@andalus-oud.ae',
    name: 'عود الأندلس والعطور الملكية | Andalus Oud',
    activityAr: 'العطور الشرقية ودهن العود الطبيعي',
    activityEn: 'Fine Oud & Oriental Perfumes',
    country: 'AE',
    defaultLang: 'ar',
    subdomain: 'oud.qabs1.store',
    customDomain: 'andalus-oud.ae',
    domainStatus: 'verified_active',
    currency: 'AED',
    theme: 'aqua_petrol',
    primaryColor: '#00A896',
    fontFamily: 'Cairo',
    logoText: 'ANDALUS OUD | عود الأندلس',
    headerAnnouncementAr: 'هدية عينة دهن عود كمبودي مع كل طلب فوق 350 درهم',
    headerAnnouncementEn: 'Complimentary Royal Cambodian Oud sample on orders over 350 AED',
    footerTextAr: 'عود الأندلس للعطور الملكية — متجر مستقل معتمد على منصة QABS Stores',
    footerTextEn: 'Andalus Royal Oud — Independent Storefront on QABS Stores',
    productsCount: 2,
    ordersCount: 640,
    totalRevenue: 89400,
    status: 'active',
    approvalStatus: 'approved_published',
    adminReviewNotes: 'متجر معتمد ومنشور.',
    paymentConnected: true,
    paymentApprovalStatus: 'approved_active',
    gatewayType: 'Tap',
    taxRate: 5,
    sections: DEFAULT_STORE_SECTIONS,
    designVersions: [
      {
        id: 'ver_201',
        versionName: 'التصميم الافتراضي المعتمد',
        timestamp: '2026-02-20 14:00',
        theme: 'aqua_petrol',
        primaryColor: '#00A896',
        fontFamily: 'Cairo',
        sections: DEFAULT_STORE_SECTIONS
      }
    ],
    createdAt: '2025-08-20'
  },
  {
    id: 'store_03',
    ownerId: 'usr_merchant_03',
    ownerName: 'خالد المنصور',
    ownerEmail: 'khalid@techvolt.io',
    name: 'تك فولت للإلكترونيات والبطاقات الرقمية | TechVolt',
    activityAr: 'إلكترونيات ذكية ومنتجات رقمية',
    activityEn: 'Smart Electronics & Digital Licenses',
    country: 'US',
    defaultLang: 'en',
    subdomain: 'techvolt.qabs1.store',
    customDomain: 'shop.techvolt.io',
    domainStatus: 'pending_verification',
    currency: 'USD',
    theme: 'luxury_dark',
    primaryColor: '#00B8A9',
    fontFamily: 'Plus Jakarta Sans',
    logoText: 'TECHVOLT LABS',
    headerAnnouncementAr: 'تسليم فوري للمنتجات الرقمية وشحن دولي للأجهزة الذكية',
    headerAnnouncementEn: 'Instant delivery on digital licenses & worldwide hardware shipping',
    footerTextAr: 'تك فولت لابز — جميع الحقوق محفوظة © 2026',
    footerTextEn: 'TechVolt Labs — All rights reserved © 2026',
    productsCount: 2,
    ordersCount: 920,
    totalRevenue: 112450,
    status: 'active',
    approvalStatus: 'approved_published',
    paymentConnected: false,
    paymentApprovalStatus: 'pending_admin_approval',
    gatewayType: 'Stripe',
    taxRate: 0,
    sections: DEFAULT_STORE_SECTIONS,
    designVersions: [],
    createdAt: '2025-11-05'
  },
  {
    id: 'store_04',
    ownerId: 'usr_merchant_04',
    ownerName: 'نورة العتيبي',
    ownerEmail: 'noura@roast-qabs.sa',
    name: 'محمصة سحاب للقهوة المختصة | Sahab Roastery',
    activityAr: 'القهوة المختصة وأدوات التحضير',
    activityEn: 'Specialty Coffee & Brewing Gear',
    country: 'SA',
    defaultLang: 'ar',
    subdomain: 'sahab.qabs1.store',
    customDomain: 'sahabcoffee.sa',
    domainStatus: 'pending_verification',
    currency: 'SAR',
    theme: 'minimal_white',
    primaryColor: '#004457',
    fontFamily: 'Cairo',
    logoText: 'SAHAB ROASTERY | محمصة سحاب',
    headerAnnouncementAr: 'حمص جديد يومياً لمحاصيل إثيوبيا وكولومبيا المختصة',
    headerAnnouncementEn: 'Freshly roasted daily: Ethiopian & Colombian specialty single-origin beans',
    footerTextAr: 'محمصة سحاب للقهوة المختصة — قيد مراجعة النشر في قبس',
    footerTextEn: 'Sahab Specialty Roastery — Pending QABS Publication Approval',
    productsCount: 2,
    ordersCount: 0,
    totalRevenue: 0,
    status: 'setup',
    approvalStatus: 'pending_review',
    adminReviewNotes: 'بانتظار مراجعة إدارة قبس للموافقة على نشر المتجر وتفعيل النطاق.',
    paymentConnected: false,
    paymentApprovalStatus: 'pending_admin_approval',
    gatewayType: 'Moyasar',
    taxRate: 15,
    sections: DEFAULT_STORE_SECTIONS,
    designVersions: [],
    createdAt: '2026-03-08'
  }
];

// STRICT ISOLATION: Every product belongs strictly to ONE storeId
export const INITIAL_PRODUCTS: StoreProduct[] = [
  // Store 01 Products (QABS Elite Lux — Watches & Leather)
  {
    id: 'prod_01',
    storeId: 'store_01',
    titleAr: 'ساعة يد أوتوماتيكية إصدار قبس الذهبي الملكي',
    titleEn: 'Qabs Executive Automatic Watch - Royal Gold Edition',
    sku: 'WTC-QBS-GLD-01',
    barcode: '6281000492811',
    productType: 'physical',
    price: 580,
    cost: 210,
    stock: 22,
    lowStockThreshold: 5,
    warehouse: 'مستودع الرياض الرئيسي — WH-RUH-01',
    categoryAr: 'ساعات فاخرة',
    categoryEn: 'Luxury Watches',
    status: 'active',
    supplier: 'Geneva Atelier Craft',
    salesCount: 189,
    variants: [
      { nameAr: 'المقاس', nameEn: 'Case Size', options: ['40mm', '42mm'] },
      { nameAr: 'لون السوار', nameEn: 'Strap Color', options: ['كحلي ملكي', 'بني إيطالي', 'ذهبي معدني'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    descriptionAr: 'ساعة أوتوماتيكية سويسرية الحركة بزجاج ياقوتي مقاوم للخدش وهيكل مقاوم للماء حتى 100 متر.'
  },
  {
    id: 'prod_02',
    storeId: 'store_01',
    titleAr: 'محفظة جلد طبيعي إيطالي بحماية RFID مع ختم قبس',
    titleEn: 'Italian Full-Grain RFID Executive Leather Wallet',
    sku: 'WLT-ITA-004',
    barcode: '6281000492828',
    productType: 'physical',
    price: 95,
    cost: 28,
    stock: 60,
    lowStockThreshold: 10,
    warehouse: 'مستودع الرياض الرئيسي — WH-RUH-01',
    categoryAr: 'جلديات إيطالية',
    categoryEn: 'Italian Leather',
    status: 'active',
    supplier: 'Florence Leatherworks',
    salesCount: 350,
    variants: [
      { nameAr: 'اللون', nameEn: 'Color', options: ['أسود كلاسيك', 'بني محروق', 'كحلي بترولي'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80',
    descriptionAr: 'محفظة جلدية مصنعة يدوياً في فلورنسا مع طبقة حماية للبطاقات البنكية اللاتلامسية.'
  },
  {
    id: 'prod_03',
    storeId: 'store_01',
    titleAr: 'حقيبة سفر جلدية لرجال الأعمال — كابينة الطائرة',
    titleEn: 'Executive Weekender Cabin Leather Duffel Bag',
    sku: 'BAG-EXEC-009',
    barcode: '6281000492835',
    productType: 'physical',
    price: 340,
    cost: 125,
    stock: 4,
    lowStockThreshold: 8,
    warehouse: 'مستودع جدة اللوجستي — WH-JED-02',
    categoryAr: 'جلديات إيطالية',
    categoryEn: 'Italian Leather',
    status: 'active',
    supplier: 'Florence Leatherworks',
    salesCount: 74,
    variants: [
      { nameAr: 'اللون', nameEn: 'Color', options: ['عسلي فاخر', 'أسود ملكي'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
    descriptionAr: 'حقيبة سفر فاخرة بمقاس معتمد لكابينة الطائرة مع جيب مبطن للحاسب المحمول.'
  },

  // Store 02 Products (Andalus Oud — strictly isolated to store_02)
  {
    id: 'prod_04',
    storeId: 'store_02',
    titleAr: 'دهن العود الكمبودي المعتّق الملكي — ربع تولة (3 مل)',
    titleEn: 'Aged Royal Cambodian Pure Agarwood Oil (3ml)',
    sku: 'OUD-CAM-001',
    barcode: '6291009911012',
    productType: 'physical',
    price: 240,
    cost: 85,
    stock: 45,
    lowStockThreshold: 10,
    warehouse: 'مستودع دبي للعطور — WH-DXB-01',
    categoryAr: 'أدهان العود الملكية',
    categoryEn: 'Pure Oud Oils',
    status: 'active',
    supplier: 'Al-Madinah Royal Distillers',
    salesCount: 412,
    variants: [
      { nameAr: 'الحجم', nameEn: 'Size', options: ['ربع تولة (3 مل)', 'نصف تولة (6 مل)', 'تولة كاملة (12 مل)'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
    descriptionAr: 'دهن عود كمبودي صافي معتق لمدة 10 سنوات بثبات يتجاوز 48 ساعة.'
  },
  {
    id: 'prod_05',
    storeId: 'store_02',
    titleAr: 'خشب عود مروكي طبيعي سوبر مرتفع (أوقية 28 جرام)',
    titleEn: 'Super Grade Natural Maroke Agarwood Chips (28g)',
    sku: 'OUD-MRK-028',
    barcode: '6291009911029',
    productType: 'physical',
    price: 195,
    cost: 70,
    stock: 3,
    lowStockThreshold: 5,
    warehouse: 'مستودع دبي للعطور — WH-DXB-01',
    categoryAr: 'البخور وخشب العود',
    categoryEn: 'Incense & Wood',
    status: 'active',
    supplier: 'Jakarta Heritage Oud',
    salesCount: 280,
    variants: [
      { nameAr: 'الوزن', nameEn: 'Weight', options: ['أوقية (28 جم)', 'أوقيتان (56 جم)', 'ثمن كيلو (125 جم)'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80',
    descriptionAr: 'كسرات عود مروكي طبيعي مشبعة بالدهن مناسبة للمجالس والمناسبات الرسمية.'
  },

  // Store 03 Products (TechVolt — Electronics & Digital — strictly isolated to store_03)
  {
    id: 'prod_06',
    storeId: 'store_03',
    titleAr: 'منصة شحن لاسلكي مكتبية ذكية 3 في 1 من الألمنيوم',
    titleEn: '3-in-1 Billet Aluminum MagCharge Executive Desk Stand',
    sku: 'PWR-3IN1-ALU',
    barcode: '8401928371029',
    productType: 'physical',
    price: 119,
    cost: 38,
    stock: 84,
    lowStockThreshold: 15,
    warehouse: 'US Delaware Fulfillment — WH-US-DE',
    categoryAr: 'إلكترونيات مكتبية',
    categoryEn: 'Tech Gadgets',
    status: 'active',
    supplier: 'Shenzhen Precision Tech',
    salesCount: 778,
    variants: [
      { nameAr: 'اللون', nameEn: 'Finish', options: ['Space Gray', 'Silver Titanium'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80',
    descriptionAr: 'شاحن مكتبي مغناطيسي بقوة 15W للهاتف والساعة والسماعات.'
  },
  {
    id: 'prod_07',
    storeId: 'store_03',
    titleAr: 'رخصة برنامج حماية وإدارة السحابة للأعمال (منتج رقمي فوري)',
    titleEn: 'CloudGuard Enterprise Security Suite — 1 Year Digital License',
    sku: 'DIG-CLD-PRO-1Y',
    barcode: '8401928379991',
    productType: 'digital',
    price: 149,
    cost: 20,
    stock: 999,
    lowStockThreshold: 10,
    warehouse: 'تسليم رقمي فوري (Cloud R2 Vault)',
    categoryAr: 'منتجات وتراخيص رقمية',
    categoryEn: 'Digital Licenses',
    status: 'active',
    supplier: 'TechVolt Software Division',
    salesCount: 530,
    variants: [
      { nameAr: 'عدد الأجهزة', nameEn: 'Seats', options: ['5 مستخدمين', '25 مستخدماً', 'غير محدود'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
    descriptionAr: 'يتم إرسال مفتاح التفعيل الرقمي ورابط التحميل تلقائياً فور إتمام الطلب.'
  },

  // Store 04 Products (Sahab Specialty Roastery — strictly isolated to store_04)
  {
    id: 'prod_08',
    storeId: 'store_04',
    titleAr: 'محصول قهوة إثيوبيا ييرغاشيف مجفف — 250 جرام',
    titleEn: 'Ethiopia Yirgacheffe Natural Specialty Beans — 250g',
    sku: 'COF-ETH-250',
    barcode: '6285500112233',
    productType: 'physical',
    price: 68,
    cost: 25,
    stock: 110,
    lowStockThreshold: 20,
    warehouse: 'محمصة الرياض — WH-RUH-COFFEE',
    categoryAr: 'محاصيل قهوة مختصة',
    categoryEn: 'Specialty Coffee Beans',
    status: 'active',
    supplier: 'Addis Ababa Direct Trade',
    salesCount: 0,
    variants: [
      { nameAr: 'درجة الطحن', nameEn: 'Grind', options: ['حبوب كاملة (Whole Bean)', 'تقطير V60', 'إسبريسو'] },
      { nameAr: 'الوزن', nameEn: 'Bag Size', options: ['250 جرام', '1 كيلو جرام'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80',
    descriptionAr: 'إيحاءات التوت الأزرق والياسمين والشوكولاتة الداكنة، حمص طازج.'
  },
  {
    id: 'prod_09',
    storeId: 'store_04',
    titleAr: 'مجموعة تحضير القهوة المقطرة V60 الاحترافية (سيراميك + ميزان)',
    titleEn: 'Artisan Pour-Over V60 Ceramic Brewer & Digital Scale Kit',
    sku: 'BRW-V60-KIT',
    barcode: '6285500112295',
    productType: 'physical',
    price: 215,
    cost: 80,
    stock: 35,
    lowStockThreshold: 5,
    warehouse: 'محمصة الرياض — WH-RUH-COFFEE',
    categoryAr: 'أدوات التحضير',
    categoryEn: 'Brewing Equipment',
    status: 'active',
    supplier: 'Kyoto Ceramic Works',
    salesCount: 0,
    variants: [
      { nameAr: 'اللون', nameEn: 'Color', options: ['أبيض لؤلؤي', 'أسود مطفي'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    descriptionAr: 'طقم متكامل لتحضير القهوة المختصة يشمل قمع V60 السيراميكي وإبريق التقديم وميزان المؤقت.'
  }
];

export const INITIAL_ORDERS: StoreOrder[] = [
  {
    id: 'ord_101',
    storeId: 'store_01',
    orderNumber: 'QBS-8921',
    customerName: 'فهد المطيري',
    customerEmail: 'fahad.m@gmail.com',
    customerCountry: 'Saudi Arabia',
    itemsCount: 2,
    total: 675,
    taxAmount: 88,
    shippingAmount: 0,
    currency: 'SAR',
    status: 'paid',
    createdAt: '2026-03-09 14:22',
    paymentGateway: 'Stripe',
    shippingCarrier: 'DHL Express',
    trackingNumber: 'DHL-948201948SA'
  },
  {
    id: 'ord_102',
    storeId: 'store_01',
    orderNumber: 'QBS-8922',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@techcorp.uk',
    customerCountry: 'United Kingdom',
    itemsCount: 1,
    total: 580,
    taxAmount: 0,
    shippingAmount: 25,
    currency: 'SAR',
    status: 'shipped',
    createdAt: '2026-03-09 11:05',
    paymentGateway: 'Stripe',
    shippingCarrier: 'FedEx',
    trackingNumber: 'FEDEX-102948102GB'
  },
  {
    id: 'ord_103',
    storeId: 'store_02',
    orderNumber: 'QBS-8923',
    customerName: 'سلطان القاسمي',
    customerEmail: 's.alqasimi@emirates.ae',
    customerCountry: 'United Arab Emirates',
    itemsCount: 3,
    total: 720,
    taxAmount: 36,
    shippingAmount: 0,
    currency: 'AED',
    status: 'paid',
    createdAt: '2026-03-08 19:40',
    paymentGateway: 'Tap',
    shippingCarrier: 'Aramex',
    trackingNumber: 'ARAMEX-55829104AE'
  },
  {
    id: 'ord_104',
    storeId: 'store_03',
    orderNumber: 'QBS-8924',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@berlin.de',
    customerCountry: 'Germany',
    itemsCount: 1,
    total: 119,
    taxAmount: 0,
    shippingAmount: 15,
    currency: 'USD',
    status: 'delivered',
    createdAt: '2026-03-07 09:12',
    paymentGateway: 'Stripe',
    shippingCarrier: 'DHL Express',
    trackingNumber: 'DHL-1Z99999999999'
  }
];

export const INITIAL_CUSTOMERS: StoreCustomer[] = [
  {
    id: 'cust_01',
    storeId: 'store_01',
    name: 'فهد المطيري',
    email: 'fahad.m@gmail.com',
    phone: '+966 50 482 9910',
    country: 'السعودية (SA)',
    ordersCount: 5,
    totalSpent: 2840,
    lastOrderDate: '2026-03-09'
  },
  {
    id: 'cust_02',
    storeId: 'store_01',
    name: 'Marcus Vance',
    email: 'm.vance@techcorp.uk',
    phone: '+44 7700 900077',
    country: 'المملكة المتحدة (UK)',
    ordersCount: 2,
    totalSpent: 1160,
    lastOrderDate: '2026-03-09'
  },
  {
    id: 'cust_03',
    storeId: 'store_02',
    name: 'راشد المزروعي',
    email: 'rashid.m@dubai.ae',
    phone: '+971 50 992 1844',
    country: 'الإمارات (AE)',
    ordersCount: 7,
    totalSpent: 4320,
    lastOrderDate: '2026-03-08'
  },
  {
    id: 'cust_04',
    storeId: 'store_03',
    name: 'Elena Rostova',
    email: 'elena.rostova@berlin.de',
    phone: '+49 151 23456789',
    country: 'ألمانيا (DE)',
    ordersCount: 3,
    totalSpent: 467,
    lastOrderDate: '2026-03-07'
  }
];

export const INITIAL_DISCOUNTS: StoreDiscount[] = [
  {
    id: 'disc_01',
    storeId: 'store_01',
    code: 'QABS15',
    type: 'percentage',
    value: 15,
    minOrderAmount: 200,
    usageCount: 48,
    maxUses: 200,
    expiresAt: '2026-12-31',
    status: 'active'
  },
  {
    id: 'disc_02',
    storeId: 'store_01',
    code: 'VIP100',
    type: 'fixed',
    value: 100,
    minOrderAmount: 500,
    usageCount: 19,
    maxUses: 50,
    expiresAt: '2026-09-30',
    status: 'active'
  },
  {
    id: 'disc_03',
    storeId: 'store_02',
    code: 'OUD20',
    type: 'percentage',
    value: 20,
    minOrderAmount: 300,
    usageCount: 82,
    maxUses: 300,
    expiresAt: '2026-12-31',
    status: 'active'
  },
  {
    id: 'disc_04',
    storeId: 'store_03',
    code: 'TECH10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 100,
    usageCount: 112,
    maxUses: 500,
    expiresAt: '2026-12-31',
    status: 'active'
  }
];

export const INITIAL_SHIPPING_ZONES: StoreShippingZone[] = [
  {
    id: 'shp_01',
    storeId: 'store_01',
    regionNameAr: 'المملكة العربية السعودية (توصيل سريع)',
    regionNameEn: 'Saudi Arabia Domestic Express',
    countries: 'SA',
    carrier: 'SMSA',
    rate: 25,
    freeAbove: 500,
    estimatedDays: '1 - 2 أيام عمل',
    status: 'active'
  },
  {
    id: 'shp_02',
    storeId: 'store_01',
    regionNameAr: 'دول الخليج العربي (GCC Express)',
    regionNameEn: 'GCC Countries Express',
    countries: 'AE, KW, QA, BH, OM',
    carrier: 'DHL Express',
    rate: 45,
    freeAbove: 800,
    estimatedDays: '2 - 3 أيام عمل',
    status: 'active'
  },
  {
    id: 'shp_03',
    storeId: 'store_02',
    regionNameAr: 'الإمارات والخليج العربي',
    regionNameEn: 'UAE & GCC Priority',
    countries: 'AE, SA, KW, QA, BH, OM',
    carrier: 'Aramex',
    rate: 30,
    freeAbove: 350,
    estimatedDays: '1 - 3 أيام عمل',
    status: 'active'
  },
  {
    id: 'shp_04',
    storeId: 'store_03',
    regionNameAr: 'الشحن الدولي السريع (أمريكا وأوروبا والخليج)',
    regionNameEn: 'Global Express (US, EU, MENA)',
    countries: 'US, UK, DE, FR, SA, AE',
    carrier: 'FedEx',
    rate: 20,
    freeAbove: 250,
    estimatedDays: '2 - 4 أيام عمل',
    status: 'active'
  }
];

export const INITIAL_STORE_PAGES: StorePageItem[] = [
  {
    id: 'pg_01',
    storeId: 'store_01',
    slug: 'home',
    titleAr: 'الصفحة الرئيسية',
    titleEn: 'Home Page',
    contentAr: 'مرحباً بكم في متجر قبس لكشري للساعات الأوتوماتيكية والجلديات الإيطالية الفاخرة.',
    contentEn: 'Welcome to QABS Elite Lux — Fine Swiss-movement watches and Italian full-grain leather.',
    isSystem: true,
    published: true
  },
  {
    id: 'pg_02',
    storeId: 'store_01',
    slug: 'about',
    titleAr: 'من نحن',
    titleEn: 'About Us',
    contentAr: 'نحن علامة تجارية مسجلة متخصصة في تصميم وتوريد الساعات الفاخرة والمحافظ الجلدية الإيطالية بضمان أصالة لمدة سنتين.',
    contentEn: 'We are an official luxury retail house specializing in executive timepieces and handcrafted leather goods.',
    isSystem: true,
    published: true
  },
  {
    id: 'pg_03',
    storeId: 'store_01',
    slug: 'contact',
    titleAr: 'اتصل بنا',
    titleEn: 'Contact Us',
    contentAr: 'للتواصل مع خدمة عملاء المتجر: support@lux-qabs.com | واتساب: +966504829910',
    contentEn: 'Customer Care: support@lux-qabs.com | WhatsApp: +966504829910',
    isSystem: true,
    published: true
  },
  {
    id: 'pg_04',
    storeId: 'store_01',
    slug: 'refund-policy',
    titleAr: 'سياسة الاستبدال والاسترجاع',
    titleEn: 'Return & Refund Policy',
    contentAr: 'يحق للعميل استبدال أو استرجاع المنتج خلال 14 يوماً من تاريخ الاستلام بشرط بقائه في حالته الأصلية.',
    contentEn: '14-day hassle-free return and exchange guarantee on all unworn items in original packaging.',
    isSystem: false,
    published: true
  },
  {
    id: 'pg_05',
    storeId: 'store_02',
    slug: 'home',
    titleAr: 'الصفحة الرئيسية',
    titleEn: 'Home Page',
    contentAr: 'عود الأندلس — نوادر دهن العود الكمبودي والمروكي الطبيعي.',
    contentEn: 'Andalus Oud — Rare Cambodian and Maroke agarwood collections.',
    isSystem: true,
    published: true
  },
  {
    id: 'pg_06',
    storeId: 'store_02',
    slug: 'about',
    titleAr: 'من نحن',
    titleEn: 'About Us',
    contentAr: 'خبرة تمتد لأكثر من 15 عاماً في استيراد أندر أدهان العود الطبيعي.',
    contentEn: 'Over 15 years of heritage sourcing pure artisanal agarwood.',
    isSystem: true,
    published: true
  }
];

export const INITIAL_STORE_APPS: StoreAppAddon[] = [
  {
    id: 'app_whatsapp',
    nameAr: 'زر واتساب العائم وإشعارات السلة المتروكة',
    nameEn: 'WhatsApp Chat & Abandoned Cart Recovery',
    categoryAr: 'التسويق وخدمة العملاء',
    categoryEn: 'Marketing & Support',
    descriptionAr: 'تواصل مباشر مع زوار المتجر وإرسال تذكير تلقائي بالسلات المتروكة عبر واتساب.',
    descriptionEn: 'Live customer chat widget and automated WhatsApp abandoned cart reminders.',
    installedStores: ['store_01', 'store_02', 'store_04']
  },
  {
    id: 'app_pixels',
    nameAr: 'مدير بكسل الإعلانات (Meta, TikTok, Snapchat, Google)',
    nameEn: 'Multi-Pixel Conversion API Tracker',
    categoryAr: 'التحليلات والإعلانات',
    categoryEn: 'Analytics & Ads',
    descriptionAr: 'ربط فوري لبكسلات سناب شات وتيك توك وميتا وجوجل مع تتبع الخادم (Server-Side CAPI).',
    descriptionEn: 'One-click Server-Side Conversion API for Snapchat, TikTok, Meta, and Google Ads.',
    installedStores: ['store_01', 'store_03']
  },
  {
    id: 'app_seo',
    nameAr: 'محسن محركات البحث الذكي (QABS SEO & Schema)',
    nameEn: 'QABS SEO & JSON-LD Rich Snippets',
    categoryAr: 'ظهور محركات البحث',
    categoryEn: 'Search Engine Optimization',
    descriptionAr: 'توليد خرائط الموقع Sitemap والبيانات المهيكلة للمنتجات والأسعار في نتائج بحث جوجل.',
    descriptionEn: 'Automated XML sitemaps and Schema.org Product JSON-LD markup.',
    installedStores: ['store_01', 'store_02', 'store_03']
  },
  {
    id: 'app_loyalty',
    nameAr: 'برنامج نقاط الولاء ومكافآت العملاء',
    nameEn: 'VIP Loyalty Points & Referrals',
    categoryAr: 'ولاء العملاء',
    categoryEn: 'Customer Retention',
    descriptionAr: 'منح نقاط تلقائية للعملاء عند كل عملية شراء قابلة للاستبدال بكوبونات خصم.',
    descriptionEn: 'Reward repeat shoppers with redeemable points and referral links.',
    installedStores: ['store_01']
  }
];

export const INITIAL_COMPANIES: CompanyFormation[] = [
  {
    id: 'comp_01',
    companyName: 'QABS GLOBAL COMMERCE LLC',
    jurisdiction: 'US_WYOMING',
    entityType: 'LLC',
    stateFileNumber: 'WY-2025-00194829',
    ein: '98-4720194',
    registeredAgent: 'Northwest Registered Agent LLC (Cheyenne, WY)',
    registeredAddress: '30 N Gould St Ste R, Sheridan, WY 82801, USA',
    filingDate: '2025-01-14',
    renewalDueDate: '2027-01-01',
    status: 'approved',
    documents: [
      { name: 'Articles of Organization', type: 'articles', status: 'ready', date: '2025-01-14' },
      { name: 'Official IRS EIN Letter (CP575)', type: 'ein_letter', status: 'ready', date: '2025-01-20' },
      { name: 'Operating Agreement (LLC Agreement)', type: 'operating_agreement', status: 'ready', date: '2025-01-15' },
      { name: 'Banking Resolution & Authority Certificate', type: 'resolution', status: 'ready', date: '2025-01-22' }
    ],
    notes: 'Wyoming Annual Report filing completed for 2026. Mercury & Stripe connected.'
  },
  {
    id: 'comp_02',
    companyName: 'ANDALUS COMMERCE GROUP LTD',
    jurisdiction: 'UK_LTD',
    entityType: 'LTD',
    crn: '14920412',
    registeredAgent: 'QABS UK Company Secretarial & Registered Office',
    registeredAddress: '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, UK',
    filingDate: '2025-06-18',
    renewalDueDate: '2026-06-18',
    status: 'approved',
    documents: [
      { name: 'Certificate of Incorporation', type: 'certificate_of_inc', status: 'ready', date: '2025-06-18' },
      { name: 'Articles of Association', type: 'articles', status: 'ready', date: '2025-06-18' },
      { name: 'HMRC Corporation Tax UTR Confirmation', type: 'ein_letter', status: 'ready', date: '2025-06-25' }
    ],
    notes: 'UK Companies House active. Wise Business account linked.'
  },
  {
    id: 'comp_03',
    companyName: 'TECHVOLT VENTURES INC',
    jurisdiction: 'US_DELAWARE',
    entityType: 'C-CORP',
    stateFileNumber: 'DE-2026-7839102',
    registeredAgent: 'The Corporation Trust Company (Wilmington, DE)',
    registeredAddress: '1209 N Orange St, Wilmington, DE 19801, USA',
    filingDate: '2026-02-10',
    renewalDueDate: '2027-03-01',
    status: 'submitted_to_state',
    documents: [
      { name: 'Certificate of Incorporation (Filed)', type: 'certificate_of_inc', status: 'ready', date: '2026-02-10' },
      { name: 'Federal EIN (IRS Review Pending)', type: 'ein_letter', status: 'generating', date: '2026-02-12' },
      { name: 'Bylaws & Initial Shareholder Agreement', type: 'operating_agreement', status: 'ready', date: '2026-02-11' }
    ],
    notes: 'Delaware Division of Corporations submission approved. Awaiting IRS CP575 letter.'
  }
];

export const INITIAL_BANKING: BankingAccount[] = [
  {
    id: 'bnk_01',
    provider: 'Mercury',
    accountName: 'QABS STORES SETTLEMENT ACCOUNT',
    accountNumberMasked: '•••• 8920',
    routingNumber: '021000021',
    currency: 'USD',
    balance: 84320.50,
    status: 'verified',
    linkedCompany: 'QABS GLOBAL COMMERCE LLC'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_01',
    storeId: 'store_04',
    ticketNumber: 'TKT-9921',
    subjectAr: 'طلب مراجعة واعتماد نشر متجر محمصة سحاب (sahab.qabs1.store)',
    subjectEn: 'Publication approval request for Sahab Roastery Store',
    category: 'store',
    priority: 'high',
    status: 'open',
    createdAt: '2026-03-09 10:15',
    updatedAt: '2026-03-09 12:00',
    clientName: 'نورة العتيبي (محمصة سحاب)',
    assignedTo: 'فريق اعتماد المتاجر في قبس',
    lastMessage: 'تم إكمال إضافة المنتجات وتخصيص القالب وطلب ربط النطاق sahabcoffee.sa، نرجو مراجعة المتجر واعتماد النشر.'
  },
  {
    id: 'tkt_02',
    storeId: 'store_03',
    ticketNumber: 'TKT-9922',
    subjectAr: 'طلب تفعيل بوابة الدفع Stripe لمتجر تك فولت بعد التحقق اليدوي',
    subjectEn: 'Manual verification request for TechVolt Stripe gateway',
    category: 'payments',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-03-08 16:30',
    updatedAt: '2026-03-09 09:20',
    clientName: 'خالد المنصور (TechVolt)',
    assignedTo: 'كريم عادل (مهندس تكامل المتاجر)',
    lastMessage: 'بانتظار مطابقة بيانات التاجر من إدارة قبس؛ لا يتم تفعيل بوابة الدفع تلقائياً.'
  },
  {
    id: 'tkt_03',
    storeId: 'store_01',
    ticketNumber: 'TKT-9923',
    subjectAr: 'تأكيد شهادة SSL للنطاق المخصص www.lux-qabs.com',
    subjectEn: 'SSL Certificate verification for custom domain www.lux-qabs.com',
    category: 'technical',
    priority: 'low',
    status: 'resolved',
    createdAt: '2026-03-06 14:00',
    updatedAt: '2026-03-07 14:00',
    clientName: 'محمد الخالدي (قبس لكشري)',
    assignedTo: 'فريق البنية السحابية Cloudflare',
    lastMessage: 'تم التحقق من سجلات CNAME وتفعيل HTTPS على شبكة Cloudflare بنجاح.'
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'stf_01',
    name: 'عبدالله السعدي',
    email: 'abdullah@qabs1.store',
    role: 'super_admin',
    department: 'الإدارة المركزية لمتاجر قبس (QABS Central Control)',
    permissions: ['all_stores_control', 'store_approval_publish', 'payment_gateway_verify', 'template_manager'],
    status: 'active',
    lastActive: 'الآن (نشط)'
  },
  {
    id: 'stf_02',
    name: 'سارة المنصوري',
    email: 'sara.m@qabs1.store',
    role: 'compliance_officer',
    department: 'مراجعة واعتماد المتاجر والمدفوعات',
    permissions: ['store_review', 'domain_verification', 'payment_audit'],
    status: 'active',
    lastActive: 'منذ 15 دقيقة'
  },
  {
    id: 'stf_03',
    storeId: 'store_01',
    name: 'ماجد الحربي (موظف متجر قبس لكشري)',
    email: 'majed@lux-qabs.com',
    role: 'support_agent',
    department: 'إدارة الطلبات والمخزون — متجر store_01 فقط',
    permissions: ['orders_manage_only', 'inventory_update_only'],
    status: 'active',
    lastActive: 'منذ 30 دقيقة'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log_01',
    storeId: 'store_01',
    timestamp: '2026-03-09 14:38',
    actor: 'عبدالله السعدي (إدارة قبس)',
    actionAr: 'اعتماد نشر متجر قبس لكشري (store_01) وتفعيل النطاق المستقل www.lux-qabs.com',
    actionEn: 'Approved publication of store_01 and activated custom domain www.lux-qabs.com',
    target: 'Tenant Store #store_01 (Isolated D1 Database)',
    status: 'success'
  },
  {
    id: 'log_02',
    storeId: 'store_04',
    timestamp: '2026-03-09 12:15',
    actor: 'نورة العتيبي (تاجر)',
    actionAr: 'إرسال متجر محمصة سحاب (store_04) إلى إدارة قبس للمراجعة قبل النشر',
    actionEn: 'Submitted Sahab Roastery (store_04) to QABS Admin for publication approval',
    target: 'Approval Queue #store_04',
    status: 'info'
  },
  {
    id: 'log_03',
    storeId: 'store_03',
    timestamp: '2026-03-09 09:40',
    actor: 'نظام الحماية وعزل المتاجر (Tenant Guard)',
    actionAr: 'نجاح فحص عزل قواعد البيانات وأخذ نسخة احتياطية تلقائية لجميع المتاجر (D1 + R2)',
    actionEn: 'Verified 100% multi-tenant data isolation and completed automated D1/R2 backup',
    target: 'Cloudflare Workers + D1 Multi-Tenant Engine',
    status: 'success'
  }
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter' as const,
    nameAr: 'الباقة الأساسية للمتاجر (Basic Store)',
    nameEn: 'Basic Store Plan',
    badgeAr: '$19 / شهرياً — مثل بوابة قبس',
    badgeEn: '$19 / month',
    priceMonthly: 19,
    priceAnnual: 19,
    descriptionAr: 'متجر إلكتروني مستقل كامل مع قوالب QABS Studio وحتى 25 منتجاً وعزل تام للبيانات.',
    descriptionEn: 'Standalone online store with QABS Studio themes, up to 25 products, and full data isolation.',
    maxStores: 1,
    maxProducts: 25,
    commissionFee: 0,
    featuresAr: [
      'متجر إلكتروني مستقل بلوحة تحكم خاصة',
      'إضافة حتى 25 منتجاً (مادي أو رقمي) مع متغيراتها',
      'تخصيص التصميم والألوان في QABS Studio',
      'ربط بوابات الدفع والشحن بعد مراجعة قبس',
      'عزل كامل لبيانات المتجر والعملاء والطلبات',
      'دعم اللغتين العربية (RTL) والإنجليزية (LTR)'
    ],
    featuresEn: [
      '1 independent storefront with dedicated dashboard',
      'Up to 25 physical or digital products with variants',
      'Full QABS Studio visual theme customization',
      'Payment & shipping setup after QABS verification',
      '100% isolated tenant data, orders, and customers',
      'Full Arabic RTL & English LTR support'
    ]
  },
  {
    id: 'growth' as const,
    nameAr: 'باقة النمو للمتاجر (Growth Store)',
    nameEn: 'Growth Store Plan',
    badgeAr: 'الأكثر طلباً — $39 / شهرياً',
    badgeEn: 'Most Popular — $39 / mo',
    popular: true,
    priceMonthly: 39,
    priceAnnual: 39,
    descriptionAr: 'للمتاجر المتنامية والعلامات التجارية: حتى 100 منتج، ربط نطاق مستقل، وتقارير متقدمة.',
    descriptionEn: 'For growing brands: up to 100 products, custom domain connection, and advanced analytics.',
    maxStores: 3,
    maxProducts: 100,
    commissionFee: 0,
    featuresAr: [
      'إنشاء وإدارة حتى 3 متاجر إلكترونية مستقلة',
      'حتى 100 منتج لكل متجر مع تنبيهات المخزون والمستودعات',
      'ربط نطاق خاص مستقل (Custom Domain + SSL)',
      'كوبونات الخصم والعروض الترويجية وتطبيقات التسويق',
      'حفظ نسخ التصميم واستعادتها في QABS Studio',
      'صلاحيات منفصلة لمالك المتجر والموظفين'
    ],
    featuresEn: [
      'Up to 3 independent multi-currency stores',
      'Up to 100 products per store with warehouse alerts',
      'Custom domain connection with automated SSL',
      'Discount coupons, promotions & marketing apps',
      'Design version history & restore in QABS Studio',
      'Separate role permissions for store owner & staff'
    ]
  },
  {
    id: 'enterprise' as const,
    nameAr: 'باقة الشراكة والأعمال (Partner / Enterprise)',
    nameEn: 'Partner & Enterprise Stores',
    badgeAr: 'حتى 500+ منتج ومتاجر متعددة',
    badgeEn: '500+ Products & Multi-Store',
    priceMonthly: 99,
    priceAnnual: 89,
    descriptionAr: 'للشركات والتجار الكبار: متاجر متعددة، حتى 500 منتج، وتكامل سحابي مخصص عبر Cloudflare D1 & R2.',
    descriptionEn: 'For high-volume merchants: multi-store fleet, 500+ products, and dedicated Cloudflare edge resources.',
    maxStores: 15,
    maxProducts: 500,
    commissionFee: 0,
    featuresAr: [
      'حتى 15 متجراً إلكترونياً مستقلاً بعزل قواعد بيانات',
      'حتى 500 منتج لكل متجر (مادي ورقمي وباركود)',
      'أولوية مراجعة واعتماد النشر والنطاقات من إدارة قبس',
      'نسخ احتياطي يومي وسجل عمليات أمني كامل',
      'ربط متقدم مع Shopify و Cloudflare Workers / D1 / R2',
      'مدير حساب مخصص ودعم فني مباشر'
    ],
    featuresEn: [
      'Up to 15 isolated storefronts',
      'Up to 500 products with SKU, barcode & variants',
      'Priority QABS publication and domain approval',
      'Daily backups and immutable audit trail',
      'Cloudflare Workers, D1, R2 & Shopify bridge',
      'Dedicated account manager and priority support'
    ]
  }
];

export const INITIAL_USER_SUBSCRIPTION = {
  planId: 'growth' as const,
  billingCycle: 'monthly' as const,
  renewalDate: '2026-04-10',
  status: 'active' as const,
  currentPrice: 39
};

export const INITIAL_INVOICES = [
  {
    id: 'inv_2026_01',
    invoiceNumber: 'INV-QBS-8891',
    date: '2026-03-01',
    amount: 39,
    currency: 'USD',
    status: 'paid' as const,
    descriptionAr: 'اشتراك باقة النمو للمتاجر (Growth Store Plan — 30 يوماً)',
    descriptionEn: 'Growth Store Plan Subscription (30 Days)',
    clientName: 'قبس لكشري للساعات والجلديات (store_01)'
  },
  {
    id: 'inv_2026_02',
    invoiceNumber: 'INV-QBS-8892',
    date: '2026-02-20',
    amount: 39,
    currency: 'USD',
    status: 'paid' as const,
    descriptionAr: 'اشتراك باقة النمو للمتاجر — متجر عود الأندلس (store_02)',
    descriptionEn: 'Growth Store Plan — Andalus Oud (store_02)',
    clientName: 'عود الأندلس والعطور الملكية (store_02)'
  }
];

export const INITIAL_COMMISSIONS = [
  {
    id: 'comm_01',
    storeId: 'store_01',
    storeName: 'قبس لكشري للساعات والجلديات',
    orderNumber: 'QBS-8921',
    grossAmount: 675,
    commissionRate: 0,
    commissionAmount: 0,
    status: 'settled' as const,
    date: '2026-03-09'
  }
];

export const INITIAL_REFUNDS = [
  {
    id: 'ref_01',
    orderNumber: 'QBS-8710',
    amount: 95,
    currency: 'SAR',
    reasonAr: 'طلب العميل إلغاء الطلب قبل الشحن',
    reasonEn: 'Customer cancellation requested before dispatch',
    status: 'processed' as const,
    date: '2026-03-02',
    customerName: 'طارق الزهراني'
  }
];
