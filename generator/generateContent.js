import fetch from 'node-fetch';
import { recordAiRequest } from './apiUsageTracker.js';

/**
 * Generates compelling website copy using Gemini 1.5 Flash.
 * @param {Object} data - Business data from fetchBusiness
 * @returns {Promise<Object>} Polished AI website copy
 */
export async function generateContent(data) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const err = new Error('GEMINI_API_KEY is not configured. Please add your Gemini API key in .env');
    err.code = 'GEMINI_ERROR';
    throw err;
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  console.log(`[generateContent] Calling ${modelName} with key (${apiKey.length} chars) for: ${data.name}`);

  const hoursStr = Array.isArray(data.hours) && data.hours.length > 0
    ? data.hours.map(h => `${h.day}: ${h.hours}`).join(', ')
    : 'Not provided';

  const reviewsStr = Array.isArray(data.reviews) && data.reviews.length > 0
    ? data.reviews.map(r => `  "${r.text}" — ${r.author}, ${r.rating} stars`).join('\n')
    : '  No reviews available';

  const prompt = `
You are an expert copywriter who creates compelling website content for local businesses.
Based on the following real business data extracted from Google My Business, generate website content.

BUSINESS DATA:
- Name: ${data.name}
- Category: ${data.category}
- Rating: ${data.rating} stars from ${data.reviewCount} reviews
- Address: ${data.address}
- Phone: ${data.phone || 'Not provided'}
- Website: ${data.website || 'Not provided'}
- Description (from owner): ${data.description || 'Not provided'}
- Hours: ${hoursStr}
- Highlights/Features: ${data.highlights?.join(', ') || 'Not provided'}
- Sample customer reviews: 
${reviewsStr}

Generate ONLY a valid JSON object (no markdown, no backticks, no explanation) with this exact structure:

{
  "heroHeadline": "A punchy, benefit-focused headline under 10 words. Must be specific to this business and category. Do NOT use generic phrases like 'Your trusted partner' or 'Excellence in service'.",
  
  "heroSubheadline": "One sentence (max 20 words) that describes who they serve and what makes them stand out. Mention the city if known from address.",
  
  "aboutTitle": "Short heading for the About section (4-6 words max)",
  
  "aboutText": "2-3 sentences about this business. Include the category, location context, rating if it's 4.0 or above, and any specific details from the owner description. Write in second-person ('Your search for...' or 'At [Name]...'). Do not invent services or claims not supported by the data.",
  
  "servicesTitle": "Short heading for the Services section (3-5 words max)",
  
  "services": [
    "Service or feature 1 — derive from category and highlights only",
    "Service or feature 2",
    "Service or feature 3",
    "Service or feature 4"
  ],
  
  "ctaPrimary": "Call-to-action button text (2-4 words, verb first, e.g. 'Book Appointment', 'Call Now', 'Get a Quote')",
  
  "ctaSecondary": "Secondary CTA button text (2-4 words, e.g. 'View on Maps', 'See Reviews')",
  
  "seoTitle": "Page title tag: [Business Name] — [Category] in [City] | [1-3 word tagline] (max 60 chars total)",
  
  "seoDescription": "Meta description: What this business does, where it is, and why to choose them. 140-155 characters. Include city and category naturally.",
  
  "colorScheme": "Based on the business category, suggest ONE of these color schemes: 'medical' (clean blue-white), 'food' (warm amber-red), 'legal' (deep navy-gold), 'beauty' (soft rose-cream), 'automotive' (bold orange-dark), 'education' (fresh green-white), 'retail' (vibrant purple-white), 'generic' (professional teal-white). Return only the scheme name."
}

Rules:
- heroHeadline must be unique to this specific business — not reusable by any other business
- Do NOT use em dashes (—) in heroHeadline or heroSubheadline
- services array must have exactly 4 items
- All text must be in English
- Return ONLY the JSON object, nothing else
`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 600,
      responseMimeType: "application/json"
    }
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
  } catch (netErr) {
    const err = new Error(`Failed to connect to Gemini API: ${netErr.message}`);
    err.code = 'GEMINI_ERROR';
    throw err;
  }

  if (!response.ok) {
    const statusText = await response.text();
    let parsedErr = statusText;
    try {
      const errObj = JSON.parse(statusText);
      parsedErr = errObj.error?.message || statusText;
    } catch (_) {}

    const err = new Error(`Gemini API error (${response.status}): ${parsedErr}`);
    if (response.status === 429 || parsedErr.toLowerCase().includes('quota') || parsedErr.toLowerCase().includes('rate limit')) {
      err.code = 'RATE_LIMIT';
    } else {
      err.code = 'GEMINI_ERROR';
    }
    throw err;
  }

  const result = await response.json();
  recordAiRequest();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    const err = new Error('Gemini API returned an empty response.');
    err.code = 'GEMINI_ERROR';
    throw err;
  }

  let aiContent;
  try {
    // Clean potential markdown wrappers if any leaked despite responseMimeType
    const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    aiContent = JSON.parse(cleanText);
  } catch (parseErr) {
    console.warn(`[generateContent] JSON parse warning: ${parseErr.message}. Attempting fallback structure.`);
    aiContent = {};
  }

  const validColorSchemes = ['medical', 'food', 'legal', 'beauty', 'automotive', 'education', 'retail', 'generic'];
  const rawScheme = (aiContent.colorScheme || '').toLowerCase().trim();
  const colorScheme = validColorSchemes.includes(rawScheme) ? rawScheme : 'generic';

  const cityPart = data.address?.split(',')?.slice(-3, -1)?.join(' ')?.trim() || 'the local community';

  return {
    heroHeadline: (aiContent.heroHeadline || `Welcome to ${data.name}`).replace(/—/g, '-'),
    heroSubheadline: (aiContent.heroSubheadline || `Dedicated to delivering premier ${data.category} in ${cityPart}.`).replace(/—/g, '-'),
    aboutTitle: aiContent.aboutTitle || 'About Us',
    aboutText: aiContent.aboutText || data.description || `Welcome to ${data.name}. We are proud to provide top-rated ${data.category} services to our valued clients.`,
    servicesTitle: aiContent.servicesTitle || 'What We Offer',
    services: (Array.isArray(aiContent.services) && aiContent.services.length === 4)
      ? aiContent.services
      : ['Quality Service', 'Professional Team', 'Customer Satisfaction', 'Trusted Experience'],
    ctaPrimary: aiContent.ctaPrimary || (data.phone ? 'Call Now' : 'Contact Us'),
    ctaSecondary: aiContent.ctaSecondary || 'View on Maps',
    seoTitle: aiContent.seoTitle || `${data.name} — ${data.category}`,
    seoDescription: aiContent.seoDescription || `${data.name} is a premier ${data.category} provider located at ${data.address}.`,
    colorScheme
  };
}
