// test/test-domainUtils.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractSubdomain, deployToDomainFolder } from '../generator/domainUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSubdomainExtraction() {
  const testCases = [
    { name: 'Mediterranean Foods Trattoria & Deli, Newtown', expected: 'mediterranean-foods' },
    { name: 'Royal Traders & Hardware', expected: 'royal-traders' },
    { name: 'Sayaji Hotel Vadodara', expected: 'sayaji-hotel' },
    { name: 'Starbucks', expected: 'starbucks' }
  ];

  console.log('Testing subdomain extraction...');
  for (const { name, expected } of testCases) {
    const sub = extractSubdomain(name);
    if (sub !== expected) {
      throw new Error(`Expected '${expected}' for '${name}', got '${sub}'`);
    }
    console.log(`  ✔ '${name}' -> '${sub}'`);
  }
}

async function testDeployment() {
  console.log('\nTesting deployToDomainFolder...');
  const tmpRoot = path.join(__dirname, '..', 'sites', 'tmp-test-www');
  const tmpNginxAvailable = path.join(tmpRoot, 'nginx', 'sites-available');
  const tmpNginxEnabled = path.join(tmpRoot, 'nginx', 'sites-enabled');
  const tmpCertDir = path.join(tmpRoot, 'ssl', 'certs');
  const tmpKeyDir = path.join(tmpRoot, 'ssl', 'private');

  process.env.WEB_ROOT_BASE = tmpRoot;
  process.env.MAIN_DOMAIN = 'example.com';
  process.env.NGINX_AVAILABLE_DIR = tmpNginxAvailable;
  process.env.NGINX_ENABLED_DIR = tmpNginxEnabled;
  process.env.SSL_CERT_DIR = tmpCertDir;
  process.env.SSL_KEY_DIR = tmpKeyDir;
  process.env.SKIP_NGINX_PROVISION = 'true';

  const testSlug = 'royal-traders-and-hardware';
  const sourcePath = path.join(__dirname, '..', 'sites', `${testSlug}.html`);

  if (!fs.existsSync(sourcePath)) {
    fs.writeFileSync(sourcePath, '<html><head><title>Test</title></head><body>Test Site</body></html>', 'utf-8');
  }

  // Test 1: Subdomain generated from business name
  const result1 = await deployToDomainFolder({
    slug: testSlug,
    businessName: 'Mediterranean Foods Trattoria & Deli, Newtown',
    sourceHtmlPath: sourcePath
  });

  if (result1.subdomain !== 'mediterranean-foods') {
    throw new Error(`Expected subdomain 'mediterranean-foods', got '${result1.subdomain}'`);
  }

  if (!fs.existsSync(result1.targetHtmlPath)) {
    throw new Error(`Target HTML file not found at ${result1.targetHtmlPath}`);
  }

  console.log(`  ✔ Successfully deployed business site to ${result1.targetHtmlPath}`);

  // Test 2: Full domain explicit input case (shop.example.com)
  const result2 = await deployToDomainFolder({
    slug: testSlug,
    businessName: 'Custom Shop',
    domainInput: 'shop.example.com',
    sourceHtmlPath: sourcePath
  });

  if (result2.fqdn !== 'shop.example.com' || result2.subdomain !== 'shop') {
    throw new Error(`Expected FQDN 'shop.example.com', got '${result2.fqdn}'`);
  }

  if (!fs.existsSync(result2.targetHtmlPath)) {
    throw new Error(`Target HTML file for shop.example.com not found at ${result2.targetHtmlPath}`);
  }

  console.log(`  ✔ Successfully deployed explicit FQDN site to ${result2.targetHtmlPath}`);

  // Cleanup tmp test directory
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

async function run() {
  try {
    await testSubdomainExtraction();
    await testDeployment();
    console.log('\nAll tests passed successfully!');
  } catch (err) {
    console.error('\n✖ Test failed:', err);
    process.exit(1);
  }
}

run();
