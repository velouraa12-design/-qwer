import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useCustomizer } from '../context/CustomizerContext.tsx';
import { QabsLogo } from './QabsLogo.tsx';
import { Phone, Globe, Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdminGuard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminGuard }) => {
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
              <button onClick={() => setMode('billing')} className="block hover:text-[#00A896] cursor-pointer">
                {isAr ? 'الاشتراكات والفوترة' : 'Billing & Plans'}
              </button>
            </div>

            <div className="space-y-2">
              <span className="font-extrabold text-[#003445] dark:text-white block">{isAr ? 'الحوكمة والامتثال' : 'Governance & Compliance'}</span>
              <button onClick={() => setMode('landing')} className="block hover:text-[#00A896] cursor-pointer">
                {isAr ? 'دليل تأسيس الشركات (LLC / LTD)' : 'Company Formation Guide'}
              </button>
              <button onClick={() => setMode('landing')} className="block hover:text-[#00A896] cursor-pointer">
                {isAr ? 'سياسة الوكيل المسجل والخصوصية' : 'Registered Agent Policy'}
              </button>
              <button onClick={() => setMode('landing')} className="block hover:text-[#00A896] cursor-pointer">
                {isAr ? 'شروط الخدمة والاتفاقيات' : 'Terms of Service'}
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
          <p className="max-w-3xl leading-relaxed">
            {isAr
              ? 'تنبيه تجاري وقانوني معتمد: الرسوم الحكومية للولاية منفصلة تماماً عن رسوم منصة قبس. قبول وتفعيل بوابات الدفع (Stripe, PayPal, Tap Payments) والخدمات المصرفية التجارية يخضع كلياً للأهلية القانونية وموافقة المزود الرسمي للخدمة.'
              : 'Official statutory notice: State filing fees are separate from QABS platform fees. Third-party payment gateways (Stripe, PayPal, Tap) and commercial banking approvals are subject to individual eligibility and provider compliance.'}
          </p>
          <div className="flex items-center gap-4 font-semibold text-[#004457] dark:text-slate-400">
            <span>© 2026 QABS | قبس — متاجر إلكترونية | خدمات رقمية.</span>
            {onOpenAdminGuard && (
              <button
                onClick={onOpenAdminGuard}
                className="hover:text-[#00A896] dark:hover:text-[#d5b46b] transition-colors cursor-pointer flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-slate-600"
                title={isAr ? 'بوابة دخول الإدارة والتحكم (Admin Guard)' : 'Admin Guard Access'}
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>{isAr ? 'دخول الإدارة' : 'Staff Access'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
