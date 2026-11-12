import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, Lock, Mail, User, Building, KeyRound, AlertTriangle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    language,
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    register
  } = useApp();

  const isAr = language === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');

  if (!authModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Strictly login as standard customer / merchant
    login(email, 'merchant');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    // Strictly register as customer / merchant (no client escalation)
    register(name, email, companyName || 'QABS Merchant LLC', 'merchant');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#082030] border border-cyan-950/80 rounded-xl shadow-2xl max-w-md w-full text-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-950/60 bg-[#03131D]/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg border border-[#D4AF37]/20">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {authMode === 'login'
                  ? isAr
                    ? 'تسجيل الدخول إلى حساب العميل'
                    : 'Customer Sign In'
                  : authMode === 'register'
                  ? isAr
                    ? 'إنشاء حساب عميل جديد'
                    : 'Create Customer Account'
                  : isAr
                  ? 'استعادة كلمة المرور'
                  : 'Recover Password'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'بوابة عملاء وتجار منصة قبس الرقمية' : 'QABS Client & Merchant Portal'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-cyan-950/40 bg-[#051724] text-xs">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer text-center ${
              authMode === 'login'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-bold bg-[#082030]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer text-center ${
              authMode === 'register'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-bold bg-[#082030]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'حساب جديد' : 'Register'}
          </button>
          <button
            onClick={() => setAuthMode('recover')}
            className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer text-center ${
              authMode === 'recover'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-bold bg-[#082030]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'استعادة الرمز' : 'Recovery'}
          </button>
        </div>

        {/* Body forms */}
        <div className="p-6">
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="customer@qabs1.store"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-slate-950 font-bold rounded-lg text-xs hover:from-[#C59B27] hover:to-[#E5D28A] transition-all cursor-pointer shadow-md"
              >
                {isAr ? 'تسجيل الدخول إلى البوابة' : 'Sign In to Portal'}
              </button>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'محمد الخالدي' : 'Mohammed Al-Khaledi'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00A389]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="founder@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00A389]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'اسم الشركة أو الكيان المطلوب' : 'Company or Brand Name'}
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Atlas Ventures LLC"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00A389]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00A389]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#00A389] to-[#2DD4BF] text-slate-950 font-bold rounded-lg text-xs hover:from-[#008F78] hover:to-[#14B8A6] transition-all cursor-pointer shadow-md"
              >
                {isAr ? 'إنشاء حساب عميل جديد' : 'Create Customer Account'}
              </button>
            </form>
          )}

          {authMode === 'recover' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#051724] border border-amber-500/40 text-xs text-amber-200/90 leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isAr ? 'خدمة الإرسال البريدي الآلي (BLOCKED 🔒)' : 'Automated Mailer Service (BLOCKED 🔒)'}</span>
                </div>
                <p>
                  {isAr
                    ? 'إرسال روابط الاستعادة آلياً معلق حالياً لحين إعداد خادم SMTP أو مزود بريد موثق (مثل Resend / SendGrid) مع سجلات SPF/DKIM مفعلة. تطبيقا للقواعد الأمنية، لا يتم ادعاء نجاح الإرسال دون فحص فعلي.'
                    : 'Automated password dispatch is BLOCKED pending verified SMTP / transactional email provider with active SPF/DKIM DNS records.'}
                </p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300">
                <span className="block font-bold text-white mb-1">
                  {isAr ? 'طريقة الاستعادة المعتمدة حالياً:' : 'Current Verified Recovery Channel:'}
                </span>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? 'يرجى التواصل المباشر مع فريق الدعم الفني عبر قناة WhatsApp الرسمية المعتمدة (+159710784967) للتحقق من الهوية وإعادة تعيين كلمة المرور.'
                    : 'Please contact official WhatsApp support (+159710784967) for manual identity verification and account recovery.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
