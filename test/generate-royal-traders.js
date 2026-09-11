import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSite } from '../generator/buildSite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const royalBiz = {
  name: 'Royal Traders & Hardware',
  rating: 4.8,
  reviewCount: 128,
  category: 'Hardware & Industrial Supply',
  address: 'Plot 42, GIDC Industrial Estate, Makarpura, Vadodara, Gujarat 390010',
  phone: '+91 98250 12345',
  website: 'https://royalhardware.example.com',
  description: 'Royal Traders & Hardware is Vadodara\'s trusted wholesale and retail supplier for professional power tools, high-grade fasteners, industrial electrical supplies, and plumbing fixtures.',
  hours: [
    { day: 'Monday', hours: '9:00 AM – 8:00 PM' },
    { day: 'Tuesday', hours: '9:00 AM – 8:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM – 8:00 PM' },
    { day: 'Thursday', hours: '9:00 AM – 8:00 PM' },
    { day: 'Friday', hours: '9:00 AM – 8:00 PM' },
    { day: 'Saturday', hours: '9:00 AM – 8:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ],
  coordinates: { lat: 22.2543, lng: 73.1956 },
  photos: [
    'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800',
    '/fasteners-bolts.jpg',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800',
    'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800',
    'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
  ],
  thumbnail: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800',
  reviews: [
    { author: 'Rajesh Mistry', rating: 5, text: 'Best place in Makarpura GIDC for industrial power tools. Always have genuine Bosch and Makita spare parts.', date: '1 month ago' },
    { author: 'Kiran Parmar', rating: 5, text: 'Wholesale prices and very knowledgeable staff. Provided high-tensile fasteners for our fabrication unit on same-day notice.', date: '2 months ago' },
    { author: 'Snehal Desai', rating: 5, text: 'Top tier hardware store in Vadodara. Excellent quality brass fittings and electrical switches.', date: '3 months ago' }
  ],
  amenities: [
    'Wholesale Supply', 'In-store Shopping', 'Same-Day Delivery', 'Bulk Invoicing', 'Credit Cards Accepted', 'Free Parking'
  ],
  placeId: 'ChIJroyaltradersvadodara'
};

const royalAi = {
  heroHeadline: 'Premium Industrial Tools & Hardware Supplies in Vadodara',
  heroSubheadline: 'Reliable equipment, high-grade fasteners, and building supplies trusted by hundreds of contractors and industries across Gujarat.',
  aboutTitle: 'About Royal Traders & Hardware',
  aboutText: 'For over 18 years, Royal Traders & Hardware has been the trusted supply partner for heavy engineering, construction, and precision trades in Vadodara. Located in the heart of GIDC Makarpura, we stock thousands of certified tools, industrial fasteners, safety equipment, and electrical hardware at wholesale rates.',
  servicesTitle: 'Our Product Categories & Services',
  services: [
    'Heavy-Duty Power Tools & Accessories',
    'High-Tensile Fasteners, Bolts & Anchors',
    'Industrial Electricals & Safety Equipment',
    'Precision Plumbing Valves & Pipe Fittings'
  ],
  ctaPrimary: 'Call +91 98250 12345',
  ctaSecondary: 'Get Directions',
  seoTitle: 'Royal Traders & Hardware — Industrial Hardware Store in Vadodara',
  seoDescription: 'Wholesale and retail industrial hardware store in Makarpura GIDC, Vadodara. Power tools, fasteners, safety gear, and electrical fittings.',
  colorScheme: 'warm'
};

const html = buildSite(royalBiz, royalAi);
const slug = 'royal-traders-and-hardware';
const targetPath = path.join(__dirname, '..', 'sites', `${slug}.html`);
fs.writeFileSync(targetPath, html, 'utf-8');
console.log(`Generated sample site written to ${targetPath}`);
