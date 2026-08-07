/**
 * modules/theme.js
 * Light/dark theme switching. Reads/writes the `data-theme` attribute
 * that the stylesheet already keys off of — this module only ever
 * decides *which* value to set, all the actual color logic lives in
 * CSS custom properties.
 *
 * Preference order: explicit user choice (localStorage) > OS
 * preference (prefers-color-scheme) > light default.
 *
 * Known trade-off: because this runs from a deferred module script
 * (not an inline <head> script — that would have meant a third HTML
 * change beyond the two approved ones), a visitor whose OS/stored
 * preference is dark may see a brief flash of the light theme before
 * this module applies data-theme on first load. Fixing that fully
 * would require a tiny blocking inline script in <head>, which is
 * out of scope for this pass.
 */

import { qs } from '../core/dom.js';
import { getItem, setItem } from '../core/storage.js';

const STORAGE_KEY = 'theme';

export function initTheme() {
  const toggleBtn = qs('[data-theme-toggle]');
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function getStoredTheme() {
    const value = getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  }

  function getPreferredTheme() {
    return getStoredTheme() || (mediaQuery.matches ? 'dark' : 'light');
  }

  function updateToggleUI(theme) {
    if (!toggleBtn) return;
    const isDark = theme === 'dark';
    const icon = toggleBtn.querySelector('ion-icon');
    if (icon) icon.setAttribute('name', isDark ? 'sunny-outline' : 'moon-outline');
    toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleUI(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setItem(STORAGE_KEY, next);
  }

  // apply immediately, whether or not this page has a visible toggle
  // button (project/article detail pages don't, but should still
  // respect a theme chosen elsewhere on the site)
  applyTheme(getPreferredTheme());

  toggleBtn?.addEventListener('click', toggleTheme);

  // if the user hasn't explicitly chosen a theme, keep following the
  // OS setting live (e.g. system switches to dark at sunset)
  mediaQuery.addEventListener('change', (event) => {
    if (!getStoredTheme()) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });

  // keep multiple open tabs in sync when the user toggles in one
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
      applyTheme(event.newValue);
    }
  });
}
