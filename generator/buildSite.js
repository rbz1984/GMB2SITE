const colorSchemes = {
    medical: { primary: '#1a6fa8', accent: '#e8f4fd', text: '#1a2b3c', bg: '#f7fbff', btnText: '#ffffff' },
    food: { primary: '#c0392b', accent: '#fdf3f0', text: '#2c1a0e', bg: '#fffaf8', btnText: '#ffffff' },
    legal: { primary: '#1a2744', accent: '#f5f0e8', text: '#1a2744', bg: '#fafaf8', btnText: '#d4af37' },
    beauty: { primary: '#8b5e7e', accent: '#fdf0f8', text: '#2d1b2d', bg: '#fdf8fc', btnText: '#ffffff' },
    automotive: { primary: '#e85d04', accent: '#fff3e6', text: '#1a1a1a', bg: '#fafafa', btnText: '#ffffff' },
    education: { primary: '#2d6a4f', accent: '#e8f5ee', text: '#1a2e1a', bg: '#f7fdf9', btnText: '#ffffff' },
    retail: { primary: '#6c3fc5', accent: '#f3eeff', text: '#1a0a2e', bg: '#faf8ff', btnText: '#ffffff' },
    generic: { primary: '#0f7b6c', accent: '#e6f6f4', text: '#0d1f1e', bg: '#f5fffe', btnText: '#ffffff' }
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
      <div class="section-head">
        <h2>Gallery</h2>
      </div>
      <div class="photo-grid">
        ${d.photos.slice(0, 8).map(url =>
        `<div class="photo-item"><img src="${url}" alt="${d.name} photo" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='/api/image-proxy?url='+encodeURIComponent(this.src);"></div>`
    ).join('')}
      </div>
    </div>
  </section>` : '';

    const reviewsSection = d.reviews && d.reviews.length > 0 ? `
  <section id="reviews">
    <div class="container">
      <div class="section-head">
        <h2>What people are saying</h2>
      </div>
      <div class="reviews-grid">
        ${d.reviews.map(r => `
        <div class="review-card">
          <div class="review-stars">${'★'.repeat(Math.max(1, Math.min(5, Math.round(r.rating || 5))))}${'☆'.repeat(Math.max(0, 5 - Math.max(1, Math.min(5, Math.round(r.rating || 5)))))}</div>
          <p class="review-text">${r.text}</p>
          <p class="review-author">${r.author} <span class="review-dot">·</span> ${r.date || 'Recent'}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>` : '';

    const hasHotelTimes = Boolean(d.checkInTime || d.checkOutTime);
    const hasWeeklyHours = Boolean(d.hours && d.hours.length > 0);

    let hoursTitle = 'Opening hours';
    let hoursContent = '';

    if (hasWeeklyHours && hasHotelTimes) {
      hoursTitle = 'Hours & Check-in Timings';
      hoursContent = `
      <div class="hotel-timings-grid">
        <div class="timing-card">
          <span class="timing-icon">🛎️</span>
          <span class="timing-label">Check-in</span>
          <span class="timing-val">${d.checkInTime || '12:00 PM'}</span>
        </div>
        <div class="timing-card">
          <span class="timing-icon">🚪</span>
          <span class="timing-label">Check-out</span>
          <span class="timing-val">${d.checkOutTime || '10:00 AM'}</span>
        </div>
      </div>
      <table class="hours-table" style="margin-top: 2rem;">
        ${d.hours.map(h => `<tr><td class="day">${h.day}</td><td class="time">${h.hours}</td></tr>`).join('')}
      </table>`;
    } else if (hasWeeklyHours) {
      hoursTitle = 'Opening hours';
      hoursContent = `
      <table class="hours-table">
        ${d.hours.map(h => `
        <tr>
          <td class="day">${h.day}</td>
          <td class="time">${h.hours}</td>
        </tr>`).join('')}
      </table>`;
    } else if (hasHotelTimes) {
      hoursTitle = 'Check-in & Timings';
      hoursContent = `
      <div class="hotel-timings-grid">
        <div class="timing-card">
          <span class="timing-icon">🛎️</span>
          <span class="timing-label">Check-in Time</span>
          <span class="timing-val">${d.checkInTime || '12:00 PM'}</span>
        </div>
        <div class="timing-card">
          <span class="timing-icon">🚪</span>
          <span class="timing-label">Check-out Time</span>
          <span class="timing-val">${d.checkOutTime || '10:00 AM'}</span>
        </div>
        <div class="timing-card">
          <span class="timing-icon">🕒</span>
          <span class="timing-label">Front Desk</span>
          <span class="timing-val">24-Hour Service</span>
        </div>
      </div>`;
    } else {
      hoursTitle = 'Hours & Availability';
      hoursContent = '<p class="hours-fallback">Please call for business hours and availability.</p>';
    }

    const amenitiesSection = d.amenities && d.amenities.length > 0 ? `
  <section id="amenities">
    <div class="container">
      <div class="section-head">
        <h2>Amenities & Highlights</h2>
      </div>
      <div class="amenities-grid">
        ${d.amenities.map(a => `<div class="amenity-item"><span class="amenity-check">✓</span> <span>${a}</span></div>`).join('')}
      </div>
    </div>
  </section>` : '';

    // Check if Maps Embed API key is available and valid
    const embedKey = process.env.GOOGLE_MAPS_EMBED_KEY;
    const hasValidEmbedKey = embedKey && embedKey !== 'your_google_maps_embed_key_here';

    const mapEmbedSrc = hasValidEmbedKey
        ? `https://www.google.com/maps/embed/v1/place?key=${embedKey}&q=place_id:${d.placeId}`
        : `https://maps.google.com/maps?q=${encodeURIComponent(d.name + ' ' + d.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    const mapEmbed = `
  <iframe
    src="${mapEmbedSrc}"
    width="100%" height="420" style="border:0;" allowfullscreen=""
    loading="lazy" referrerpolicy="no-referrer-when-downgrade">
  </iframe>`;

    const websiteLink = d.website ?
        `<a href="${d.website}" target="_blank" rel="noopener" class="contact-link">Visit website ↗</a>` : '';

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
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>
    /* ── Reset & Base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    :focus-visible { outline: 2px solid ${scheme.primary}; outline-offset: 3px; }
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
    body {
      font-family: 'Inter', sans-serif;
      background: ${scheme.bg};
      color: ${scheme.text};
      line-height: 1.6;
      font-size: 16px;
    }
    img { max-width: 100%; display: block; }
    a { color: ${scheme.primary}; text-decoration: none; }
    .display-font { font-family: 'Fraunces', serif; }

    /* ── Layout ── */
    .container { max-width: 1120px; margin: 0 auto; padding: 0 1.5rem; }
    section { padding: 5.5rem 0; position: relative; }
    .section-head { max-width: 560px; margin-bottom: 2.75rem; }
    h2 {
      font-family: 'Fraunces', serif;
      font-size: clamp(1.75rem, 3vw, 2.375rem);
      font-weight: 600;
      letter-spacing: -0.01em;
      color: ${scheme.text};
    }

    /* ── Header / Nav ── */
    .site-header {
      position: sticky; top: 0; z-index: 100;
      background: ${scheme.bg}ee;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 1.1rem 0;
      transition: box-shadow 0.25s ease, border-color 0.25s ease;
      border-bottom: 1px solid transparent;
    }
    .site-header.scrolled { box-shadow: 0 1px 0 rgba(0,0,0,0.06); border-color: ${scheme.primary}14; }
    .nav-inner {
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem;
    }
    .nav-brand {
      font-family: 'Fraunces', serif;
      font-weight: 600; font-size: 1.2rem; color: ${scheme.text};
    }
    .nav-cta {
      background: ${scheme.text}; color: ${scheme.bg};
      padding: 0.55rem 1.35rem; border-radius: 100px;
      font-size: 0.85rem; font-weight: 600;
      white-space: nowrap;
      transition: transform 0.15s ease;
      display: inline-block;
    }
    .nav-cta:hover { transform: translateY(-1px); text-decoration: none; }

    /* ── Hero ── */
    #hero {
      padding: 4.5rem 0 6rem;
      background:
        radial-gradient(1100px 480px at 85% -10%, ${scheme.primary}14, transparent 60%),
        ${scheme.bg};
      overflow: hidden;
    }
    .hero-inner {
      display: grid;
      grid-template-columns: 1.05fr ${d.thumbnail ? '0.95fr' : ''};
      gap: 3.5rem; align-items: center;
    }
    .rating-badge {
      display: inline-flex; align-items: center; gap: 0.55rem;
      background: ${scheme.bg}; border: 1px solid ${scheme.primary}30;
      padding: 0.4rem 0.95rem 0.4rem 0.7rem; border-radius: 100px;
      font-size: 0.85rem; font-weight: 600;
      color: ${scheme.text};
      margin-bottom: 1.85rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .rating-stars { color: #d99a1f; letter-spacing: 1px; }
    .hero-headline {
      font-family: 'Fraunces', serif;
      font-size: clamp(2.25rem, 4.6vw, 3.6rem);
      font-weight: 600;
      line-height: 1.08;
      letter-spacing: -0.015em;
      color: ${scheme.text};
      margin-bottom: 1.35rem;
    }
    .hero-sub {
      font-size: 1.15rem;
      color: ${scheme.text}b3;
      margin-bottom: 2.15rem;
      max-width: 480px;
      line-height: 1.65;
    }
    .hero-ctas { display: flex; gap: 0.9rem; flex-wrap: wrap; }
    .btn-primary {
      background: ${scheme.primary}; color: ${scheme.btnText};
      padding: 0.85rem 1.9rem; border-radius: 100px;
      font-weight: 600; font-size: 0.98rem;
      box-shadow: 0 8px 20px -8px ${scheme.primary}80;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      display: inline-block;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -8px ${scheme.primary}90; text-decoration: none; }
    .btn-secondary {
      background: transparent; color: ${scheme.text};
      padding: 0.85rem 1.9rem; border-radius: 100px;
      font-weight: 600; font-size: 0.98rem;
      border: 1.5px solid ${scheme.text}2a;
      transition: border-color 0.15s ease, background 0.15s ease;
      display: inline-block;
    }
    .btn-secondary:hover { background: ${scheme.text}08; border-color: ${scheme.text}55; text-decoration: none; }
    .hero-image { position: relative; }
    .hero-image img {
      width: 100%; height: 420px; object-fit: cover;
      border-radius: 20px;
      box-shadow: 0 30px 60px -20px rgba(0,0,0,0.25);
    }
    .hero-image::after {
      content: '';
      position: absolute; inset: 0;
      border-radius: 20px;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15);
      pointer-events: none;
    }

    /* ── About ── */
    #about { background: ${scheme.bg}; }
    #about .about-inner {
      display: grid; grid-template-columns: auto 1fr; gap: 3rem;
      align-items: start;
    }
    #about .about-eyebrow {
      font-family: 'Fraunces', serif;
      font-style: italic;
      font-size: 1.1rem;
      color: ${scheme.primary};
      white-space: nowrap;
      padding-top: 0.35rem;
    }
    #about .about-text {
      font-size: 1.2rem; line-height: 1.75;
      max-width: 640px; color: ${scheme.text}d9;
    }

    /* ── Gallery ── */
    #gallery { background: ${scheme.accent}; }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.1rem;
    }
    .photo-item {
      border-radius: 16px;
      overflow: hidden;
      height: 230px;
      box-shadow: 0 4px 15px -3px rgba(0,0,0,0.08);
    }
    .photo-item img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .photo-item:hover img { transform: scale(1.05); }

    /* ── Amenities & Highlights ── */
    #amenities { background: ${scheme.bg}; }
    .amenities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.9rem;
    }
    .amenity-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: ${scheme.accent};
      padding: 0.9rem 1.25rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 500;
      color: ${scheme.text};
      border: 1px solid ${scheme.primary}18;
    }
    .amenity-check {
      color: ${scheme.primary};
      font-weight: 700;
    }

    /* ── Hotel Timings ── */
    .hotel-timings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
      max-width: 700px;
    }
    .timing-card {
      background: ${scheme.accent};
      border: 1px solid ${scheme.primary}20;
      border-radius: 16px;
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .timing-icon { font-size: 1.4rem; margin-bottom: 0.2rem; }
    .timing-label { font-size: 0.8rem; font-weight: 600; color: ${scheme.primary}; text-transform: uppercase; letter-spacing: 0.04em; }
    .timing-val { font-size: 1.2rem; font-weight: 700; color: ${scheme.text}; }

    /* ── Services ── */
    #services { background: ${scheme.bg}; }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 1px;
      background: ${scheme.text}14;
      border: 1px solid ${scheme.text}14;
      border-radius: 16px;
      overflow: hidden;
    }
    .service-card {
      background: ${scheme.bg};
      padding: 1.9rem 1.6rem;
      font-weight: 500;
      font-size: 1.02rem;
      color: ${scheme.text};
    }
    .service-card::before {
      content: '';
      display: block;
      width: 9px; height: 9px;
      border-radius: 50%;
      background: ${scheme.primary};
      margin-bottom: 1rem;
    }

    /* ── Reviews ── */
    #reviews { background: ${scheme.accent}; }
    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.4rem;
    }
    .review-card {
      background: ${scheme.bg};
      border-radius: 16px; padding: 1.9rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 28px -18px rgba(0,0,0,0.18);
    }
    .review-stars { color: #d99a1f; font-size: 1rem; margin-bottom: 1rem; letter-spacing: 1px; }
    .review-text {
      font-family: 'Fraunces', serif;
      font-size: 1.08rem;
      color: ${scheme.text}e6;
      margin-bottom: 1.1rem; line-height: 1.55;
    }
    .review-author { font-size: 0.85rem; color: ${scheme.text}8a; font-weight: 500; }
    .review-dot { color: ${scheme.primary}; }

    /* ── Hours ── */
    #hours { background: ${scheme.bg}; }
    .hours-table { width: 100%; max-width: 480px; border-collapse: collapse; }
    .hours-table tr { border-bottom: 1px solid ${scheme.text}14; }
    .hours-table tr:last-child { border-bottom: none; }
    .hours-table td { padding: 0.85rem 0; }
    .hours-table .day { font-weight: 600; width: 40%; }
    .hours-table .time { color: ${scheme.text}b3; }
    .hours-fallback { color: ${scheme.text}b3; }

    /* ── Contact ── */
    #contact { background: ${scheme.accent}; }
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.75rem;
    }
    .contact-item h3 {
      font-size: 0.78rem; font-weight: 600;
      color: ${scheme.primary};
      margin-bottom: 0.45rem;
      letter-spacing: 0.01em;
    }
    .contact-item p, .contact-link { font-size: 1.05rem; color: ${scheme.text}; }
    .contact-link { color: ${scheme.primary}; font-weight: 600; }

    /* ── Map ── */
    #map { padding: 0; line-height: 0; }
    #map iframe { display: block; filter: grayscale(8%); }

    /* ── Footer ── */
    footer {
      background: ${scheme.text};
      color: ${scheme.bg}b3;
      text-align: center;
      padding: 2.75rem 1.5rem;
      font-size: 0.875rem;
    }
    footer .biz-name {
      font-family: 'Fraunces', serif;
      color: ${scheme.bg}; font-weight: 600; font-size: 1.1rem;
      margin-bottom: 0.35rem;
    }
    footer .footer-meta { margin-bottom: 1.25rem; }
    footer a { color: ${scheme.bg}90; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      section { padding: 3.5rem 0; }
      .hero-inner { grid-template-columns: 1fr; gap: 2.25rem; }
      .hero-image { order: -1; }
      .hero-image img { height: 260px; }
      #about .about-inner { grid-template-columns: 1fr; gap: 0.75rem; }
      .photo-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 140px; }
      .photo-item { grid-column: span 1; }
      .photo-item-1 { grid-row: span 1; }
      .nav-brand { font-size: 1.05rem; }
    }
  </style>
</head>

<body>

  <!-- Header -->
  <header class="site-header" id="siteHeader">
    <div class="container nav-inner">
      <div class="nav-brand">${d.name}</div>
      <a href="${d.phone ? `tel:${d.phone.replace(/\s/g, '')}` : '#contact'}" class="nav-cta">
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
            <a href="${d.phone ? `tel:${d.phone.replace(/\s/g, '')}` : '#contact'}" class="btn-primary">
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
    <div class="container about-inner">
      <span class="about-eyebrow">${ai.aboutTitle}</span>
      <p class="about-text">${ai.aboutText}</p>
    </div>
  </section>

  <!-- Gallery (conditional) -->
  ${photoGrid}

  <!-- Services -->
  <section id="services">
    <div class="container">
      <div class="section-head">
        <h2>${ai.servicesTitle}</h2>
      </div>
      <div class="services-grid">
        ${ai.services.map(s => `<div class="service-card">${s}</div>`).join('')}
      </div>
    </div>
  </section>

  <!-- Reviews (conditional) -->
  ${reviewsSection}

  <!-- Hours / Timings -->
  <section id="hours">
    <div class="container">
      <div class="section-head">
        <h2>${hoursTitle}</h2>
      </div>
      ${hoursContent}
    </div>
  </section>

  <!-- Amenities (conditional) -->
  ${amenitiesSection}

  <!-- Contact -->
  <section id="contact">
    <div class="container">
      <div class="section-head">
        <h2>Find us</h2>
      </div>
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
    <p class="footer-meta">${d.category} · ${d.address ? d.address.split(',').slice(-2).join(',').trim() : ''}</p>
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