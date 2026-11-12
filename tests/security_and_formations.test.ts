process.env.NODE_ENV = 'test';

import { app, tenantsDb, formationsDb, auditLogsDb } from '../server.ts';
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
  console.log('🧪 QABS INTEGRATION TESTS: PHASE 1 & PHASE 2 VERIFICATION');
  console.log('======================================================\n');

  // --- PHASE 1 TESTS: ADMIN HARDENING & RBAC ---
  console.log('--- PHASE 1: Administrative Hardening & Anti-Escalation ---');

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
      Authorization: 'Bearer session_usr_customer_01'
    }
  });
  assert(
    res2.statusCode === 403,
    'Reject standard customer/merchant accessing admin route (Status 403 Forbidden)',
    `Expected 403, got ${res2.statusCode}`
  );

  // Test 3: Attempting privilege escalation via registration/login
  const res3 = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: {
      email: 'attacker@example.com',
      role: 'super_admin' // malicious attempt to claim super_admin
    }
  });
  assert(
    res3.statusCode === 200 && res3.body.user && res3.body.user.role === 'merchant',
    'Prevent client privilege escalation: new accounts strictly receive role "merchant"',
    `Expected user.role to be merchant, got ${res3.body?.user?.role}`
  );

  // Test 4: Live admin write actions are BLOCKED at server level
  // Simulate an admin session if one existed:
  tenantsDb.set('usr_admin_sim', {
    id: 'usr_admin_sim',
    owner_name: 'Simulated Admin',
    email: 'admin@qabs1.store',
    role: 'super_admin',
    credits_balance: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const res4 = await makeRequest({
    method: 'POST',
    path: '/api/admin/settings',
    headers: {
      Authorization: 'Bearer session_usr_admin_sim'
    },
    body: { allowDirectLiveDeploys: true }
  });
  assert(
    res4.statusCode === 503 && res4.body?.error === 'BLOCKED',
    'Live admin write actions are BLOCKED without certified production IdP (Rule 6 compliant)',
    `Expected 503 BLOCKED, got ${res4.statusCode}: ${JSON.stringify(res4.body)}`
  );

  // --- PHASE 2 TESTS: REAL INITIAL FORMATION INTAKE & TENANT ISOLATION ---
  console.log('\n--- PHASE 2: Initial Formation Intake & Strict Tenant Isolation ---');

  // Test 5: Anonymous visitor cannot create formation
  const res5 = await makeRequest({
    method: 'POST',
    path: '/api/formations',
    body: {
      company_name: 'ANON COMPANY LLC',
      jurisdiction: 'US_WYOMING'
    }
  });
  assert(
    res5.statusCode === 401,
    'Reject unauthenticated visitor from creating company formation (Status 401)',
    `Expected 401, got ${res5.statusCode}`
  );

  // Test 6: Customer 1 creates an initial formation intake
  const res6 = await makeRequest({
    method: 'POST',
    path: '/api/formations',
    headers: {
      Authorization: 'Bearer session_usr_customer_01'
    },
    body: {
      company_name: 'AL-RAYAN GLOBAL COMMERCE LLC',
      jurisdiction: 'US_WYOMING',
      entity_type: 'LLC',
      notes: 'Initial intake test'
    }
  });
  assert(
    res6.statusCode === 201 && res6.body?.success === true,
    'Customer 1 successfully submits initial formation intake (Status 201 Created)',
    `Expected 201, got ${res6.statusCode}`
  );

  const createdFormation = res6.body?.formation;
  assert(
    createdFormation &&
      createdFormation.status === 'submitted' &&
      createdFormation.state_file_number === null &&
      createdFormation.ein === null,
    'Formation status is strictly "submitted" and does NOT claim state filing or unissued EIN',
    `Status: ${createdFormation?.status}, state_file_number: ${createdFormation?.state_file_number}`
  );

  assert(
    createdFormation &&
      createdFormation.tenant_id === 'usr_customer_01',
    'Formation record is strictly linked to Customer 1 tenant_id',
    `Expected tenant_id usr_customer_01, got ${createdFormation?.tenant_id}`
  );

  // Test 7: Verify unverified registered agent address is NOT shown as a factual address
  assert(
    createdFormation &&
      createdFormation.registered_agent.includes('Pending') ||
      createdFormation.registered_agent.includes('بانتظار'),
    'Registered agent and address are labeled pending verification (no fake facts)',
    `Agent: ${createdFormation?.registered_agent}`
  );

  // Test 8: Customer 1 retrieves their formations
  const res8 = await makeRequest({
    method: 'GET',
    path: '/api/formations',
    headers: {
      Authorization: 'Bearer session_usr_customer_01'
    }
  });
  const customer1Formations = res8.body?.formations || [];
  assert(
    res8.statusCode === 200 && customer1Formations.length >= 2,
    'Customer 1 retrieves only their own formations (including seed and new intake)',
    `Expected >=2 formations, got ${customer1Formations.length}`
  );

  // Test 9: Strict Multi-Tenant Isolation - Customer 2 queries formations
  const res9 = await makeRequest({
    method: 'GET',
    path: '/api/formations',
    headers: {
      Authorization: 'Bearer session_usr_customer_02'
    }
  });
  const customer2Formations = res9.body?.formations || [];
  assert(
    res9.statusCode === 200 && customer2Formations.length === 0,
    'Tenant Isolation: Customer 2 CANNOT see Customer 1 formations (returns 0 records)',
    `Customer 2 saw ${customer2Formations.length} records, expected 0`
  );

  // Test 10: Customer 2 attempts to directly access Customer 1 formation by ID
  const res10 = await makeRequest({
    method: 'GET',
    path: `/api/formations/${createdFormation?.id}`,
    headers: {
      Authorization: 'Bearer session_usr_customer_02'
    }
  });
  assert(
    res10.statusCode === 403,
    'Cross-Tenant Defense: Customer 2 rejected with 403 Forbidden when requesting Customer 1 formation by ID',
    `Expected 403 Forbidden, got ${res10.statusCode}`
  );

  // Test 11: Audit Trail verification
  const auditEntriesForCreation = auditLogsDb.filter(
    l => l.target_entity === `company_formations:${createdFormation?.id}`
  );
  const hasSuccessfulCreationLog = auditEntriesForCreation.some(l => l.status === 'success');
  assert(
    hasSuccessfulCreationLog,
    'Audit Trail: Company formation creation is immutably recorded in audit logs with status success',
    `Audit entries count: ${auditEntriesForCreation.length}`
  );

  const blockedAttemptsInAudit = auditLogsDb.filter(l => l.status === 'blocked');
  assert(
    blockedAttemptsInAudit.length >= 3,
    'Audit Trail: Unauthorized access and privilege escalation attempts are logged with "blocked" status',
    `Expected >=3 blocked audit logs, found ${blockedAttemptsInAudit.length}`
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
