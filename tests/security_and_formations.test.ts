process.env.NODE_ENV = 'test';

import { app, db } from '../server.ts';
import http from 'http';

interface TestResult {
  title: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

// Lightweight in-process HTTP request helper
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
  console.log('🧪 QABS INTEGRATION TESTS: CRYPTOGRAPHIC AUTH & PERSISTENT STORAGE');
  console.log('======================================================\n');

  // Customer seed tokens
  const customer1Token = 'qabs_seed_token_customer_01_secure_64_bytes_entropy_token_valid';
  const customer2Token = 'qabs_seed_token_customer_02_secure_64_bytes_entropy_token_valid';

  // --- PILLAR 1: AUTHENTICATION & ADMIN HARDENING ---
  console.log('--- PILLAR 1: Authentication, Cryptographic Sessions & Anti-Escalation ---');

  // Test 1: Anonymous visitor rejected on Admin route
  const res1 = await makeRequest({
    method: 'GET',
    path: '/api/admin/audit-logs'
  });
  assert(
    res1.statusCode === 401,
    'Reject anonymous visitor accessing administrative endpoint (Status 401)',
    `Expected 401, got ${res1.statusCode}`
  );

  // Test 2: Standard merchant/customer rejected on Admin route (Anti-Escalation)
  const res2 = await makeRequest({
    method: 'GET',
    path: '/api/admin/audit-logs',
    headers: {
      Authorization: `Bearer ${customer1Token}`
    }
  });
  assert(
    res2.statusCode === 403,
    'Reject standard customer/merchant accessing admin route (Status 403 Forbidden)',
    `Expected 403, got ${res2.statusCode}`
  );

  // Test 3: Reject login with email alone (Enforce password requirement)
  const res3 = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: {
      email: 'customer@qabs1.store'
      // password omitted deliberately
    }
  });
  assert(
    res3.statusCode === 400 && res3.body?.error === 'PASSWORD_REQUIRED',
    'Reject authentication with email alone: password is strictly required (Status 400)',
    `Expected 400 PASSWORD_REQUIRED, got ${res3.statusCode}: ${JSON.stringify(res3.body)}`
  );

  // Test 4: Reject login with wrong password
  const res4 = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: {
      email: 'customer@qabs1.store',
      password: 'wrong_password_12345'
    }
  });
  assert(
    res4.statusCode === 401 && res4.body?.error === 'INVALID_CREDENTIALS',
    'Reject login with invalid password (Status 401 Invalid Credentials)',
    `Expected 401 INVALID_CREDENTIALS, got ${res4.statusCode}: ${JSON.stringify(res4.body)}`
  );

  // Test 5: Successful login with correct password returns 64-char crypto token
  const res5 = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: {
      email: 'customer@qabs1.store',
      password: 'QabsSecure2026!'
    }
  });
  const loginToken = res5.body?.token;
  assert(
    res5.statusCode === 200 &&
      res5.body?.success === true &&
      typeof loginToken === 'string' &&
      loginToken.length === 64,
    'Successful customer login issues unguessable 64-character crypto session token',
    `Expected 64-char token, got length ${loginToken?.length}`
  );

  // Test 6: Registration prevents privilege escalation
  const newEmail = `merchant_${Date.now()}@example.com`;
  const res6 = await makeRequest({
    method: 'POST',
    path: '/api/auth/register',
    body: {
      name: 'New Test Merchant',
      email: newEmail,
      password: 'Password999!',
      role: 'super_admin' // malicious attempt to claim super_admin
    }
  });
  assert(
    res6.statusCode === 201 && res6.body?.user?.role === 'merchant',
    'Prevent client privilege escalation: public registration strictly assigns role "merchant"',
    `Expected role merchant, got ${res6.body?.user?.role}`
  );
  const registeredToken = res6.body?.token;

  // Test 7: Verify session inspection endpoint
  const res7 = await makeRequest({
    method: 'GET',
    path: '/api/auth/session',
    headers: {
      Authorization: `Bearer ${registeredToken}`
    }
  });
  assert(
    res7.statusCode === 200 &&
      res7.body?.authenticated === true &&
      res7.body?.user?.email === newEmail.toLowerCase(),
    'Server-side session verification via /api/auth/session succeeds with token',
    `Session response: ${JSON.stringify(res7.body)}`
  );

  // Test 8: Logout terminates the session token
  const res8 = await makeRequest({
    method: 'POST',
    path: '/api/auth/logout',
    headers: {
      Authorization: `Bearer ${registeredToken}`
    }
  });
  assert(
    res8.statusCode === 200 && res8.body?.success === true,
    'Logout endpoint terminates session successfully (Status 200)',
    `Status: ${res8.statusCode}`
  );

  const res8b = await makeRequest({
    method: 'GET',
    path: '/api/auth/session',
    headers: {
      Authorization: `Bearer ${registeredToken}`
    }
  });
  assert(
    res8b.statusCode === 200 && res8b.body?.authenticated === false,
    'Invalidated session token is immediately rejected on subsequent queries',
    `Authenticated: ${res8b.body?.authenticated}`
  );

  // Test 9: Live admin write actions are BLOCKED at server level
  // Create simulated admin session
  const adminSession = db.createSession('usr_admin_01', 'super_admin');
  const res9 = await makeRequest({
    method: 'POST',
    path: '/api/admin/settings',
    headers: {
      Authorization: `Bearer ${adminSession.token}`
    },
    body: { allowDirectLiveDeploys: true }
  });
  assert(
    res9.statusCode === 503 && res9.body?.error === 'BLOCKED',
    'Live admin write mutations are BLOCKED pending production IdP certification (503)',
    `Expected 503 BLOCKED, got ${res9.statusCode}: ${JSON.stringify(res9.body)}`
  );

  // --- PILLAR 2: FORMATIONS, INVOICES & DISK PERSISTENCE ---
  console.log('\n--- PILLAR 2: Formations Intake, Pending Invoices & Disk Persistence ---');

  // Test 10: Anonymous visitor cannot create formation
  const res10 = await makeRequest({
    method: 'POST',
    path: '/api/formations',
    body: {
      company_name: 'ANON COMPANY LLC',
      jurisdiction: 'US_WYOMING'
    }
  });
  assert(
    res10.statusCode === 401,
    'Reject unauthenticated visitor from creating company formation (Status 401)',
    `Expected 401, got ${res10.statusCode}`
  );

  // Test 11: Authenticated Customer 1 submits initial formation intake
  const uniqueCoName = `AL-RAYAN GLOBAL COMMERCE LLC ${Date.now()}`;
  const res11 = await makeRequest({
    method: 'POST',
    path: '/api/formations',
    headers: {
      Authorization: `Bearer ${customer1Token}`
    },
    body: {
      company_name: uniqueCoName,
      jurisdiction: 'US_WYOMING',
      entity_type: 'LLC',
      notes: 'Initial intake test'
    }
  });
  assert(
    res11.statusCode === 201 && res11.body?.success === true,
    'Customer 1 successfully submits initial formation intake (Status 201 Created)',
    `Expected 201, got ${res11.statusCode}`
  );

  const createdFormation = res11.body?.formation;
  assert(
    createdFormation &&
      createdFormation.status === 'submitted' &&
      createdFormation.payment_status === 'pending_payment' &&
      createdFormation.state_file_number === null &&
      createdFormation.ein === null,
    'Formation status is strictly "submitted" (pending_payment) and does NOT claim state filing or unissued EIN',
    `Status: ${createdFormation?.status}, payment_status: ${createdFormation?.payment_status}, file_num: ${createdFormation?.state_file_number}`
  );

  assert(
    createdFormation && createdFormation.tenant_id === 'usr_customer_01',
    'Formation record is strictly linked to Customer 1 tenant_id',
    `Expected tenant_id usr_customer_01, got ${createdFormation?.tenant_id}`
  );

  assert(
    createdFormation &&
      (createdFormation.registered_agent.includes('Pending') ||
        createdFormation.registered_agent.includes('بانتظار')),
    'Registered agent and address are labeled pending verification (no fabricated filing)',
    `Agent: ${createdFormation?.registered_agent}`
  );

  // Test 12: Automated Invoice creation in "pending" status (Never auto-paid)
  const invoiceRes = await makeRequest({
    method: 'GET',
    path: '/api/invoices',
    headers: {
      Authorization: `Bearer ${customer1Token}`
    }
  });
  const customerInvoices = invoiceRes.body?.invoices || [];
  const latestInvoice = customerInvoices.find((i: any) => i.description_ar?.includes(uniqueCoName) || i.description_en?.includes(uniqueCoName));
  assert(
    invoiceRes.statusCode === 200 && latestInvoice && latestInvoice.status === 'pending',
    'Intake automatically creates an invoice with status strictly "pending" (never auto-paid)',
    `Found invoice status: ${latestInvoice?.status}`
  );

  // Test 13: Customer 1 retrieves only their own formations
  const res13 = await makeRequest({
    method: 'GET',
    path: '/api/formations',
    headers: {
      Authorization: `Bearer ${customer1Token}`
    }
  });
  const customer1Formations = res13.body?.formations || [];
  assert(
    res13.statusCode === 200 && customer1Formations.length >= 2,
    'Customer 1 retrieves their own formations (seed and new intake)',
    `Expected >=2 formations, got ${customer1Formations.length}`
  );

  // Test 14: Strict Multi-Tenant Isolation - Customer 2 cannot see Customer 1 formations
  const res14 = await makeRequest({
    method: 'GET',
    path: '/api/formations',
    headers: {
      Authorization: `Bearer ${customer2Token}`
    }
  });
  const customer2Formations = res14.body?.formations || [];
  assert(
    res14.statusCode === 200 && customer2Formations.length === 0,
    'Tenant Isolation: Customer 2 CANNOT see Customer 1 formations (returns 0 records)',
    `Customer 2 saw ${customer2Formations.length} records, expected 0`
  );

  // Test 15: Cross-Tenant Defense: Customer 2 rejected with 403 accessing Customer 1 record by ID
  const res15 = await makeRequest({
    method: 'GET',
    path: `/api/formations/${createdFormation?.id}`,
    headers: {
      Authorization: `Bearer ${customer2Token}`
    }
  });
  assert(
    res15.statusCode === 403,
    'Cross-Tenant Defense: Customer 2 rejected with 403 Forbidden accessing Customer 1 formation by ID',
    `Expected 403 Forbidden, got ${res15.statusCode}`
  );

  // Test 16: Disk Persistence Verification (Simulate process restart)
  db.reloadFromDisk();
  const reloadedFormation = db.getFormationById(createdFormation?.id);
  assert(
    reloadedFormation !== undefined && reloadedFormation.company_name === uniqueCoName,
    'Disk Persistence: Record verified stored on disk and restored upon database reload',
    `Reloaded record exists: ${Boolean(reloadedFormation)}`
  );

  // Test 17: Honestly declaring email verification and recovery as BLOCKED
  const resVerify = await makeRequest({
    method: 'POST',
    path: '/api/auth/verify-email',
    body: { email: 'customer@qabs1.store' }
  });
  assert(
    resVerify.statusCode === 503 && resVerify.body?.error === 'BLOCKED_PENDING_SMTP',
    'Email verification service declared BLOCKED pending real SMTP setup (Status 503)',
    `Expected 503 BLOCKED_PENDING_SMTP, got ${resVerify.statusCode}: ${JSON.stringify(resVerify.body)}`
  );

  const resRecover = await makeRequest({
    method: 'POST',
    path: '/api/auth/recover-password',
    body: { email: 'customer@qabs1.store' }
  });
  assert(
    resRecover.statusCode === 503 && resRecover.body?.error === 'BLOCKED_PENDING_SMTP',
    'Password recovery service declared BLOCKED pending real SMTP setup (Status 503)',
    `Expected 503 BLOCKED_PENDING_SMTP, got ${resRecover.statusCode}: ${JSON.stringify(resRecover.body)}`
  );

  // Test 18: Audit Trail records actions
  const auditLogs = db.getAuditLogs();
  const hasFormationLog = auditLogs.some(
    l => l.target_entity === `company_formations:${createdFormation?.id}` && l.status === 'success'
  );
  assert(
    hasFormationLog,
    'Audit Trail: Formation submission immutably recorded in persistent audit log',
    `Total audit logs: ${auditLogs.length}`
  );

  const blockedLogs = auditLogs.filter(l => l.status === 'blocked');
  assert(
    blockedLogs.length >= 2,
    'Audit Trail: Privilege escalation and unauthorized access attempts logged with "blocked" status',
    `Blocked audit entries count: ${blockedLogs.length}`
  );

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
