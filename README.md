# QABS — MASTER UNIFIED PLATFORM TEMPLATE
## منصة قبس الرقمية المتكاملة لتأسيس الشركات والتجارة الإلكترونية والخدمات الرقمية

[![GitHub Template](https://img.shields.io/badge/GitHub-Template-gold.svg)](https://github.com/velouraa12-design/QABS-UNIFIED-PLATFORM-TEMPLATE)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Vite & React](https://img.shields.io/badge/Vite-8.x_React_19-teal)](https://vitejs.dev/)
[![Bilingual RTL/LTR](https://img.shields.io/badge/i18n-Arabic_RTL_%7C_English_LTR-emerald)](https://qabs1.store)
[![Security Audited](https://img.shields.io/badge/Security-Zero_Leaks_Audited-green)](SECURITY.md)

---

## 🌟 نظرة عامة (Overview)

مستودع قالب سيادي متكامل **QABS-UNIFIED-PLATFORM-TEMPLATE** مصمم لتمكين رواد الأعمال والتجار الرقميين من إطلاق وتشغيل منظومة أعمال رقمية عالمية تشمل:
1. **تأسيس الشركات العالمية**: بوابات التأسيس في الولايات المتحدة (وايومنغ، ديلاوير) والمملكة المتحدة (UK LTD) واستخراج أرقام الضريبة الفيدرالية **IRS EIN**.
2. **إدارة المتاجر المتعددة (Multi-Store & Store Builder)**: بنية عزل تامة للمستأجرين، دعم النطاقات الخاصة، وإدارة الكتالوج والمخزون والطلبات.
3. **بوابات الدفع والبنوك الرقمية**: تكاملات معتمدة مع **Stripe Connect**، **PayPal Commerce**، **Tap Payments**، **Moyasar**، وحسابات **Mercury** و **Wise Business**.
4. **نظام الاشتراكات والفوترة والأرصدة**: باقات شهرية وسنوية، محفظة أرصدة مسبقة الدفع، فواتير ضريبية، سجل عمولات، واستردادات مالية.
5. **استوديو الذكاء الاصطناعي للأعمال**: محرك لصياغة القرارات القانونية وكتابة الأوصاف التسويقية وحملات الإعلانات.
6. **لوحة تحكم الإدارة العليا (Super Admin Master)**: حوكمة المستأجرين، مصفوفة الصلاحيات RBAC، وسجل تدقيق أمني غير قابل للتعديل.
7. **التكامل مع Shopify و Cloudflare Pages**: دعم النشر المباشر على الحافة Edge وتصدير قوالب شوبيفاي.

---

## 🏛️ هيكل الوحدات المستقلة (12 Subsystems)

تم تقسيم المشروع إلى 12 وحدة مستقلة مع واجهات برمجية واضحة ومحددة:

```
QABS-UNIFIED-PLATFORM-TEMPLATE/
├── qabs-core/                  # النواة المشتركة وإدارة الحالة واللغات
├── qabs-admin/                 # لوحة تحكم الإدارة العليا Super Admin وسجلات التدقيق
├── qabs-customer-dashboard/    # بوابة العميل والتاجر وإدارة الشركات والطلبات
├── qabs-store-builder/         # محرك تصميم وتخصيص المتاجر المستقلة وإدارة الكتالوج
├── qabs-multi-store/           # معمارية عزل المستأجرين والنطاقات المخصصة
├── qabs-formation/             # بوابة تأسيس الشركات الأمريكية والبريطانية والوكيل المسجل
├── qabs-compliance/            # تقويم الامتثال السنوي وتجديدات سكرتير الولاية
├── qabs-payments/              # تكاملات بوابات الدفع Stripe, Tap, Moyasar, PayPal
├── qabs-billing/               # نظام الاشتراكات، المحفظة مسبقة الدفع، والفواتير
├── qabs-ai/                    # استوديو الذكاء الاصطناعي للأعمال عبر Gemini
├── qabs-crm/                   # مركز التذاكر والدعم الفني والاستشارات
└── qabs-integrations/          # جسور التكامل مع Shopify Storefront و Cloudflare Edge
```

---

## 🚀 البدء السريع (Quickstart)

### المتطلبات الأساسية
- Node.js 20+ أو Bun 1.1+
- Git

### التثبيت والتشغيل المحلي
```bash
# 1. استنساخ القالب
git clone https://github.com/velouraa12-design/QABS-UNIFIED-PLATFORM-TEMPLATE.git
cd QABS-UNIFIED-PLATFORM-TEMPLATE

# 2. تثبيت الاعتماديات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env

# 4. تشغيل خادم التطوير المحلي
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

---

## 🎨 الهوية البصرية والتخصيص

- **الألوان الرسمية**: الكحلي السيادي الفاخر (`#03131D` / `#082030`)، الذهبي الدافئ (`#D4AF37`)، وتيل قبس المميز (`#00A389`).
- **الخطوط المعتمدة**: خط `Cairo` للعربية وخط `Plus Jakarta Sans` للإنجليزية، مع `JetBrains Mono` للبيانات المالية والأرقام المتناسقة (`tabular-nums`).
- **المحرر المباشر (Live Visual CMS)**: يدعم تخصيص كافة النصوص، الروابط، الصور، والصفحات الإضافية وحفظها في المتصفح في الوقت الفعلي.

---

## 🔒 الأمان والتراخيص

- **خلو تام من الأسرار المكشوفة**: لا يحتوي المستودع على أي مفاتيح خاصة أو أسرار، ويتم عزل المعاملات في بيئة Sandbox آمنة.
- **التراخيص**: مرخص بموجب رخصة **Apache License 2.0** المتوافقة والمفتوحة المصدر.

---

## 📞 الدعم والتواصل
- الموقع الرسمي: [qabs1.store](https://qabs1.store)
- بوابة العملاء: [portal.qabs1.store](https://portal.qabs1.store)
- واتساب الدعم الفني: `+159 710 784 967`
