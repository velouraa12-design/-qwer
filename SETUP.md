# دليل تثبيت ونشر منصة قبس الرقمية (QABS Setup & Deployment Guide)

يوضح هذا الدليل خطوات تشغيل ونشر قالب **QABS-UNIFIED-PLATFORM-TEMPLATE** محلياً وعلى منصات الحوسبة السحابية.

---

## 1. التشغيل المحلي (Local Environment)

### المتطلبات
- Node.js إصدار 20 أو أحدث
- مدير الحزم npm أو pnpm أو bun

### خطوات الإعداد
```bash
# استنساخ المستودع
git clone https://github.com/velouraa12-design/QABS-UNIFIED-PLATFORM-TEMPLATE.git
cd QABS-UNIFIED-PLATFORM-TEMPLATE

# تثبيت الحزم
npm install

# فحص الأخطاء والأنواع
npm run lint

# بناء نسخة الإنتاج
npm run build

# تشغيل خادم التطوير
npm run dev
```

يعمل خادم التطوير الافتراضي على المنفذ `http://localhost:3000`.

---

## 2. النشر على شبكة Cloudflare Pages & Workers

يدعم القالب النشر المباشر وفائق السرعة على شبكة Cloudflare العالمية:

```bash
# 1. بناء حزمة الإنتاج
npm run build

# 2. النشر عبر أداة Wrangler CLI
npx wrangler pages deploy dist --project-name qabs-platform
```

### إعداد سجلات DNS في Cloudflare:
- أضف سجل `CNAME` للنطاق الفرعي:
  - **Type**: `CNAME`
  - **Name**: `portal` (أو اسم المتجر المخصص)
  - **Target**: `qabs-platform.pages.dev`
  - **Proxy Status**: `Proxied (Orange Cloud)`

---

## 3. التكامل والنشر مع Shopify (Shopify Integration)

### تصدير قالب شوبيفاي (Liquid Theme)
1. من داخل لوحة **منشئ المتاجر (Store Builder)**، انتقل إلى تبويب **تكاملات Shopify**.
2. انقر على **تصدير حزمة Shopify Theme (Liquid/JSON)**.
3. قم برفع الحزمة المضغوطة إلى متجرك في Shopify عبر:
   `Shopify Admin ➔ Online Store ➔ Themes ➔ Add theme ➔ Upload zip file`.

### ربط الكتالوج عبر Shopify Storefront API
```typescript
const response = await fetch('https://your-shop.myshopify.com/api/2026-01/graphql.json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN,
  },
  body: JSON.stringify({ query: `{ products(first: 20) { edges { node { id title } } } }` })
});
```

---

## 4. إعداد قاعدة البيانات (PostgreSQL / Supabase / Cloud SQL)

يمكنك تطبيق المخطط الرسمي مباشرة عبر ملف `DATABASE_SCHEMA.sql`:

```bash
# لتشغيل المخطط على PostgreSQL أو Supabase
psql -h your-db-host -U postgres -d qabs_db -f DATABASE_SCHEMA.sql
```

---

## 5. متغيرات البيئة (Environment Variables)

راجع ملف `.env.example` وقم بتعبئة المتغيرات المطلوبة في بيئة الإنتاج:
- `GEMINI_API_KEY`: لتفعيل استوديو الذكاء الاصطناعي وصياغة القرارات القانونية.
- `APP_URL`: رابط الاستضافة العام للنظام.
- `STRIPE_CONNECT_CLIENT_ID`: لمعاملات بوابة Stripe في بيئة الإنتاج.
- `MERCURY_API_KEY`: لواجهة تدقيق حسابات ميركوري البنكية.
