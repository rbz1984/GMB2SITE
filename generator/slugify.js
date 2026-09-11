// Create a URL-safe slug from business name and address
export function slugify(name = '', address = '') {
  const parts = address ? address.split(',') : [];
  const city = parts.length > 1 ? parts.slice(-3, -1).join(' ').trim() : '';
  const combined = `${name} ${city}`.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')            // spaces to hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '')           // trim leading/trailing hyphens
    .substring(0, 80);               // max length
  return combined || 'business-site';
}
