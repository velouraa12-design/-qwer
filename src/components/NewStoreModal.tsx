import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, Store, ShieldCheck, Globe } from 'lucide-react';

interface NewStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewStoreModal: React.FC<NewStoreModalProps> = ({ isOpen, onClose }) => {
  const { language, addStore, storeTemplates, user } = useApp();
  const isAr = language === 'ar';

  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [activityAr, setActivityAr] = useState('الأزياء والعطور والمنتجات الفاخرة');
  const [country, setCountry] = useState('SA');
  const [defaultLanguage, setDefaultLanguage] = useState<'ar' | 'en' | 'both'>('both');
  const [currency, setCurrency] = useState('SAR');
  const [templateId, setTemplateId] = useState(storeTemplates[0]?.id || 'tpl_luxury_gold');
  const [gatewayType, setGatewayType] = useState<'Stripe' | 'Tap' | 'Moyasar'>('Tap');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSubdomain(slug || `store-${Math.floor(100 + Math.random() * 900)}`);
  };

  const selectedTemplate = storeTemplates.find(t => t.id === templateId) || storeTemplates[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addStore({
      name,
      ownerName: user.name,
      ownerEmail: user.email,
      activityAr,
      activityEn: activityAr,
      country,
      defaultLanguage,
      subdomain: `${subdomain || 'mystore'}.qabs1.store`,
      currency,
      taxRate: country === 'SA' ? 15 : country === 'AE' ? 5 : 0,
      theme: selectedTemplate?.theme || 'gold_executive',
      templateId: selectedTemplate?.id || 'tpl_luxury_gold',
      primaryColor: selectedTemplate?.primaryColor || '#004457',
      accentColor: selectedTemplate?.accentColor || '#C8A24A',
      fontFamily: selectedTemplate?.fontFamily || 'Cairo',
      status: 'draft',
      approvalStatus: 'draft',
      paymentConnected: false,
      paymentApprovalStatus: 'unconfigured',
      gatewayType
    });

    onClose();
    setName('');
    setSubdomain('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full text-slate-900 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-[#004457] to-[#005C73] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 text-[#E5C158] rounded-xl border border-white/15">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">
                {isAr ? 'إنشاء متجر إلكتروني مستقل | QABS Stores' : 'Create Independent Online Store | QABS Stores'}
              </h2>
              <p className="text-xs text-teal-100">
                {isAr
                  ? 'بيانات ومنتجات وطلبات معزولة بالكامل عن بقية المتاجر'
                  : 'Complete multi-tenant isolation for products, orders & customers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'اسم المتجر التجاري *' : 'Store Name *'}
              </label>
              <input
                type="text"
                required
                placeholder={isAr ? 'مثال: متجر سحاب للعطور' : 'e.g. Sahab Perfumes'}
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#00A896]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'النشاط التجاري *' : 'Store Activity / Niche *'}
              </label>
              <select
                value={activityAr}
                onChange={e => setActivityAr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00A896]"
              >
                <option value="الأزياء والعطور والمنتجات الفاخرة">
                  {isAr ? 'الأزياء والعطور والمنتجات الفاخرة' : 'Fashion, Perfumes & Luxury'}
                </option>
                <option value="الإلكترونيات والأجهزة الذكية">
                  {isAr ? 'الإلكترونيات والأجهزة الذكية' : 'Electronics & Smart Gadgets'}
                </option>
                <option value="القهوة المختصة والأغذية">
                  {isAr ? 'القهوة المختصة والأغذية' : 'Specialty Coffee & F&B'}
                </option>
                <option value="المنتجات الرقمية والبرمجيات">
                  {isAr ? 'المنتجات الرقمية والبرمجيات' : 'Digital Products & Licenses'}
                </option>
                <option value="العناية والتجميل والصيدليات">
                  {isAr ? 'العناية والتجميل' : 'Beauty & Personal Care'}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isAr ? 'النطاق الفرعي لمتجرك (Subdomain)' : 'Store Subdomain'}
            </label>
            <div className="flex items-center" dir="ltr">
              <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-xs text-slate-500 font-mono">
                https://
              </span>
              <input
                type="text"
                required
                value={subdomain}
                onChange={e => setSubdomain(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 px-3 py-2.5 text-sm font-mono text-[#004457] font-bold focus:outline-none"
              />
              <span className="px-3 py-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-xl text-xs text-slate-600 font-mono font-bold">
                .qabs1.store
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'البلد والضريبة' : 'Country & Tax'}
              </label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="SA">{isAr ? 'السعودية (ضريبة 15%)' : 'Saudi Arabia (15% VAT)'}</option>
                <option value="AE">{isAr ? 'الإمارات (ضريبة 5%)' : 'UAE (5% VAT)'}</option>
                <option value="KW">{isAr ? 'الكويت (0%)' : 'Kuwait (0%)'}</option>
                <option value="US">{isAr ? 'الولايات المتحدة' : 'United States'}</option>
                <option value="UK">{isAr ? 'المملكة المتحدة' : 'United Kingdom'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'لغة المتجر' : 'Store Language'}
              </label>
              <select
                value={defaultLanguage}
                onChange={e => setDefaultLanguage(e.target.value as 'ar' | 'en' | 'both')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="both">{isAr ? 'العربية والإنجليزية (RTL/LTR)' : 'Arabic & English (Both)'}</option>
                <option value="ar">{isAr ? 'العربية فقط (RTL)' : 'Arabic Only'}</option>
                <option value="en">{isAr ? 'الإنجليزية فقط (LTR)' : 'English Only'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'عملة المتجر' : 'Store Currency'}
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="SAR">SAR (ر.س) ريال سعودي</option>
                <option value="AED">AED (د.إ) درهم إماراتي</option>
                <option value="USD">USD ($) دولار أمريكي</option>
                <option value="KWD">KWD (د.ك) دينار كويتي</option>
                <option value="GBP">GBP (£) جنيه إسترليني</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isAr ? 'اختر قالب التصميم من استوديو قبس' : 'Select QABS Studio Template'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {storeTemplates.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setTemplateId(tpl.id)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2.5 ${
                    templateId === tpl.id
                      ? 'border-[#004457] bg-[#004457]/5 ring-2 ring-[#00A896]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg shrink-0 border border-black/10"
                    style={{ background: `linear-gradient(135deg, ${tpl.primaryColor}, ${tpl.accentColor})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {isAr ? tpl.nameAr : tpl.nameEn}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {isAr ? tpl.categoryAr : tpl.categoryEn}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isAr ? 'بوابة الدفع المفضلة (تُفعّل بعد مراجعة قبس)' : 'Preferred Payment Gateway (Requires Admin Approval)'}
            </label>
            <select
              value={gatewayType}
              onChange={e => setGatewayType(e.target.value as 'Stripe' | 'Tap' | 'Moyasar')}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="Tap">Tap Payments (مدى، فيزا، أبل باي — الخليج)</option>
              <option value="Moyasar">Moyasar ميسر (مدى، سداد، أبل باي — السعودية)</option>
              <option value="Stripe">Stripe Connect (البطاقات العالمية والدولية)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {isAr ? 'سياسة الأمان والحوكمة في متاجر قبس:' : 'QABS Stores Governance Policy:'}
              </span>{' '}
              {isAr
                ? 'ينشأ المتجر في وضع (مسودة التجهيز) مع عزل كامل لمنتجاتك، ولا يتم نشره للعامة أو تفعيل بوابة الدفع إلا بعد مراجعة واعتماد لوحة إدارة قبس.'
                : 'New stores start in Draft mode with isolated data. Public publishing and live payment gateways require QABS Central Admin approval.'}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-[#004457] to-[#00A896] hover:opacity-95 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              {isAr ? 'إنشاء المتجر والبدء بالتصميم' : 'Create Store & Open Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
