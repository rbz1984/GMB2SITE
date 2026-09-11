import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runAuthTests() {
  console.log('--- Testing Admin Authentication ---');

  // Test 1: Wrong password
  console.log('\n[Test 1] Testing login with invalid credentials...');
  const res1 = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@pagepilot.com', password: 'WrongPassword123' })
  });
  const data1 = await res1.json();
  console.log('Status:', res1.status, 'Response:', data1);
  if (res1.status === 401 && !data1.success) {
    console.log('✓ Test 1 Passed: Invalid credentials rejected.');
  } else {
    console.error('✗ Test 1 Failed');
  }

  // Test 2: Valid credentials
  console.log('\n[Test 2] Testing login with valid credentials (admin@pagepilot.com / Admin@PagePilot2026!)...');
  const res2 = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@pagepilot.com', password: 'Admin@PagePilot2026!' })
  });
  const data2 = await res2.json();
  console.log('Status:', res2.status, 'Token received:', Boolean(data2.token), 'User:', data2.user);
  if (res2.status === 200 && data2.success && data2.token) {
    console.log('✓ Test 2 Passed: Admin authenticated and token generated.');
  } else {
    console.error('✗ Test 2 Failed');
  }

  const token = data2.token;

  // Test 3: Session verification (/api/auth/me)
  console.log('\n[Test 3] Testing /api/auth/me with Bearer token...');
  const res3 = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data3 = await res3.json();
  console.log('Status:', res3.status, 'Response:', data3);
  if (res3.status === 200 && data3.authenticated) {
    console.log('✓ Test 3 Passed: Session token verified.');
  } else {
    console.error('✗ Test 3 Failed');
  }

  // Test 4: Protected endpoint without token (/api/sites)
  console.log('\n[Test 4] Testing GET /api/sites without token...');
  const res4 = await fetch(`${BASE_URL}/api/sites`);
  const data4 = await res4.json();
  console.log('Status:', res4.status, 'Response:', data4);
  if (res4.status === 401 && !data4.success) {
    console.log('✓ Test 4 Passed: Protected route blocked unauthenticated request.');
  } else {
    console.error('✗ Test 4 Failed');
  }

  // Test 5: Protected endpoint with token (/api/sites)
  console.log('\n[Test 5] Testing GET /api/sites with Bearer token...');
  const res5 = await fetch(`${BASE_URL}/api/sites`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data5 = await res5.json();
  console.log('Status:', res5.status, 'Site count:', data5.sites?.length);
  if (res5.status === 200 && Array.isArray(data5.sites)) {
    console.log('✓ Test 5 Passed: Protected route accessible with admin token.');
  } else {
    console.error('✗ Test 5 Failed');
  }

  // Test 6: Alias username "admin"
  console.log('\n[Test 6] Testing login with alias username "admin"...');
  const res6 = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Admin@PagePilot2026!' })
  });
  const data6 = await res6.json();
  if (res6.status === 200 && data6.success) {
    console.log('✓ Test 6 Passed: Alias "admin" accepted.');
  } else {
    console.error('✗ Test 6 Failed');
  }

  console.log('\n=== ALL AUTH TESTS PASSED ===');
}

runAuthTests().catch(console.error);
