const colorSchemes = {
  medical:     { primary: '#1a6fa8', accent: '#e8f4fd', text: '#1a2b3c', bg: '#f7fbff', btnText: '#ffffff' },
  food:        { primary: '#c0392b', accent: '#fdf3f0', text: '#2c1a0e', bg: '#fffaf8', btnText: '#ffffff' },
  legal:       { primary: '#1a2744', accent: '#f5f0e8', text: '#1a2744', bg: '#fafaf8', btnText: '#d4af37' },
  beauty:      { primary: '#8b5e7e', accent: '#fdf0f8', text: '#2d1b2d', bg: '#fdf8fc', btnText: '#ffffff' },
  automotive:  { primary: '#e85d04', accent: '#fff3e6', text: '#1a1a1a', bg: '#fafafa', btnText: '#ffffff' },
  education:   { primary: '#2d6a4f', accent: '#e8f5ee', text: '#1a2e1a', bg: '#f7fdf9', btnText: '#ffffff' },
  retail:      { primary: '#6c3fc5', accent: '#f3eeff', text: '#1a0a2e', bg: '#faf8ff', btnText: '#ffffff' },
  generic:     { primary: '#0f7b6c', accent: '#e6f6f4', text: '#0d1f1e', bg: '#f5fffe', btnText: '#ffffff' }
};

/**
 * Builds a complete, self-contained, responsive HTML website string.
 * @param {Object} businessData - The structured business data
 * @param {Object} aiContent - The AI-generated copy and selected color scheme
 * @returns {string} The full HTML document
 */
export function buildSite(businessData, aiContent) {
  const scheme = colorSchemes[aiContent.colorScheme] || colorSchemes.generic;
  const d = businessData;
  const ai = aiContent;

  // Helpers
  const ratingStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = Math.max(0, 5 - full - half);
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  };

  const photoGrid = d.photos && d.photos.length > 0 ? `
  <section id="gallery">
    <div class="container">
      <h2>Gallery</h2>
      <div class="photo-grid">
        ${d.photos.slice(0, 6).map(url => 
          `<div class="photo-item"><img src="${url}" alt="${d.name} photo" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='/api/image-proxy?url='+encodeURIComponent(this.src);"></div>`
        ).join('')}
      </div>
    </div>
  </section>` : '';

  const reviewsSection = d.reviews && d.reviews.length > 0 ? `
  <section id="reviews">
    <div class="container">
      <h2>What Our Customers Say</h2>
      <div class="reviews-grid">
        ${d.reviews.map(r => `
        <div class="review-card">
          <div class="review-stars">${'★'.repeat(Math.max(1, Math.min(5, Math.round(r.rating || 5))))}${'☆'.repeat(Math.max(0, 5 - Math.max(1, Math.min(5, Math.round(r.rating || 5)))))}</div>
          <p class="review-text">"${r.text}"</p>
          <p class="review-author">— ${r.author} &nbsp;·&nbsp; ${r.date || 'Recent'}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>` : '';

  const hoursTable = d.hours && d.hours.length > 0 ? `
  <table class="hours-table">
    ${d.hours.map(h => `
    <tr>
      <td class="day">${h.day}</td>
      <td class="time">${h.hours}</td>
    </tr>`).join('')}
  </table>` : '<p>Please call for opening hours.</p>';

  // Check if Maps Embed API key is available and valid
  const embedKey = process.env.GOOGLE_MAPS_EMBED_KEY;
  const hasValidEmbedKey = embedKey && embedKey !== 'your_google_maps_embed_key_here';

  const mapEmbedSrc = hasValidEmbedKey
    ? `https://www.google.com/maps/embed/v1/place?key=${embedKey}&q=place_id:${d.placeId}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(d.name + ' ' + d.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const mapEmbed = `
  <iframe
    src="${mapEmbedSrc}"
    width="100%" height="400" style="border:0;" allowfullscreen="" 
    loading="lazy" referrerpolicy="no-referrer-when-downgrade">
  </iframe>`;

  const websiteLink = d.website ? 
    `<a href="${d.website}" target="_blank" rel="noopener" class="contact-link">Visit Website →</a>` : '';

  const phoneLink = d.phone ? 
    `<a href="tel:${d.phone.replace(/\s/g, '')}" class="contact-link">${d.phone}</a>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ai.seoTitle}</title>
  <meta name="description" content="${ai.seoDescription}">
  <meta property="og:title" content="${ai.seoTitle}">
  <meta property="og:description" content="${ai.seoDescription}">
  <meta property="og:type" content="business.business">
  ${d.thumbnail ? `<meta property="og:image" content="${d.thumbnail}">` : ''}
  <meta name="robots" content="index, follow">
  <meta name="referrer" content="no-referrer">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    /* ── Reset & Base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', sans-serif;
      background: ${scheme.bg};
      color: ${scheme.text};
      line-height: 1.6;
      font-size: 16px;
    }
    img { max-width: 100%; display: block; }
    a { color: ${scheme.primary}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    
    /* ── Layout ── */
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    section { padding: 4rem 0; }
    section:nth-child(even) { background: ${scheme.accent}; }
    h2 {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700;
      margin-bottom: 2rem;
      color: ${scheme.text};
    }
    
    /* ── Header / Nav ── */
    .site-header {
      position: sticky; top: 0; z-index: 100;
      background: ${scheme.bg};
      border-bottom: 1px solid ${scheme.accent};
      padding: 1rem 0;
      transition: box-shadow 0.2s ease;
    }
    .site-header.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
    .nav-inner {
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem;
    }
    .nav-brand { font-weight: 700; font-size: 1.1rem; color: ${scheme.primary}; }
    .nav-cta {
      background: ${scheme.primary}; color: ${scheme.btnText};
      padding: 0.5rem 1.25rem; border-radius: 6px;
      font-size: 0.875rem; font-weight: 600;
      white-space: nowrap;
      transition: opacity 0.2s ease;
    }
    .nav-cta:hover { opacity: 0.9; text-decoration: none; }
    
    /* ── Hero ── */
    #hero {
      padding: 5rem 0;
      background: ${scheme.bg};
      border-bottom: 1px solid ${scheme.accent};
    }
    .hero-inner {
      display: grid;
      grid-template-columns: 1fr ${d.thumbnail ? '1fr' : ''};
      gap: 3rem; align-items: center;
    }
    .hero-headline {
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 700;
      line-height: 1.15;
      color: ${scheme.text};
      margin-bottom: 1rem;
    }
    .hero-sub {
      font-size: 1.125rem;
      color: ${scheme.text}cc;
      margin-bottom: 1.5rem;
      max-width: 520px;
    }
    .rating-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: ${scheme.accent}; border: 1px solid ${scheme.primary}33;
      padding: 0.4rem 0.9rem; border-radius: 20px;
      font-size: 0.875rem; font-weight: 600;
      color: ${scheme.primary};
      margin-bottom: 1.75rem;
    }
    .rating-stars { color: #f59e0b; letter-spacing: 1px; }
    .hero-ctas { display: flex; gap: 1rem; flex-wrap: wrap; }
    .btn-primary {
      background: ${scheme.primary}; color: ${scheme.btnText};
      padding: 0.75rem 1.75rem; border-radius: 8px;
      font-weight: 600; font-size: 1rem;
      transition: opacity 0.2s ease;
    }
    .btn-primary:hover { opacity: 0.9; text-decoration: none; }
    .btn-secondary {
      background: transparent; color: ${scheme.primary};
      padding: 0.75rem 1.75rem; border-radius: 8px;
      font-weight: 600; font-size: 1rem;
      border: 2px solid ${scheme.primary};
      transition: background 0.2s ease;
    }
    .btn-secondary:hover { background: ${scheme.accent}; text-decoration: none; }
    .hero-image img {
      width: 100%; height: 380px; object-fit: cover;
      border-radius: 12px;
    }
    
    /* ── About ── */
    #about .about-text {
      font-size: 1.1rem; line-height: 1.8;
      max-width: 680px; color: ${scheme.text}dd;
    }
    
    /* ── Gallery ── */
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    .photo-item img {
      width: 100%; height: 220px;
      object-fit: cover; border-radius: 8px;
      transition: transform 0.2s ease;
    }
    .photo-item img:hover { transform: scale(1.02); }
    
    /* ── Services ── */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .service-card {
      background: ${scheme.bg};
      border: 1px solid ${scheme.primary}22;
      border-radius: 10px; padding: 1.5rem;
      font-weight: 500;
      color: ${scheme.text};
    }
    .service-card::before {
      content: '✓';
      display: block;
      color: ${scheme.primary};
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }
    
    /* ── Reviews ── */
    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .review-card {
      background: ${scheme.bg};
      border: 1px solid ${scheme.accent};
      border-radius: 10px; padding: 1.5rem;
    }
    .review-stars { color: #f59e0b; font-size: 1.1rem; margin-bottom: 0.75rem; }
    .review-text {
      font-style: italic; color: ${scheme.text}cc;
      margin-bottom: 0.75rem; line-height: 1.6;
    }
    .review-author { font-size: 0.875rem; color: ${scheme.text}99; font-weight: 500; }
    
    /* ── Hours ── */
    .hours-table { width: 100%; max-width: 480px; border-collapse: collapse; }
    .hours-table tr { border-bottom: 1px solid ${scheme.accent}; }
    .hours-table td { padding: 0.6rem 0; }
    .hours-table .day { font-weight: 600; width: 40%; }
    .hours-table .time { color: ${scheme.text}cc; }
    
    /* ── Contact ── */
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .contact-item h3 {
      font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.08em; color: ${scheme.primary};
      margin-bottom: 0.4rem;
    }
    .contact-item p, .contact-link { font-size: 1rem; color: ${scheme.text}; }
    .contact-link { color: ${scheme.primary}; font-weight: 500; }
    
    /* ── Map ── */
    #map { padding: 0; }
    #map iframe { display: block; }
    
    /* ── Footer ── */
    footer {
      background: ${scheme.text};
      color: rgba(255,255,255,0.7);
      text-align: center;
      padding: 2rem 1.5rem;
      font-size: 0.875rem;
    }
    footer .biz-name { color: #fff; font-weight: 600; margin-bottom: 0.25rem; }
    footer a { color: rgba(255,255,255,0.5); }
    
    /* ── Responsive ── */
    @media (max-width: 768px) {
      .hero-inner { grid-template-columns: 1fr; }
      .hero-image { display: none; }
      .hero-headline { font-size: 2rem; }
      section { padding: 2.5rem 0; }
      .nav-brand { font-size: 0.95rem; }
    }
  </style>
</head>

<body>

  <!-- Header -->
  <header class="site-header" id="siteHeader">
    <div class="container nav-inner">
      <div class="nav-brand">${d.name}</div>
      <a href="${d.phone ? `tel:${d.phone.replace(/\s/g,'')}` : '#contact'}" class="nav-cta">
        ${ai.ctaPrimary}
      </a>
    </div>
  </header>

  <!-- Hero -->
  <section id="hero">
    <div class="container">
      <div class="hero-inner">
        <div class="hero-content">
          ${d.rating ? `
          <div class="rating-badge">
            <span class="rating-stars">${ratingStars(d.rating)}</span>
            <span>${d.rating} · ${d.reviewCount?.toLocaleString() || ''} reviews</span>
          </div>` : ''}
          <h1 class="hero-headline">${ai.heroHeadline}</h1>
          <p class="hero-sub">${ai.heroSubheadline}</p>
          <div class="hero-ctas">
            <a href="${d.phone ? `tel:${d.phone.replace(/\s/g,'')}` : '#contact'}" class="btn-primary">
              ${ai.ctaPrimary}
            </a>
            <a href="https://maps.google.com/?q=place_id:${d.placeId}" 
               target="_blank" rel="noopener" class="btn-secondary">
              ${ai.ctaSecondary}
            </a>
          </div>
        </div>
        ${d.thumbnail ? `
        <div class="hero-image">
          <img src="${d.thumbnail}" alt="${d.name}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='/api/image-proxy?url='+encodeURIComponent(this.src);">
        </div>` : ''}
      </div>
    </div>
  </section>

  <!-- About -->
  <section id="about">
    <div class="container">
      <h2>${ai.aboutTitle}</h2>
      <p class="about-text">${ai.aboutText}</p>
    </div>
  </section>

  <!-- Gallery (conditional) -->
  ${photoGrid}

  <!-- Services -->
  <section id="services">
    <div class="container">
      <h2>${ai.servicesTitle}</h2>
      <div class="services-grid">
        ${ai.services.map(s => `<div class="service-card">${s}</div>`).join('')}
      </div>
    </div>
  </section>

  <!-- Reviews (conditional) -->
  ${reviewsSection}

  <!-- Hours -->
  <section id="hours">
    <div class="container">
      <h2>Opening Hours</h2>
      ${hoursTable}
    </div>
  </section>

  <!-- Contact -->
  <section id="contact">
    <div class="container">
      <h2>Find Us</h2>
      <div class="contact-grid">
        <div class="contact-item">
          <h3>Address</h3>
          <p>${d.address}</p>
        </div>
        ${d.phone ? `
        <div class="contact-item">
          <h3>Phone</h3>
          ${phoneLink}
        </div>` : ''}
        ${d.website ? `
        <div class="contact-item">
          <h3>Website</h3>
          ${websiteLink}
        </div>` : ''}
      </div>
    </div>
  </section>

  <!-- Map -->
  <section id="map">
    ${mapEmbed}
  </section>

  <!-- Footer -->
  <footer>
    <p class="biz-name">${d.name}</p>
    <p>${d.category} · ${d.address ? d.address.split(',').slice(-2).join(',').trim() : ''}</p>
    <br>
    <p>Made with <a href="/">PagePilot</a> · © ${new Date().getFullYear()}</p>
  </footer>

  <script>
    // Sticky header shadow on scroll
    const header = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  </script>

</body>
</html>`;
}
