// generator/domainUtils.js
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

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

export async function deployToDomainFolder({ slug, businessName, domainInput, sourceHtmlPath }) {
  const mainDomain = process.env.MAIN_DOMAIN || 'pagepilot.sites';
  const webRootBase = process.env.WEB_ROOT_BASE || '/var/www';
  const webUser = process.env.WEB_USER || 'www-data';
  const ngawBin = process.env.NGAW_DOMAIN_BIN || 'ngaw-domain';

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

  let provisioned = false;
  let ngawError = null;

  try {
    await execFileAsync(ngawBin, [fqdn, webUser, '-y']);
    provisioned = true;
  } catch (err) {
    ngawError = err.message;
  }

  if (!fs.existsSync(docroot)) {
    fs.mkdirSync(docroot, { recursive: true });
  }

  const targetHtmlPath = path.join(docroot, 'index.html');
  fs.copyFileSync(sourceHtmlPath, targetHtmlPath);

  return {
    success: true,
    fqdn,
    domain: dom,
    subdomain: sub,
    docroot,
    targetHtmlPath,
    provisioned,
    ngawError,
    liveUrl: `https://${fqdn}`
  };
}
