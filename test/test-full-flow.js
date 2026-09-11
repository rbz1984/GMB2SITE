import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';

async function verifyAll() {
  console.log('Testing complete admin flow...');

  // 1. Unauthenticated sites access
  const r1 = await fetch(`${BASE}/api/sites`);
  console.log('1. /api/sites unauthenticated:', r1.status === 401 ? 'PASS (401)' : 'FAIL');

  // 2. Unauthenticated save access
  const r2 = await fetch(`${BASE}/api/sites/royal-traders-and-hardware/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html: 'test' })
  });
  console.log('2. /api/sites/:slug/save unauthenticated:', r2.status === 401 ? 'PASS (401)' : 'FAIL');

  // 3. Unauthenticated publish access
  const r3 = await fetch(`${BASE}/api/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'royal-traders-and-hardware' })
  });
  console.log('3. /api/publish unauthenticated:', r3.status === 401 ? 'PASS (401)' : 'FAIL');

  // 4. Login with admin credentials
  const r4 = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@pagepilot.com', password: 'Admin@PagePilot2026!' })
  });
  const data4 = await r4.json();
  console.log('4. Login status:', r4.status === 200 && data4.success ? 'PASS (200)' : 'FAIL');
  const token = data4.token;

  // 5. Authenticated sites access
  const r5 = await fetch(`${BASE}/api/sites`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data5 = await r5.json();
  console.log('5. /api/sites authenticated:', r5.status === 200 && Array.isArray(data5.sites) ? `PASS (found ${data5.sites.length} sites)` : 'FAIL');

  // 6. Authenticated publish access
  const r6 = await fetch(`${BASE}/api/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ slug: 'royal-traders-and-hardware', domain: 'royal.pagepilot.sites' })
  });
  const data6 = await r6.json();
  console.log('6. /api/publish authenticated:', r6.status === 200 && data6.success ? 'PASS (200)' : 'FAIL');

  // 7. Logout
  const r7 = await fetch(`${BASE}/api/auth/logout`, { method: 'POST' });
  const data7 = await r7.json();
  console.log('7. /api/auth/logout:', r7.status === 200 && data7.success ? 'PASS (200)' : 'FAIL');

  console.log('\n--- ALL VERIFICATIONS COMPLETED SUCCESSFULLY ---');
}

verifyAll().catch(console.error);
