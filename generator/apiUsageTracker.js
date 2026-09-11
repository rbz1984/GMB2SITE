import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USAGE_FILE = path.join(__dirname, '..', 'api-usage.json');

/**
 * Returns current API usage data, automatically resetting daily counters at 00:00 UTC.
 */
export function getUsageData() {
  const todayUtc = new Date().toISOString().split('T')[0];
  let data = {
    date: todayUtc,
    requestsToday: 0,
    lifetimeRequests: 0,
    lastRequestTime: null,
    history: []
  };

  try {
    if (fs.existsSync(USAGE_FILE)) {
      const raw = fs.readFileSync(USAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.date === todayUtc) {
        data = { ...data, ...parsed };
      } else {
        // Daily rollover: save previous day into history
        const history = Array.isArray(parsed.history) ? parsed.history : [];
        if (parsed.requestsToday > 0) {
          history.unshift({ date: parsed.date, requests: parsed.requestsToday });
          if (history.length > 30) history.pop();
        }
        data = {
          date: todayUtc,
          requestsToday: 0,
          lifetimeRequests: parsed.lifetimeRequests || 0,
          lastRequestTime: parsed.lastRequestTime || null,
          history
        };
        saveUsageData(data);
      }
    } else {
      saveUsageData(data);
    }
  } catch (err) {
    console.error('[apiUsageTracker] Error reading usage:', err.message);
  }

  return data;
}

/**
 * Persists usage data to api-usage.json.
 */
export function saveUsageData(data) {
  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[apiUsageTracker] Error saving usage:', err.message);
  }
}

/**
 * Increments AI request counter upon successful generation.
 */
export function recordAiRequest() {
  const data = getUsageData();
  data.requestsToday = (data.requestsToday || 0) + 1;
  data.lifetimeRequests = (data.lifetimeRequests || 0) + 1;
  data.lastRequestTime = new Date().toISOString();
  saveUsageData(data);
  return data;
}
