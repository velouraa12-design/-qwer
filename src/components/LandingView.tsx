import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useCustomizer } from '../context/CustomizerContext.tsx';
import {
  US_STATES_PRICING,
  QABS_FORMATION_PKGS
} from '../data/usStatesPricing.ts';
import {
  Building2,
  Store,
  ShieldCheck,
  CreditCard,
  Globe,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  Landmark,
  FileCheck2,
  Edit3,
  Phone,
  HelpCircle,
  Zap,
  Award,
  ArrowRight,
  MessageSquare,
  Archive,
  ShieldAlert
} from 'lucide-react';

interface LandingViewProps {
  onOpenFormationModal: (stateCode?: string) => void;
  onOpenStoreModal: () => void;
  onOpenAIModal?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenFormationModal,
  onOpenStoreModal,
  onOpenAIModal
}) => {
  const { language, setMode, showToast } = useApp();
  const { siteContent, setEditorOpen } = useCustomizer();
  const isAr = language === 'ar';

  // Collapsible states pricing
  const [showStatesPricing, setShowStatesPricing] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | 'popular' | 'zero_tax' | 'low_fee'>('all');
  const [selectedPkgId, setSelectedPkgId] = useState<'starter' | 'complete' | 'premium'>('complete');

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  // Order tracking input for customer journey #4
  const [trackOrderNumber, setTrackOrderNumber] = useState('');

  const selectedPkg =
    QABS_FORMATION_PKGS.find(p => p.id === selectedPkgId) || QABS_FORMATION_PKGS[1];

  const filteredStates = US_STATES_PRICING.filter(st => {
    const matchesSearch =
      st.nameAr.includes(stateSearch) ||
      st.nameEn.toLowerCase().includes(stateSearch.toLowerCase()) ||
      st.code.toLowerCase().includes(stateSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (stateFilter === 'popular') return st.tags.includes('popular');
    if (stateFilter === 'zero_tax') return st.tags.includes('zero_tax');
    if (stateFilter === 'low_fee') return st.stateFilingFee <= 100;
    return true;
  });

  const faqs = [
    {
      qAr: 'هل يمكن لغير المقيم في أمريكا تأسيس شركة قانونية 100%؟',
      qEn: 'Can non-US residents legally form a US company 100%?',
      aAr: 'نعم، يتيح القانون الأمريكي لرواد الأعمال والمستثمرين من كافة دول العالم تأسيس شركات LLC أو C-Corp وامتلاكها بنسبة 100% دون اشتراط إقامة أو زيارة للولايات المتحدة أو وجود شريك أمريكي.',
      aEn: 'Yes, US law allows global founders to form and own 100% of an LLC or C-Corp without requiring US residency, travel, or a domestic partner.'
    },
    {
      qAr: 'ما هو الفرق بين التأسيس في وايومنغ (Wyoming) وديلاوير (Delaware)؟',
      qEn: 'What is the difference between Wyoming and Delaware formation?',
      aAr: 'ولاية وايومنغ هي الخيار الأول للتجارة الإلكترونية والأنشطة الرقمية بفضل خصوصية الملاك العالية وانعدام ضريبة الدخل والرسوم السنوية المنخفضة ($60). بينما ولاية ديلاوير هي المعيار الذهبي للشركات التقنية الناشئة التي تخطط لجذب استثمارات ورؤوس أموال مغامرة (VC).',
      aEn: 'Wyoming is ideal for e-commerce and digital founders due to complete privacy, zero state income tax, and low annual fees ($60). Delaware is the premier standard for tech startups seeking venture capital and institutional funding.'
    },
    {
      qAr: 'كم يستغرق إصدار الرقم الضريبي الفيدرالي EIN للشركات لغير المقيمين؟',
      qEn: 'How long does IRS EIN issuance take for non-residents?',
      aAr: 'يستغرق إصدار شهادة الرقم الضريبي الرسمي CP575 من مصلحة الضرائب الأمريكية (IRS) لغير حاملي رقم SSN عادة بين 4 إلى 10 أيام عمل عبر خط الاتصال المباشر المخصص للوكلاء المعتمدين.',
      aEn: 'Official IRS CP575 EIN issuance for non-SSN holders typically takes 4 to 10 business days via direct authorized agent channels.'
    },
    {
      qAr: 'كيف يساعدني الكيان في ربط بوابات الدفع Stripe والحساب البنكي؟',
      qEn: 'How does the entity facilitate Stripe and US banking approval?',
      aAr: 'بمجرد صدور وثائق التأسيس والرقم الضريبي EIN وعنوان الوكيل المسجل، يصبح لديك ملف تجاري أمريكي متكامل يؤهلك لفتح حسابات بنكية أعمال (مثل Mercury و Wise Business) والتقديم على بوابات الدفع العالمية مثل Stripe و PayPal.',
      aEn: 'With state formation papers, IRS EIN, and registered address, you possess a compliant US business profile to open business fintech accounts (Mercury, Wise) and apply for Stripe and PayPal.'
    },
    {
      qAr: 'هل يمكنني إدارة متاجري الإلكترونية وتأسيس الشركات من نفس لوحة التحكم؟',
      qEn: 'Can I manage my online stores and corporate entities from one unified portal?',
      aAr: 'نعم تماماً! تقدم منصة قبس الموحدة لوحة تحكم واحدة تجمع إدارة ملفات تأسيس الشركات ووثائقها القانونية، إلى جانب إدارة متاجرك الإلكترونية المستقلة ومنتجاتها وطلباتها واستوديو التصميم.',
      aEn: 'Yes! QABS provides a unified dashboard merging corporate entity filings and legal compliance with independent online stores, product catalogs, and QABS Studio design.'
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 0. QABS MASTER PLATFORM v1.4.0 — LIVE 19-MODULE STATUS & QUICK-LAUNCH BAR */}
      <div className="bg-[#0b172a] border-b border-[#d5b46b]/40 text-white py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#d5b46b]/15 border border-[#d5b46b]/50 text-[#d5b46b] text-[11px] font-mono font-black">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d5b46b]" />
              <span>QABS MASTER SYSTEM v1.4.0</span>
            </span>
            <span className="text-xs font-bold text-slate-200">
              {isAr
                ? '19 وحدة تشغيلية نشطة: تأسيس 14 مرحلة • خزنة وثائق AES-256-GCM • فوترة Sandbox • متاجر واستوديو قبس'
                : '19 Active Modules: 14-Step Formation • AES-256-GCM Vault • Sandbox Billing • Multi-Tenant Stores & Studio'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
            <button
              onClick={() => onOpenFormationModal('WY')}
              className="px-2.5 py-1 rounded-lg bg-[#00A896]/20 hover:bg-[#00A896]/30 border border-[#00A896]/50 text-teal-300 cursor-pointer transition-colors"
            >
              {isAr ? '⚡ معالج التأسيس (LLC / C-Corp / UK LTD)' : '⚡ Formation Wizard (14-Step)'}
            </button>
            <button
              onClick={() => setMode('portal')}
              className="px-2.5 py-1 rounded-lg bg-[#d5b46b] hover:bg-[#c8a24a] text-[#0b172a] font-black cursor-pointer transition-colors"
            >
              {isAr ? '🔐 بوابة العميل الموحدة وخزنة الوثائق' : '🔐 Client Portal & Encrypted Vault'}
            </button>
            <button
              onClick={() => setMode('store_builder')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer transition-colors"
            >
              {isAr ? '🎨 استوديو المتاجر QABS Studio' : '🎨 QABS Studio'}
            </button>
          </div>
        </div>
      </div>

      {/* 1. EXECUTIVE HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F2F9F9] to-white dark:from-[#03131D] dark:via-[#062030] dark:to-[#03131D] pt-8 pb-16 border-b-2 border-[#00A896]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Text Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#004457]/10 dark:bg-teal-950/80 border border-[#00A896]/40 text-[#004457] dark:text-teal-300 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5 text-[#00A896]" />
                <span>{isAr ? siteContent.heroBadgeAr : siteContent.heroBadgeEn}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-[#003445] dark:text-white leading-tight">
                {isAr ? siteContent.heroTitleAr : siteContent.heroTitleEn}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-2xl">
                {isAr ? siteContent.heroSubtitleAr : siteContent.heroSubtitleEn}
              </p>

              {/* Primary Hero Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenFormationModal('WY')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#004457] via-[#006D77] to-[#00A896] text-white font-black text-xs sm:text-sm shadow-lg hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-[#E5C158]" />
                  <span>{isAr ? siteContent.heroCtaTextAr : siteContent.heroCtaTextEn}</span>
                </button>

                <button
                  onClick={() => setMode('portal')}
                  className="px-5 py-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-[#004457] text-[#004457] dark:text-teal-300 font-black text-xs sm:text-sm hover:bg-teal-50/60 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Store className="w-4 h-4 text-[#00A896]" />
                  <span>{isAr ? 'الدخول للبوابة الموحدة (المتاجر والشركات)' : 'Open Unified Portal'}</span>
                </button>

                {onOpenAIModal && (
                  <button
                    onClick={onOpenAIModal}
                    className="px-4 py-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-[#C8A24A]/50 text-[#004457] dark:text-[#E5C158] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#C8A24A]" />
                    <span>{isAr ? 'مستشار قبس الذكي' : 'QABS Advisor'}</span>
                  </button>
                )}

                <button
                  onClick={() => setEditorOpen(true)}
                  className="px-3.5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#004457] dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  title={isAr ? 'تعديل نصوص وصور الواجهة' : 'Edit Hero & Package'}
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#00A896]" />
                  <span>{isAr ? 'تخصيص الواجهة' : 'Customize'}</span>
                </button>
              </div>

              {/* Official Quick Links Strip */}
              <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <a
                  href="https://qabs1.store"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00A896] font-mono font-bold flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5 text-[#00A896]" />
                  <span>qabs1.store</span>
                </a>
                <span>•</span>
                <button
                  onClick={() => setMode('portal')}
                  className="hover:text-[#00A896] font-mono font-bold cursor-pointer"
                >
                  portal.qabs1.store
                </button>
                <span>•</span>
                <a
                  href={`https://wa.me/${siteContent.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00A896] font-mono font-bold flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C8A24A]" />
                  <span dir="ltr">{siteContent.whatsappNumber}</span>
                </a>
              </div>
            </div>

            {/* Hero Right Column: Turnkey Package Showcase Card ($349) */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-[#071D2B] border-2 border-[#00A896]/40 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <img
                    src="/qabas-logo.png"
                    alt="QABS | قبس"
                    className="h-12 w-auto object-contain bg-white rounded-xl px-2 py-1 border border-slate-100"
                  />
                  <div className="text-left">
                    <span className="text-[11px] text-slate-400 block font-bold">
                      {isAr ? 'باقة التأسيس والدفع الشاملة' : 'Turnkey Launch Package'}
                    </span>
                    <span className="text-2xl font-black text-[#004457] dark:text-[#E5C158] font-mono">
                      ${siteContent.showcasePrice}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#003445] dark:text-white">
                    {isAr ? siteContent.showcasePackageTitleAr : siteContent.showcasePackageTitleEn}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isAr
                      ? 'تشمل تأسيس الشركة الأمريكية، الرقم الضريبي EIN، العنوان، وتجهيز بوابات الدفع والمتجر الإلكتروني'
                      : 'Includes US LLC formation, IRS EIN, Registered Agent address, payment gateway prep & store'}
                  </p>
                </div>

                <ul className="space-y-2.5">
                  {(isAr ? siteContent.showcaseFeaturesAr : siteContent.showcaseFeaturesEn).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#00A896] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    onClick={() => onOpenFormationModal('WY')}
                    className="py-3 px-4 rounded-xl bg-[#004457] hover:bg-[#003342] text-white font-black text-xs transition-all cursor-pointer text-center"
                  >
                    {isAr ? 'ابدأ تأسيس شركتك' : 'Form Company Now'}
                  </button>
                  <button
                    onClick={() => setMode('portal')}
                    className="py-3 px-4 rounded-xl bg-[#00A896] hover:bg-[#008f7f] text-white font-black text-xs transition-all cursor-pointer text-center"
                  >
                    {isAr ? 'البوابة الموحدة' : 'Unified Portal'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Quantitative Trust Metrics */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#004457] dark:text-[#E5C158] font-mono">
                +1,450
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? 'شركة تم تأسيسها رسمياً' : 'Companies Incorporated'}
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#00A896] font-mono">
                100%
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? 'نسبة نجاح استخراج EIN' : 'EIN Issuance Success'}
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#004457] dark:text-[#E5C158] font-mono">
                48h
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? 'متوسط سرعة الإيداع لدى الولاية' : 'Avg State Filing Speed'}
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#00A896] font-mono">
                $0
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? 'ضريبة دخل في وايومنغ' : 'State Tax in Wyoming'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SIMPLIFIED CUSTOMER JOURNEY (المسارات الأربعة الأساسية لخدمة العميل) */}
      <section id="customer-journeys" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-gradient-to-r from-[#14243e] to-[#0b172a] rounded-3xl p-6 sm:p-8 border-2 border-[#d5b46b]/40 text-white shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d5b46b]/15 text-[#d5b46b] border border-[#d5b46b]/40 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5 text-[#d5b46b]" />
                <span>{isAr ? 'مسارات العميل الأربعة الأساسية' : 'Simplified 4-Path Customer Journey'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                {isAr ? 'كيف ترغب في بدء أعمالك مع قبس اليوم؟' : 'How would you like to start with QABS today?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {isAr
                  ? 'تم تبسيط رحلة العميل بالكامل في 4 مسارات مباشرة: التأسيس، بوابات الدفع، إنشاء المتاجر، أو متابعة طلباتك السابقة.'
                  : 'Customer journey simplified into 4 primary paths: formation, payments, store setup, or verified tracking.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isAr ? 'قنوات خدمة معتمدة ومباشرة' : 'Direct Verified Channels'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Journey 1: أريد تأسيس شركة */}
            <div className="bg-[#0b172a]/90 rounded-2xl p-5 border border-slate-700/80 hover:border-[#d5b46b] transition-all flex flex-col justify-between space-y-4 shadow-lg group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#14243e] border border-[#d5b46b]/40 text-[#d5b46b] flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5 text-[#d5b46b]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                    {isAr ? 'الإرسال قيد التفعيل' : 'Submission pending'}
                  </span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-[#d5b46b] transition-colors">
                  {isAr ? '1. أريد تأسيس شركة' : '1. Form a Company'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'تأسيس رسمي معتمد في أمريكا (وايومنغ أو ديلاوير) أو بريطانيا، يشمل عقد التشغيل والوكيل المسجل.'
                    : 'US LLC (Wyoming / Delaware) or UK LTD incorporation with Articles & Registered Agent.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenFormationModal('WY')}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d5b46b] to-[#b3934d] hover:brightness-110 text-[#14243e] font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>{isAr ? 'ابدأ طلب التأسيس' : 'Start Formation'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>

            {/* Journey 2: أريد تجهيز الدفع */}
            <div className="bg-[#0b172a]/90 rounded-2xl p-5 border border-slate-700/80 hover:border-amber-400 transition-all flex flex-col justify-between space-y-4 shadow-lg group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#14243e] border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-600/50">
                    {isAr ? 'BLOCKED / قيد التفعيل' : 'BLOCKED / In Setup'}
                  </span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                  {isAr ? '2. أريد تجهيز الدفع' : '2. Setup Payments'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'إصدار رقم الضريبة EIN، وتجهيز الملف المصرفي لبوابات الدفع (Stripe/Tap/Mercury). ملاحظة: القبول يخضع كلياً للأهلية وموافقة المزود الرسمي.'
                    : 'EIN tax issuance & banking dossier for Stripe, Tap & Mercury. Note: Approvals subject to provider eligibility.'}
                </p>
              </div>

              <a
                href={`https://wa.me/159710784967?text=${encodeURIComponent(
                  isAr
                    ? 'مرحباً فريق قبس، أرغب في الاستفسار عن تجهيز بوابات الدفع (Stripe / Tap) والحساب البنكي لشركتي.'
                    : 'Hello QABS team, I want to inquire about payment gateways (Stripe / Tap) and banking setup.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-[#14243e] hover:bg-[#1a2f50] text-amber-300 border border-amber-500/50 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>{isAr ? 'استشارة تجهيز الدفع' : 'Inquire Payment Setup'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </a>
            </div>

            {/* Journey 3: أريد إنشاء متجر */}
            <div className="bg-[#0b172a]/90 rounded-2xl p-5 border border-slate-700/80 hover:border-[#d5b46b] transition-all flex flex-col justify-between space-y-4 shadow-lg group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#14243e] border border-[#d5b46b]/40 text-[#d5b46b] flex items-center justify-center font-bold">
                    <Store className="w-5 h-5 text-[#d5b46b]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-600/50">
                    {isAr ? 'إطلاق فوري' : 'Turnkey Ready'}
                  </span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-[#d5b46b] transition-colors">
                  {isAr ? '3. أريد إنشاء متجر' : '3. Launch a Store'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'إطلاق متجر إلكتروني مستقل بقالب قبس العربي v14 أو Shopify، مع ربط الكتالوج وبوابات الدفع.'
                    : 'Launch independent storefront with QABS Arabic v14 template or Shopify integration.'}
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenStoreModal}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00A896] to-[#007F8B] hover:brightness-110 text-white font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>{isAr ? 'إنشاء متجر جديد' : 'Launch New Store'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>

            {/* Journey 4: أريد متابعة طلب قائم عبر WhatsApp */}
            <div className="bg-[#0b172a]/90 rounded-2xl p-5 border border-slate-700/80 hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4 shadow-lg group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>WhatsApp: +159710784967</span>
                  </span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                  {isAr ? '4. أريد متابعة طلب قائم' : '4. Track Order'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'متابعة مباشرة وموثقة مع فريق الامتثال والتأسيس للاستفسار عن مستجدات ملفك عبر WhatsApp الموثق (+159710784967).'
                    : 'Direct verified tracking via WhatsApp (+159710784967) with compliance officers for your active filing.'}
                </p>

                {/* Tracking input */}
                <div className="pt-1">
                  <input
                    type="text"
                    value={trackOrderNumber}
                    onChange={e => setTrackOrderNumber(e.target.value)}
                    placeholder={isAr ? 'أدخل رقم الطلب (مثال: QABS-101)' : 'Order # (e.g. QABS-101)'}
                    className="w-full bg-[#14243e] border border-slate-700 focus:border-emerald-400 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-500 outline-none font-mono"
                  />
                </div>
              </div>

              <a
                href={`https://wa.me/159710784967?text=${encodeURIComponent(
                  trackOrderNumber.trim()
                    ? (isAr
                        ? `مرحباً فريق قبس، أرغب في متابعة طلبي القائم رقم: ${trackOrderNumber.trim()}`
                        : `Hello QABS team, I want to track my active order #${trackOrderNumber.trim()}`)
                    : (isAr
                        ? 'مرحباً فريق قبس، أرغب في الاستفسار ومتابعة طلبي القائم لديكم عبر الخط الموثق (+159710784967).'
                        : 'Hello QABS team, I would like to inquire about my active order.')
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5 text-white" />
                <span>{isAr ? 'متابعة عبر WhatsApp الموثق' : 'Track via WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRANSPARENT FUNCTIONALITY & OPERATIONAL READINESS MATRIX (مصفوفة الوظائف الحقيقية للعملاء) */}
      <section id="functionality-matrix" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#071D2B] border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#003445] dark:text-[#d5b46b] border border-slate-300 dark:border-slate-700 text-xs font-bold font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isAr ? 'مصفوفة الشفافية والجاهزية التشغيلية' : 'Service Transparency & Readiness Matrix'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#14243e] dark:text-white mt-2">
                {isAr
                  ? 'حالة الخدمات والأنظمة التشغيلية الفعلية'
                  : 'Current Real-World Operational Status of Services'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isAr
                  ? 'نلتزم بأعلى درجات الشفافية مع عملائنا: توضيح دقيق للخدمات المتاحة فوراً مقابل الخدمات قيد التفعيل المصرفي والمراجعة.'
                  : 'Full transparency: clear distinction between active initial intake and pending external integrations.'}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isAr ? 'تقرير الحالة التشغيلية (الخطوة 02)' : 'Operational Audit Matrix'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Module 1: طلب التأسيس */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-[#051e17] border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? '1. طلب التأسيس' : '1. Formation Intake'}</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                  PASS ✅
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'حفظ خلفي حقيقي: معالج ولايات أمريكا الـ 50، حفظ كمسودة أو إرسال للمراجعة، مع إصدار فاتورة Sandbox وسجل تدقيق.'
                  : 'Real backend persistence: 50 US states wizard, save draft or submit for review, Sandbox quote/invoice & audit trail.'}
              </p>
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {isAr ? 'الحالة: مفعل ومرتبط بقاعدة البيانات (PASS)' : 'Status: Active Backend Persistence (PASS)'}
              </div>
            </div>

            {/* Module 2: رفع المستندات / السحابة */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-[#1f1707] border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-amber-600" />
                  <span>{isAr ? '2. رفع المستندات / السحابة' : '2. KYC / Cloud Uploads'}</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                  PARTIAL ⚠️
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'غير مفعّل للعموم: واجهة الرفع مبرمجة، وقيد استكمال التشفير AES-256 وربط مخزن Cloudflare R2 المعزول.'
                  : 'Inactive public cloud: Upload UI programmed, pending AES-256 Cloudflare R2 storage link.'}
              </p>
              <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
                {isAr ? 'الحالة: قيد التجهيز السحابي' : 'Status: In Setup Pipeline'}
              </div>
            </div>

            {/* Module 3: بوابات الدفع (Stripe / Tap / Mercury) */}
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-[#20090e] border border-rose-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-950 dark:text-rose-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-rose-600" />
                  <span>{isAr ? '3. بوابات الدفع والمصارف' : '3. Payment Gateways'}</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                  BLOCKED 🔒
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'قيد التفعيل والتجهيز: ربط Stripe و Tap و Mercury بانتظار استكمال السجلات والحسابات والموافقة المشروطة من المزود.'
                  : 'In activation: Stripe, Tap & Mercury pending entity completion & formal provider approval.'}
              </p>
              <div className="pt-2 border-t border-rose-200 dark:border-rose-800/60 text-[10px] font-mono font-bold text-rose-700 dark:text-rose-400">
                {isAr ? 'الحالة: قيد التفعيل التجاري' : 'Status: Pending Approval'}
              </div>
            </div>

            {/* Module 4: الاشتراكات والفوترة والذكاء الاصطناعي */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0b172a] border border-slate-300 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#d5b46b]" />
                  <span>{isAr ? '4. الفوترة والذكاء الاصطناعي' : '4. Billing & AI'}</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-200">
                  {isAr ? 'قيد التخطيط والمراجعة' : 'In Review'}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'استعراض الباقات نشط، بينما الخصم التلقائي الدوري ونماذج الذكاء الاصطناعي قيد التخطيط والمراجعة القانونية.'
                  : 'Package tiers active; automated billing cron and legal AI models in planning and compliance review.'}
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                {isAr ? 'الحالة: قيد التخطيط والتطوير' : 'Status: In Planning'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMMERCIAL DISCLAIMERS & FEE BREAKDOWN TRANSPARENCY (التنبيهات والتحفظات التجارية وهيكل الرسوم) */}
      <section id="commercial-disclaimers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-[#14243e] text-white rounded-3xl p-6 sm:p-8 border-2 border-[#d5b46b]/60 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0b172a] border border-[#d5b46b]/60 text-[#d5b46b] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-[#d5b46b]" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600">
                {isAr ? 'التحفظات والشفافية القانونية المعتمدة' : 'Official Statutory Disclaimers'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                {isAr
                  ? 'التنبيهات التجارية الرسمية وهيكل فصل الرسوم'
                  : 'Official Commercial Disclaimers & Fee Structure Breakdown'}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Disclaimer 1: Third-Party Payment Gateway & Banking Approvals */}
            <div className="bg-[#0b172a] p-5 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="flex items-center gap-2 text-[#d5b46b] font-bold text-sm">
                <CreditCard className="w-4 h-4 text-[#d5b46b]" />
                <h4>
                  {isAr
                    ? 'إخلاء مسؤولية قبول بوابات الدفع والمصارف الخارجية'
                    : 'Third-Party Payment & Banking Approval Disclaimer'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'تنبيه قانوني وتجاري هام: قبول وتفعيل الحسابات لدى بوابات الدفع العالمية والمحلية (بما في ذلك Stripe, PayPal, Tap Payments) والخدمات المصرفية التجارية (مثل Mercury Bank و Wise) يخضع كلياً للأهلية القانونية، فحص ومطابقة الامتثال المصرفي (KYC / AML)، وموافقة المزود الرسمي للخدمة دون أدنى ضمان مطلق من منصة قبس، حيث ينحصر دورنا في إعداد الملف القانوني وتجهيز المتاجر وتوفير وثائق التأسيس المعتمدة.'
                  : 'Important notice: Approvals for external merchant payment processors (Stripe, PayPal, Tap) and commercial banks (Mercury, Wise) are strictly subject to individual applicant eligibility, KYC/AML review, and sole discretion of the respective provider. QABS facilitates filing documentation and technical integration but does not guarantee third-party approvals.'}
              </p>
            </div>

            {/* Disclaimer 2: Clear Separation of Fees */}
            <div className="bg-[#0b172a] p-5 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h4>
                  {isAr
                    ? 'الفصل الواضح والشفاف بين هيكل الرسوم'
                    : 'Transparent Separation of Fee Structure'}
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#d5b46b] font-black shrink-0">1.</span>
                  <span>
                    <strong className="text-white">{isAr ? 'رسوم منصة قبس (QABS Service Fee):' : 'QABS Platform Fees:'}</strong>{' '}
                    {isAr
                      ? 'تشمل خدمات التأسيس، إعداد عقد التشغيل، وتوفير الوكيل المسجل والعنوان الرسمي للسنة الأولى.'
                      : 'Covers preparation, Operating Agreement, and 1st year registered agent.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-black shrink-0">2.</span>
                  <span>
                    <strong className="text-white">{isAr ? 'الرسوم الحكومية للولاية (State Statutory Fees):' : 'State Filing Fees:'}</strong>{' '}
                    {isAr
                      ? 'رسوم حكومية إلزامية تُدفع مباشرة لمكتب سكرتير الولاية (مثل $102 لوايومنغ) وهي منفصلة ومستقلة تماماً.'
                      : 'Mandatory statutory fees paid directly to Secretary of State offices without markup.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-black shrink-0">3.</span>
                  <span>
                    <strong className="text-white">{isAr ? 'رسوم معالجة المدفوعات الخارجية (Processor Fees):' : 'Third-Party Processor Fees:'}</strong>{' '}
                    {isAr
                      ? 'تقتطعها بوابات الدفع (مثل 2.9% + 30¢ لـ Stripe) على كل معاملة بيع، وتخضع لسياسات المزود المباشر.'
                      : 'Deducted directly by payment processors per transaction according to their published terms.'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. QABS 9 SOVEREIGN SERVICES EXECUTIVE GRID (الخدمات السيادية الـ 9) */}
      <section id="services-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14243e] text-[#d5b46b] border border-[#d5b46b]/40 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#d5b46b]" />
              <span>{isAr ? 'الخدمات السيادية الـ 9 المعتمدة' : 'Official 9 Sovereign Services'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#14243e] dark:text-white mt-2">
              {isAr
                ? 'منظومة قبس المتكاملة: كل ما يلزم لتأسيس شركتك، إطلاق متاجرك، وربط مدفوعاتك'
                : 'Complete Sovereign Ecosystem: Form Entities, Connect Payments & Run Multi-Stores'}
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">
            qabs1.store · Certified Suite
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service 1: US Company Formation */}
          <div
            onClick={() => onOpenFormationModal('WY')}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border-2 border-slate-200 dark:border-slate-800 hover:border-[#d5b46b] shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#14243e] text-[#d5b46b] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6 text-[#d5b46b]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  01 · Formation
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">All 50 States</span>
              </div>
              <h3 className="text-base font-black text-[#14243e] dark:text-white group-hover:text-[#d5b46b] transition-colors">
                {isAr ? '1. تأسيس الشركات الأمريكية (US LLC & C-Corp)' : '1. US LLC & C-Corp Formation'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? 'تأسيس رسمي معتمد في وايومنغ، ديلاوير، ونيو مكسيكو، يشمل النظام الأساسي (Articles) والوكيل المسجل وعقد التشغيل.'
                  : 'Official state registration in Wyoming, Delaware, and New Mexico with Operating Agreement & Registered Agent.'}
              </p>
            </div>
            <span className="text-xs font-black text-[#d5b46b] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              <span>{isAr ? 'فتح بوابة التأسيس' : 'Start Formation'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </span>
          </div>

          {/* Service 2: UK LTD Formation */}
          <div
            onClick={() => showToast(isAr ? 'مسار تأسيس الشركات البريطانية غير متاح حالياً.' : 'UK company formation is not currently available.')}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border-2 border-slate-200 dark:border-slate-800 hover:border-[#d5b46b] shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#14243e] text-[#d5b46b] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6 text-[#d5b46b]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  02 · United Kingdom
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">Companies House</span>
              </div>
              <h3 className="text-base font-black text-[#14243e] dark:text-white group-hover:text-[#d5b46b] transition-colors">
                {isAr ? '2. تأسيس الشركات البريطانية (UK LTD)' : '2. UK LTD Incorporation'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? 'تسجيل رسمي وسريع لدى Companies House، شهادة التأسيس الرسمية، وتوفير عنوان قانوني مرموق في قلب لندن.'
                  : 'Incorporation with Companies House UK, Articles of Association, and prime prestigious London address.'}
              </p>
            </div>
            <span className="text-xs font-black text-[#d5b46b] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              <span>{isAr ? 'تأسيس شركة بريطانية' : 'Form UK Company'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </span>
          </div>

          {/* Service 3: IRS EIN Service */}
          <div
            onClick={() => onOpenFormationModal('WY')}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border-2 border-slate-200 dark:border-slate-800 hover:border-[#d5b46b] shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#14243e] text-[#d5b46b] flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-6 h-6 text-[#d5b46b]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  03 · IRS CP575
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">Non-Residents</span>
              </div>
              <h3 className="text-base font-black text-[#14243e] dark:text-white group-hover:text-[#d5b46b] transition-colors">
                {isAr ? '3. استخراج رقم الضريبة الفيدرالي (IRS EIN)' : '3. IRS Employer ID (EIN)'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? 'إصدار شهادة CP575 الرسمية من مصلحة الضرائب الأمريكية لغير حاملي SSN خلال أيام عمل قليلة لتفعيل البنوك وبوابات الدفع.'
                  : 'Official IRS CP575 confirmation letter issued for global non-residents without SSN requirement.'}
              </p>
            </div>
            <span className="text-xs font-black text-[#d5b46b] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              <span>{isAr ? 'طلب إصدار الـ EIN' : 'Acquire EIN'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </span>
          </div>

          {/* Service 4: Digital Banking Mercury & Wise */}
          <div
            onClick={() => setMode('portal')}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border-2 border-slate-200 dark:border-slate-800 hover:border-[#d5b46b] shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#14243e] text-[#d5b46b] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Landmark className="w-6 h-6 text-[#d5b46b]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  04 · Banking
                </span>
                <span className="text-xs font-mono font-bold text-purple-600">FDIC Insured</span>
              </div>
              <h3 className="text-base font-black text-[#14243e] dark:text-white group-hover:text-[#d5b46b] transition-colors">
                {isAr ? '4. فتح الحسابات البنكية (Mercury & Wise)' : '4. Commercial Banking (Mercury & Wise)'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? 'تجهيز ملف الشركة وقرار مجلس الإدارة البنكي المعتمد لفتح حسابات جارية تجارية بالدولار واليورو والإسترليني.'
                  : 'Corporate resolution kit & banking dossier for verified Mercury & Wise Business account approvals.'}
              </p>
            </div>
            <span className="text-xs font-black text-[#d5b46b] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              <span>{isAr ? 'تجهيز الملف المصرفي' : 'Banking Dossier'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </span>
          </div>

          {/* Service 5: Stripe Connect Gateway */}
          <div
            onClick={() => setMode('portal')}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border-2 border-slate-200 dark:border-slate-800 hover:border-[#d5b46b] shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#14243e] text-[#d5b46b] flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="w-6 h-6 text-[#d5b46b]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  05 · Global Payments
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">Stripe Connect</span>
              </div>
              <h3 className="text-base font-black text-[#14243e] dark:text-white group-hover:text-[#d5b46b] transition-colors">
                {isAr ? '5. بوابة الدفع العالمية (Stripe Connect)' : '5. Stripe Connect Multi-Currency'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? 'ربط حساب Stripe تجاري موثق بالكيان الأمريكي لاستقبال المدفوعات العالمية والتحويلات المباشرة إلى حسابك المصرفي.'
                  : 'Fully verified US-entity Stripe merchant account with 135+ currencies and 3D-Secure fraud defense.'}
              </p>
            </div>
            <span className="text-xs font-black text-[#d5b46b] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              <span>{isAr ? 'ربط بوابة Stripe' : 'Connect Stripe'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </span>
          </div>

          {/* Service 6: Tap Payments GCC */}
          <div
            onClick={() => setMode('portal')}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border-2 border-slate-200 dark:border-slate-800 hover:border-[#d5b46b] shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#14243e] text-[#d5b46b] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 text-[#d5b46b]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  06 · GCC Gateway
                </span>
                <span className="text-xs font-mono font-bold text-teal-600">مدى · KNET</span>
              </div>
              <h3 className="text-base font-black text-[#14243e] dark:text-white group-hover:text-[#d5b46b] transition-colors">
                {isAr ? '6. بوابات الدفع الخليجية (Tap Payments)' : '6. Tap Payments GCC Regional'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? 'تفعيل الدفع الفوري عبر مدى (السعودية)، KNET (الكويت)، Benefit (البحرين)، و Apple Pay لتحقيق أعلى معدل تحويل خليجي.'
                  : 'Native GCC payments via Mada, KNET, Benefit & Apple Pay with localized checkout settlement.'}
              </p>
            </div>
            <span className="text-xs font-black text-[#d5b46b] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              <span>{isAr ? 'تفعيل بوابات الخليج' : 'Activate GCC Gateways'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </span>
          </div>

          {/* Service 7: Multi-Store Builder */}
          <div
            onClick={() => setMode('store_builder')}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border-2 border-slate-200 dark:border-slate-800 hover:border-[#d5b46b] shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#14243e] text-[#d5b46b] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Store className="w-6 h-6 text-[#d5b46b]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  07 · Commerce Engine
                </span>
                <span className="text-xs font-mono font-bold text-amber-600">QABS Studio</span>
              </div>
              <h3 className="text-base font-black text-[#14243e] dark:text-white group-hover:text-[#d5b46b] transition-colors">
                {isAr ? '7. منشئ المتاجر المتعددة (QABS Studio)' : '7. Standalone Storefront Builder'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? 'منشئ متاجر متقدم يتيح تخصيص القوالب والكتالوج والمخزون، مع عزل كامل لقواعد البيانات D1 ودعم النطاقات المخصصة.'
                  : 'Isolated multi-tenant storefront designer, custom domain routing, catalog CRUD & stock tracking.'}
              </p>
            </div>
            <span className="text-xs font-black text-[#d5b46b] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              <span>{isAr ? 'فتح استوديو المتاجر' : 'Open Store Builder'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </span>
          </div>

          {/* Service 8: Annual Compliance & State Reports */}
          <div
            onClick={() => setMode('portal')}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border-2 border-slate-200 dark:border-slate-800 hover:border-[#d5b46b] shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#14243e] text-[#d5b46b] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-[#d5b46b]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  08 · Compliance
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">Auto Calendar</span>
              </div>
              <h3 className="text-base font-black text-[#14243e] dark:text-white group-hover:text-[#d5b46b] transition-colors">
                {isAr ? '8. تقويم الامتثال والتجديدات السنوية' : '8. Annual Compliance & Filings'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? 'متابعة تقارير سكرتير الولاية السنوية، ضريبة الامتياز Franchise Tax، وتجديد خدمة الوكيل المسجل لضمان الوضع الجيد (Good Standing).'
                  : 'Automated state compliance tracking, annual franchise tax filings, and registered agent renewals.'}
              </p>
            </div>
            <span className="text-xs font-black text-[#d5b46b] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              <span>{isAr ? 'عرض تقويم الامتثال' : 'Compliance Calendar'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </span>
          </div>

          {/* Service 9: Legal Advisory & AI Studio */}
          <div
            onClick={onOpenAIModal}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border-2 border-slate-200 dark:border-slate-800 hover:border-[#d5b46b] shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#14243e] text-[#d5b46b] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-[#d5b46b]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  09 · Advisory & AI
                </span>
                <span className="text-xs font-mono font-bold text-cyan-600">Gemini Engine</span>
              </div>
              <h3 className="text-base font-black text-[#14243e] dark:text-white group-hover:text-[#d5b46b] transition-colors">
                {isAr ? '9. الاستشارات القانونية وصياغة القرارات' : '9. Legal Advisory & Resolution AI'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? 'استوديو ذكاء اصطناعي متخصص لصياغة قرارات مجلس الإدارة الرسمية، عقود التأسيس، وصياغة الأوصاف التسويقية عالية التحويل.'
                  : 'AI-assisted drafting for banking resolutions, operating bylaws, corporate memos, and sales copy.'}
              </p>
            </div>
            <span className="text-xs font-black text-[#d5b46b] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              <span>{isAr ? 'تشغيل مستشار قبس' : 'Launch AI Advisor'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </span>
          </div>
        </div>
      </section>

      {/* 3. THE 3-STEP FORMATION JOURNEY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-[#00A896] uppercase tracking-wider">
              {isAr ? 'كيف تبدأ شركتك وتجارتك مع قبس؟' : 'How It Works'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#003445] dark:text-white">
              {isAr ? 'ثلاث خطوات فقط للانطلاق نحو العالمية' : '3 Simple Steps to Global Commerce'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {isAr
                ? 'نتولى عنك كافة الإجراءات الحكومية والقانونية والتقنية لتتفرغ لتنمية تجارتك'
                : 'We manage all legal, governmental, and technical procedures so you can focus on scale'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#004457] text-[#E5C158] font-black text-sm flex items-center justify-center font-mono">
                01
              </div>
              <h3 className="text-base font-black text-[#003445] dark:text-white">
                {isAr ? 'اختيار الولاية وتعبئة البيانات' : 'Select State & Enter Details'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'اختر الولاية الأنسب لنشاطك (وايومنغ للتجارة الإلكترونية، ديلاوير للاستثمار) وقم بتحديد اسم الشركة والمدراء.'
                  : 'Choose the best state (Wyoming for commerce, Delaware for VC) and specify company name & managers.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#00A896] text-white font-black text-sm flex items-center justify-center font-mono">
                02
              </div>
              <h3 className="text-base font-black text-[#003445] dark:text-white">
                {isAr ? 'الإيداع واستخراج EIN والوثائق' : 'State Filing & IRS EIN'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'نقوم بإيداع النظام الأساسي لدى سكرتير الولاية واستخراج الرقم الضريبي الفيدرالي EIN وتجهيز عقد التأسيس.'
                  : 'We file Articles of Organization, obtain IRS EIN letter, and issue the custom Operating Agreement.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#C8A24A] text-slate-950 font-black text-sm flex items-center justify-center font-mono">
                03
              </div>
              <h3 className="text-base font-black text-[#003445] dark:text-white">
                {isAr ? 'تفعيل البنك والدفع وإطلاق المتجر' : 'Banking, Gateways & Launch'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'نوجهك لفتح حساب Mercury أو Wise، وربط بوابة Stripe، وتفعيل متجرك الإلكتروني المستقل في قبس.'
                  : 'Open Mercury or Wise accounts, connect Stripe payment gateway, and launch your store on QABS.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. JURISDICTION COMPARISON TABLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-black text-[#00A896] uppercase tracking-wider">
            {isAr ? 'دليل الاختيار الذكي' : 'Jurisdiction Comparison'}
          </span>
          <h2 className="text-2xl font-black text-[#003445] dark:text-white mt-1">
            {isAr ? 'مقارنة الولايات التأسيسية الأكثر طلباً لرواد الأعمال' : 'Top Jurisdictions Comparison'}
          </h2>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#071D2B]">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">{isAr ? 'الولاية / الاختصاص' : 'Jurisdiction'}</th>
                <th className="p-4">{isAr ? 'ضريبة دخل الولاية' : 'State Income Tax'}</th>
                <th className="p-4">{isAr ? 'سرية الملاك (Privacy)' : 'Owner Privacy'}</th>
                <th className="p-4">{isAr ? 'التقرير السنوي' : 'Annual Report'}</th>
                <th className="p-4">{isAr ? 'الأنسب لـ' : 'Recommended For'}</th>
                <th className="p-4 text-center">{isAr ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr className="hover:bg-teal-50/40 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-black text-[#004457] dark:text-white">
                  {isAr ? 'وايومنغ (Wyoming - WY) ⭐' : 'Wyoming (WY)'}
                </td>
                <td className="p-4 text-emerald-600 font-bold">0% (معفاة تماماً)</td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">سرية تامة (لا تظهر بالسجلات العامة)</td>
                <td className="p-4 font-mono">$60 / سنوياً</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">التجارة الإلكترونية، المتاجر الرقمية، والخدمات عن بعد</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => onOpenFormationModal('WY')}
                    className="px-3 py-1.5 rounded-lg bg-[#004457] hover:bg-[#003342] text-white font-bold text-[11px] cursor-pointer"
                  >
                    {isAr ? 'تأسيس في وايومنغ' : 'Form in WY'}
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-teal-50/40 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-black text-[#004457] dark:text-white">
                  {isAr ? 'ديلاوير (Delaware - DE)' : 'Delaware (DE)'}
                </td>
                <td className="p-4 text-slate-700 dark:text-slate-300 font-bold">0% (خارج الولاية)</td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">حماية قانونية متقدمة (Court of Chancery)</td>
                <td className="p-4 font-mono">$300 / سنوياً</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">الشركات الناشئة التقنية، جذب الاستثمار وصناديق VC</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => onOpenFormationModal('DE')}
                    className="px-3 py-1.5 rounded-lg bg-[#004457] hover:bg-[#003342] text-white font-bold text-[11px] cursor-pointer"
                  >
                    {isAr ? 'تأسيس في ديلاوير' : 'Form in DE'}
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-teal-50/40 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-black text-[#004457] dark:text-white">
                  {isAr ? 'نيو مكسيكو (New Mexico - NM)' : 'New Mexico (NM)'}
                </td>
                <td className="p-4 text-emerald-600 font-bold">0% (للأعمال الخارجية)</td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">سرية تامة ومطلقة للملاك</td>
                <td className="p-4 font-mono text-emerald-600 font-bold">$0 (لا يوجد تقرير سنوي)</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">أقل تكلفة صيانة سنوية وميزانية اقتصادية</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => onOpenFormationModal('NM')}
                    className="px-3 py-1.5 rounded-lg bg-[#004457] hover:bg-[#003342] text-white font-bold text-[11px] cursor-pointer"
                  >
                    {isAr ? 'تأسيس في نيو مكسيكو' : 'Form in NM'}
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-teal-50/40 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-black text-[#004457] dark:text-white">
                  {isAr ? 'بريطانيا (UK LTD)' : 'United Kingdom (LTD)'}
                </td>
                <td className="p-4 text-slate-700 dark:text-slate-300 font-bold">ضريبة الشركات البريطانية</td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">سجل Companies House الرسمي</td>
                <td className="p-4 font-mono">£13 تقرير تأكيد سنوي</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">التجارة مع بريطانيا وأوروبا وبوابات الدفع بالجنيه الإسترليني</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => showToast(isAr ? 'مسار تأسيس الشركات البريطانية غير متاح حالياً.' : 'UK company formation is not currently available.')}
                    className="px-3 py-1.5 rounded-lg bg-[#004457] hover:bg-[#003342] text-white font-bold text-[11px] cursor-pointer"
                  >
                    {isAr ? 'تأسيس في بريطانيا' : 'Form UK LTD'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. COLLAPSIBLE ALL 50 US STATES TRANSPARENT PRICING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white dark:bg-[#071D2B] border-2 border-[#004457]/20 dark:border-cyan-950 p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-[#00A896]">
                {isAr
                  ? 'أسعار كافة الولايات الأمريكية بشفافية تامة — شاملة الرسوم الحكومية'
                  : 'Transparent All 50 US States Formation Pricing — Including State Filing Fees'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[#003445] dark:text-white mt-0.5">
                {isAr
                  ? 'تشمل جميع الباقات: رسوم سكرتير الولاية الحكومية + تأسيس (50 ولاية أمريكية)'
                  : 'All Packages Include: Secretary of State Filing Fee + Formation (All 50 US States)'}
              </h3>
            </div>

            <button
              onClick={() => setShowStatesPricing(!showStatesPricing)}
              className="px-5 py-2.5 rounded-xl bg-[#004457] hover:bg-[#003342] text-white text-xs font-black flex items-center gap-2 cursor-pointer self-start sm:self-center shadow-sm"
            >
              <span>
                {showStatesPricing
                  ? isAr
                    ? 'إخفاء جدول أسعار الولايات الأمريكية (50 ولاية)'
                    : 'Hide All 50 US States Pricing'
                  : isAr
                  ? 'عرض أسعار كافة الولايات الأمريكية (50 ولاية)'
                  : 'Show All 50 US States Pricing'}
              </span>
              {showStatesPricing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showStatesPricing && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-5 animate-fade-in">
              {/* Package Tier Selector & State Search */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {QABS_FORMATION_PKGS.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                        selectedPkgId === pkg.id
                          ? 'bg-[#004457] text-white border-[#004457]'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {isAr ? `باقة ${pkg.nameAr} ($${pkg.price} + رسوم الولاية)` : `${pkg.nameEn} ($${pkg.price} + State Fee)`}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      placeholder={isAr ? 'ابحث عن الولاية (مثال: وايومنغ / WY)...' : 'Search state...'}
                      value={stateSearch}
                      onChange={e => setStateSearch(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pr-8 pl-3 py-1.5 text-xs"
                    />
                  </div>
                  <select
                    value={stateFilter}
                    onChange={e => setStateFilter(e.target.value as any)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold"
                  >
                    <option value="all">{isAr ? 'كل الولايات (50)' : 'All 50 States'}</option>
                    <option value="popular">{isAr ? 'الأكثر شعبية ⭐' : 'Most Popular'}</option>
                    <option value="zero_tax">{isAr ? 'بدون ضريبة ولاية' : 'Zero State Tax'}</option>
                    <option value="low_fee">{isAr ? 'رسوم حكومية منخفضة' : 'Low Filing Fee'}</option>
                  </select>
                </div>
              </div>

              {/* States Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto p-1">
                {filteredStates.map(st => {
                  const totalWithPkg = st.stateFilingFee + selectedPkg.price;
                  return (
                    <div
                      key={st.code}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#00A896] bg-slate-50/60 dark:bg-slate-900/60 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-[#003445] dark:text-white">
                            {isAr ? st.nameAr : st.nameEn}{' '}
                            <span className="text-xs font-mono text-[#00A896]">({st.code})</span>
                          </span>
                          {st.badgeAr && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {isAr ? st.badgeAr : st.badgeEn}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {isAr ? st.recommendedForAr : st.recommendedForEn}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {isAr ? `رسوم الولاية: $${st.stateFilingFee}` : `State Fee: $${st.stateFilingFee}`}
                          </span>
                          <span className="font-mono font-black text-base text-[#004457] dark:text-teal-300">
                            ${totalWithPkg}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenFormationModal(st.code)}
                        className="w-full py-2 rounded-xl bg-[#004457] hover:bg-[#003342] text-white text-xs font-bold cursor-pointer"
                      >
                        {isAr ? `تأسيس في ${st.nameAr}` : `Form in ${st.nameEn}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black text-[#00A896] uppercase tracking-wider">
            {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </span>
          <h2 className="text-2xl font-black text-[#003445] dark:text-white">
            {isAr ? 'كل ما تحتاج معرفته عن تأسيس الشركات وبوابات الدفع' : 'Everything You Need to Know'}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071D2B] overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 cursor-pointer font-bold text-sm text-[#003445] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#00A896] shrink-0" />
                    <span>{isAr ? faq.qAr : faq.qEn}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#00A896] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                    {isAr ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FINAL EXECUTIVE CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#003445] via-[#004D5E] to-[#003445] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-2 border-[#00A896]/30">
          <div className="space-y-3 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-[#E5C158] text-slate-950 font-black text-xs uppercase tracking-wider inline-block">
              {isAr ? 'انطلاقة موثوقة وسريعة' : 'Fast & Compliant Launch'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              {isAr
                ? 'جاهز لنقل تجارتك وأعمالك إلى المستوى العالمي مع قبس؟'
                : 'Ready to Expand Your Business Globally with QABS?'}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
              {isAr
                ? 'ابدأ اليوم بتأسيس شركتك الأمريكية أو البريطانية، واحصل على الرقم الضريبي EIN، وأدر متاجرك الإلكترونية من لوحة واحدة موحدة.'
                : 'Form your US or UK company today, obtain IRS EIN, and run all your e-commerce stores from one unified portal.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onOpenFormationModal('WY')}
              className="px-6 py-3.5 rounded-xl bg-[#E5C158] hover:bg-[#d8b44c] text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-lg text-center"
            >
              {isAr ? 'ابدأ تأسيس شركتك الآن' : 'Start Formation Now'}
            </button>
            <button
              onClick={() => setMode('portal')}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs sm:text-sm transition-all cursor-pointer text-center"
            >
              {isAr ? 'الدخول إلى البوابة الموحدة' : 'Open Unified Portal'}
            </button>
            <a
              href={`https://wa.me/${siteContent.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isAr ? 'استشارة فورية عبر واتساب' : 'WhatsApp Consultation'}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
