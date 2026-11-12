import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ShieldAlert, Lock, ArrowLeft, KeyRound, AlertTriangle, ShieldX, RefreshCw } from 'lucide-react';

interface AdminGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetMode?: string;
}

export const AdminGuardModal: React.FC<AdminGuardModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { language, setMode, showToast } = useApp();
  const [sessionToken, setSessionToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(true);
  const isAr = language === 'ar';

  if (!isOpen) return null;

  const handleServerVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sessionToken.trim()) {
      setStatusMessage(
        isAr
          ? 'يرجى إدخال رمز جلسة موظف معتمد للتحقق عبر الخادم.'
          : 'Please provide a valid staff session token for server verification.'
      );
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/status', {
        headers: {
          Authorization: `Bearer ${sessionToken.trim()}`
        }
      });
      const data = await res.json();

      if (res.ok && data.admin_access_allowed) {
        showToast(
          isAr
            ? `تم التحقق من جلسة المدير عبر الخادم بنجاح: ${data.user}`
            : `Admin session verified by server: ${data.user}`
        );
        onSuccess();
      } else {
        setIsBlocked(true);
        setStatusMessage(
          data.reason_ar ||
            (isAr
              ? 'تم رفض الوصول الإداري من قبل الخادم (403 Forbidden). الجلسة غير مصرح لها بصلاحية Super Admin.'
              : 'Server rejected admin access (403 Forbidden). Session not authorized as Super Admin.')
        );
      }
    } catch {
      // In standalone client preview when backend is unreachable, strictly block
      setIsBlocked(true);
      setStatusMessage(
        isAr
          ? 'المصادقة الخادمية غير متوفرة حالياً. تطبيقاً لسياسة الأمان الصارمة، تم حظر الوصول الإداري (BLOCKED).'
          : 'Server-side identity verification unavailable. Administrative access is strictly BLOCKED.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#14243e] text-white border-2 border-red-500/50 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden space-y-6">
        {/* Background accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-400 flex items-center justify-center shrink-0 shadow-inner">
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/90 border border-red-500/60 text-red-300 text-[10px] font-mono font-bold">
              <ShieldAlert className="w-3 h-3 text-red-400" />
              <span>{isAr ? 'عزل أمني صارم (Server RBAC Guard)' : 'Server RBAC Guard'}</span>
            </div>
            <h2 className="text-base font-black text-white mt-1">
              {isAr ? 'بوابة التحقق الإداري الخادمي' : 'Server Administration Gate'}
            </h2>
          </div>
        </div>

        {/* Security Alert: Hardcoded PINs & Local Escalation Removed */}
        <div className="bg-[#0b172a] p-4 rounded-xl border border-red-500/40 text-xs text-slate-300 leading-relaxed space-y-2.5">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
            <ShieldX className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              {isAr
                ? 'الوصول الإداري معطل ومصنف كـ BLOCKED 🔒'
                : 'Administrative Access is BLOCKED 🔒'}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {isAr
              ? 'وفق التوجيهات الأمنية الإلزامية لمنظومة قبس: تم إزالة كافة الرموز الثابتة (Passcodes) وأزرار الترقية المحلية (Fast Pass). لا يُمنح أي مستخدم صلاحية Super Admin إلا عبر جلسة خادمية مشفرة ومزود هوية مؤسسي (Production IAM).'
              : 'Per security policy: All static passcodes and client-side bypass buttons have been permanently decommissioned. Super Admin privileges require a verified server-authoritative session.'}
          </p>

          <div className="pt-1 border-t border-slate-800 text-[11px] text-amber-300/90 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {isAr
                ? 'الحالة التشغيلية الحالية: BLOCKED (بانتظار ربط مزود الهوية المؤسسي).'
                : 'Current Operational Status: BLOCKED (Awaiting production IdP).'}
            </span>
          </div>
        </div>

        {/* Server Session Token Verification Form */}
        <form onSubmit={handleServerVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isAr ? 'رمز جلسة الموظف المعتمدة (Server Session Token)' : 'Server Session Token'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={sessionToken}
                onChange={e => {
                  setSessionToken(e.target.value);
                  setStatusMessage(null);
                }}
                placeholder={isAr ? 'أدخل رمز الجلسة الخادمية الموقعة...' : 'session_...'}
                className="w-full bg-[#0b172a] border border-slate-700 focus:border-red-500 rounded-xl py-2.5 px-9 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>
            {statusMessage && (
              <div className="mt-2 p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
                {statusMessage}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d5b46b]" />
                  <span>{isAr ? 'جارِ التحقق عبر الخادم...' : 'Verifying with server...'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#d5b46b]" />
                  <span>{isAr ? 'التحقق عبر خادم المصادقة (Verify via Server)' : 'Verify via Server API'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                setMode('landing');
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d5b46b] to-[#b3934d] hover:brightness-110 text-[#14243e] font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{isAr ? 'العودة الآمنة إلى الموقع العام (qabs1.store)' : 'Return to Public Store (qabs1.store)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
