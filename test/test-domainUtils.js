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
  process.env.WEB_ROOT_BASE = tmpRoot;
  process.env.MAIN_DOMAIN = 'example.com';
  process.env.NGAW_DOMAIN_BIN = '/nonexistent/ngaw-domain';

  const testSlug = 'royal-traders-and-hardware';
  const sourcePath = path.join(__dirname, '..', 'sites', `${testSlug}.html`);

  if (!fs.existsSync(sourcePath)) {
    fs.writeFileSync(sourcePath, '<html><body>Test Site</body></html>', 'utf-8');
  }

  const result = await deployToDomainFolder({
    slug: testSlug,
    businessName: 'Mediterranean Foods Trattoria & Deli, Newtown',
    sourceHtmlPath: sourcePath
  });

  console.log('  Result:', result);

  if (result.subdomain !== 'mediterranean-foods') {
    throw new Error(`Expected subdomain 'mediterranean-foods', got '${result.subdomain}'`);
  }

  if (!fs.existsSync(result.targetHtmlPath)) {
    throw new Error(`Target HTML file not found at ${result.targetHtmlPath}`);
  }

  console.log(`  ✔ Successfully copied HTML to ${result.targetHtmlPath}`);

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
