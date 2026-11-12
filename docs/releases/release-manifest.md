# QABS Digital — Release Manifest (v1.4.0 Staging)

- **Version**: `1.4.0`
- **Target Environment**: `staging` (Production deployment held pending explicit approval)
- **Build Command**: `npm run build` (`vite build`)
- **Start Command**: `npm start` (`node server.ts`)
- **Verification Suite**: `npm test` (`tsx tests/security_and_formations.test.ts`) + `npm run lint` (`tsc --noEmit`)

## Included Capabilities
1. Cryptographic Authentication & Session Management (`PASS`)
2. 14-Step Company Formation Lifecycle & State Fee Calculator (`PASS`)
3. Private AES-256-GCM Encrypted Document Vault (`PASS`)
4. Unified Pricing & Sandbox Quote/Invoice/Webhook Engine (`PASS`)
5. Multi-Tenant Store Isolation (`PASS`)
6. Server-Side Gemini AI Advisor (`@google/genai` `gemini-3.8-flash`) (`PASS`)
7. Sanitized Cloudflare/Staging Health Endpoint (`/api/health`) (`PASS`)
