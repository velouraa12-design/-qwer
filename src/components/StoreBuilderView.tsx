import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { DEFAULT_STORE_SECTIONS } from '../data/mockData.ts';
import {
  Palette,
  Layers,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  Send,
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  FileText,
  Plus,
  Trash2,
  ShieldCheck,
  Star
} from 'lucide-react';
import { StoreProduct } from '../types/index.ts';

interface StoreBuilderViewProps {
  onOpenStoreModal: () => void;
}

export const StoreBuilderView: React.FC<StoreBuilderViewProps> = ({ onOpenStoreModal }) => {
  const {
    language,
    stores,
    activeStoreId,
    setActiveStoreId,
    updateStoreDetails,
    updateStoreSections,
    saveStoreSnapshot,
    restoreStoreSnapshot,
    submitStoreForApproval,
    products,
    addOrder,
    storeTemplates,
    storePages,
    saveStorePage
  } = useApp();

  const isAr = language === 'ar';
  const currentStore = stores.find(s => s.id === activeStoreId) || stores[0];
  const storeProducts = products.filter(p => p.storeId === currentStore?.id);
  const currentPages = storePages.filter(p => p.storeId === currentStore?.id);
  const sections = currentStore?.sections || DEFAULT_STORE_SECTIONS;

  const [studioTab, setStudioTab] = useState<'templates' | 'sections' | 'branding' | 'pages' | 'versions'>('sections');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeStorefrontPage, setActiveStorefrontPage] = useState<string>('home');
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageContent, setNewPageContent] = useState('');

  // Interactive Storefront Shopping Cart State
  const [cart, setCart] = useState<{ product: StoreProduct; qty: number }[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutCustomerName, setCheckoutCustomerName] = useState('عميل متجر قبس');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!currentStore) return null;

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newArr = [...sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newArr.length) return;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    updateStoreSections(currentStore.id, newArr);
  };

  const toggleSectionVisibility = (id: string) => {
    const updated = sections.map(s => {
      if (s.id !== id) return s;
      const isVis = s.visible ?? s.enabled ?? true;
      return { ...s, visible: !isVis, enabled: !isVis };
    });
    updateStoreSections(currentStore.id, updated);
  };

  const addToCart = (prod: StoreProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === prod.id);
      if (existing) {
        return prev.map(item => (item.product.id === prod.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { product: prod, qty: 1 }];
    });
    setCartDrawerOpen(true);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);
  const cartTax = Math.round(cartSubtotal * ((currentStore.taxRate ?? 15) / 100));
  const cartTotal = cartSubtotal + cartTax;

  const handleSimulatedCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    addOrder({
      storeId: currentStore.id,
      customerName: checkoutCustomerName || 'عميل المتجر',
      customerEmail: 'buyer@customer.sa',
      total: cartTotal,
      taxAmount: cartTax,
      shippingCost: 0,
      shippingCarrier: 'DHL Express',
      trackingNumber: `QBS-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'processing',
      itemsCount: cart.reduce((a, b) => a + b.qty, 0)
    });
    setCart([]);
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setCartDrawerOpen(false);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Studio Top Bar */}
      <div className="rounded-2xl bg-[#03131D] text-white p-4 sm:p-5 border border-cyan-950 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00A896]/20 border border-[#00A896]/40 text-[#00A896]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#E5C158] uppercase">
                {isAr ? '2. منشئ المتاجر — QABS Studio' : '2. QABS Studio — Visual Store Builder'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentStore.approvalStatus === 'approved_published'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {currentStore.approvalStatus === 'approved_published'
                  ? isAr
                    ? 'معتمد ومنشور'
                    : 'Published'
                  : isAr
                  ? 'غير منشور حتى موافقة قبس'
                  : 'Pending QABS Approval'}
              </span>
            </div>
            <h1 className="text-lg font-black mt-0.5">
              {currentStore.name} — <span className="text-xs font-mono text-teal-300">{currentStore.subdomain}</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Switch Store */}
          <select
            value={activeStoreId}
            onChange={e => setActiveStoreId(e.target.value)}
            className="bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-xs font-bold text-white cursor-pointer"
          >
            {stores.map(st => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          {/* Device Preview Switch */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-cyan-950">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                previewDevice === 'desktop' ? 'bg-[#00A896] text-white' : 'text-slate-400'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{isAr ? 'كمبيوتر' : 'Desktop'}</span>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                previewDevice === 'mobile' ? 'bg-[#00A896] text-white' : 'text-slate-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isAr ? 'هاتف' : 'Mobile'}</span>
            </button>
          </div>

          {/* Save Version Snapshot */}
          <button
            onClick={() => saveStoreSnapshot(currentStore.id, `نسخة استوديو (${new Date().toLocaleTimeString()})`)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-200 border border-cyan-900 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isAr ? 'حفظ نسخة التصميم' : 'Save Snapshot'}</span>
          </button>

          {/* Submit for QABS Publication Approval */}
          <button
            onClick={() => submitStoreForApproval(currentStore.id)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C8A24A] to-[#E5C158] text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAr ? 'إرسال المتجر للاعتماد والنشر' : 'Submit for Approval'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Controls Panel + Right Live Storefront Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Studio Control Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 h-fit">
          {/* Studio Tabs */}
          <div className="grid grid-cols-5 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-[11px] font-black">
            <button
              onClick={() => setStudioTab('sections')}
              className={`py-2 rounded-lg cursor-pointer ${
                studioTab === 'sections' ? 'bg-[#004457] text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'الأقسام' : 'Sections'}
            </button>
            <button
              onClick={() => setStudioTab('templates')}
              className={`py-2 rounded-lg cursor-pointer ${
                studioTab === 'templates' ? 'bg-[#004457] text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'القوالب' : 'Templates'}
            </button>
            <button
              onClick={() => setStudioTab('branding')}
              className={`py-2 rounded-lg cursor-pointer ${
                studioTab === 'branding' ? 'bg-[#004457] text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'الهوية' : 'Branding'}
            </button>
            <button
              onClick={() => setStudioTab('pages')}
              className={`py-2 rounded-lg cursor-pointer ${
                studioTab === 'pages' ? 'bg-[#004457] text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'الصفحات' : 'Pages'}
            </button>
            <button
              onClick={() => setStudioTab('versions')}
              className={`py-2 rounded-lg cursor-pointer ${
                studioTab === 'versions' ? 'bg-[#004457] text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'النسخ' : 'Versions'}
            </button>
          </div>

          {/* TAB 1: SECTIONS REORDER & VISIBILITY */}
          {studioTab === 'sections' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500">
                {isAr
                  ? 'رتّب أقسام الصفحة الرئيسية لمتجرك أو أخفِ/أظهر أي قسم مباشرة:'
                  : 'Reorder or toggle storefront sections in real time:'}
              </div>
              <div className="space-y-2">
                {sections.map((sec, idx) => {
                  const isVis = sec.visible ?? sec.enabled ?? true;
                  return (
                  <div
                    key={sec.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                      isVis
                        ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        : 'bg-slate-100/50 dark:bg-slate-900/30 border-dashed border-slate-300 opacity-60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-[#004457] dark:text-white truncate">
                        {isAr ? sec.titleAr : sec.titleEn}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {isAr ? sec.subtitleAr : sec.subtitleEn}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                        title={isAr ? 'تحريك لأعلى' : 'Move Up'}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === sections.length - 1}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                        title={isAr ? 'تحريك لأسفل' : 'Move Down'}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleSectionVisibility(sec.id)}
                        className={`p-1.5 rounded-lg cursor-pointer ${
                          isVis ? 'text-[#00A896] bg-teal-50' : 'text-slate-400 bg-slate-200'
                        }`}
                        title={isAr ? 'إظهار / إخفاء القسم' : 'Toggle Visibility'}
                      >
                        {isVis ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );})}
              </div>
            </div>
          )}

          {/* TAB 2: READY STORE TEMPLATES */}
          {studioTab === 'templates' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500">
                {isAr ? 'اختر قالباً جاهزاً لتطبيقه فوراً على متجرك:' : 'Select a ready template preset:'}
              </div>
              <div className="space-y-2.5">
                {storeTemplates.map(tpl => (
                  <div
                    key={tpl.id}
                    onClick={() =>
                      updateStoreDetails(currentStore.id, {
                        templateId: tpl.id,
                        theme: tpl.theme,
                        primaryColor: tpl.primaryColor,
                        accentColor: tpl.accentColor,
                        fontFamily: tpl.fontFamily
                      })
                    }
                    className={`p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                      currentStore.templateId === tpl.id
                        ? 'border-[#00A896] bg-teal-50/40 dark:bg-teal-950/30'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <img src={tpl.previewImage} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-[#004457] dark:text-white">
                        {isAr ? tpl.nameAr : tpl.nameEn}
                      </div>
                      <div className="text-[10px] text-slate-500">{isAr ? tpl.categoryAr : tpl.categoryEn}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tpl.primaryColor }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tpl.accentColor }} />
                        <span className="text-[10px] font-mono text-slate-400">{tpl.fontFamily}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BRANDING, HEADER & FOOTER */}
          {studioTab === 'branding' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isAr ? 'اللون الرئيسي للهيدر والعناوين' : 'Primary Header & Brand Color'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentStore.primaryColor || '#004457'}
                    onChange={e => updateStoreDetails(currentStore.id, { primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono">{currentStore.primaryColor || '#004457'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isAr ? 'لون الأزرار والعروض (Accent)' : 'Buttons & Accent Color'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentStore.accentColor || '#C8A24A'}
                    onChange={e => updateStoreDetails(currentStore.id, { accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono">{currentStore.accentColor || '#C8A24A'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isAr ? 'الخط المعتمد في المتجر' : 'Store Font Family'}
                </label>
                <select
                  value={currentStore.fontFamily || 'Cairo'}
                  onChange={e => updateStoreDetails(currentStore.id, { fontFamily: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-bold"
                >
                  <option value="Cairo">Cairo</option>
                  <option value="Tajawal">Tajawal</option>
                  <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
                  <option value="Readex Pro">Readex Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isAr ? 'تخطيط الهيدر والقوائم' : 'Header Layout Style'}
                </label>
                <select
                  value={currentStore.headerStyle || 'executive'}
                  onChange={e => updateStoreDetails(currentStore.id, { headerStyle: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-bold"
                >
                  <option value="executive">{isAr ? 'رئاسي متكامل مع شريط إعلاني' : 'Executive with Top Bar'}</option>
                  <option value="centered">{isAr ? 'شعار متوسط وقوائم متناظرة' : 'Centered Brand Header'}</option>
                  <option value="minimal">{isAr ? 'عصري مبسط' : 'Minimal Clean'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isAr ? 'نص الفوتر وحقوق المتجر' : 'Footer Copyright Text'}
                </label>
                <input
                  type="text"
                  value={currentStore.footerTextAr || ''}
                  onChange={e => updateStoreDetails(currentStore.id, { footerTextAr: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM PAGES BUILDER */}
          {studioTab === 'pages' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {currentPages.map(pg => (
                  <button
                    key={pg.id}
                    onClick={() => setActiveStorefrontPage(pg.slug)}
                    className={`w-full text-right p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer ${
                      activeStorefrontPage === pg.slug
                        ? 'border-[#00A896] bg-teal-50/50 font-black'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>{isAr ? pg.titleAr : pg.titleEn}</span>
                    <span className="text-[10px] font-mono text-slate-400">/{pg.slug}</span>
                  </button>
                ))}
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!newPageTitle.trim()) return;
                  const slug = `page-${Date.now().toString().slice(-4)}`;
                  saveStorePage({
                    storeId: currentStore.id,
                    titleAr: newPageTitle,
                    titleEn: newPageTitle,
                    slug,
                    type: 'custom',
                    contentAr: newPageContent || newPageTitle,
                    contentEn: newPageContent || newPageTitle,
                    published: true
                  });
                  setNewPageTitle('');
                  setNewPageContent('');
                  setActiveStorefrontPage(slug);
                }}
                className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <div className="text-xs font-black text-[#004457] dark:text-white">
                  {isAr ? '+ إضافة صفحة مخصصة للمتجر' : '+ Add Custom Page'}
                </div>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'عنوان الصفحة' : 'Page Title'}
                  value={newPageTitle}
                  onChange={e => setNewPageTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <textarea
                  rows={2}
                  placeholder={isAr ? 'محتوى الصفحة...' : 'Content...'}
                  value={newPageContent}
                  onChange={e => setNewPageContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#004457] text-white text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إضافة الصفحة ومعاينتها' : 'Create & Preview Page'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: DESIGN VERSION HISTORY (حفظ نسخ التصميم واستعادتها) */}
          {studioTab === 'versions' && (
            <div className="space-y-4">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  saveStoreSnapshot(currentStore.id, snapshotLabel || `نسخة (${new Date().toLocaleTimeString()})`);
                  setSnapshotLabel('');
                }}
                className="space-y-2"
              >
                <input
                  type="text"
                  placeholder={isAr ? 'اسم النسخة (مثال: تصميم رمضان)' : 'Version label'}
                  value={snapshotLabel}
                  onChange={e => setSnapshotLabel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#004457] text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حفظ نسخة التصميم الحالية' : 'Save Current Snapshot'}</span>
                </button>
              </form>

              <div className="space-y-2">
                {(currentStore.designVersions || []).map(ver => (
                  <div
                    key={ver.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#004457] dark:text-white">{ver.label || ver.versionName}</div>
                      <div className="text-[10px] text-slate-400">{ver.savedAt || ver.timestamp}</div>
                    </div>
                    <button
                      onClick={() => restoreStoreSnapshot(currentStore.id, ver.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-50 text-[#004457] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isAr ? 'استعادة' : 'Restore'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LIVE STOREFRONT PREVIEW ENGINE (8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div
            className={`w-full transition-all duration-300 rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl bg-white text-slate-900 ${
              previewDevice === 'mobile' ? 'max-w-[390px]' : 'w-full'
            }`}
            style={{ fontFamily: currentStore.fontFamily || 'Cairo' }}
          >
            {/* Browser Bar */}
            <div className="bg-slate-900 text-slate-300 px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="px-3 py-1 rounded-md bg-slate-800 font-mono text-[11px] text-teal-300 truncate">
                https://{currentStore.customDomain || currentStore.subdomain}
              </div>
              <button
                onClick={() => setCartDrawerOpen(!cartDrawerOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-white font-bold cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#E5C158]" />
                <span>{cart.reduce((a, b) => a + b.qty, 0)}</span>
              </button>
            </div>

            {/* STOREFRONT HEADER */}
            <header
              className="px-6 py-4 text-white flex flex-wrap items-center justify-between gap-4"
              style={{ backgroundColor: currentStore.primaryColor || '#004457' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-slate-950"
                  style={{ backgroundColor: currentStore.accentColor || '#C8A24A' }}
                >
                  {currentStore.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-black text-base">{currentStore.name}</div>
                  <div className="text-[10px] opacity-80">{isAr ? currentStore.activityAr : currentStore.activityEn}</div>
                </div>
              </div>

              {/* Storefront Pages Nav */}
              <nav className="flex flex-wrap items-center gap-3 text-xs font-bold">
                <button
                  onClick={() => setActiveStorefrontPage('home')}
                  className={`cursor-pointer ${activeStorefrontPage === 'home' ? 'underline text-[#E5C158]' : 'opacity-85'}`}
                >
                  {isAr ? 'الرئيسية' : 'Home'}
                </button>
                {currentPages
                  .filter(p => p.slug !== 'home')
                  .map(pg => (
                    <button
                      key={pg.id}
                      onClick={() => setActiveStorefrontPage(pg.slug)}
                      className={`cursor-pointer ${
                        activeStorefrontPage === pg.slug ? 'underline text-[#E5C158]' : 'opacity-85'
                      }`}
                    >
                      {isAr ? pg.titleAr : pg.titleEn}
                    </button>
                  ))}
              </nav>
            </header>

            {/* Interactive Shopping Cart Drawer inside Storefront */}
            {cartDrawerOpen && (
              <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-[#004457]">
                    {isAr ? 'سلة المشتريات وإتمام الطلب (Live Checkout)' : 'Storefront Cart & Checkout'}
                  </h4>
                  <button
                    onClick={() => setCartDrawerOpen(false)}
                    className="text-xs text-slate-500 font-bold cursor-pointer"
                  >
                    {isAr ? 'إغلاق ✕' : 'Close ✕'}
                  </button>
                </div>

                {checkoutSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isAr
                        ? 'تم تسجيل الطلب بنجاح في لوحة تحكم هذا المتجر المعزول!'
                        : 'Order placed and recorded in this store dashboard!'}
                    </span>
                  </div>
                ) : cart.length === 0 ? (
                  <p className="text-xs text-slate-500">{isAr ? 'السلة فارغة — أضف منتجات من المتجر أدناه' : 'Cart is empty'}</p>
                ) : (
                  <form onSubmit={handleSimulatedCheckout} className="space-y-3">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border">
                        <span className="font-bold">
                          {isAr ? item.product.nameAr : item.product.nameEn} × {item.qty}
                        </span>
                        <span className="font-black">
                          {item.product.price * item.qty} {currentStore.currency}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-xs pt-2 border-t">
                      <span>
                        {isAr ? `الإجمالي شامل الضريبة (${currentStore.taxRate ?? 15}%):` : 'Total incl. Tax:'}
                      </span>
                      <span className="text-sm font-black text-[#004457]">
                        {cartTotal} {currentStore.currency}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={checkoutCustomerName}
                        onChange={e => setCheckoutCustomerName(e.target.value)}
                        placeholder={isAr ? 'اسم المشتري' : 'Buyer Name'}
                        className="flex-1 rounded-xl border px-3 py-2 text-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl text-white text-xs font-black cursor-pointer"
                        style={{ backgroundColor: currentStore.primaryColor || '#004457' }}
                      >
                        {isAr ? 'إتمام الشراء الآن' : 'Complete Order'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* STOREFRONT BODY: Custom Page or Dynamic Sections */}
            {activeStorefrontPage !== 'home' ? (
              <div className="p-8 min-h-[360px] space-y-4">
                {(() => {
                  const pg = currentPages.find(p => p.slug === activeStorefrontPage);
                  if (!pg) return null;
                  return (
                    <>
                      <h2 className="text-2xl font-black" style={{ color: currentStore.primaryColor || '#004457' }}>
                        {isAr ? pg.titleAr : pg.titleEn}
                      </h2>
                      <p className="text-sm text-slate-600 leading-relaxed">{isAr ? pg.contentAr : pg.contentEn}</p>
                      <button
                        onClick={() => setActiveStorefrontPage('home')}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
                        style={{ backgroundColor: currentStore.primaryColor || '#004457' }}
                      >
                        {isAr ? '← العودة لمنتجات المتجر' : '← Back to Storefront'}
                      </button>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sections
                  .filter(sec => sec.visible ?? sec.enabled ?? true)
                  .map(sec => {
                    if (sec.type === 'hero') {
                      return (
                        <div
                          key={sec.id}
                          className="p-8 sm:p-12 text-white relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${currentStore.primaryColor || '#004457'}, #041E2B)`
                          }}
                        >
                          <div className="max-w-lg space-y-3">
                            <span
                              className="inline-block px-3 py-1 rounded-full text-[10px] font-black text-slate-950"
                              style={{ backgroundColor: currentStore.accentColor || '#C8A24A' }}
                            >
                              {currentStore.name}
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                              {isAr ? sec.titleAr : sec.titleEn}
                            </h2>
                            <p className="text-xs sm:text-sm opacity-85">
                              {isAr ? sec.subtitleAr : sec.subtitleEn}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (sec.type === 'featured_products') {
                      return (
                        <div key={sec.id} className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-black" style={{ color: currentStore.primaryColor || '#004457' }}>
                                {isAr ? sec.titleAr : sec.titleEn}
                              </h3>
                              <p className="text-xs text-slate-500">{isAr ? sec.subtitleAr : sec.subtitleEn}</p>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400">
                              {storeProducts.length} {isAr ? 'منتج خاص بهذا المتجر فقط' : 'isolated items'}
                            </span>
                          </div>

                          <div
                            className={`grid gap-4 ${
                              previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                            }`}
                          >
                            {storeProducts.map(prod => (
                              <div
                                key={prod.id}
                                className="rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between bg-white hover:shadow-md transition-all"
                              >
                                <div>
                                  <img src={prod.image || prod.imageUrl} alt="" className="w-full h-36 object-cover" />
                                  <div className="p-3.5 space-y-1">
                                    <div className="text-[10px] text-slate-400 font-bold">{prod.category || prod.categoryAr}</div>
                                    <div className="text-sm font-black text-slate-900">
                                      {isAr ? prod.nameAr || prod.titleAr : prod.nameEn || prod.titleEn}
                                    </div>
                                    <div className="text-xs font-black" style={{ color: currentStore.primaryColor || '#004457' }}>
                                      {prod.price} {currentStore.currency}
                                    </div>
                                  </div>
                                </div>
                                <div className="p-3 pt-0">
                                  <button
                                    onClick={() => addToCart(prod)}
                                    className="w-full py-2 rounded-xl text-xs font-black text-white cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5"
                                    style={{ backgroundColor: currentStore.primaryColor || '#004457' }}
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    <span>{isAr ? 'إضافة للسلة' : 'Add to Cart'}</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={sec.id} className="p-6 bg-slate-50/60 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-black" style={{ color: currentStore.primaryColor || '#004457' }}>
                            {isAr ? sec.titleAr : sec.titleEn}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">{isAr ? sec.subtitleAr : sec.subtitleEn}</p>
                        </div>
                        <Star className="w-5 h-5" style={{ color: currentStore.accentColor || '#C8A24A' }} />
                      </div>
                    );
                  })}
              </div>
            )}

            {/* STOREFRONT FOOTER */}
            <footer
              className="px-6 py-5 text-white text-xs flex flex-col sm:flex-row items-center justify-between gap-2"
              style={{ backgroundColor: currentStore.primaryColor || '#004457' }}
            >
              <span>{currentStore.footerTextAr || `© ${currentStore.name} — QABS Stores`}</span>
              <span className="text-[11px] opacity-75">Powered by QABS STORES</span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};
