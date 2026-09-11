import { slugify } from '../generator/slugify.js';
import { buildSite } from '../generator/buildSite.js';

console.log('--- Testing slugify ---');
const s1 = slugify('Sharma Dental Clinic', '123 MG Road, Vadodara, Gujarat 390001');
console.log('Result slug 1:', s1);
if (!s1.startsWith('sharma-dental-clinic')) {
  throw new Error(`Unexpected slug: ${s1}`);
}

const s2 = slugify('Café & Bistro 100%!', 'Mumbai, Maharashtra');
console.log('Result slug 2:', s2);
if (s2.includes('&') || s2.includes('%') || s2.includes('!')) {
  throw new Error(`Special characters not stripped: ${s2}`);
}

console.log('--- Testing buildSite ---');
const dummyBiz = {
  name: 'Sharma Dental Clinic',
  rating: 4.7,
  reviewCount: 234,
  category: 'Dentist',
  address: '123 MG Road, Vadodara, Gujarat 390001',
  phone: '+91 98765 43210',
  website: 'https://sharmadental.com',
  description: 'Premier dental healthcare',
  hours: [{ day: 'Monday', hours: '9:00 AM – 7:00 PM' }],
  photos: ['https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600'],
  thumbnail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600',
  reviews: [{ author: 'Priya Shah', rating: 5, text: 'Amazing service!', date: '3 months ago' }],
  placeId: 'ChIJp4JiUCNP0xQR1JaSjpW_Hms'
};

const dummyAi = {
  heroHeadline: 'World-Class Smile Care in Vadodara',
  heroSubheadline: 'Gentle, modern dentistry for the entire family.',
  aboutTitle: 'About Sharma Dental',
  aboutText: 'Trusted dental team serving Vadodara with state-of-the-art procedures.',
  servicesTitle: 'Our Dental Services',
  services: ['Teeth Whitening', 'Dental Implants', 'Root Canal Therapy', 'Preventive Checkups'],
  ctaPrimary: 'Book Appointment',
  ctaSecondary: 'View on Maps',
  seoTitle: 'Sharma Dental Clinic — Dentist in Vadodara',
  seoDescription: 'Sharma Dental Clinic provides dental care in Vadodara.',
  colorScheme: 'medical'
};

const html = buildSite(dummyBiz, dummyAi);
const requiredSections = [
  'id="hero"',
  'id="about"',
  'id="gallery"',
  'id="services"',
  'id="reviews"',
  'id="hours"',
  'id="contact"',
  'id="map"',
  '<footer>',
  'World-Class Smile Care in Vadodara',
  'Sharma Dental Clinic',
  'Teeth Whitening',
  'Priya Shah'
];

for (const sec of requiredSections) {
  if (!html.includes(sec)) {
    throw new Error(`Missing expected element/section in HTML: ${sec}`);
  }
}

console.log('All buildSite assertions passed! Generated HTML length:', html.length);
console.log('All tests completed successfully!');
