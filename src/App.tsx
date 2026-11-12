/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { CustomizerProvider } from './context/CustomizerContext.tsx';
import { Header } from './components/Header.tsx';
import { LandingView } from './components/LandingView.tsx';
import { PortalView } from './components/PortalView.tsx';
import { StoreBuilderView } from './components/StoreBuilderView.tsx';
import { BillingSubscriptionView } from './components/BillingSubscriptionView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { TemplateHubView } from './components/TemplateHubView.tsx';
import { FormationWizardModal } from './components/FormationWizardModal.tsx';
import { NewStoreModal } from './components/NewStoreModal.tsx';
import { AIChatModal } from './components/AIChatModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ContentEditorModal } from './components/ContentEditorModal.tsx';
import { AdminGuardModal } from './components/AdminGuardModal.tsx';
import { Footer } from './components/Footer.tsx';
import { CheckCircle, Shield, LogOut, Terminal, Globe } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { mode, setMode, user, switchRole, toastMessage, language } = useApp();

  const [formationModalOpen, setFormationModalOpen] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState<string>('WY');
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [adminGuardOpen, setAdminGuardOpen] = useState(false);
  const [pendingTargetMode, setPendingTargetMode] = useState<string>('admin');

  const isAr = language === 'ar';
  const isSuperAdmin = user.role === 'super_admin';

  const handleOpenFormationWithState = (stateCode?: string) => {
    if (stateCode) {
      setSelectedStateCode(stateCode);
    }
    setFormationModalOpen(true);
  };

  const handleTriggerAdminGuard = (target: string = 'admin') => {
    setPendingTargetMode(target);
    setAdminGuardOpen(true);
  };

  // If a non-super-admin tries to directly access admin or template_hub mode
  const isRestrictedMode = mode === 'admin' || mode === 'template_hub';
  const showAdminGuardIntercept = isRestrictedMode && !isSuperAdmin;

  return (
    <div className="min-h-screen bg-[#F7FAFA] dark:bg-[#03131D] text-[#003E52] dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-[#00A896]/25 selection:text-[#003445] dark:selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#082030] border-2 border-[#00A896] text-[#003445] dark:text-white text-xs font-bold shadow-2xl animate-fade-in">
          <CheckCircle className="w-4 h-4 text-[#00A896] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Super Admin Isolated Toolbar — ONLY shown when verified as Super Admin */}
      {isSuperAdmin && (
        <div className="sticky top-0 z-50 w-full bg-[#14243e] text-white border-b border-[#d5b46b]/40 shadow-lg px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b172a] border border-[#d5b46b]/40 text-[#d5b46b] font-mono font-bold text-[11px]">
                <Shield className="w-3.5 h-3.5 text-[#d5b46b]" />
                <span>{isAr ? 'جلسة إشراف معتمدة (Super Admin)' : 'Staff Session (Super Admin)'}</span>
              </span>

              {/* Internal navigation for Super Admin */}
              <div className="inline-flex rounded-lg bg-[#0b172a] p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setMode('landing')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    mode === 'landing'
                      ? 'bg-[#d5b46b] text-[#14243e] font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{isAr ? 'الموقع العام' : 'Public Store'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    mode === 'admin'
                      ? 'bg-[#d5b46b] text-[#14243e] font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isAr ? 'لوحة التحكم' : 'Control Center'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('template_hub')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    mode === 'template_hub'
                      ? 'bg-[#d5b46b] text-[#14243e] font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{isAr ? 'غرفة العمليات والجرد (43)' : 'Operations Hub (43)'}</span>
                </button>
              </div>
            </div>

            {/* Exit Admin Mode */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  switchRole('merchant');
                  setMode('landing');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-600 transition-colors cursor-pointer"
                title={isAr ? 'الخروج من وضع الإشراف والعودة كزائر عادي' : 'Exit Admin Mode'}
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>{isAr ? 'خروج من وضع الإدارة' : 'Exit Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenFormationModal={() => handleOpenFormationWithState()}
        onOpenStoreModal={() => setStoreModalOpen(true)}
        onOpenAdminGuard={() => handleTriggerAdminGuard('admin')}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {mode === 'landing' && (
          <LandingView
            onOpenFormationModal={handleOpenFormationWithState}
            onOpenStoreModal={() => setStoreModalOpen(true)}
            onOpenAIModal={() => setAiModalOpen(true)}
          />
        )}

        {mode === 'portal' && (
          <PortalView
            onOpenFormationModal={() => handleOpenFormationWithState()}
            onOpenStoreModal={() => setStoreModalOpen(true)}
          />
        )}

        {mode === 'store_builder' && (
          <StoreBuilderView
            onOpenStoreModal={() => setStoreModalOpen(true)}
          />
        )}

        {mode === 'billing' && (
          <BillingSubscriptionView />
        )}

        {/* Protected Admin View */}
        {mode === 'admin' && (
          isSuperAdmin ? (
            <AdminView />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-[#071D2B] rounded-3xl border-2 border-red-500/30 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center font-bold">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-[#003445] dark:text-white">
                {isAr ? 'لوحة الإشراف محمية' : 'Admin Area Restricted'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'هذه اللوحة مخصصة لإدارة العمليات ومطوري منصة قبس الرقمية.'
                  : 'This area is restricted to authorized operations staff.'}
              </p>
              <button
                onClick={() => handleTriggerAdminGuard('admin')}
                className="w-full py-2.5 rounded-xl bg-[#14243e] text-[#d5b46b] border border-[#d5b46b]/40 font-bold text-xs cursor-pointer shadow-md"
              >
                {isAr ? 'تسجيل دخول الإدارة (Admin Guard)' : 'Authenticate as Admin'}
              </button>
            </div>
          )
        )}

        {/* Protected Template & Operations Hub */}
        {mode === 'template_hub' && (
          isSuperAdmin ? (
            <TemplateHubView />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-[#071D2B] rounded-3xl border-2 border-red-500/30 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center font-bold">
                <Terminal className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-[#003445] dark:text-white">
                {isAr ? 'غرفة العمليات معزولة' : 'Operations Hub Restricted'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'غرفة العمليات ومصفوفة الجرد الداخلية معزولة عن الواجهة العامة للزوار.'
                  : 'Operations hub and inventory matrix are restricted to verified staff.'}
              </p>
              <button
                onClick={() => handleTriggerAdminGuard('template_hub')}
                className="w-full py-2.5 rounded-xl bg-[#14243e] text-[#d5b46b] border border-[#d5b46b]/40 font-bold text-xs cursor-pointer shadow-md"
              >
                {isAr ? 'تسجيل دخول الإدارة (Admin Guard)' : 'Authenticate as Admin'}
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer with Discrete Staff Access */}
      <Footer onOpenAdminGuard={() => handleTriggerAdminGuard('admin')} />

      {/* Global Modals */}
      <FormationWizardModal
        isOpen={formationModalOpen}
        onClose={() => setFormationModalOpen(false)}
        initialStateCode={selectedStateCode}
      />

      <NewStoreModal
        isOpen={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
      />

      <AIChatModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      <AuthModal />

      <ContentEditorModal />

      <AdminGuardModal
        isOpen={adminGuardOpen || showAdminGuardIntercept}
        onClose={() => {
          setAdminGuardOpen(false);
          if (showAdminGuardIntercept) {
            setMode('landing');
          }
        }}
        onSuccess={() => {
          setAdminGuardOpen(false);
          setMode((pendingTargetMode as 'landing' | 'portal' | 'store_builder' | 'billing' | 'admin' | 'template_hub') || 'admin');
        }}
        targetMode={pendingTargetMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <CustomizerProvider>
        <MainLayout />
      </CustomizerProvider>
    </AppProvider>
  );
}
