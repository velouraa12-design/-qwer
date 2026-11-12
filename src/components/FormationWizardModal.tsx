import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, ShieldCheck, Building2, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  US_STATES_PRICING,
  QABS_FORMATION_PKGS,
  QABS_FORMATION_ADDONS
} from '../data/usStatesPricing.ts';

interface FormationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStateCode?: string;
}

export const FormationWizardModal: React.FC<FormationWizardModalProps> = ({
  isOpen,
  onClose,
  initialStateCode = 'WY'
}) => {
  const { language, addCompany, showToast, setAuthModalOpen } = useApp();
  const isAr = language === 'ar';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCode, setSelectedCode] = useState<string>(initialStateCode);
  const [selectedPkgId, setSelectedPkgId] = useState<'starter' | 'complete' | 'premium'>('complete');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [entityType, setEntityType] = useState<'LLC' | 'C-CORP' | 'LTD'>('LLC');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerCountry, setOwnerCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialStateCode) {
      setSelectedCode(initialStateCode);
    }
  }, [initialStateCode, isOpen]);

  if (!isOpen) return null;

  const selectedState =
    US_STATES_PRICING.find(s => s.code === selectedCode) || US_STATES_PRICING[0];
  const selectedPkg =
    QABS_FORMATION_PKGS.find(p => p.id === selectedPkgId) || QABS_FORMATION_PKGS[1];

  const popularStates = US_STATES_PRICING.filter(s => s.tags.includes('popular'));
  const otherStates = US_STATES_PRICING.filter(s => !s.tags.includes('popular'));

  const availableAddons = QABS_FORMATION_ADDONS.filter(
    addon => selectedPkgId === 'starter' || !addon.starterOnly
  );

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const addonsTotal = availableAddons
    .filter(a => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const serviceTotal = selectedPkg.price + addonsTotal;
  const grandTotal = serviceTotal + selectedState.stateFilingFee;

  const handlePersistFormation = async (saveAsDraft: boolean) => {
    if (!companyName.trim()) return;
    const token =
      localStorage.getItem('qabs_token') ||
      'qabs_seed_token_customer_01_secure_64_bytes_entropy_token_valid';

    const suffix = entityType === 'LLC' ? ' LLC' : entityType === 'LTD' ? ' LTD' : ' INC';
    const fullCompanyName = companyName.trim().toUpperCase() + suffix;

    setSubmitting(true);
    try {
      const res = await fetch('/api/formations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: fullCompanyName,
          jurisdiction: entityType === 'LTD' ? 'UK_LTD' : selectedState.jurisdictionId,
          entity_type: entityType,
          package_id: selectedPkgId,
          addons_fee: addonsTotal,
          save_as_draft: saveAsDraft,
          notes: `Owner: ${ownerName || 'N/A'} (${ownerEmail || 'N/A'}) - ${selectedState.nameEn} (${selectedState.code})`
        })
      });

      if (res.status === 401) {
        showToast(isAr ? 'يرجى تسجيل الدخول لحفظ طلب التأسيس في حسابك.' : 'Please sign in to save your formation request.');
        setAuthModalOpen(true);
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      if (res.ok && data.formation) {
        addCompany({
          companyName: data.formation.company_name,
          jurisdiction: data.formation.jurisdiction,
          entityType,
          registeredAgent: data.formation.registered_agent,
          registeredAddress: data.formation.registered_address,
          renewalDueDate: data.formation.renewal_due_date,
          notes: data.formation.notes
        });
        showToast(
          saveAsDraft
            ? isAr
              ? 'تم حفظ المسودة في قاعدة البيانات بنجاح (Draft)'
              : 'Formation draft saved to backend database'
            : isAr
            ? 'تم إرسال طلب التأسيس للمراجعة وإصدار فاتورة مبدئية (Submitted)'
            : 'Formation request submitted for review with pending invoice'
        );
        onClose();
        setStep(1);
        setCompanyName('');
      } else {
        showToast(data.message_ar || data.message_en || (isAr ? 'تعذر حفظ الطلب' : 'Failed to save request'));
      }
    } catch {
      showToast(isAr ? 'تعذر الاتصال بالخادم الخلفي لحفظ الطلب.' : 'Could not reach backend server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#082030] border-2 border-[#00A896]/40 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto text-[#003445] dark:text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-cyan-950/60 bg-[#F4FAFA] dark:bg-[#03131D]/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#004457] to-[#00A896] text-white rounded-xl shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#003445] dark:text-white">
                {isAr ? 'تأسيس الشركات الأمريكية والبريطانية | قبس QABS' : 'US & UK Company Formation | QABS'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'تسجيل LLC أو C-Corp أو UK LTD، مع EIN واتفاقية تشغيل ووكيل مسجل مجاني'
                  : 'LLC, C-Corp, or UK LTD formation with EIN, operating agreement, and free registered agent'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#003445] dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div role="status" className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-b border-emerald-300 dark:border-emerald-800 text-xs leading-relaxed">
          {isAr
            ? 'حفظ خلفي مفعل (Backend Persistence): يتم ربط الطلب بحساب العميل مع إصدار فاتورة بانتظار السداد دون تنفيذ خصم مالي حقيقي.'
            : 'Real Backend Persistence Active: Requests are saved to your tenant account with a pending Sandbox invoice.'}
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between px-8 py-3 bg-white dark:bg-[#051724] border-b border-slate-200 dark:border-cyan-950/40 text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#007F8B] dark:text-[#D4AF37] font-bold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center border border-current text-[11px]">1</span>
            <span>{isAr ? 'الولاية والباقة' : 'State & Package'}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">———</span>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#007F8B] dark:text-[#D4AF37] font-bold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center border border-current text-[11px]">2</span>
            <span>{isAr ? 'بيانات النشاط والملاك' : 'Business & Owners'}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">———</span>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#007F8B] dark:text-[#D4AF37] font-bold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center border border-current text-[11px]">3</span>
            <span>{isAr ? 'المراجعة والحفظ' : 'Review & Save'}</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 flex-1">
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Exact State Dropdown from portal.qabs1.store/workspace#/company-formation/new */}
                <div>
                  <label className="block text-xs font-extrabold text-[#003445] dark:text-slate-200 mb-1.5">
                    {isAr ? 'الولاية (50 ولاية أمريكية):' : 'State (50 US States):'}
                  </label>
                  <select
                    value={selectedCode}
                    onChange={e => setSelectedCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-[#004457]/30 bg-[#F4FAFA] dark:bg-[#051724] text-xs font-extrabold text-[#003445] dark:text-white focus:outline-none focus:border-[#004457] cursor-pointer"
                  >
                    <optgroup label={isAr ? '⭐ الأكثر شعبية' : '⭐ Most popular'}>
                      {popularStates.map(st => (
                        <option key={st.code} value={st.code}>
                          {isAr ? `${st.nameAr} — $${st.stateFilingFee}` : `${st.nameEn} — $${st.stateFilingFee}`}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={isAr ? 'كل الولايات (50)' : 'All states (50)'}>
                      {otherStates.map(st => (
                        <option key={st.code} value={st.code}>
                          {isAr ? `${st.nameAr} — $${st.stateFilingFee}` : `${st.nameEn} — $${st.stateFilingFee}`}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Company Type */}
                <div>
                  <label className="block text-xs font-extrabold text-[#003445] dark:text-slate-200 mb-1.5">
                    {isAr ? 'نوع الشركة:' : 'Company Type:'}
                  </label>
                  <select
                    value={entityType}
                    onChange={e => setEntityType(e.target.value as 'LLC' | 'C-CORP' | 'LTD')}
                    className="w-full p-2.5 rounded-xl border-2 border-[#004457]/30 bg-[#F4FAFA] dark:bg-[#051724] text-xs font-extrabold text-[#003445] dark:text-white focus:outline-none focus:border-[#004457] cursor-pointer"
                  >
                    <option value="LLC">{isAr ? 'LLC — مسؤولية محدودة (أمريكا)' : 'LLC — US Limited Liability'}</option>
                    <option value="C-CORP">{isAr ? 'C-Corp — شركة مساهمة (أمريكا)' : 'C-Corp — US Corporation'}</option>
                    <option value="LTD">{isAr ? 'UK LTD — شركة بريطانية محدودة' : 'UK LTD — Private Limited Company'}</option>
                  </select>
                </div>
              </div>

              {/* 3 Packages: Starter ($0), Complete ($299), Premium ($599) */}
              <div>
                <label className="block text-xs font-extrabold text-[#003445] dark:text-slate-200 mb-2">
                  {isAr ? 'الباقة:' : 'Select Package:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {QABS_FORMATION_PKGS.map(pkg => {
                    const active = selectedPkgId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPkgId(pkg.id)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          active
                            ? 'border-[#004457] dark:border-[#D4AF37] bg-[#004457] text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-[#F9FCFC] dark:bg-[#051724] text-[#003445] dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">{isAr ? pkg.nameAr : pkg.nameEn}</span>
                          <span className={`text-sm font-black tabular-nums ${active ? 'text-[#D4AF37]' : 'text-[#007F8B]'}`}>
                            ${pkg.price}
                          </span>
                        </div>
                        <p className={`text-[10px] mt-1 leading-relaxed ${active ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                          {isAr ? pkg.descAr : pkg.descEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Company Name Input */}
              <div>
                <label className="block text-xs font-extrabold text-[#003445] dark:text-slate-300 mb-1.5">
                  {isAr ? 'اسم الشركة المقترح (إنجليزي):' : 'Proposed Company Name (English):'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. QABS GLOBAL COMMERCE"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="flex-1 bg-[#F4FAFA] dark:bg-[#051724] border border-[#00A896]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#003445] dark:text-white focus:outline-none focus:border-[#004457]"
                  />
                  <span className="px-3.5 py-2.5 bg-[#004457] text-white text-xs font-bold rounded-xl">
                    {entityType}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#003445] dark:text-slate-300 mb-1">
                    {isAr ? 'الاسم الكامل للمالك الرئيسي (إنجليزي)' : 'Primary Owner Full Name'}
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    className="w-full bg-[#F4FAFA] dark:bg-[#051724] border border-[#00A896]/40 rounded-lg px-3 py-2 text-sm text-[#003445] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#003445] dark:text-slate-300 mb-1">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={e => setOwnerEmail(e.target.value)}
                    className="w-full bg-[#F4FAFA] dark:bg-[#051724] border border-[#00A896]/40 rounded-lg px-3 py-2 text-sm text-[#003445] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#003445] dark:text-slate-300 mb-1">
                    {isAr ? 'الجنسية / دولة الإقامة' : 'Nationality / Country'}
                  </label>
                  <input
                    type="text"
                    value={ownerCountry}
                    onChange={e => setOwnerCountry(e.target.value)}
                    className="w-full bg-[#F4FAFA] dark:bg-[#051724] border border-[#00A896]/40 rounded-lg px-3 py-2 text-sm text-[#003445] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#003445] dark:text-slate-300 mb-1">
                    {isAr ? 'الوكيل المسجل (مشمول مجاناً)' : 'Registered Agent (Included Free)'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={isAr ? `مجاناً لمدة ${selectedPkg.agentAr}` : `Free for ${selectedPkg.agentEn}`}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 text-xs text-slate-500 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-cyan-950/60 space-y-2.5">
                <div className="text-xs font-extrabold text-[#003445] dark:text-white">
                  {isAr ? 'إضافات اختيارية:' : 'Optional Add-ons:'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableAddons.map(addon => {
                    const checked = selectedAddons.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[#00A896]/30 bg-[#F4FAFA] dark:bg-[#061B29] cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAddon(addon.id)}
                            className="accent-[#007F8B] w-4 h-4"
                          />
                          <span className="font-bold text-[#003445] dark:text-white">
                            {isAr ? addon.nameAr : addon.nameEn}
                          </span>
                        </div>
                        <span className="font-mono font-extrabold text-[#007F8B] dark:text-[#D4AF37]">
                          ${addon.price}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F4FAFA] dark:bg-[#051724] border border-[#00A896]/40 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">{isAr ? 'الاسم المقترح:' : 'Proposed Name:'}</span>
                  <span className="text-sm font-black text-[#004457] dark:text-[#D4AF37]">
                    {companyName.toUpperCase()} {entityType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isAr ? 'الولاية:' : 'State:'}</span>
                  <span className="font-bold text-[#003445] dark:text-white">
                    {isAr ? selectedState.nameAr : selectedState.nameEn}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isAr ? 'الباقة:' : 'Package:'}</span>
                  <span className="font-bold text-[#003445] dark:text-white">
                    {isAr ? selectedPkg.nameAr : selectedPkg.nameEn} (${selectedPkg.price})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isAr ? 'رسوم الولاية:' : 'State filing fee:'}</span>
                  <span className="font-mono font-bold text-[#003445] dark:text-white">${selectedState.stateFilingFee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isAr ? 'وكيل مسجل (مشمول):' : 'Registered agent (included):'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {isAr ? `مجاناً (${selectedPkg.agentAr})` : `Free (${selectedPkg.agentEn})`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isAr ? 'أتعاب الخدمة والإضافات فقط:' : 'Service fees and add-ons only:'}</span>
                  <span className="font-mono font-bold text-[#003445] dark:text-white">${serviceTotal}</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-r from-[#004457] to-[#006D77] text-white flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs font-extrabold text-[#80E5D9] block">
                    {isAr ? 'الإجمالي مع رسوم الولاية التقديرية:' : 'Total with Estimated State Fee:'}
                  </span>
                  <p className="text-[11px] text-slate-200">
                    {isAr
                      ? `الباقة $${selectedPkg.price} + رسوم ولاية ${selectedState.nameAr} $${selectedState.stateFilingFee}`
                      : `Package $${selectedPkg.price} + ${selectedState.nameEn} fee $${selectedState.stateFilingFee}`}
                  </p>
                </div>
                <span className="text-3xl font-black text-white tabular-nums">${grandTotal}</span>
              </div>

              {/* Statutory & Third-Party Gateways Notice */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{isAr ? 'تنبيه تجاري وقانوني هام بخصوص الرسوم وبوابات الدفع:' : 'Important Statutory & Gateway Disclaimer:'}</span>
                </span>
                <p>
                  {isAr
                    ? 'الرسوم الحكومية للولاية منفصلة تماماً وتُدفع لمكتب سكرتير الولاية. تفعيل بوابات الدفع (Stripe / PayPal) والمصارف التجارية يخضع كلياً للأهلية وموافقة المزود الرسمي للخدمة.'
                    : 'State statutory fees are separate and paid directly to the state. Third-party gateways (Stripe/PayPal) and commercial banking approvals are subject to provider compliance.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F4FAFA] dark:bg-[#03131D]/90 border-t border-slate-200 dark:border-cyan-950/60">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="px-4 py-2 text-xs font-bold text-[#003445] dark:text-slate-200 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{isAr ? 'رجوع' : 'Back'}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              disabled={step === 1 && !companyName.trim()}
              onClick={() => setStep((step + 1) as 2 | 3)}
              className="px-6 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-[#004457] to-[#00A896] disabled:opacity-40 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>{isAr ? 'المتابعة' : 'Continue'}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handlePersistFormation(true)}
                className="px-4 py-2.5 text-xs font-extrabold text-[#003445] dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isAr ? 'حفظ كمسودة (Draft)' : 'Save as Draft'}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handlePersistFormation(false)}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-[#00A896] to-[#007F8B] hover:from-[#008F7F] hover:to-[#006973] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>{isAr ? 'حفظ وإرسال للمراجعة (Submitted)' : 'Save & Submit for Review'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
