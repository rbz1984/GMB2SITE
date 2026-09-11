import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { buildSite } from '../generator/buildSite.js';
import { slugify } from '../generator/slugify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const demoBiz = {
  name: 'Sharma Dental Clinic',
  rating: 4.8,
  reviewCount: 247,
  category: 'Dentist',
  address: '123 MG Road, Vadodara, Gujarat 390001',
  phone: '+91 98765 43210',
  website: 'https://sharmadental.example.com',
  description: 'Sharma Dental Clinic provides compassionate, high-tech dental care for families in Vadodara.',
  hours: [
    { day: 'Monday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Tuesday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Thursday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Friday', hours: '9:00 AM – 7:00 PM' },
    { day: 'Saturday', hours: '9:00 AM – 5:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ],
  coordinates: { lat: 22.3072, lng: 73.1812 },
  photos: [
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600',
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600'
  ],
  thumbnail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600',
  reviews: [
    { author: 'Priya Shah', rating: 5, text: 'Dr. Sharma and the staff are outstanding! Pain-free root canal treatment.', date: '2 months ago' },
    { author: 'Amit Patel', rating: 5, text: 'Clean clinic, modern equipment, and very polite demeanor.', date: '3 months ago' },
    { author: 'Neha Joshi', rating: 5, text: 'Best dental clinic in Vadodara. Highly recommend for cosmetic dentistry!', date: '4 months ago' }
  ],
  placeId: 'ChIJp4JiUCNP0xQR1JaSjpW_Hms'
};

const demoAi = {
  heroHeadline: 'Advanced Dental Care for Confident Smiles',
  heroSubheadline: 'Modern, gentle family dentistry in Vadodara with over 15 years of trusted experience.',
  aboutTitle: 'About Sharma Dental Clinic',
  aboutText: 'At Sharma Dental Clinic, we combine cutting-edge dental technology with a gentle, patient-focused approach. Rated 4.8 stars by our Vadodara community, our team is dedicated to stress-free dental visits.',
  servicesTitle: 'Comprehensive Dental Services',
  services: [
    'Cosmetic Smile Makeovers',
    'Painless Root Canal Therapy',
    'Precision Dental Implants',
    'Preventive & Family Dentistry'
  ],
  ctaPrimary: 'Book Appointment',
  ctaSecondary: 'View on Maps',
  seoTitle: 'Sharma Dental Clinic — Dentist in Vadodara | Gentle Family Care',
  seoDescription: 'Sharma Dental Clinic offers premier dental services in Vadodara including implants, cosmetic dentistry, and gentle root canals. Rated 4.8 stars.',
  colorScheme: 'medical'
};

const html = buildSite(demoBiz, demoAi);
const slug = 'sharma-dental-clinic-vadodara';
const targetPath = path.join(__dirname, '..', 'sites', `${slug}.html`);
fs.writeFileSync(targetPath, html, 'utf-8');
console.log('Sample site written to:', targetPath);

async function verifySiteAccess() {
  const res = await fetch(`http://localhost:3000/sites/${slug}`);
  console.log(`GET /sites/${slug} response status:`, res.status);
  if (res.status !== 200) throw new Error('Failed to retrieve site');
  const body = await res.text();
  console.log(`Retrieved site HTML bytes: ${body.length}`);

  const sitesRes = await fetch('http://localhost:3000/api/sites');
  const sitesData = await sitesRes.json();
  console.log('GET /api/sites now contains:', sitesData.sites);
  if (!sitesData.sites.some(s => s.slug === slug)) {
    throw new Error('Site not found in /api/sites listing');
  }
  console.log('Site generation and serving verified successfully!');
}

verifySiteAccess().catch(err => {
  console.error(err);
  process.exit(1);
});
