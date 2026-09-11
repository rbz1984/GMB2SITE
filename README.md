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

## Host Deployment (systemd + Nginx)

PagePilot runs directly on the Linux host as a systemd service (`pagepilot.service`), allowing it to provision Nginx vhosts and SSL certificates directly to `/etc/nginx` and `/var/www`:

```ini
[Unit]
Description=PagePilot GMB Web App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/amolw.xyz/gmb2site
ExecStart=/usr/bin/node server.js
Restart=always
EnvironmentFile=/var/www/amolw.xyz/gmb2site/.env
Environment=PORT=8210

[Install]
WantedBy=multi-user.target
```

## Domain Publishing

When a site is published:
1. Subdomain is extracted from the business name (e.g. `Mediterranean Foods` → `mediterranean-foods.amolw.xyz`).
2. Public docroot is created at `/var/www/<domain>/<subdomain>/public/index.html`.
3. Nginx vhost is written to `/etc/nginx/sites-available/<fqdn>.conf` with SSL + HTTPS redirect and symlinked to `/etc/nginx/sites-enabled/`.
4. Cloudflare DNS A record is automatically created using `CLOUDFLARE_API_TOKEN` & `CLOUDFLARE_DEFAULT_IP`.


## Generated Sites

All sites are saved to the `/sites/` directory as static HTML files.
Each file is fully self-contained — no build step, no framework, no runtime needed.
