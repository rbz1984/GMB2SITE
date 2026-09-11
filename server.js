import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import crypto from 'crypto';

import { fetchBusiness } from './generator/fetchBusiness.js';
import { generateContent } from './generator/generateContent.js';
import { buildSite } from './generator/buildSite.js';
import { slugify } from './generator/slugify.js';
import { getUsageData } from './generator/apiUsageTracker.js';
import { deployToDomainFolder, extractSubdomain } from './generator/domainUtils.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SITES_DIR = path.join(__dirname, 'sites');

if (!fs.existsSync(SITES_DIR)) {
  fs.mkdirSync(SITES_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Resolves a potentially shortened Google Maps URL to its final destination URL.
 */
async function resolveRedirect(rawUrl) {
  try {
    const res = await fetch(rawUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    return res.url || rawUrl;
  } catch (err) {
    console.warn(`[resolveRedirect] Could not follow redirect for ${rawUrl}:`, err.message);
    return rawUrl;
  }
}

/**
 * Extracts Place ID, data_cid, or data from input string (URL, Place ID, or CID).
 */
async function parsePlaceInput(input) {
  const trimmed = input.trim();

  // 1. Direct Place ID starting with ChIJ
  if (/^ChIJ[a-zA-Z0-9_-]{15,}$/.test(trimmed)) {
    return { place_id: trimmed };
  }

  // 2. Direct decimal CID (large integer)
  if (/^\d{10,}$/.test(trimmed)) {
    return { data_cid: trimmed };
  }

  // 3. Direct hex data_id (0x...:0x...)
  if (/^0x[0-9a-fA-F]+:0x[0-9a-fA-F]+$/.test(trimmed)) {
    const parts = trimmed.split(':');
    try {
      return { data_cid: BigInt(parts[1]).toString() };
    } catch (_) {
      return { data: trimmed };
    }
  }

  // 4. URL format
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    let targetUrl = trimmed;

    // Follow shortened link redirects like maps.app.goo.gl or goo.gl/maps
    if (trimmed.includes('goo.gl') || trimmed.includes('page.link') || trimmed.includes('maps.app')) {
      targetUrl = await resolveRedirect(trimmed);
      console.log(`[parsePlaceInput] Resolved redirect to: ${targetUrl}`);
    }

    // Check query params: place_id, cid, ftid
    try {
      const parsed = new URL(targetUrl);
      const queryPlaceId = parsed.searchParams.get('place_id');
      if (queryPlaceId && queryPlaceId.startsWith('ChIJ')) {
        return { place_id: queryPlaceId };
      }
      const queryCid = parsed.searchParams.get('cid');
      if (queryCid && /^\d+$/.test(queryCid)) {
        return { data_cid: queryCid };
      }
      const queryFtid = parsed.searchParams.get('ftid');
      if (queryFtid && queryFtid.includes(':')) {
        const parts = queryFtid.split(':');
        try {
          return { data_cid: BigInt(parts[1]).toString() };
        } catch (_) {}
      }
    } catch (_) {}

    // Check for ChIJ pattern anywhere in URL
    const chijMatch = targetUrl.match(/(ChIJ[a-zA-Z0-9_-]{15,})/);
    if (chijMatch) {
      return { place_id: chijMatch[1] };
    }

    // Check for primary business entity pattern !1s0x...:0x[hexCid]
    const specificEntityMatch = targetUrl.match(/!1s0x[0-9a-fA-F]+:(0x[0-9a-fA-F]+)/);
    if (specificEntityMatch) {
      try {
        const decCid = BigInt(specificEntityMatch[1]).toString();
        return { data_cid: decCid };
      } catch (_) {}
    }

    // Check for any hex data_id pattern (0x...:0x[hexCid])
    const dataIdMatch = targetUrl.match(/0x[0-9a-fA-F]+:(0x[0-9a-fA-F]+)/);
    if (dataIdMatch) {
      try {
        const decCid = BigInt(dataIdMatch[1]).toString();
        return { data_cid: decCid };
      } catch (_) {}
    }

    // Check for /data=!3m... or data query parameter
    const dataParamMatch = targetUrl.match(/\/data=(![0-9a-zA-Z!_:-]+)/);
    if (dataParamMatch) {
      return { data: dataParamMatch[1] };
    }
  }

  return null;
}

/**
 * Helper to generate an available, collision-free slug.
 */
function getUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  while (fs.existsSync(path.join(SITES_DIR, `${slug}.html`))) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
}

// ── ADMIN AUTHENTICATION HELPERS & MIDDLEWARE ──
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin@pagepilot.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@PagePilot2026!';
const SESSION_SECRET = process.env.SESSION_SECRET || 'pagepilot-secure-admin-secret-2026';

function signToken(payload) {
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadStr)
    .digest('base64url');
  return `${payloadStr}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadStr, signature] = token.split('.');
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadStr)
    .digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function getAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.headers['x-admin-token']) {
    return req.headers['x-admin-token'];
  }
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/admin_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

function requireAdmin(req, res, next) {
  const token = getAuthToken(req);
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Admin access required.',
      code: 'UNAUTHORIZED'
    });
  }
  req.user = user;
  next();
}

// ── ROUTES ──

// POST /api/auth/login -> Authenticate admin
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required.'
    });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const configuredUser = ADMIN_USERNAME.toLowerCase();
  const validUser = (cleanUser === configuredUser || cleanUser === 'admin');
  const validPass = (String(password) === ADMIN_PASSWORD);

  if (!validUser || !validPass) {
    return res.status(401).json({
      success: false,
      error: 'Invalid login credentials. Please check your username and password.'
    });
  }

  // Token valid for 7 days
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = signToken({
    username: ADMIN_USERNAME,
    role: 'admin',
    exp
  });

  // Set HTTP cookie as well
  res.cookie('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({
    success: true,
    token,
    user: {
      username: ADMIN_USERNAME,
      name: 'Administrator',
      role: 'admin'
    }
  });
});

// GET /api/auth/me -> Verify active authentication status
app.get('/api/auth/me', (req, res) => {
  const token = getAuthToken(req);
  const user = verifyToken(token);

  if (!user || user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Not authenticated or session expired'
    });
  }

  return res.json({
    success: true,
    authenticated: true,
    user: {
      username: user.username,
      name: 'Administrator',
      role: 'admin'
    }
  });
});

// POST /api/auth/logout -> Log out current admin
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    sameSite: 'lax'
  });
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// GET /api/image-proxy -> Proxies external images without referrer issues
app.get('/api/image-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing image url');

  try {
    const imgRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!imgRes.ok) {
      return res.status(imgRes.status).send('Failed to fetch remote image');
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    imgRes.body.pipe(res);
  } catch (err) {
    res.status(500).send('Error proxying image');
  }
});

// GET / -> Serves landing page UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET /dashboard -> Serves dashboard UI directly
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET /sites/:slug -> Serves generated static site
app.get('/sites/:slug', (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(SITES_DIR, `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Site Not Found - PagePilot</title><style>body{font-family:sans-serif;background:#0f1117;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;}a{color:#0ea5e9;}</style></head>
      <body>
        <h2>404 - Website Not Found</h2>
        <p>No generated site found at /sites/${slug}</p>
        <p><a href="/">← Back to PagePilot Dashboard</a></p>
      </body>
      </html>
    `);
  }

  res.sendFile(filePath);
});

// GET /api/status -> API key availability check
app.get('/api/status', (req, res) => {
  res.json({
    serpapi: Boolean(process.env.SERPAPI_KEY && process.env.SERPAPI_KEY !== 'your_serpapi_key_here'),
    googleMapsEmbed: Boolean(process.env.GOOGLE_MAPS_EMBED_KEY && process.env.GOOGLE_MAPS_EMBED_KEY !== 'your_google_maps_embed_key_here'),
    gemini: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')
  });
});

// GET /api/config -> System & domain configuration check
app.get('/api/config', (req, res) => {
  res.json({
    mainDomain: process.env.MAIN_DOMAIN || 'pagepilot.sites',
    webRootBase: process.env.WEB_ROOT_BASE || '/var/www',
    cloudflareConfigured: Boolean(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_DEFAULT_IP)
  });
});

// GET /api/admin/usage -> Fetch live API usage for SerpAPI & Google AI Studio (Protected)
app.get('/api/admin/usage', requireAdmin, async (req, res) => {
  try {
    const serpKey = process.env.SERPAPI_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

    // 1. Fetch live SerpAPI account data
    let serpData = {
      status: serpKey ? 'Active' : 'Unconfigured',
      planName: 'Free Plan',
      searchesPerMonth: 250,
      searchesLeft: 250,
      usedThisMonth: 0,
      percentUsed: 0,
      accountEmail: 'Connected',
      renewalDate: 'Monthly Reset',
      rateLimitPerHour: 250
    };

    if (serpKey && serpKey !== 'your_serpapi_key_here') {
      try {
        const serpRes = await fetch(`https://serpapi.com/account?api_key=${encodeURIComponent(serpKey)}`);
        if (serpRes.ok) {
          const acc = await serpRes.json();
          const limit = acc.searches_per_month || 250;
          const left = acc.plan_searches_left ?? acc.total_searches_left ?? 250;
          const used = acc.this_month_usage ?? Math.max(0, limit - left);
          const percent = Math.min(100, Math.round((used / limit) * 100 * 10) / 10);

          serpData = {
            status: acc.account_status || 'Active',
            planName: acc.plan_name || 'Free Plan',
            searchesPerMonth: limit,
            searchesLeft: left,
            usedThisMonth: used,
            percentUsed: percent,
            accountEmail: acc.account_email || 'Connected',
            renewalDate: acc.plan_renewal_date || 'Monthly',
            rateLimitPerHour: acc.account_rate_limit_per_hour || 250
          };
        }
      } catch (serpErr) {
        console.warn('[usage] Could not fetch live SerpAPI account info:', serpErr.message);
      }
    }

    // 2. Fetch Google AI Studio (Gemini) Usage & Limits
    const geminiUsage = getUsageData();
    const geminiDailyLimit = 1500; // Standard Free Tier limit for Gemini Flash / Flash-Lite models
    const geminiRpmLimit = 15; // 15 Requests Per Minute
    const geminiTpmLimit = '1,000,000'; // 1,000,000 Tokens Per Minute
    const geminiUsedToday = geminiUsage.requestsToday || 0;
    const geminiLeftToday = Math.max(0, geminiDailyLimit - geminiUsedToday);
    const geminiPercent = Math.min(100, Math.round((geminiUsedToday / geminiDailyLimit) * 100 * 10) / 10);

    const geminiData = {
      status: geminiKey && geminiKey !== 'your_gemini_api_key_here' ? 'Active' : 'Unconfigured',
      model: geminiModel,
      tierName: 'Google AI Studio Free Tier',
      dailyLimit: geminiDailyLimit,
      requestsToday: geminiUsedToday,
      remainingToday: geminiLeftToday,
      percentUsed: geminiPercent,
      rpmLimit: geminiRpmLimit,
      tpmLimit: geminiTpmLimit,
      resetSchedule: '00:00 UTC (Daily Reset)',
      lifetimeRequests: geminiUsage.lifetimeRequests || 0,
      lastRequestTime: geminiUsage.lastRequestTime || null
    };

    // 3. Count total sites in SITES_DIR
    const totalSites = fs.readdirSync(SITES_DIR).filter(f => f.endsWith('.html')).length;

    return res.json({
      success: true,
      serpapi: serpData,
      gemini: geminiData,
      summary: {
        totalSitesGenerated: totalSites,
        estimatedCost: '$0.00 / month (100% Free Tier)',
        maxSitesPerMonth: Math.floor(serpData.searchesPerMonth / 2),
        maxSitesPerDayWithAI: geminiDailyLimit
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/sites -> Lists all generated sites with rich metadata (Protected)
app.get('/api/sites', requireAdmin, (req, res) => {
  try {
    const files = fs.readdirSync(SITES_DIR)
      .filter(file => file.endsWith('.html'))
      .map(file => {
        const filePath = path.join(SITES_DIR, file);
        const stats = fs.statSync(filePath);
        const slug = file.replace('.html', '');
        
        let name = slug;
        let category = 'Local Business';
        let thumbnail = null;

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const titleMatch = content.match(/<div class="nav-brand">([^<]+)<\/div>/i) || content.match(/<title>([^<]+)<\/title>/i);
          if (titleMatch) {
            name = titleMatch[1].split('—')[0].split('|')[0].trim();
          }
          const catMatch = content.match(/class="badge"[^>]*>([^<]+)<\/div>/i) || content.match(/class="hero-category"[^>]*>([^<]+)<\/span>/i);
          if (catMatch) {
            category = catMatch[1].replace(/✦/g, '').trim();
          }
          const imgMatch = content.match(/<img[^>]+src="([^">]+)"[^>]*class="[^"]*hero[^"]*"/i) || content.match(/<img[^>]+src="([^">]+)"/i);
          if (imgMatch) {
            thumbnail = imgMatch[1];
          }
        } catch (_) {}

        return {
          slug,
          name,
          category,
          thumbnail,
          status: 'Published',
          url: `/sites/${slug}`,
          createdAt: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ sites: files });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/sites/:slug -> Get site content for Editor (Protected)
app.get('/api/sites/:slug', requireAdmin, (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(SITES_DIR, `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Site not found' });
  }

  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    let name = slug;
    const titleMatch = html.match(/<div class="nav-brand">([^<]+)<\/div>/i) || html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      name = titleMatch[1].split('—')[0].split('|')[0].trim();
    }
    res.json({ success: true, slug, name, html });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/sites/:slug/save -> Save edits from Editor (Protected)
app.post('/api/sites/:slug/save', requireAdmin, (req, res) => {
  const { slug } = req.params;
  const { html, name } = req.body;
  const filePath = path.join(SITES_DIR, `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Site not found' });
  }

  try {
    if (html && typeof html === 'string') {
      fs.writeFileSync(filePath, html, 'utf-8');
    }
    res.json({ success: true, slug, message: 'Website updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/publish -> Publish website to live custom domain / sub-domain (Protected)
app.post('/api/publish', requireAdmin, async (req, res) => {
  const { slug, domain } = req.body;
  if (!slug) {
    return res.status(400).json({ success: false, error: 'Missing slug' });
  }

  const filePath = path.join(SITES_DIR, `${slug}.html`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Site not found' });
  }

  let businessName = slug;
  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = html.match(/<div class="nav-brand">([^<]+)<\/div>/i) || html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      businessName = titleMatch[1].split('—')[0].split('|')[0].trim();
    }
  } catch (_) {}

  try {
    const result = await deployToDomainFolder({
      slug,
      businessName,
      domainInput: domain,
      sourceHtmlPath: filePath
    });

    return res.json({
      success: true,
      slug,
      publishedUrl: result.liveUrl,
      fqdn: result.fqdn,
      domain: result.domain,
      subdomain: result.subdomain,
      docroot: result.docroot,
      provisioned: result.provisioned,
      dnsCreated: result.dnsCreated,
      dnsResult: result.dnsResult,
      ssl: true,
      publishedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/generate -> Main generation endpoint
app.post('/api/generate', async (req, res) => {
  const { input } = req.body;

  if (!input || typeof input !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid Google Maps URL or Place ID.',
      code: 'INVALID_INPUT'
    });
  }

  const cleanInput = input.trim().toLowerCase();

  // Instant demo support for Royal Traders & Hardware
  if (cleanInput.includes('royal') || cleanInput === 'demo' || cleanInput.includes('chijroyal')) {
    const royalSlug = 'royal-traders-and-hardware';
    return res.json({
      success: true,
      slug: royalSlug,
      url: `/sites/${royalSlug}`,
      business: {
        name: 'Royal Traders & Hardware',
        rating: 4.8,
        reviews: 128,
        category: 'Hardware & Industrial Supply',
        address: 'Plot 42, GIDC Industrial Estate, Makarpura, Vadodara, Gujarat 390010'
      }
    });
  }

  // Step 1: Parse input
  const placeIdOrDataId = await parsePlaceInput(input);
  if (!placeIdOrDataId) {
    return res.status(400).json({
      success: false,
      error: 'Could not extract a valid Place ID or Google Maps location from the provided input.',
      code: 'INVALID_INPUT'
    });
  }

  try {
    // Step 2: Fetch business data from SerpAPI
    console.log('[generate] Step 1: Fetching business data for', placeIdOrDataId);
    const businessData = await fetchBusiness(placeIdOrDataId);

    // Step 3: Call Gemini AI to generate website copy
    console.log(`[generate] Step 2: Generating AI copy for "${businessData.name}"`);
    const aiContent = await generateContent(businessData);

    // Step 4: Build complete HTML string
    console.log(`[generate] Step 3: Assembling HTML site with ${aiContent.colorScheme} scheme`);
    const html = buildSite(businessData, aiContent);

    // Step 5: Create collision-free slug
    const baseSlug = slugify(businessData.name, businessData.address);
    const slug = getUniqueSlug(baseSlug);

    // Step 6: Write HTML to disk
    const targetPath = path.join(SITES_DIR, `${slug}.html`);
    fs.writeFileSync(targetPath, html, 'utf-8');
    console.log(`[generate] Step 4: Successfully written to ${targetPath}`);

    // Step 7: Return JSON response
    return res.json({
      success: true,
      slug,
      url: `/sites/${slug}`,
      business: {
        name: businessData.name,
        rating: businessData.rating,
        reviews: businessData.reviewCount,
        category: businessData.category,
        address: businessData.address
      }
    });

  } catch (err) {
    console.error(`[generate] Generation failed:`, err);
    const code = err.code || 'SERPAPI_ERROR';
    const status = code === 'RATE_LIMIT' ? 429 : 500;
    return res.status(status).json({
      success: false,
      error: err.message || 'An unexpected error occurred during site generation.',
      code
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 PagePilot Server running on port ${PORT}`);
  console.log(`   Dashboard: http://localhost:${PORT}`);
  console.log(`===========================================`);
});
