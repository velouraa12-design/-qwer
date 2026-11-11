import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  CreditCard,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Plus,
  Download,
  AlertCircle,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../data/mockData.ts';
import { Invoice } from '../types/index.ts';

export const BillingSubscriptionView: React.FC = () => {
  const {
    language,
    subscription,
    changeSubscriptionPlan,
    invoices,
    commissions,
    refunds,
    issueRefund,
    user,
    topUpCredits,
    showToast
  } = useApp();

  const isAr = language === 'ar';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(subscription.billingCycle);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Refund Modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundOrderNumber, setRefundOrderNumber] = useState('');
  const [refundAmount, setRefundAmount] = useState(50);
  const [refundReason, setRefundReason] = useState('');

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId) || SUBSCRIPTION_PLANS[1];

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderNumber.trim()) return;

    issueRefund(
      refundOrderNumber,
      Number(refundAmount),
      refundReason || 'طلب استرداد تجريبي',
      refundReason || 'Sandbox customer refund'
    );

    setRefundModalOpen(false);
    setRefundOrderNumber('');
    setRefundReason('');
  };

  return (
    <div className="w-full bg-[#03131D] text-slate-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-950/60">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {isAr ? 'نظام الاشتراكات والفوترة والأرصدة' : 'Subscriptions, Invoicing & Billing'}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] font-medium border border-[#D4AF37]/30">
                qabs-billing v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'إدارة باقات الخدمة الشهرية والسنوية، المحفظة مسبقة الدفع، سجل الفواتير، ونظام العمولات والاسترداد'
                : 'Manage recurring subscription plans, pre-paid wallet, invoice receipts, and transaction commissions'}
            </p>
          </div>

          {/* Quick Credit Top-up Pill */}
          <div className="flex items-center gap-3 bg-[#082030] border border-cyan-950 p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? 'رصيد المحفظة مسبق الدفع:' : 'Pre-paid Balance:'}</span>
                <span className="text-sm font-black text-[#D4AF37] tabular-nums">${user.credits.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => topUpCredits(250)}
              className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] rounded-md hover:from-[#C59B27] hover:to-[#E5D28A] transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'شحن +$250' : 'Top-up +$250'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Subscription Plans & Cycle Switcher */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">
                {isAr ? 'باقات الاشتراك الشهرية والسنوية' : 'Select Subscription Tier'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'وفر 20% عند اختيار الفوترة السنوية مع دعم كامل للشركات والمتاجر' : 'Save 20% with annual billing with full enterprise SLA'}
              </p>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="flex items-center p-1 bg-[#082030] border border-cyan-950 rounded-lg text-xs self-start">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'شهري' : 'Monthly'}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{isAr ? 'سنوي' : 'Annual'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-[#D4AF37]">
                  {isAr ? 'وفر 20%' : '-20%'}
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map(plan => {
              const isCurrent = subscription.planId === plan.id;
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-xl flex flex-col justify-between transition-all relative ${
                    isCurrent
                      ? 'bg-[#082030] border-2 border-[#D4AF37] shadow-xl shadow-[#D4AF37]/5'
                      : 'bg-[#051724] border border-cyan-950 hover:border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#D4AF37] text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                      {isAr ? plan.badgeAr : plan.badgeEn}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white">{isAr ? plan.nameAr : plan.nameEn}</h3>
                      <p className="text-xs text-slate-400 mt-1">{isAr ? plan.descriptionAr : plan.descriptionEn}</p>
                    </div>

                    <div className="flex items-baseline gap-1 py-2 border-b border-slate-800">
                      <span className="text-3xl font-black text-white tabular-nums">${price}</span>
                      <span className="text-xs text-slate-400">
                        {isAr ? (billingCycle === 'annual' ? '/شهرياً (فاتورة سنوية)' : '/شهرياً') : '/month'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="text-[11px] font-semibold text-slate-300">
                        {isAr ? 'المواصفات الأساسية:' : 'Included Features:'}
                      </div>
                      {(isAr ? plan.featuresAr : plan.featuresEn).map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-300">
                          <Check className="w-3.5 h-3.5 text-[#00A389] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold text-center">
                        {isAr ? '✓ باقتك الحالية النشطة' : '✓ Current Active Plan'}
                      </div>
                    ) : (
                      <button
                        onClick={() => changeSubscriptionPlan(plan.id, billingCycle)}
                        className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>{isAr ? 'الترقية إلى هذه الخطة' : 'Switch to this Plan'}</span>
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Wallet & Pre-paid Credits Breakdown */}
        <section className="p-6 rounded-xl bg-[#082030] border border-cyan-950/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{isAr ? 'نظام الأرصدة مسبقة الدفع (Pre-paid Credits)' : 'Pre-paid Wallet & Service Credits'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'رصيد مرن يُستخدم تلقائياً لعمليات الذكاء الاصطناعي وتجديد التراخيص السنوية ورسوم سكرتير الولاية'
                  : 'Flexible multi-use wallet used for AI generation, annual state franchise filings, and store add-ons'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => topUpCredits(100)}
                className="px-3 py-1.5 text-xs bg-[#051724] border border-cyan-950 hover:border-[#D4AF37] text-slate-200 rounded cursor-pointer"
              >
                +$100
              </button>
              <button
                onClick={() => topUpCredits(500)}
                className="px-3 py-1.5 text-xs bg-[#051724] border border-cyan-950 hover:border-[#D4AF37] text-slate-200 rounded cursor-pointer"
              >
                +$500
              </button>
              <button
                onClick={() => topUpCredits(1000)}
                className="px-3 py-1.5 text-xs font-bold bg-[#D4AF37] hover:bg-[#C59B27] text-slate-950 rounded cursor-pointer"
              >
                +$1,000
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-[#051724] border border-cyan-950">
              <span className="text-[11px] text-slate-400">{isAr ? 'الرصيد المتاح حالياً' : 'Available Balance'}</span>
              <div className="text-2xl font-black text-[#D4AF37] tabular-nums mt-1">${user.credits.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-lg bg-[#051724] border border-cyan-950">
              <span className="text-[11px] text-slate-400">{isAr ? 'استهلاك الذكاء الاصطناعي' : 'AI Studio Compute'}</span>
              <div className="text-2xl font-black text-white tabular-nums mt-1">$45.20</div>
            </div>
            <div className="p-4 rounded-lg bg-[#051724] border border-cyan-950">
              <span className="text-[11px] text-slate-400">{isAr ? 'مستحقات التجديد القادمة' : 'Upcoming Compliance Reserve'}</span>
              <div className="text-2xl font-black text-cyan-300 tabular-nums mt-1">$350.00</div>
            </div>
          </div>
        </section>

        {/* Section 3: Invoices & Receipts Vault */}
        <section className="p-6 rounded-xl bg-[#082030] border border-cyan-950/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00A389]" />
                <span>{isAr ? 'سجل الفواتير والإيصالات الضريبية الرسمية' : 'Official Tax Invoices & Receipts Vault'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'فواتير قابلة للتحميل والطباعة ومطابقة للإقرارات المحاسبية' : 'Statutory tax receipts compliant with corporate book-keeping'}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{invoices.length} {isAr ? 'فواتير صادرة' : 'invoices'}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#051724] text-slate-400 border-b border-cyan-950/60 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">{isAr ? 'رقم الفاتورة' : 'Invoice Number'}</th>
                  <th className="py-2.5 px-3">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="py-2.5 px-3">{isAr ? 'البيان والخدمة' : 'Description'}</th>
                  <th className="py-2.5 px-3">{isAr ? 'الجهة / الشركة' : 'Client Entity'}</th>
                  <th className="py-2.5 px-3 text-right">{isAr ? 'المبلغ' : 'Amount'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'معاينة' : 'Receipt'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-cyan-950/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#D4AF37]">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{inv.date}</td>
                    <td className="py-3 px-3 text-white max-w-[280px] truncate">
                      {isAr ? inv.descriptionAr : inv.descriptionEn}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{inv.clientName}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white text-right tabular-nums">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[#D4AF37] rounded text-[11px] font-medium cursor-pointer inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>{isAr ? 'عرض' : 'View'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Commissions Ledger & Refund Processing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commissions */}
          <div className="p-6 rounded-xl bg-[#082030] border border-cyan-950/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isAr ? 'سجل عمولات المنصة على المبيعات' : 'Platform Sales Commission Ledger'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? `معدل العمولة لباقة النمو: ${currentPlan.commissionFee}%` : `Current plan commission fee: ${currentPlan.commissionFee}%`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {commissions.map(c => (
                <div key={c.id} className="p-3 bg-[#051724] border border-cyan-950/60 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{c.storeName} · {c.orderNumber}</div>
                    <div className="text-[11px] text-slate-400">
                      {isAr ? 'قيمة الطلب الإجمالية:' : 'Gross Order Total:'} ${c.grossAmount}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#D4AF37] tabular-nums">
                      ${c.commissionAmount.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">({c.commissionRate}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refunds */}
          <div className="p-6 rounded-xl bg-[#082030] border border-cyan-950/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'سجل وإجراء الاستردادات المالية (Refunds)' : 'Refund & Dispute Center'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'معالجة استرجاع المبالغ لحسابات العملاء وبوابات الدفع' : 'Stripe & Tap automated customer refund processing'}
                </p>
              </div>
              <button
                onClick={() => setRefundModalOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{isAr ? 'طلب استرداد' : 'Issue Refund'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {refunds.map(r => (
                <div key={r.id} className="p-3 bg-[#051724] border border-cyan-950/60 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{r.orderNumber} · {r.customerName}</div>
                    <div className="text-[11px] text-slate-400">{isAr ? r.reasonAr : r.reasonEn}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-red-400 tabular-nums">-${r.amount}</span>
                    <span className="block text-[10px] text-emerald-400 font-mono">{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#082030] border border-cyan-950 rounded-xl shadow-2xl max-w-lg w-full text-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <img src="/qabas-logo.png" alt="قبس | QABS" className="h-8 w-auto rounded bg-white px-2 py-0.5" />
                <span className="text-xs font-mono font-bold text-[#D4AF37]">{selectedInvoice.invoiceNumber}</span>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'تاريخ الإصدار:' : 'Issue Date:'}</span>
                <span className="text-white font-mono">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'المستفيد / العميل:' : 'Billed To:'}</span>
                <span className="text-white font-semibold">{selectedInvoice.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'الخدمة / البيان:' : 'Service:'}</span>
                <span className="text-white">{isAr ? selectedInvoice.descriptionAr : selectedInvoice.descriptionEn}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#051724] border border-cyan-950 text-sm">
                <span className="font-bold text-slate-300">{isAr ? 'المجموع المدفوع:' : 'Total Amount Paid:'}</span>
                <span className="font-black text-[#D4AF37] tabular-nums text-lg">${selectedInvoice.amount.toLocaleString()} USD</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  showToast(isAr ? 'تم حفظ الإيصال بصيغة PDF' : 'Receipt PDF downloaded');
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#C59B27] text-slate-950 font-bold text-xs rounded cursor-pointer"
              >
                {isAr ? 'تحميل الفاتورة PDF' : 'Download Official PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleRefundSubmit} className="bg-[#082030] border border-cyan-950 rounded-xl shadow-2xl max-w-md w-full text-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">{isAr ? 'إجراء استرداد مالي لطلب' : 'Issue Order Refund'}</h3>
              <button type="button" onClick={() => setRefundModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? 'رقم الطلب (Order ID)' : 'Order Number'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. QBS-8921"
                value={refundOrderNumber}
                onChange={e => setRefundOrderNumber(e.target.value)}
                className="w-full bg-[#051724] border border-cyan-950 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? 'المبلغ المسترد ($)' : 'Refund Amount ($)'}
              </label>
              <input
                type="number"
                required
                value={refundAmount}
                onChange={e => setRefundAmount(Number(e.target.value))}
                className="w-full bg-[#051724] border border-cyan-950 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? 'سبب الاسترداد' : 'Refund Reason'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'طلب العميل، منتج غير متوفر، إلخ' : 'Customer request, stock out, etc.'}
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                className="w-full bg-[#051724] border border-cyan-950 rounded px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="px-3 py-2 text-xs text-slate-400"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded cursor-pointer"
              >
                {isAr ? 'تأكيد وصرف الاسترداد' : 'Confirm & Process Refund'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
