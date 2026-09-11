// scripts/deploy-site.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { deployToDomainFolder } from '../generator/domainUtils.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const args = process.argv.slice(2);
  const slug = args[0];
  const domainInput = args[1];

  if (!slug) {
    console.error('Usage: node scripts/deploy-site.js <slug> [domainOrSubdomain]');
    process.exit(1);
  }

  const sitesDir = path.join(__dirname, '..', 'sites');
  const sourceHtmlPath = path.join(sitesDir, slug.endsWith('.html') ? slug : `${slug}.html`);

  if (!fs.existsSync(sourceHtmlPath)) {
    console.error(`Error: Source HTML file not found at ${sourceHtmlPath}`);
    process.exit(1);
  }

  let businessName = slug;
  try {
    const html = fs.readFileSync(sourceHtmlPath, 'utf-8');
    const titleMatch = html.match(/<div class="nav-brand">([^<]+)<\/div>/i) || html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      businessName = titleMatch[1].split('—')[0].split('|')[0].trim();
    }
  } catch (_) {}

  console.log(`Deploying site '${slug}' for '${businessName}'...`);

  try {
    const result = await deployToDomainFolder({
      slug,
      businessName,
      domainInput,
      sourceHtmlPath
    });

    console.log(`\n✔ Deployment complete!`);
    console.log(`  FQDN:         ${result.fqdn}`);
    console.log(`  Target path:  ${result.targetHtmlPath}`);
    console.log(`  Provisioned:  ${result.provisioned ? 'Yes (via ngaw-domain)' : 'No (created folder directly)'}`);
    if (result.ngawError) {
      console.log(`  Notice:       ngaw-domain notice: ${result.ngawError}`);
    }
    console.log(`  Live URL:     ${result.liveUrl}\n`);
  } catch (err) {
    console.error(`\n✖ Deployment failed: ${err.message}`);
    process.exit(1);
  }
}

main();
