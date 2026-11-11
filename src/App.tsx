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
import { Footer } from './components/Footer.tsx';
import { CheckCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { mode, setMode, toastMessage, language } = useApp();

  const [formationModalOpen, setFormationModalOpen] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState<string>('WY');
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const isAr = language === 'ar';

  const handleOpenFormationWithState = (stateCode?: string) => {
    if (stateCode) {
      setSelectedStateCode(stateCode);
    }
    setFormationModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFA] dark:bg-[#03131D] text-[#003E52] dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-[#00A896]/25 selection:text-[#003445] dark:selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#082030] border-2 border-[#00A896] text-[#003445] dark:text-white text-xs font-bold shadow-2xl animate-fade-in">
          <CheckCircle className="w-4 h-4 text-[#00A896] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Dual-Mode Sovereign Switcher Bar */}
      <div className="sticky top-0 z-50 w-full bg-[#14243e] text-white border-b border-[#d5b46b]/40 shadow-lg px-3 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left / Start: Active Mode Badges & Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b172a] border border-[#d5b46b]/30 text-[#d5b46b] font-black tracking-wider text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              QABS v48.27
            </span>

            <div className="inline-flex rounded-lg bg-[#0b172a] p-1 border border-slate-700/80 shadow-inner">
              {/* Option 1: Live Store Design (Default) */}
              <button
                type="button"
                onClick={() => setMode('landing')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-bold text-xs transition-all cursor-pointer ${
                  mode === 'landing'
                    ? 'bg-[#d5b46b] text-[#14243e] shadow-md font-black ring-1 ring-white/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title="عرض التصميم الحي لموقع qabs1.store (بالكحلي #14243e والذهبي #d5b46b والخدمات الـ 9)"
              >
                <span className="text-sm">🌐</span>
                <span>{isAr ? 'الموقع الحي (qabs1.store)' : 'Live Site (qabs1.store)'}</span>
                {mode === 'landing' && (
                  <span className="text-[10px] bg-[#14243e] text-[#d5b46b] px-1.5 py-0.5 rounded font-mono font-bold">
                    نشط الآن
                  </span>
                )}
              </button>

              {/* Option 2: Operations Room (43 Routes & File Exporter) */}
              <button
                type="button"
                onClick={() => setMode('template_hub')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-bold text-xs transition-all cursor-pointer ${
                  mode === 'template_hub'
                    ? 'bg-[#d5b46b] text-[#14243e] shadow-md font-black ring-1 ring-white/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title="غرفة العمليات المركزية: جرد الـ 43 مساراً، فك حظر GitHub، تأمين Staging، ومركز تصدير الملفات"
              >
                <span className="text-sm">⚙️</span>
                <span>{isAr ? 'غرفة العمليات (43 مساراً · مركز الملفات)' : 'Operations Hub (43 Routes & Exporter)'}</span>
                {mode === 'template_hub' && (
                  <span className="text-[10px] bg-[#14243e] text-[#d5b46b] px-1.5 py-0.5 rounded font-mono font-bold">
                    نشط الآن
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right / End: Live Status & Fast Release Bundle Action */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* 43/43 Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b172a] border border-emerald-500/40 text-emerald-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-bold">43/43 جاهزية سيادية</span>
              <span className="bg-emerald-950/80 text-emerald-400 text-[10px] px-1 py-0.2 rounded border border-emerald-800">
                100% PASS
              </span>
            </div>

            {/* Quick Action to Operations Exporter */}
            <button
              type="button"
              onClick={() => setMode('template_hub')}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-[#d5b46b] to-[#b3934d] hover:brightness-110 text-[#14243e] font-black text-xs shadow-md transition-all cursor-pointer"
            >
              <span>📦</span>
              <span>{isAr ? 'حزمة الإطلاق والملفات' : 'Release Bundle'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <Header
        onOpenFormationModal={() => handleOpenFormationWithState()}
        onOpenStoreModal={() => setStoreModalOpen(true)}
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

        {mode === 'admin' && (
          <AdminView />
        )}

        {mode === 'template_hub' && (
          <TemplateHubView />
        )}
      </main>

      {/* Footer */}
      <Footer />

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
