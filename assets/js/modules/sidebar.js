/**
 * modules/sidebar.js
 * Mobile "Show Contacts" collapse behavior for the sidebar. Same
 * interaction the original template had (toggle .active on
 * [data-sidebar]) plus two accessibility additions: closing on
 * outside click and on Escape, with focus returned to the toggle
 * button so keyboard users don't lose their place.
 *
 * Real multi-page navigation (About/Resume/Portfolio/Article/Contact)
 * needs no JS at all — those are plain <a href> links between static
 * pages. The old single-page-app page-swapping code from the original
 * template (data-nav-link / data-page) matched zero elements anywhere
 * in the actual HTML and has been dropped entirely rather than ported.
 */

import { qs } from '../core/dom.js';

export function initSidebar() {
  const sidebar = qs('[data-sidebar]');
  const toggleBtn = qs('[data-sidebar-btn]');
  if (!sidebar || !toggleBtn) return;

  function close() {
    sidebar.classList.remove('active');
  }

  toggleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    sidebar.classList.toggle('active');
  });

  document.addEventListener('click', (event) => {
    if (sidebar.classList.contains('active') && !sidebar.contains(event.target)) {
      close();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar.classList.contains('active')) {
      close();
      toggleBtn.focus();
    }
  });
}
