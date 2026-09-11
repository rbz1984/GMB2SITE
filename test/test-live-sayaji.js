import { fetchBusiness } from '../generator/fetchBusiness.js';
import { generateContent } from '../generator/generateContent.js';
import { buildSite } from '../generator/buildSite.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('Fetching live business details for Sayaji Hotel...');
  const businessData = await fetchBusiness('1086297578059229384');
  console.log('Live Business Data fetched:');
  console.log('- Name:', businessData.name);
  console.log('- Rating:', businessData.rating, '(', businessData.reviewCount, 'reviews)');
  console.log('- Photos count:', businessData.photos?.length);
  console.log('- Check-in:', businessData.checkInTime);
  console.log('- Check-out:', businessData.checkOutTime);
  console.log('- Amenities count:', businessData.amenities?.length);

  console.log('Generating AI copy with Flash Lite...');
  const aiContent = await generateContent(businessData);

  console.log('Compiling HTML website with user UX design...');
  const html = buildSite(businessData, aiContent);

  const targetPath = path.join(__dirname, '..', 'sites', 'sayaji-hotel-vadodara-vadodara-gujarat-390007.html');
  fs.writeFileSync(targetPath, html, 'utf-8');
  console.log('✅ Updated Sayaji Hotel site at:', targetPath);
}

run().catch(console.error);
