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
  heroBadgeAr: 'منظومة قبس المتكاملة v1.4.0 — 19 وحدة تشغيلية مفعّلة',
  heroBadgeEn: 'QABS Master Platform v1.4.0 — 19 Live Modules Active',
  heroTitleAr: 'خلّ تجارتك وشركتك تنطلق عالميًا مع منظومة قبس الموحدة!',
  heroTitleEn: 'Propel Your Global Commerce with QABS Master Platform!',
  heroSubtitleAr:
    'المنصة التشغيلية المتكاملة: تأسيس شركات LLC وC-Corp وUK LTD (14 مرحلة موثقة)، خزنة وثائق مشفرة AES-256-GCM، متاجر متعددة المستأجرين مع QABS Studio، وفوترة Sandbox ومستشار ذكي عبر الخادم.',
  heroSubtitleEn:
    'Unified operating platform: US LLC, C-Corp & UK LTD formation (14-step lifecycle), AES-256-GCM encrypted document vault, multi-tenant stores with QABS Studio, Sandbox billing, and server-side AI advisor.',
  heroCtaTextAr: 'ابدأ الآن — تأسيس شركة أو إطلاق متجر',
  heroCtaTextEn: 'Start Now — Form Company or Launch Store',
  heroCtaLink: 'https://qabs1.store',
  heroImageUrl: '/src/assets/images/qabs_global_hero_1794351468325.jpg',
  cardImageUrl: '/src/assets/images/qabs_banking_card_1794351469053.jpg',
  whatsappNumber: '+159710784967',
  storeDomain: 'qabs1.store',
  showcasePackageTitleAr: 'باقة انطلاقة الدفع والتأسيس العالمي (Complete)',
  showcasePackageTitleEn: 'Turnkey Global Formation & Commerce Package',
  showcasePrice: 299,
  showcaseFeaturesAr: [
    'تأسيس LLC / C-Corp أمريكية أو UK LTD (14 مرحلة)',
    'خزنة وثائق مشفرة AES-256-GCM وروابط موقعة مؤقتة',
    'استخراج الرقم الضريبي الفيدرالي EIN والوكيل المسجل مجاناً',
    'متجر إلكتروني مستقل مع استوديو تصميم QABS Studio'
  ],
  showcaseFeaturesEn: [
    'Official US LLC / C-Corp or UK LTD Formation (14 Steps)',
    'AES-256-GCM Encrypted Document Vault & Signed URLs',
    'IRS Federal EIN Issuance & Free Registered Agent',
    'Isolated Multi-Tenant Store + QABS Studio Customizer'
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

const SITE_CONTENT_STORAGE_KEY = 'qabs_site_content_v1_4';

export const CustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, whatsappNumber: '+159710784967' };
      }
    } catch {}
    return DEFAULT_SITE_CONTENT;
  });

  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(siteContent));
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
