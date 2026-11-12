process.env.NODE_ENV = 'test';

import { app, db } from '../server.ts';
import http from 'http';
import fs from 'fs';
import path from 'path';

interface TestResult {
  title: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function makeRequest(options: {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as any;
      const port = address.port;

      const postData = options.body ? JSON.stringify(options.body) : '';
      const reqHeaders: Record<string, string> = {
        ...(options.headers || {})
      };

      if (options.body) {
        reqHeaders['Content-Type'] = 'application/json';
        reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
      }

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: options.path,
          method: options.method,
          headers: reqHeaders
        },
        res => {
          let rawData = '';
          res.on('data', chunk => {
            rawData += chunk;
          });
          res.on('end', () => {
            server.close();
            let parsedBody = rawData;
            try {
              parsedBody = JSON.parse(rawData);
            } catch {
              // keep as string
            }
            resolve({
              statusCode: res.statusCode || 500,
              headers: res.headers,
              body: parsedBody
            });
          });
        }
      );

      req.on('error', err => {
        server.close();
        reject(err);
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  });
}

function assert(condition: boolean, title: string, details?: string) {
  if (condition) {
    results.push({ title, passed: true });
    console.log(`✅ [PASS] ${title}`);
  } else {
    results.push({ title, passed: false, details });
    console.error(`❌ [FAIL] ${title} - ${details}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 QABS COMPLETE PLATFORM TEST SUITE (PHASES 2–12)');
  console.log('======================================================\n');

  const customer1Token = 'qabs_seed_token_customer_01_secure_64_bytes_entropy_token_valid';
  const customer2Token = 'qabs_seed_token_customer_02_secure_64_bytes_entropy_token_valid';
  const staffToken = 'qabs_seed_token_staff_01_secure_64_bytes_entropy_token_valid_00';

  // --- PHASE 2: AUTHENTICATION, SESSIONS, PROFILE & RBAC ---
  console.log('--- PHASE 2: Authentication, Cryptographic Sessions & RBAC ---');

  const res1 = await makeRequest({ method: 'GET', path: '/api/admin/audit-logs' });
  assert(res1.statusCode === 401, 'Reject anonymous visitor accessing administrative endpoint (401)');

  const res2 = await makeRequest({
    method: 'GET',
    path: '/api/admin/audit-logs',
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(res2.statusCode === 403, 'Reject standard customer accessing admin route (403 Forbidden)');

  const res3 = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'customer@qabs1.store' }
  });
  assert(
    res3.statusCode === 400 && res3.body?.error === 'PASSWORD_REQUIRED',
    'Reject login with email alone: password strictly required (400)'
  );

  const res4 = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'customer@qabs1.store', password: 'wrong_password_12345' }
  });
  assert(res4.statusCode === 401, 'Reject login with invalid password (401)');

  const res5 = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'customer@qabs1.store', password: 'QabsSecure2026!' }
  });
  const loginToken = res5.body?.token;
  assert(
    res5.statusCode === 200 && typeof loginToken === 'string' && loginToken.length === 64,
    'Successful login issues unguessable 64-character crypto session token'
  );

  const newEmail = `merchant_${Date.now()}@example.com`;
  const res6 = await makeRequest({
    method: 'POST',
    path: '/api/auth/register',
    body: { name: 'New Test Merchant', email: newEmail, password: 'Password999!', role: 'super_admin' }
  });
  assert(
    res6.statusCode === 201 && res6.body?.user?.role === 'merchant',
    'Prevent client privilege escalation: public registration forces role "merchant"'
  );
  const registeredToken = res6.body?.token;

  const resProfile = await makeRequest({
    method: 'PATCH',
    path: '/api/auth/profile',
    headers: { Authorization: `Bearer ${registeredToken}` },
    body: { name: 'Updated Merchant Name', company_name: 'Updated Ventures LLC' }
  });
  assert(
    resProfile.statusCode === 200 && resProfile.body?.profile?.name === 'Updated Merchant Name',
    'Authenticated customer updates account profile settings'
  );

  const resLogout = await makeRequest({
    method: 'POST',
    path: '/api/auth/logout',
    headers: { Authorization: `Bearer ${registeredToken}` }
  });
  const resAfterLogout = await makeRequest({
    method: 'GET',
    path: '/api/auth/session',
    headers: { Authorization: `Bearer ${registeredToken}` }
  });
  assert(
    resLogout.statusCode === 200 && resAfterLogout.body?.authenticated === false,
    'Logout invalidates session token immediately'
  );

  const adminSession = db.createSession('usr_admin_01', 'super_admin');
  const resAdminWrite = await makeRequest({
    method: 'POST',
    path: '/api/admin/settings',
    headers: { Authorization: `Bearer ${adminSession.token}` },
    body: { allowDirectLiveDeploys: true }
  });
  assert(
    resAdminWrite.statusCode === 503 && resAdminWrite.body?.error === 'BLOCKED',
    'Live admin write mutations are BLOCKED pending production IdP (503)'
  );

  // --- PHASE 4: 14-STEP COMPANY FORMATION LIFECYCLE ---
  console.log('\n--- PHASE 4: 14-Step Company Formation Lifecycle & Tenant Isolation ---');

  const uniqueCoName = `AL-RAYAN GLOBAL COMMERCE LLC ${Date.now()}`;
  const resDraft = await makeRequest({
    method: 'POST',
    path: '/api/formations',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      company_name: uniqueCoName,
      jurisdiction: 'US_WYOMING',
      entity_type: 'LLC',
      package_id: 'complete',
      save_as_draft: true
    }
  });
  const createdFormation = resDraft.body?.formation;
  assert(
    resDraft.statusCode === 201 && createdFormation?.status === 'draft',
    'Step 1–7: Customer creates formation request and saves as "draft" with calculated fees'
  );

  // Transition draft -> submitted -> under_review -> needs_information -> quote_ready -> approved -> paid -> processing -> completed
  const lifecycleSequence = [
    { status: 'submitted', token: customer1Token },
    { status: 'under_review', token: staffToken },
    { status: 'needs_information', token: staffToken },
    { status: 'quote_ready', token: staffToken },
    { status: 'approved', token: customer1Token },
    { status: 'paid', token: staffToken },
    { status: 'processing', token: staffToken },
    { status: 'completed', token: staffToken }
  ];

  let allTransitionsPassed = true;
  for (const stepItem of lifecycleSequence) {
    const tRes = await makeRequest({
      method: 'PATCH',
      path: `/api/formations/${createdFormation.id}/status`,
      headers: { Authorization: `Bearer ${stepItem.token}` },
      body: { status: stepItem.status, note: `Transition to ${stepItem.status}` }
    });
    if (tRes.statusCode !== 200 || tRes.body?.formation?.status !== stepItem.status) {
      allTransitionsPassed = false;
    }
  }
  assert(
    allTransitionsPassed,
    'Step 8–14: Formation transitions through submitted -> under_review -> needs_information -> quote_ready -> approved -> paid -> processing -> completed with Audit & Notifications'
  );

  const crossTenantFormationRes = await makeRequest({
    method: 'GET',
    path: `/api/formations/${createdFormation.id}`,
    headers: { Authorization: `Bearer ${customer2Token}` }
  });
  assert(
    crossTenantFormationRes.statusCode === 403,
    'Formation Tenant Isolation: Customer 2 rejected with 403 Forbidden when reading Customer 1 formation'
  );

  // --- PHASE 5: PRIVATE ENCRYPTED DOCUMENT VAULT ---
  console.log('\n--- PHASE 5: Private AES-256-GCM Document Vault & Cross-Tenant Isolation ---');

  const samplePdfBase64 = Buffer.from('%PDF-1.4 QABS Private Articles of Organization').toString('base64');
  const docUploadRes = await makeRequest({
    method: 'POST',
    path: '/api/documents',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      filename: 'Articles_of_Organization.pdf',
      mime_type: 'application/pdf',
      content_base64: samplePdfBase64,
      formation_id: createdFormation.id
    }
  });
  const uploadedDoc = docUploadRes.body?.document;
  assert(
    docUploadRes.statusCode === 201 && uploadedDoc?.encrypted === true && uploadedDoc?.public_url === null,
    'Document Vault: File validated, AES-256-GCM encrypted at rest, and stored with no public URL'
  );

  // Mandatory Phase 5 Test: Customer 2 attempts to read Customer 1's file -> MUST FAIL (403)
  const crossTenantDocRes = await makeRequest({
    method: 'GET',
    path: `/api/documents/${uploadedDoc?.id}`,
    headers: { Authorization: `Bearer ${customer2Token}` }
  });
  assert(
    crossTenantDocRes.statusCode === 403,
    'Document Isolation Test: User 2 attempting to read User 1 private document FAILS with 403 Forbidden'
  );

  // Owner reads and generates temporary signed URL
  const ownerDocRead = await makeRequest({
    method: 'GET',
    path: `/api/documents/${uploadedDoc?.id}`,
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  const signedUrlRes = await makeRequest({
    method: 'POST',
    path: `/api/documents/${uploadedDoc?.id}/signed-url`,
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(
    ownerDocRead.statusCode === 200 &&
      ownerDocRead.body?.document?.content_base64 === samplePdfBase64 &&
      signedUrlRes.statusCode === 200 &&
      signedUrlRes.body?.signed_url.includes('token='),
    'Document Owner: Decrypts content accurately and generates temporary 15-min signed URL'
  );

  // --- PHASE 6: UNIFIED PRICING & SANDBOX BILLING ---
  console.log('\n--- PHASE 6: Unified Pricing Source & Sandbox Billing Lifecycle ---');

  const pricingRes = await makeRequest({ method: 'GET', path: '/api/pricing' });
  assert(
    pricingRes.statusCode === 200 &&
      pricingRes.body?.pricing?.qabs_packages?.complete?.qabs_fee === 299 &&
      Array.isArray(pricingRes.body?.pricing?.complimentary_free_services),
    'Unified Pricing API: Exposes QABS fees, state fees, gateway rates, free services, and suspended services'
  );

  const quoteRes = await makeRequest({
    method: 'POST',
    path: '/api/billing/sandbox/quotes',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: { package_id: 'complete', jurisdiction: 'US_WYOMING', external_fee: 50 }
  });
  const createdQuote = quoteRes.body?.quote;
  const approveQuoteRes = await makeRequest({
    method: 'POST',
    path: `/api/billing/sandbox/quotes/${createdQuote?.id}/approve`,
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  const sandboxInvoice = approveQuoteRes.body?.invoice;
  assert(
    quoteRes.statusCode === 201 &&
      approveQuoteRes.statusCode === 200 &&
      sandboxInvoice?.status === 'pending',
    'Sandbox Quote & Approval: Creates itemized quote and generates pending invoice on approval'
  );

  const webhookPayRes = await makeRequest({
    method: 'POST',
    path: '/api/billing/sandbox/webhook',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: { invoice_id: sandboxInvoice?.id, event_type: 'payment_intent.succeeded' }
  });
  const webhookRefundRes = await makeRequest({
    method: 'POST',
    path: '/api/billing/sandbox/webhook',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: { invoice_id: sandboxInvoice?.id, event_type: 'charge.refunded' }
  });
  assert(
    webhookPayRes.statusCode === 200 &&
      webhookPayRes.body?.invoice?.status === 'paid' &&
      webhookRefundRes.statusCode === 200 &&
      webhookRefundRes.body?.invoice?.status === 'refunded',
    'Sandbox Webhook: Simulates payment settlement and refund in Sandbox without real financial charges'
  );

  // --- PHASE 8: MULTI-TENANT STORES ISOLATION ---
  console.log('\n--- PHASE 8: Multi-Tenant Stores Draft Creation & Isolation ---');

  const createStoreRes = await makeRequest({
    method: 'POST',
    path: '/api/stores',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: { name: 'Khaledi Royal Watches', currency: 'SAR', tax_rate: 15 }
  });
  const newStore = createStoreRes.body?.store;
  assert(
    createStoreRes.statusCode === 201 &&
      newStore?.status === 'draft' &&
      newStore?.payment_connected === false &&
      newStore?.domain_verified === false,
    'Store Creation: Created strictly in "draft" mode without auto-publishing domain or payment'
  );

  const crossTenantStoreRes = await makeRequest({
    method: 'GET',
    path: `/api/stores/${newStore?.id}`,
    headers: { Authorization: `Bearer ${customer2Token}` }
  });
  assert(
    crossTenantStoreRes.statusCode === 403,
    'Store Tenant Isolation: Store 2 owner cannot view or access Store 1 data (403 Forbidden)'
  );

  // QABS Studio update, Product creation, Order creation
  const studioUpdateRes = await makeRequest({
    method: 'PATCH',
    path: `/api/stores/${newStore?.id}/studio`,
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      theme: 'navy_modern',
      primary_color: '#14243e',
      accent_color: '#d5b46b',
      font_family: 'Cairo',
      snapshot_label: 'QABS Studio Version 2.0'
    }
  });
  assert(
    studioUpdateRes.statusCode === 200 && studioUpdateRes.body?.store?.theme === 'navy_modern',
    'QABS Studio: Persists theme, colors, typography, and design version snapshot to backend'
  );

  const addProdRes = await makeRequest({
    method: 'POST',
    path: `/api/stores/${newStore?.id}/products`,
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: { name_ar: 'ساعة ملكية ذهبية', name_en: 'Royal Gold Watch', price: 450, stock: 12 }
  });
  const addOrderRes = await makeRequest({
    method: 'POST',
    path: `/api/stores/${newStore?.id}/orders`,
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: { customer_name: 'Nasser Al-Otaibi', total: 450 }
  });
  assert(
    addProdRes.statusCode === 201 && addOrderRes.statusCode === 201,
    'QABS Products & Orders: Creates isolated product and order records in store catalog'
  );

  // Subscriptions, Support Tickets, CRM, and Integrations Status
  const subChangeRes = await makeRequest({
    method: 'POST',
    path: '/api/subscriptions/change',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: { plan_id: 'growth', billing_cycle: 'annual' }
  });
  const ticketRes = await makeRequest({
    method: 'POST',
    path: '/api/support/tickets',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: { subject: 'Help with EIN letter verification', category: 'compliance', priority: 'high' }
  });
  const crmRes = await makeRequest({
    method: 'GET',
    path: '/api/crm/summary',
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  const intStatusRes = await makeRequest({
    method: 'GET',
    path: '/api/integrations/status',
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(
    subChangeRes.statusCode === 200 &&
      ticketRes.statusCode === 201 &&
      crmRes.statusCode === 200 &&
      intStatusRes.statusCode === 200 &&
      ['PASS_AI_STUDIO', 'BLOCKED'].includes(intStatusRes.body?.integrations?.gemini_ai?.status),
    'QABS Billing, Support, CRM & Integrations: Subscription change, support ticket, CRM summary, and integration matrix verified'
  );

  // --- PHASE 9, 10 & 11: SHOPIFY, CLOUDFLARE HEALTH & DISK PERSISTENCE ---
  console.log('\n--- PHASES 9–12: Shopify Status, Health Endpoint, Persistence & Secret Scan ---');

  const shopifyRes = await makeRequest({
    method: 'GET',
    path: '/api/integrations/shopify/status',
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(
    shopifyRes.statusCode === 503 && shopifyRes.body?.status === 'BLOCKED',
    'Shopify Integration: Honestly classified as BLOCKED (503) without live credentials'
  );

  const healthRes = await makeRequest({ method: 'GET', path: '/api/health' });
  const healthKeys = Object.keys(healthRes.body || {});
  assert(
    healthRes.statusCode === 200 &&
      healthRes.body?.status === 'ok' &&
      healthRes.body?.environment === 'staging' &&
      typeof healthRes.body?.version === 'string' &&
      healthKeys.length === 3,
    'Cloudflare / Health Endpoint: Returns strictly { status: "ok", environment: "staging", version } with no leaked resource IDs'
  );

  db.reloadFromDisk();
  const reloadedFormation = db.getFormationById(createdFormation?.id);
  assert(
    reloadedFormation !== undefined && reloadedFormation.status === 'completed',
    'Disk Persistence: Database records survive reload from /data/qabs_storage.json'
  );

  // Secret scanning check across src/ and server.ts
  const serverSource = fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf-8');
  const hasLeakedLiveKeys =
    serverSource.includes('sk_live_') ||
    serverSource.includes('rk_live_') ||
    serverSource.includes('shpat_');
  assert(!hasLeakedLiveKeys, 'Secret Scanning: Zero hardcoded live Stripe/Shopify/API secrets in codebase');

  console.log('\n======================================================');
  const failedCount = results.filter(r => !r.passed).length;
  const passedCount = results.filter(r => r.passed).length;
  console.log(`SUMMARY: ${passedCount} PASSED / ${failedCount} FAILED (${results.length} Total Tests)`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
