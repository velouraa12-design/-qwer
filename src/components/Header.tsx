import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useCustomizer } from '../context/CustomizerContext.tsx';
import { QabsLogo } from './QabsLogo.tsx';
import {
  Globe,
  Sun,
  Moon,
  Shield,
  Layers,
  Store,
  FileCode2,
  ChevronDown,
  UserCheck,
  CreditCard,
  Edit3,
  User,
  Building2,
  MessageSquare,
  Phone
} from 'lucide-react';
import { UserRole } from '../types/index.ts';

interface HeaderProps {
  onOpenFormationModal: () => void;
  onOpenStoreModal: () => void;
  onOpenAdminGuard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFormationModal, onOpenStoreModal, onOpenAdminGuard }) => {
  const { language, setLanguage, theme, toggleTheme, mode, setMode, user, switchRole, setAuthModalOpen } = useApp();
  const { setEditorOpen } = useCustomizer();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const isAr = language === 'ar';

  const roles: { role: UserRole; labelAr: string; labelEn: string }[] = [
    { role: 'merchant', labelAr: 'تاجر / صاحب متجر', labelEn: 'Merchant / Founder' },
    { role: 'compliance_officer', labelAr: 'منظور مراجعة الامتثال', labelEn: 'Compliance Review' },
    { role: 'support_agent', labelAr: 'منظور دعم العملاء', labelEn: 'Customer Support' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#002B38]/95 backdrop-blur-md border-b-2 border-[#00A896]/30 text-[#003E52] dark:text-slate-100 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Zone 1: Official QABS Brand Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMode('landing')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            title="QABS | قبس — متاجر إلكترونية | خدمات رقمية"
          >
            <QabsLogo size="md" className="group-hover:scale-[1.02] transition-transform" />
          </button>
        </div>

        {/* Zone 2: Simplified 4-Path Customer Navigation */}
        <nav className="hidden xl:flex items-center gap-4 text-xs font-bold">
          {/* Path 1: أريد تأسيس شركة */}
          <button
            onClick={() => {
              setMode('landing');
              onOpenFormationModal();
            }}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#004457] dark:hover:text-[#d5b46b] hover:bg-teal-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-[#00A896]" />
            <span>{isAr ? '1. تأسيس شركة' : '1. Form Company'}</span>
          </button>

          {/* Path 2: أريد تجهيز الدفع */}
          <button
            onClick={() => {
              setMode('landing');
              const el = document.getElementById('customer-journeys');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#004457] dark:hover:text-[#d5b46b] hover:bg-teal-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#d5b46b]" />
            <span>{isAr ? '2. تجهيز الدفع' : '2. Setup Payments'}</span>
          </button>

          {/* Path 3: أريد إنشاء متجر */}
          <button
            onClick={() => {
              setMode('landing');
              onOpenStoreModal();
            }}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#004457] dark:hover:text-[#d5b46b] hover:bg-teal-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5 text-[#00A896]" />
            <span>{isAr ? '3. إنشاء متجر' : '3. Launch Store'}</span>
          </button>

          {/* Path 4: متابعة طلب قائم عبر WhatsApp الموثق */}
          <a
            href="https://wa.me/159710784967?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%81%D8%B1%D9%8A%D9%82%20%D9%82%D8%A8%D8%B3%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D9%85%D8%AA%D8%A7%D8%A8%D8%B9%D8%A9%20%D8%B7%D9%84%D8%A8%D9%8A%20%D8%A7%D9%84%D9%82%D8%A7%D8%A6%D9%85."
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1.5 font-bold"
            title="متابعة طلب قائم عبر WhatsApp الموثق (+159710784967)"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? '4. متابعة طلب (+159710784967)' : '4. Track Order (+159710784967)'}</span>
          </a>

          {/* Unified Customer Portal */}
          <button
            onClick={() => setMode('portal')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
              mode === 'portal'
                ? 'border-[#00A896] text-[#004457] dark:text-[#00B8A9]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-[#004457] dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#00A896]" />
            <span>{isAr ? 'البوابة الموحدة' : 'Portal'}</span>
          </button>

          {/* Super Admin & Internal Hub — Protected and visible only to authenticated Super Admin */}
          {user.role === 'super_admin' && (
            <>
              <button
                onClick={() => setMode('admin')}
                className={`whitespace-nowrap pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  mode === 'admin'
                    ? 'border-[#004457] dark:border-[#D4AF37] text-[#004457] dark:text-[#D4AF37]'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#004457] dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#007F8B]" />
                <span>Super Admin</span>
              </button>

              <button
                onClick={() => setMode('template_hub')}
                className={`whitespace-nowrap pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  mode === 'template_hub'
                    ? 'border-[#00A896] text-[#004457] dark:text-cyan-300'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#004457] dark:hover:text-white'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 text-[#00A896]" />
                <span>{isAr ? 'غرفة العمليات المركزية' : 'Operations Hub'}</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions (Customizer, Auth, Lang, Theme, Quick CTA) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Content Customizer Trigger */}
          <button
            onClick={() => setEditorOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#004457] dark:text-[#D4AF37] bg-[#00A896]/10 hover:bg-[#00A896]/20 rounded-lg border border-[#00A896]/30 transition-colors cursor-pointer"
            title={isAr ? 'تخصيص نصوص وصور وروابط القالب' : 'Live Content Customizer'}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#00A896]" />
            <span className="hidden sm:inline">{isAr ? 'تخصيص القالب' : 'Customize'}</span>
          </button>

          {/* Auth Button */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#004457] dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            title={isAr ? 'تسجيل الدخول / الحساب' : 'Account Login'}
          >
            <User className="w-3.5 h-3.5 text-[#00A896]" />
            <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-[#004457] dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700/60 transition-colors cursor-pointer"
            title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-[#00A896]" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-[#004457] dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700/60 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'الوضع النهاري الفاتح (هوية الشعار)' : 'الوضع الليلي الداكن'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-[#004457]" />}
          </button>

          {/* Perspective / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleMenuOpen(!roleMenuOpen);
                setActionMenuOpen(false);
              }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#004457] dark:text-slate-200 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#00A896]" />
              <span className="truncate max-w-[115px]">
                {roles.find(r => r.role === user.role)?.[isAr ? 'labelAr' : 'labelEn'] || user.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div
                className={`absolute ${
                  isAr ? 'left-0' : 'right-0'
                } mt-2 w-64 bg-white dark:bg-[#082030] border border-slate-200 dark:border-cyan-950 rounded-xl shadow-2xl py-2 z-50 text-xs`}
              >
                <div className="px-3 py-1.5 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  {isAr ? 'محاكاة الأدوار والصلاحيات (RBAC)' : 'Simulate Role Perspective'}
                </div>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      if (r.role === 'super_admin' && user.role !== 'super_admin') {
                        setRoleMenuOpen(false);
                        if (onOpenAdminGuard) {
                          onOpenAdminGuard();
                        } else {
                          switchRole(r.role);
                        }
                      } else {
                        switchRole(r.role);
                        setRoleMenuOpen(false);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-teal-50 dark:hover:bg-cyan-900/30 transition-colors cursor-pointer ${
                      user.role === r.role
                        ? 'text-[#004457] dark:text-[#D4AF37] font-bold bg-teal-50/70 dark:bg-cyan-950/40'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{isAr ? r.labelAr : r.labelEn}</span>
                    {user.role === r.role && <span className="w-2 h-2 rounded-full bg-[#00A896]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="relative">
            <button
              onClick={() => {
                setActionMenuOpen(!actionMenuOpen);
                setRoleMenuOpen(false);
              }}
              className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#004457] via-[#006D77] to-[#00A896] hover:opacity-95 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{isAr ? '+ إنشاء سريع' : '+ Quick Action'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {actionMenuOpen && (
              <div
                className={`absolute ${
                  isAr ? 'left-0' : 'right-0'
                } mt-2 w-56 bg-white dark:bg-[#082030] border border-slate-200 dark:border-cyan-950 rounded-xl shadow-2xl py-1.5 z-50 text-xs`}
              >
                <button
                  onClick={() => {
                    setActionMenuOpen(false);
                    onOpenFormationModal();
                  }}
                  className="w-full text-left px-3 py-2.5 text-[#004457] dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-cyan-900/40 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#00A896]" />
                  <span>{isAr ? 'تأسيس شركة أمريكية / بريطانية' : 'Form US / UK Company'}</span>
                </button>
                <button
                  onClick={() => {
                    setActionMenuOpen(false);
                    onOpenStoreModal();
                  }}
                  className="w-full text-left px-3 py-2.5 text-[#004457] dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-cyan-900/40 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <Store className="w-4 h-4 text-[#004457] dark:text-[#D4AF37]" />
                  <span>{isAr ? 'إطلاق متجر إلكتروني مستقل' : 'Launch New Store'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
