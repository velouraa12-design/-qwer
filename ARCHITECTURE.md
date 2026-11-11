# معمارية منصة قبس الرقمية (QABS Architecture Specification)

## 1. الفلسفة المعمارية ومبادئ التصميم (Design Principles)

1. **العزل التام للمستأجرين (Multi-Tenant Isolation)**:
   - يحصل كل متجر إلكتروني مستقل على مساحة أسماء فريدة (Namespace) وبيانات معزولة، مما يمنع تداخل الكتالوج أو الطلبات بين العملاء.
2. **السيادة والاستقلالية (Sovereignty & Decoupling)**:
   - تقسيم النظام إلى وحدات مستقلة (Modular Subsystems) تتواصل عبر واجهات واضحة لتفادي المشاكل الناتجة عن الأنظمة المترابطة بإحكام (Monoliths).
3. **الثنائية اللغوية الأصيلة (Bilingual Native RTL/LTR)**:
   - دعم كامل للغة العربية (RTL) مع خط `Cairo` المتناسق واللغة الإنجليزية (LTR) مع خط `Plus Jakarta Sans` وأرقام `JetBrains Mono` الجدولية (`tabular-nums`).
4. **الأمان الصارم وعزل الأسرار (Zero Leak Policy)**:
   - حظر كلي لتسريب أي مفاتيح خاصة أو أسرار حقيقية داخل الشيفرة البرمجية؛ كافة المعاملات المالية والتأسيسية في بيئة القالب تعمل بنظام محاكاة معزول (Sandbox).

---

## 2. مخطط الوحدات الـ 12 المستقلة (12 Subsystem Engines)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        QABS CORE RUNTIME                               │
│     (State Kernel · Language Engine · Unified Navigation · Theme)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
┌───▼──────────────┐        ┌───────▼──────────────┐        ┌───────▼──────────────┐
│  qabs-formation  │        │   qabs-multi-store   │        │     qabs-billing     │
│  - US LLC / LTD  │        │  - Tenant Isolation  │        │  - Subscriptions     │
│  - State Filings │        │  - Custom Domains    │        │  - Pre-paid Wallet   │
│  - IRS EIN Hub   │        │  - Shopify Connector │        │  - Tax Invoices      │
└───┬──────────────┘        └───┬──────────────────┘        └───┬──────────────────┘
    │                           │                               │
    │  qabs-compliance          │  qabs-store-builder           │  qabs-payments
    │  - Annual Reports         │  - Theme Customizer           │  - Stripe Connect
    │  - Franchise Tax          │  - Catalog CRUD               │  - Tap Payments
    │  - Registered Agent       │  - Inventory Tracking         │  - Moyasar & Wise
    │                           │                               │
    └───────────────────────────┼───────────────────────────────┘
                                │
    ┌───────────────────────────┼───────────────────────────────┐
    │                           │                               │
┌───▼──────────────┐        ┌───▼──────────────┐        ┌───────▼──────────────┐
│     qabs-ai      │        │     qabs-crm     │        │      qabs-admin      │
│  - Gemini Studio │        │  - Inquiries Desk│        │  - Tenant Oversight  │
│  - Resolution AI │        │  - Ticket Status │        │  - Staff RBAC Matrix │
│  - Ad Copywriter │        │  - Support Queue │        │  - Audit Logs        │
└──────────────────┘        └──────────────────┘        └──────────────────────┘
```

---

## 3. عقود البيانات الأساسية (Core Data Contracts)

### الكيان القانوني (CompanyFormation)
- `id`: المعرف الفريد.
- `companyName`: الاسم التجاري للشركة.
- `jurisdiction`: ولاية أو دولة التأسيس (`US_WYOMING` | `US_DELAWARE` | `UK_LTD`).
- `ein`: الرقم الضريبي الفيدرالي الأمريكي.
- `registeredAgent`: الوكيل المسجل المعتمد.
- `status`: حالة الطلب (`draft` | `under_review` | `submitted_to_state` | `approved`).
- `documents`: خزينة المستندات الرسمية (عقد التأسيس، خطاب EIN، الاتفاقية التشغيلية).

### المتجر المستقل (StoreInstance)
- `id`: معرف المتجر.
- `name`: اسم المتجر.
- `subdomain`: النطاق الفرعي المحجوز (مثال: `lux.qabs1.store`).
- `customDomain`: النطاق المخصص عبر Cloudflare CNAME.
- `theme`: القالب البصري (`gold_executive` | `luxury_dark` | `minimal_white`).
- `totalRevenue`: إجمالي الإيرادات المجمعة.
- `gatewayType`: بوابة الدفع النشطة (`Stripe` | `Tap` | `Moyasar`).

---

## 4. خطة الربط بمشروع قبس الحالي (Integration Roadmap)

1. **المرحلة الأولى (Baseline Sync)**:
   - الحفاظ على كود ومستودعات قبس الأصلية (`velouraa12-design/Qabs` و `qabs-unified-dashboard-template`) دون أي تعديل أو استبدال مفاجئ.
2. **المرحلة الثانية (Module Adoption)**:
   - إمكانية استيراد أي وحدة مستقلة (`qabs-store-builder` أو `qabs-billing` أو `qabs-formation`) كحزمة npm منفصلة أو كمجلد مستقل داخل المشروع القائم.
3. **المرحلة الثالثة (Production Verification)**:
   - إجراء اختبارات القبول الشاملة على بيئة Staging معزولة قبل النشر على النطاقات الحية.
