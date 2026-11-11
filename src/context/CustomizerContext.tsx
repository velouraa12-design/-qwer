import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomPage {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  active: boolean;
}

export interface SiteContent {
  heroBadgeAr: string;
  heroBadgeEn: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroCtaTextAr: string;
  heroCtaTextEn: string;
  heroCtaLink: string;
  heroImageUrl: string;
  cardImageUrl: string;
  whatsappNumber: string;
  storeDomain: string;
  showcasePackageTitleAr: string;
  showcasePackageTitleEn: string;
  showcasePrice: number;
  showcaseFeaturesAr: string[];
  showcaseFeaturesEn: string[];
  customPages: CustomPage[];
}

const DEFAULT_SITE_CONTENT: SiteContent = {
  heroBadgeAr: 'باقة انطلاقة الدفع العالمي',
  heroBadgeEn: 'Global Payments Launch Package',
  heroTitleAr: 'خلّ تجارتك تنطلق عالميًا مع قبس!',
  heroTitleEn: 'Propel Your Global Commerce with QABS!',
  heroSubtitleAr:
    'بوابتك المعتمدة نحو التجارة العالمية: تأسيس شركات LLC أمريكية، استخراج الرقم الضريبي الفيدرالي EIN، تجهيز بوابات Stripe و PayPal، وفتح الحسابات البنكية الدولية.',
  heroSubtitleEn:
    'Your sovereign gateway to global business: US LLC formation, Federal EIN issuance, Stripe & PayPal turnkey setup, and commercial fintech banking.',
  heroCtaTextAr: 'ابدأ الآن — اطلب مراجعة باقتك',
  heroCtaTextEn: 'Start Now — Review Package',
  heroCtaLink: 'https://qabs1.store',
  heroImageUrl: '/src/assets/images/qabs_global_hero_1794351468325.jpg',
  cardImageUrl: '/src/assets/images/qabs_banking_card_1794351469053.jpg',
  whatsappNumber: '+159 710 784 967',
  storeDomain: 'qabs1.store',
  showcasePackageTitleAr: 'باقة انطلاقة الدفع العالمي المتكاملة',
  showcasePackageTitleEn: 'Turnkey Global Payment & Formation Package',
  showcasePrice: 349,
  showcaseFeaturesAr: [
    'تأسيس LLC أمريكية معتمدة رسمياً',
    'المساعدة في تجهيز Stripe و PayPal',
    'استخراج الرقم الضريبي الفيدرالي EIN',
    'الوكيل المسجل والعنوان الأمريكي للسنة الأولى'
  ],
  showcaseFeaturesEn: [
    'Official US LLC Formation',
    'Turnkey Stripe & PayPal Integration',
    'IRS Federal EIN Issuance',
    'Registered Agent & US Street Address (1st Year)'
  ],
  customPages: [
    {
      id: 'page_01',
      slug: 'about-us',
      titleAr: 'عن قبس الرقمية',
      titleEn: 'About QABS',
      contentAr: 'قبس الرقمية هي المنصة الرائدة في تمكين رواد الأعمال والتجار العرب من التوسع العالمي عبر تأسيس الكيانات القانونية وربط بوابات الدفع الدولية.',
      contentEn: 'QABS is the premier sovereign digital operating platform enabling Arab entrepreneurs to establish global presence and process payments worldwide.',
      active: true
    },
    {
      id: 'page_02',
      slug: 'privacy-policy',
      titleAr: 'سياسة الخصوصية والأمان',
      titleEn: 'Privacy & Security Policy',
      contentAr: 'نلتزم بأعلى معايير تشفير البيانات وعزل بيئات المستأجرين وفق أفضل ممارسات الامتثال الدولية.',
      contentEn: 'We adhere to the highest standard of data encryption and strict multi-tenant isolation.',
      active: true
    }
  ]
};

interface CustomizerContextType {
  siteContent: SiteContent;
  updateSiteContent: (updates: Partial<SiteContent>) => void;
  resetToDefault: () => void;
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
  addCustomPage: (page: Omit<CustomPage, 'id'>) => void;
  updateCustomPage: (id: string, updates: Partial<CustomPage>) => void;
  deleteCustomPage: (id: string) => void;
}

const CustomizerContext = createContext<CustomizerContextType | undefined>(undefined);

export const CustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem('qabs_site_content');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SITE_CONTENT;
  });

  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('qabs_site_content', JSON.stringify(siteContent));
    } catch {}
  }, [siteContent]);

  const updateSiteContent = (updates: Partial<SiteContent>) => {
    setSiteContent(prev => ({ ...prev, ...updates }));
  };

  const resetToDefault = () => {
    setSiteContent(DEFAULT_SITE_CONTENT);
  };

  const addCustomPage = (page: Omit<CustomPage, 'id'>) => {
    const newPage: CustomPage = { ...page, id: `page_${Date.now()}` };
    setSiteContent(prev => ({ ...prev, customPages: [...prev.customPages, newPage] }));
  };

  const updateCustomPage = (id: string, updates: Partial<CustomPage>) => {
    setSiteContent(prev => ({
      ...prev,
      customPages: prev.customPages.map(p => (p.id === id ? { ...p, ...updates } : p))
    }));
  };

  const deleteCustomPage = (id: string) => {
    setSiteContent(prev => ({
      ...prev,
      customPages: prev.customPages.filter(p => p.id !== id)
    }));
  };

  return (
    <CustomizerContext.Provider
      value={{
        siteContent,
        updateSiteContent,
        resetToDefault,
        editorOpen,
        setEditorOpen,
        addCustomPage,
        updateCustomPage,
        deleteCustomPage
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};

export const useCustomizer = () => {
  const context = useContext(CustomizerContext);
  if (!context) {
    throw new Error('useCustomizer must be used within a CustomizerProvider');
  }
  return context;
};
