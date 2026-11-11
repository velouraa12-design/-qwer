import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useCustomizer } from '../context/CustomizerContext.tsx';
import { QabsLogo } from './QabsLogo.tsx';
import { Phone, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, setMode } = useApp();
  const { siteContent, setEditorOpen } = useCustomizer();
  const isAr = language === 'ar';

  return (
    <footer className="w-full bg-white dark:bg-[#020D14] border-t-2 border-[#00A896]/30 text-slate-600 dark:text-slate-400 text-xs py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-cyan-950/40">
          <div className="space-y-3 max-w-sm">
            <QabsLogo size="md" />
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {isAr
                ? 'منصة قبس الرقمية المتكاملة لتأسيس الشركات في الولايات المتحدة والمملكة المتحدة، وربط بوابات الدفع، وإدارة المتاجر المتعددة.'
                : 'QABS Unified Sovereign Commerce Operating System for US & UK corporate formation, global payments, and multi-store management.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs">
            <div className="space-y-2">
              <span className="font-extrabold text-[#003445] dark:text-white block">{isAr ? 'المنظومة' : 'Ecosystem'}</span>
              <button onClick={() => setMode('landing')} className="block hover:text-[#00A896] cursor-pointer">
                {isAr ? 'الموقع التعريفي' : 'Showcase'}
              </button>
              <button onClick={() => setMode('portal')} className="block hover:text-[#00A896] cursor-pointer">
                {isAr ? 'بوابة العميل ومتاجري' : 'Portal & Stores'}
              </button>
              <button onClick={() => setMode('store_builder')} className="block hover:text-[#00A896] cursor-pointer">
                {isAr ? 'منشئ المتاجر QABS Studio' : 'Store Builder'}
              </button>
            </div>

            <div className="space-y-2">
              <span className="font-extrabold text-[#003445] dark:text-white block">{isAr ? 'الحوكمة والمطورين' : 'Governance'}</span>
              <button onClick={() => setMode('admin')} className="block hover:text-[#00A896] cursor-pointer">
                {isAr ? 'لوحة Super Admin' : 'Super Admin'}
              </button>
              <button onClick={() => setMode('billing')} className="block hover:text-[#00A896] cursor-pointer">
                {isAr ? 'الاشتراكات والفوترة' : 'Billing & Plans'}
              </button>
              <button onClick={() => setMode('template_hub')} className="block hover:text-[#00A896] cursor-pointer">
                {isAr ? 'مستودع GitHub Template' : 'GitHub Template'}
              </button>
            </div>

            <div className="space-y-2">
              <span className="font-extrabold text-[#003445] dark:text-white block">{isAr ? 'التواصل الرسمي' : 'Official Channels'}</span>
              <a
                href={`https://wa.me/${siteContent.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-[#00A896] cursor-pointer font-semibold text-[#004457] dark:text-slate-300"
              >
                <Phone className="w-3.5 h-3.5 text-[#00A896]" />
                <span className="font-mono" dir="ltr">{siteContent.whatsappNumber}</span>
              </a>
              <div className="flex items-center gap-1.5 font-semibold text-[#004457] dark:text-slate-300">
                <Globe className="w-3.5 h-3.5 text-[#C8A24A]" />
                <span className="font-mono">{siteContent.storeDomain}</span>
              </div>
              <button
                onClick={() => setEditorOpen(true)}
                className="text-[11px] font-bold text-[#007F8B] dark:text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>✏️ {isAr ? 'تخصيص محتوى القالب' : 'Live Content Customizer'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            {isAr
              ? 'الرسوم الحكومية ورسوم الجهات الخارجية منفصلة. قبول Stripe و PayPal يخضع للأهلية وموافقة المزود.'
              : 'Government statutory and third-party fees separate. Stripe & PayPal approvals are subject to provider compliance.'}
          </p>
          <div className="flex items-center gap-4 font-semibold text-[#004457] dark:text-slate-400">
            <span>© 2026 QABS | قبس — متاجر إلكترونية | خدمات رقمية.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
