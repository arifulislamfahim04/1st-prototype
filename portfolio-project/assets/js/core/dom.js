/**
 * core/dom.js
 * Small DOM helpers shared by every module. Kept dependency-free on
 * purpose so nothing else in the app has to worry about load order.
 */

/** querySelector shorthand, optionally scoped to a container. */
export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

/** querySelectorAll shorthand that returns a real (mappable) array. */
export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * Escapes a value for safe interpolation into an HTML template string.
 * Used whenever JSON-sourced text (project titles, article excerpts,
 * etc.) gets inserted via innerHTML, so malformed or unexpected data
 * in a JSON file can't break markup or inject tags.
 */
export function escapeHTML(value) {
  const div = document.createElement('div');
  div.textContent = value === null || value === undefined ? '' : String(value);
  return div.innerHTML;
}
