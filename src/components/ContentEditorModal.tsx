import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useCustomizer } from '../context/CustomizerContext.tsx';
import {
  X,
  Edit3,
  Image,
  Link2,
  FileText,
  DollarSign,
  Phone,
  RotateCcw,
  Plus,
  Trash2,
  Save,
  Check
} from 'lucide-react';

export const ContentEditorModal: React.FC = () => {
  const { language, showToast } = useApp();
  const {
    siteContent,
    updateSiteContent,
    resetToDefault,
    editorOpen,
    setEditorOpen,
    addCustomPage,
    deleteCustomPage
  } = useCustomizer();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'hero' | 'package' | 'contact' | 'pages'>('hero');

  // Form states
  const [heroTitleAr, setHeroTitleAr] = useState(siteContent.heroTitleAr);
  const [heroTitleEn, setHeroTitleEn] = useState(siteContent.heroTitleEn);
  const [heroSubtitleAr, setHeroSubtitleAr] = useState(siteContent.heroSubtitleAr);
  const [heroSubtitleEn, setHeroSubtitleEn] = useState(siteContent.heroSubtitleEn);
  const [heroBadgeAr, setHeroBadgeAr] = useState(siteContent.heroBadgeAr);
  const [heroBadgeEn, setHeroBadgeEn] = useState(siteContent.heroBadgeEn);
  const [heroCtaTextAr, setHeroCtaTextAr] = useState(siteContent.heroCtaTextAr);
  const [heroCtaLink, setHeroCtaLink] = useState(siteContent.heroCtaLink);
  const [heroImageUrl, setHeroImageUrl] = useState(siteContent.heroImageUrl);

  // Package states
  const [showcasePrice, setShowcasePrice] = useState(siteContent.showcasePrice);
  const [showcaseTitleAr, setShowcaseTitleAr] = useState(siteContent.showcasePackageTitleAr);
  const [whatsappNumber, setWhatsappNumber] = useState(siteContent.whatsappNumber);
  const [storeDomain, setStoreDomain] = useState(siteContent.storeDomain);

  // New Page
  const [newPageTitleAr, setNewPageTitleAr] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageContentAr, setNewPageContentAr] = useState('');

  if (!editorOpen) return null;

  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteContent({
      heroTitleAr,
      heroTitleEn,
      heroSubtitleAr,
      heroSubtitleEn,
      heroBadgeAr,
      heroBadgeEn,
      heroCtaTextAr,
      heroCtaLink,
      heroImageUrl
    });
    showToast(isAr ? 'تم حفظ وتحديث نصوص وصور الواجهة الرئيسية!' : 'Hero content updated live!');
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteContent({
      showcasePrice: Number(showcasePrice),
      showcasePackageTitleAr: showcaseTitleAr,
      whatsappNumber,
      storeDomain
    });
    showToast(isAr ? 'تم حفظ وتحديث باقة $349 ومعلومات الاتصال!' : 'Package pricing and contact updated live!');
  };

  const handleAddNewPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitleAr || !newPageSlug) return;
    addCustomPage({
      slug: newPageSlug,
      titleAr: newPageTitleAr,
      titleEn: newPageTitleAr,
      contentAr: newPageContentAr,
      contentEn: newPageContentAr,
      active: true
    });
    setNewPageTitleAr('');
    setNewPageSlug('');
    setNewPageContentAr('');
    showToast(isAr ? 'تمت إضافة الصفحة الجديدة للقالب بنجاح!' : 'New page created!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#082030] border border-cyan-950/80 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-950/60 bg-[#03131D]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg border border-[#D4AF37]/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'محرر ومخصص محتوى القالب الشامل' : 'Full Template Content & Visual Editor'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00A389]/20 text-[#00A389] font-mono">
                  Live Visual CMS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'تعديل كافة النصوص، الصور، الروابط، الباقات، والصفحات الإضافية لحظياً' : 'Customize every text, image, link, package, and custom page in real time'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditorOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-cyan-950/40 bg-[#051724] text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-6 py-2.5 font-semibold transition-colors cursor-pointer ${
              activeTab === 'hero'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[#082030]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'نصوص وصور الهيرو (Hero Section)' : 'Hero & Imagery'}
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`px-6 py-2.5 font-semibold transition-colors cursor-pointer ${
              activeTab === 'package'
                ? 'text-[#00A389] border-b-2 border-[#00A389] bg-[#082030]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'باقة $349 والأسعار' : 'Showcase Pricing ($349)'}
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-6 py-2.5 font-semibold transition-colors cursor-pointer ${
              activeTab === 'contact'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-[#082030]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'معلومات التواصل والواتساب' : 'Contact & WhatsApp'}
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-6 py-2.5 font-semibold transition-colors cursor-pointer ${
              activeTab === 'pages'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[#082030]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'الصفحات الإضافية (Pages)' : 'Custom Pages'}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Tab 1: Hero */}
          {activeTab === 'hero' && (
            <form onSubmit={handleSaveHero} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'شارة الهيرو العلوية (Hero Badge)' : 'Hero Badge Label'}
                </label>
                <input
                  type="text"
                  value={heroBadgeAr}
                  onChange={e => setHeroBadgeAr(e.target.value)}
                  className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'عنوان الهيرو الرئيسي بالعربية' : 'Main Hero Headline (Arabic)'}
                </label>
                <input
                  type="text"
                  value={heroTitleAr}
                  onChange={e => setHeroTitleAr(e.target.value)}
                  className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-sm text-[#D4AF37] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'عنوان الهيرو بالإنجليزية' : 'Main Hero Headline (English)'}
                </label>
                <input
                  type="text"
                  value={heroTitleEn}
                  onChange={e => setHeroTitleEn(e.target.value)}
                  className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'الوصف التوضيحي للهيرو' : 'Hero Subtitle Prose'}
                </label>
                <textarea
                  rows={3}
                  value={heroSubtitleAr}
                  onChange={e => setHeroSubtitleAr(e.target.value)}
                  className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'نص زر الإجراء الأساسي' : 'Primary Button CTA Text'}
                  </label>
                  <input
                    type="text"
                    value={heroCtaTextAr}
                    onChange={e => setHeroCtaTextAr(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'رابط زر الإجراء' : 'CTA Destination Link'}
                  </label>
                  <input
                    type="text"
                    value={heroCtaLink}
                    onChange={e => setHeroCtaLink(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'مسار أو رابط الصورة ثلاثية الأبعاد (3D Hero Image)' : '3D Hero Image Path / URL'}
                </label>
                <input
                  type="text"
                  value={heroImageUrl}
                  onChange={e => setHeroImageUrl(e.target.value)}
                  className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono"
                />
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">{isAr ? 'معاينة مصغرة:' : 'Image Preview:'}</span>
                  <img
                    src={heroImageUrl}
                    alt="Preview"
                    className="h-12 w-20 object-cover rounded border border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-cyan-950/60 flex justify-between">
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-slate-950 font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حفظ التعديلات وتطبيقها فوراً' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Package */}
          {activeTab === 'package' && (
            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'عنوان باقة العرض الترويجي' : 'Showcase Package Title'}
                </label>
                <input
                  type="text"
                  value={showcaseTitleAr}
                  onChange={e => setShowcaseTitleAr(e.target.value)}
                  className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'السعر المعلن ($)' : 'Package Price in USD'}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#D4AF37]">$</span>
                  <input
                    type="number"
                    value={showcasePrice}
                    onChange={e => setShowcasePrice(Number(e.target.value))}
                    className="w-48 bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-lg font-black text-white font-mono"
                  />
                  <span className="text-xs text-slate-400">{isAr ? 'دفعة واحدة' : 'One-time investment'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-cyan-950/60 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#00A389] to-[#2DD4BF] text-slate-950 font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حفظ الباقة' : 'Save Package'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Contact & WhatsApp */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'رقم الواتساب الرسمي (كما هو معلن في البوستر)' : 'Official WhatsApp Number'}
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#00A389]" />
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    className="flex-1 bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'النطاق الرسمي للواجهة' : 'Official Portal Domain'}
                </label>
                <input
                  type="text"
                  value={storeDomain}
                  onChange={e => setStoreDomain(e.target.value)}
                  className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="pt-4 border-t border-cyan-950/60 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                >
                  {isAr ? 'حفظ معلومات التواصل' : 'Save Contact'}
                </button>
              </div>
            </form>
          )}

          {/* Tab 4: Custom Pages */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              {/* Existing Pages List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white">{isAr ? 'الصفحات المفعلة حالياً:' : 'Active Template Pages:'}</h3>
                {siteContent.customPages.map(page => (
                  <div
                    key={page.id}
                    className="p-3 bg-[#051724] border border-cyan-950 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{isAr ? page.titleAr : page.titleEn}</div>
                      <div className="text-[10px] text-slate-400 font-mono">/{page.slug}</div>
                    </div>
                    <button
                      onClick={() => deleteCustomPage(page.id)}
                      className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Page Form */}
              <form onSubmit={handleAddNewPage} className="p-4 bg-[#051724] border border-cyan-900 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-[#D4AF37]">{isAr ? 'إضافة صفحة مخصصة جديدة' : 'Add New Custom Page'}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'عنوان الصفحة (مثال: الشروط والأحكام)' : 'Page Title'}
                    value={newPageTitleAr}
                    onChange={e => setNewPageTitleAr(e.target.value)}
                    className="bg-[#082030] border border-cyan-950 rounded px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Slug (e.g. terms)"
                    value={newPageSlug}
                    onChange={e => setNewPageSlug(e.target.value)}
                    className="bg-[#082030] border border-cyan-950 rounded px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder={isAr ? 'محتوى الصفحة...' : 'Page content...'}
                  value={newPageContentAr}
                  onChange={e => setNewPageContentAr(e.target.value)}
                  className="w-full bg-[#082030] border border-cyan-950 rounded px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A389] text-slate-950 font-bold text-xs rounded cursor-pointer"
                >
                  {isAr ? '+ إنشاء الصفحة ونشرها' : '+ Create & Publish Page'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
