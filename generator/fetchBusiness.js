import fetch from 'node-fetch';

/**
 * Fetches Google Maps business details and reviews via SerpAPI.
 * @param {string} placeIdOrDataId - The Place ID (starts with ChIJ) or data_id (0x...)
 * @returns {Promise<Object>} Unified businessData object
 */
export async function fetchBusiness(inputParam) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey || apiKey === 'your_serpapi_key_here') {
    const err = new Error('SERPAPI_KEY is not configured. Please add your SerpAPI key in .env');
    err.code = 'SERPAPI_ERROR';
    throw err;
  }

  console.log(`[fetchBusiness] Fetching details with SerpAPI key (${apiKey.length} chars) for:`, inputParam);

  // Call 1: Place Details
  const placeUrl = new URL('https://serpapi.com/search.json');
  placeUrl.searchParams.set('engine', 'google_maps');
  placeUrl.searchParams.set('type', 'place');

  if (typeof inputParam === 'object' && inputParam !== null) {
    if (inputParam.place_id) placeUrl.searchParams.set('place_id', inputParam.place_id);
    else if (inputParam.data_cid) placeUrl.searchParams.set('data_cid', inputParam.data_cid);
    else if (inputParam.data) placeUrl.searchParams.set('data', inputParam.data);
  } else if (typeof inputParam === 'string') {
    const str = inputParam.trim();
    if (str.startsWith('ChIJ')) {
      placeUrl.searchParams.set('place_id', str);
    } else if (/^\d+$/.test(str)) {
      placeUrl.searchParams.set('data_cid', str);
    } else if (str.includes(':')) {
      // Hex pair: 0x...:0x[hexCid]
      const parts = str.split(':');
      if (parts[1] && parts[1].startsWith('0x')) {
        try {
          const decCid = BigInt(parts[1]).toString();
          placeUrl.searchParams.set('data_cid', decCid);
        } catch (_) {
          placeUrl.searchParams.set('data', str);
        }
      } else {
        placeUrl.searchParams.set('data', str);
      }
    } else {
      placeUrl.searchParams.set('place_id', str);
    }
  }

  placeUrl.searchParams.set('hl', 'en');
  placeUrl.searchParams.set('api_key', apiKey);

  let placeRes;
  try {
    placeRes = await fetch(placeUrl.toString());
  } catch (netErr) {
    const err = new Error(`Failed to connect to SerpAPI: ${netErr.message}`);
    err.code = 'SERPAPI_ERROR';
    throw err;
  }

  const placeJson = await placeRes.json();

  if (placeJson.error) {
    const errMsg = placeJson.error.toLowerCase();
    const err = new Error(`SerpAPI error: ${placeJson.error}`);
    if (errMsg.includes('quota') || errMsg.includes('rate limit') || errMsg.includes('exceeded') || placeRes.status === 429) {
      err.code = 'RATE_LIMIT';
    } else {
      err.code = 'SERPAPI_ERROR';
    }
    throw err;
  }

  const p = placeJson.place_results;
  if (!p || (!p.title && !p.name)) {
    const err = new Error(`No place details found for identifier: ${placeIdOrDataId}`);
    err.code = 'SERPAPI_ERROR';
    throw err;
  }

  // Extract photos (first 9)
  const photos = [];
  if (Array.isArray(p.images)) {
    for (const img of p.images.slice(0, 9)) {
      if (img && img.thumbnail) photos.push(img.thumbnail);
    }
  }

  // Extract operating hours
  const hours = [];
  if (Array.isArray(p.hours)) {
    for (const item of p.hours) {
      if (typeof item === 'object' && item !== null) {
        // Some formats are { Monday: '...' } or { day: 'Monday', hours: '...' }
        if (item.day && item.hours) {
          hours.push({ day: item.day, hours: item.hours });
        } else {
          const entries = Object.entries(item);
          if (entries.length > 0) {
            hours.push({ day: entries[0][0], hours: entries[0][1] });
          }
        }
      }
    }
  }

  // Extract highlights from extensions
  const highlights = [];
  if (p.extensions && typeof p.extensions === 'object') {
    Object.values(p.extensions).forEach(ext => {
      if (Array.isArray(ext)) {
        ext.forEach(item => {
          if (typeof item === 'string') highlights.push(item);
          else if (item && item.name) highlights.push(item.name);
        });
      }
    });
  }

  const dataId = p.data_id || (placeIdOrDataId.startsWith('0x') ? placeIdOrDataId : null);
  const placeId = p.place_id || (!placeIdOrDataId.startsWith('0x') ? placeIdOrDataId : (p.data_cid || ''));

  // Call 2: Reviews (if data_id available)
  const reviews = [];
  if (dataId) {
    try {
      console.log(`[fetchBusiness] Fetching reviews for data_id: ${dataId}`);
      const reviewsUrl = new URL('https://serpapi.com/search.json');
      reviewsUrl.searchParams.set('engine', 'google_maps_reviews');
      reviewsUrl.searchParams.set('data_id', dataId);
      reviewsUrl.searchParams.set('sort_by', 'qualityScore');
      reviewsUrl.searchParams.set('hl', 'en');
      reviewsUrl.searchParams.set('api_key', apiKey);

      const reviewsRes = await fetch(reviewsUrl.toString());
      if (reviewsRes.ok) {
        const reviewsJson = await reviewsRes.json();
        if (Array.isArray(reviewsJson.reviews)) {
          for (const r of reviewsJson.reviews.slice(0, 3)) {
            reviews.push({
              author: r.user?.name || 'Customer',
              rating: typeof r.rating === 'number' ? r.rating : 5,
              text: r.snippet || r.extracted_snippet || r.review || '',
              date: r.date || ''
            });
          }
        }
      }
    } catch (revErr) {
      console.warn(`[fetchBusiness] Optional reviews fetch failed: ${revErr.message}`);
    }
  }

  // Also check if p.reviews had embedded reviews if reviews array is still empty
  if (reviews.length === 0 && Array.isArray(p.user_reviews)) {
    for (const r of p.user_reviews.slice(0, 3)) {
      reviews.push({
        author: r.user?.name || 'Customer',
        rating: typeof r.rating === 'number' ? r.rating : 5,
        text: r.description || r.snippet || '',
        date: r.date || ''
      });
    }
  }

  // Fallback description from location_summary if owner description is absent
  const description = p.description || p.location_summary || null;

  return {
    name: p.title || p.name || 'Local Business',
    rating: typeof p.rating === 'number' ? p.rating : (parseFloat(p.rating) || 0),
    reviewCount: typeof p.reviews === 'number' ? p.reviews : (parseInt(p.reviews, 10) || 0),
    category: typeof p.type === 'string' ? p.type : (typeof p.category === 'string' ? p.category : (Array.isArray(p.types) ? p.types.join(' · ') : 'Business')),
    address: p.address || '',
    phone: p.phone || null,
    website: p.website || null,
    description,
    hours,
    checkInTime: p.check_in_time || null,
    checkOutTime: p.check_out_time || null,
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    coordinates: {
      lat: p.gps_coordinates?.latitude || null,
      lng: p.gps_coordinates?.longitude || null
    },
    photos,
    thumbnail: p.thumbnail || (photos.length > 0 ? photos[0] : null),
    reviews,
    highlights: [...highlights, ...(Array.isArray(p.amenities) ? p.amenities : [])],
    placeId: placeId || (typeof inputParam === 'string' ? inputParam : (p.data_cid || '')),
    dataId: dataId || null
  };
}
