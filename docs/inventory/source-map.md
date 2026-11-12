# QABS Digital — Source Map & Component Inventory

## 1. Project Architecture & Core Files
- **Runtime & Server Entry**: `/server.ts` (Express 4 + Vite Middleware in Dev + Static `dist/` in Production + Persistent JSON Storage `/data/qabs_storage.json`).
- **Frontend Entry**: `/index.html`, `/src/main.tsx`, `/src/App.tsx`.
- **Global State & Context**:
  - `/src/context/AppContext.tsx` (Authentication, RBAC role guards, formations, multi-tenant stores, billing, support tickets, audit trail).
  - `/src/context/CustomizerContext.tsx` (Theme & visual customizer state).
- **TypeScript Definitions**: `/src/types/index.ts`.
- **Pricing & Static Data**:
  - `/src/data/usStatesPricing.ts` (50 US states filing fees, packages, and add-ons).
  - `/src/data/mockData.ts` (Initial seed fallbacks for offline preview).
- **Database Schema Reference**: `/DATABASE_SCHEMA.sql`.

## 2. Frontend Views & Modals (`/src/components/`)
| File | Responsibility | Backend API Binding | Status |
| :--- | :--- | :--- | :---: |
| `Header.tsx` | Responsive RTL/LTR navigation, 4 customer paths, mode switcher | `/api/auth/session`, `/api/auth/logout` | **PASS** |
| `LandingView.tsx` | Public identity (Navy `#14243e` & Gold `#d5b46b`), 50-state calculator, functionality matrix | `/api/pricing`, `/api/formations` | **PASS** |
| `PortalView.tsx` | 8-section customer workspace (Overview, Formations, Stores, Gateways, Vault, Invoices, Support, Profile) | `/api/formations`, `/api/documents`, `/api/invoices`, `/api/stores` | **PASS** |
| `FormationWizardModal.tsx` | 3-step US LLC/C-Corp formation wizard (State, Package, Owner info, Draft/Submit) | `POST /api/formations` | **PASS** |
| `AuthModal.tsx` | Customer sign-in, registration, and password recovery notice | `POST /api/auth/login`, `POST /api/auth/register` | **PASS** |
| `AdminGuardModal.tsx` | Server-verified administrative gatekeeper (Zero hardcoded passcodes) | `GET /api/admin/status` | **PASS** |
| `AdminView.tsx` | 6-section admin control center (Summary, Formations, Stores, Docs, Billing, Audit) | `GET /api/admin/formations`, `GET /api/admin/audit-logs` | **PASS** |
| `StoreBuilderView.tsx` | Multi-tenant store studio, products, inventory, orders, domains | `/api/stores`, `/api/stores/:id/products` | **PASS** |
| `BillingSubscriptionView.tsx` | Unified fee breakdown, Sandbox quotes, invoices, refunds | `/api/pricing`, `/api/billing/sandbox/*` | **PASS** |
| `AIChatModal.tsx` | QABS AI Business Advisor powered by server-side `@google/genai` | `POST /api/ai/generate`, `GET /api/ai/usage` | **PASS** |
| `TemplateHubView.tsx` | Code exporter & route readiness inspector | Local + API inspection | **PASS** |
