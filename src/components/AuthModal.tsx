import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, Lock, Mail, User, Building, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types/index.ts';

export const AuthModal: React.FC = () => {
  const {
    language,
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    register,
    showToast
  } = useApp();

  const isAr = language === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('merchant');
  const [resetSent, setResetSent] = useState(false);

  if (!authModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, selectedRole);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    register(name, email, companyName || 'QABS Merchant LLC', selectedRole);
  };

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setResetSent(true);
    showToast(
      isAr
        ? `تم إرسال رابط استعادة كلمة المرور إلى ${email}`
        : `Password recovery link dispatched to ${email}`
    );
    setTimeout(() => {
      setResetSent(false);
      setAuthMode('login');
    }, 2500);
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
                    ? 'تسجيل الدخول إلى منصة قبس'
                    : 'Sign In to QABS'
                  : authMode === 'register'
                  ? isAr
                    ? 'إنشاء حساب جديد'
                    : 'Create QABS Account'
                  : isAr
                  ? 'استعادة كلمة المرور'
                  : 'Recover Password'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'نظام المصادقة والصلاحيات الآمن (RBAC)' : 'Secure Role-Based Authentication'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
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
                ? 'text-[#00A389] border-b-2 border-[#00A389] font-bold bg-[#082030]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'حساب جديد' : 'Register'}
          </button>
          <button
            onClick={() => setAuthMode('recover')}
            className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer text-center ${
              authMode === 'recover'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold bg-[#082030]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'استعادة' : 'Recover'}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="founder@qabs1.store"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {isAr ? 'كلمة المرور' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('recover')}
                    className="text-[11px] text-[#D4AF37] hover:underline"
                  >
                    {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'اختر مستوى الصلاحيات للدخول (RBAC Role)' : 'Select Permission Role to Login'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('super_admin')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedRole === 'super_admin'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold'
                        : 'border-slate-800 bg-[#051724] text-slate-400'
                    }`}
                  >
                    <div className="text-[11px]">Super Admin</div>
                    <div className="text-[9px] text-slate-500">{isAr ? 'إدارة كاملة' : 'Full access'}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('merchant')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedRole === 'merchant'
                        ? 'border-[#00A389] bg-[#00A389]/15 text-[#00A389] font-bold'
                        : 'border-slate-800 bg-[#051724] text-slate-400'
                    }`}
                  >
                    <div className="text-[11px]">Merchant</div>
                    <div className="text-[9px] text-slate-500">{isAr ? 'تاجر / عميل' : 'Customer'}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('compliance_officer')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedRole === 'compliance_officer'
                        ? 'border-cyan-400 bg-cyan-950/30 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-[#051724] text-slate-400'
                    }`}
                  >
                    <div className="text-[11px]">Officer</div>
                    <div className="text-[9px] text-slate-500">{isAr ? 'امتثال وقانون' : 'Compliance'}</div>
                  </button>
                </div>
              </div>

              {/* Fast Demo Logins */}
              <div className="p-2.5 rounded-lg bg-[#051724] border border-cyan-950/60 text-[11px] space-y-1.5">
                <span className="text-slate-400 font-semibold block">
                  {isAr ? 'دخول تجريبي سريع بنقرة واحدة:' : 'Instant Demo Login Presets:'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@qabs1.store');
                      setPassword('demo123456');
                      setSelectedRole('super_admin');
                      login('admin@qabs1.store', 'super_admin');
                    }}
                    className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-[#D4AF37] font-semibold rounded text-[10px] cursor-pointer"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('merchant@qabs1.store');
                      setPassword('demo123456');
                      setSelectedRole('merchant');
                      login('merchant@qabs1.store', 'merchant');
                    }}
                    className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-[#00A389] font-semibold rounded text-[10px] cursor-pointer"
                  >
                    Merchant / Customer
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-slate-950 font-bold rounded-lg text-xs hover:from-[#C59B27] hover:to-[#E5D28A] transition-all cursor-pointer shadow-md"
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In Now'}
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
                    placeholder={isAr ? 'عبدالله محمد' : 'Abdullah Mohammed'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
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
                    placeholder="name@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'اسم الشركة أو العلامة التجارية' : 'Company or Brand Name'}
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Atlas Ventures LLC"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
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
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#00A389] to-[#2DD4BF] text-slate-950 font-bold rounded-lg text-xs hover:from-[#008F78] hover:to-[#14B8A6] transition-all cursor-pointer shadow-md"
              >
                {isAr ? 'إنشاء الحساب وبدء التجربة' : 'Create Free Account'}
              </button>
            </form>
          )}

          {authMode === 'recover' && (
            <form onSubmit={handleRecoverSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً مشفراً لإعادة تعيين كلمة المرور فوراً.'
                  : 'Enter your registered email address and we will dispatch a secure password reset token.'}
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {resetSent && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isAr ? 'تم إرسال رابط التعيين بنجاح!' : 'Reset link sent successfully!'}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                {isAr ? 'إرسال رابط الاستعادة' : 'Send Recovery Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
