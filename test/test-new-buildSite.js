import { buildSite } from '../generator/buildSite.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dummyBiz = {
  name: 'Sayaji Hotel Vadodara',
  rating: 4.4,
  reviewCount: 11298,
  category: 'Hotel',
  address: 'Near Bhimnath Bridge, Sayajiganj, Vadodara, Gujarat 390007',
  phone: '+91 265 247 6666',
  website: 'https://sayajihotels.com',
  description: 'Informal rooms in a hotel offering 2 restaurants, a coffee shop & a fitness centre.',
  hours: [
    { day: 'Monday', hours: 'Open 24 hours' },
    { day: 'Tuesday', hours: 'Open 24 hours' },
    { day: 'Wednesday', hours: 'Open 24 hours' }
  ],
  photos: [
    'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlcuL-d13oSDJJ9W5uqughoj4jPe63q2xgUqbDjuK8TV5FXScbKPEJpwE7cOomGnuqJoYvmfXpBXv-rc4bYdq545CAEZRqaxXAs7Am9ESfEoyXNxrFKLib4hVyx4P_-l140pYKCCHQG-Ps=w1000-h1000-c-n',
    'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWljw_JIgHJ2iJKf8FntPU1SL06_JHgQnwz5Pnih5ZFxZqnRBs44UN34AFlsOeihpTlKTVhbNbNpcGfTL_QyOWZIZoBcCjuYJa_HXOM-wUWuq74x8ovGx6znJRUrF_2ImpFuhCtWb4AP5wCW=w1000-h1000-c-n'
  ],
  thumbnail: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlcuL-d13oSDJJ9W5uqughoj4jPe63q2xgUqbDjuK8TV5FXScbKPEJpwE7cOomGnuqJoYvmfXpBXv-rc4bYdq545CAEZRqaxXAs7Am9ESfEoyXNxrFKLib4hVyx4P_-l140pYKCCHQG-Ps=w1000-h1000-c-n',
  reviews: [
    { author: 'Chhavi Goel', rating: 5, text: 'Fantastic experience! The staff was very courteous.', date: 'a month ago' }
  ],
  placeId: 'ChIJAQAAQK3IXzkRyGiWTORNEw8'
};

const dummyAi = {
  heroHeadline: 'Luxury & Comfort in the Heart of Vadodara',
  heroSubheadline: 'Award-winning hospitality, fine dining restaurants and premium rooms.',
  aboutTitle: 'About Sayaji Hotel',
  aboutText: 'Sayaji Hotel Vadodara provides 5-star hospitality with world-class dining, modern fitness amenities, and luxurious rooms in Sayajiganj.',
  servicesTitle: 'Signature Amenities',
  services: [
    '2 Multi-Cuisine Restaurants',
    '24/7 Room Service',
    'Modern Fitness & Spa',
    'Banquet & Wedding Halls'
  ],
  ctaPrimary: 'Call Now',
  ctaSecondary: 'View on Maps',
  seoTitle: 'Sayaji Hotel Vadodara — Luxury Hotel',
  seoDescription: 'Sayaji Hotel Vadodara offers premier hospitality.',
  colorScheme: 'food'
};

const html = buildSite(dummyBiz, dummyAi);

// Re-write sayaji-hotel-vadodara-vadodara-gujarat-390007.html with the new buildSite code
const targetPath = path.join(__dirname, '..', 'sites', 'sayaji-hotel-vadodara-vadodara-gujarat-390007.html');
fs.writeFileSync(targetPath, html, 'utf-8');
console.log('Successfully compiled Sayaji Hotel with new buildSite.js to:', targetPath);
