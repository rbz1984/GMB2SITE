# PagePilot — GMB to Website Generator

Paste a Google Maps URL or Place ID → get a live, AI-written single-page business website in seconds.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

3. Get your free API keys:
   - **SerpAPI key**: https://serpapi.com (free: 250 searches/month)
   - **Google Maps Embed API key**: https://console.cloud.google.com (enable Maps Embed API)
   - **Gemini API key**: https://aistudio.google.com (free: 1500 req/day, use `gemini-1.5-flash`)

4. Start the server:
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## How to find a Place ID

- **Option A — From a Google Maps URL:**
  Visit any business on Google Maps. Copy the URL. The app parses it automatically.
  Example: `https://maps.google.com/?cid=12345...` or `https://goo.gl/maps/...`

- **Option B — From Google Maps directly:**
  Right-click any business marker on maps.google.com → "What's here?" → copy the `place_id`.

- **Option C — Paste a Place ID directly:**
  Example: `ChIJp4JiUCNP0xQR1JaSjpW_Hms`

## API Limits (Free Tier)

| API | Free Limit | Your Usage |
|-----|-----------|------------|
| SerpAPI | 250 searches/month | 2 per site = 125 sites/month |
| Gemini 1.5 Flash | 1,500 req/day | 1 per site |
| Maps Embed API | Unlimited | 1 embed per site |
| Cloudflare Pages | Unlimited bandwidth | Hosting |

## Deploying to Cloudflare Pages

1. Push your repo to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com) → Create application → Connect to Git
3. Add all `.env` variables as Cloudflare Pages environment variables
4. Deploy — your sites will be at `your-project.pages.dev/sites/{slug}`

## Generated Sites

All sites are saved to the `/sites/` directory as static HTML files.
Each file is fully self-contained — no build step, no framework, no runtime needed.
