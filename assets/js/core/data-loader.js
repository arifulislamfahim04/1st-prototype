/**
 * core/data-loader.js
 * Fetches and caches JSON data files (projects.json, articles.json, …).
 *
 * - In-memory cache: a page that calls loadJSON() from more than one
 *   module (unlikely today, plausible as the site grows) never fires
 *   a second network request for the same file.
 * - Errors never throw out to the caller: a missing file, a bad HTTP
 *   status, or malformed JSON all resolve to `null` so callers can do
 *   a simple `if (data) { ... }` and fall back to whatever static
 *   markup is already on the page.
 *
 * Note for local development: fetch() of a local file over file://
 * is blocked by CORS in most browsers. Testing this needs a simple
 * local server (e.g. `python -m http.server`), not double-clicking
 * the HTML file. This does not affect the real GitHub Pages deploy.
 */

const cache = new Map();

export async function loadJSON(path) {
  if (cache.has(path)) {
    return cache.get(path);
  }

  try {
    const response = await fetch(path, { credentials: 'same-origin' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while fetching ${path}`);
    }

    const data = await response.json();
    cache.set(path, data);
    return data;
  } catch (error) {
    console.warn(`[data-loader] Could not load "${path}" — falling back to static content.`, error);
    return null;
  }
}
