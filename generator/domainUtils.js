// generator/domainUtils.js
import fs from 'fs';
import path from 'path';
import { exec, execFile } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

export function extractSubdomain(businessName = '') {
  const cleanName = businessName.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  const firstTwo = words.slice(0, 2).join('-');
  
  const subdomain = firstTwo.toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return subdomain || 'site';
}

export function getFqdn(businessName, customSubdomain = null) {
  const mainDomain = process.env.MAIN_DOMAIN || 'pagepilot.sites';
  const subdomain = customSubdomain || extractSubdomain(businessName);
  return {
    subdomain,
    mainDomain,
    fqdn: `${subdomain}.${mainDomain}`
  };
}

export function getDocrootPath(domain, subdomain) {
  const webRootBase = process.env.WEB_ROOT_BASE || '/var/www';
  return path.join(webRootBase, domain, subdomain, 'public');
}

export function compileSiteForDomain(html, fqdn) {
  const liveUrl = `https://${fqdn}`;
  const canonicalTag = `<link rel="canonical" href="${liveUrl}/">`;
  const ogUrlTag = `<meta property="og:url" content="${liveUrl}/">`;

  let updated = html;
  if (updated.includes('</head>')) {
    updated = updated.replace('</head>', `  ${canonicalTag}\n  ${ogUrlTag}\n</head>`);
  } else {
    updated = `${canonicalTag}\n${ogUrlTag}\n${updated}`;
  }
  return updated;
}

export async function createCloudflareARecord({ fqdn, domain }) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const ip = process.env.CLOUDFLARE_DEFAULT_IP;

  if (!token || !ip) {
    return { success: false, dnsCreated: false, error: 'CLOUDFLARE_API_TOKEN or CLOUDFLARE_DEFAULT_IP missing' };
  }

  try {
    const zonesRes = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${domain}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const zonesData = await zonesRes.json();
    if (!zonesData.success || !zonesData.result || zonesData.result.length === 0) {
      return { success: false, dnsCreated: false, error: `Cloudflare zone not found for ${domain}` };
    }

    const zoneId = zonesData.result[0].id;

    const recordsRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${fqdn}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const recordsData = await recordsRes.json();
    if (recordsData.success && recordsData.result && recordsData.result.length > 0) {
      return { success: true, dnsCreated: true, existing: true, record: recordsData.result[0] };
    }

    const createRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'A',
        name: fqdn,
        content: ip,
        ttl: 1,
        proxied: true
      })
    });

    const createData = await createRes.json();
    if (createData.success) {
      return { success: true, dnsCreated: true, record: createData.result };
    } else {
      return { success: false, dnsCreated: false, error: createData.errors?.[0]?.message || 'Failed to create A record' };
    }

  } catch (err) {
    return { success: false, dnsCreated: false, error: err.message };
  }
}

export async function deployToDomainFolder({ slug, businessName, domainInput, sourceHtmlPath }) {
  const mainDomain = process.env.MAIN_DOMAIN || 'pagepilot.sites';
  const webRootBase = process.env.WEB_ROOT_BASE || '/var/www';
  const webUser = process.env.WEB_USER || 'www-data';

  const nginxAvailableDir = process.env.NGINX_AVAILABLE_DIR || '/etc/nginx/sites-available';
  const nginxEnabledDir = process.env.NGINX_ENABLED_DIR || '/etc/nginx/sites-enabled';
  const sslCertDir = process.env.SSL_CERT_DIR || '/etc/ssl/certs';
  const sslKeyDir = process.env.SSL_KEY_DIR || '/etc/ssl/private';
  const skipNginx = process.env.SKIP_NGINX_PROVISION === 'true';

  let fqdn = '';
  let sub = '';
  let dom = '';

  if (domainInput && domainInput.includes('.')) {
    fqdn = domainInput.trim().toLowerCase();
    const parts = fqdn.split('.');
    sub = parts.length > 2 ? parts[0] : 'www';
    dom = parts.length > 2 ? parts.slice(1).join('.') : fqdn;
  } else {
    sub = domainInput ? domainInput.trim().toLowerCase() : extractSubdomain(businessName);
    dom = mainDomain;
    fqdn = `${sub}.${dom}`;
  }

  const docroot = path.join(webRootBase, dom, sub, 'public');

  if (!fs.existsSync(docroot)) {
    fs.mkdirSync(docroot, { recursive: true });
  }

  const rawHtml = fs.readFileSync(sourceHtmlPath, 'utf-8');
  const compiledHtml = compileSiteForDomain(rawHtml, fqdn);

  const targetHtmlPath = path.join(docroot, 'index.html');
  fs.writeFileSync(targetHtmlPath, compiledHtml, 'utf-8');

  try {
    await execFileAsync('chown', ['-R', `${webUser}:${webUser}`, docroot]);
  } catch (_) {}

  let provisioned = false;
  let certCreated = false;
  let vhostPath = null;
  let provisionError = null;

  if (!skipNginx) {
    try {
      if (!fs.existsSync(sslCertDir)) fs.mkdirSync(sslCertDir, { recursive: true });
      if (!fs.existsSync(sslKeyDir)) fs.mkdirSync(sslKeyDir, { recursive: true });
      if (!fs.existsSync(nginxAvailableDir)) fs.mkdirSync(nginxAvailableDir, { recursive: true });
      if (!fs.existsSync(nginxEnabledDir)) fs.mkdirSync(nginxEnabledDir, { recursive: true });

      const certPath = path.join(sslCertDir, `${fqdn}-selfsigned.crt`);
      const keyPath = path.join(sslKeyDir, `${fqdn}-selfsigned.key`);

      if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        await execFileAsync('openssl', [
          'req', '-x509', '-nodes',
          '-newkey', 'rsa:2048',
          '-days', '3650',
          '-subj', `/CN=${fqdn}`,
          '-out', certPath,
          '-keyout', keyPath
        ]);
        certCreated = true;
      }

      vhostPath = path.join(nginxAvailableDir, `${fqdn}.conf`);
      const vhostConfig = `server {
    listen 80;
    listen [::]:80;
    server_name ${fqdn};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${fqdn};

    root ${docroot};
    index index.html;

    ssl_certificate ${certPath};
    ssl_certificate_key ${keyPath};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    access_log /var/log/nginx/${fqdn}.access.log json_logs;
    error_log /var/log/nginx/${fqdn}.error.log;

    location / {
        try_files \$uri \$uri/ =404;
    }

    location ~ /\. {
        deny all;
    }
}
`;

      fs.writeFileSync(vhostPath, vhostConfig, 'utf-8');

      const enabledPath = path.join(nginxEnabledDir, `${fqdn}.conf`);
      if (!fs.existsSync(enabledPath)) {
        try {
          fs.symlinkSync(vhostPath, enabledPath);
        } catch (err) {
          if (err.code !== 'EEXIST') throw err;
        }
      }

      await execFileAsync('nginx', ['-t']);
      const reloadCmd = process.env.NGINX_RELOAD_CMD || 'systemctl reload nginx';
      await execAsync(reloadCmd);
      provisioned = true;

    } catch (err) {
      provisionError = err.stderr ? `${err.message}\n${err.stderr}` : err.message;
      console.error(`[nginx-provision] Error for ${fqdn}:`, provisionError);
    }
  }

  const dnsResult = await createCloudflareARecord({ fqdn, domain: dom });

  return {
    success: true,
    fqdn,
    domain: dom,
    subdomain: sub,
    docroot,
    targetHtmlPath,
    provisioned,
    certCreated,
    vhostPath,
    provisionError,
    dnsCreated: dnsResult.dnsCreated || false,
    dnsResult,
    liveUrl: `https://${fqdn}`
  };
}
