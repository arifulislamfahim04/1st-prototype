/**
 * modules/scroll-reveal.js
 * Fades + slides each top-level content section in as it scrolls into
 * view, using the same shared observer as counters.js.
 *
 * Deliberately targets whole `<section>` blocks (`.main-content >
 * article > section`) rather than the individual cards inside them
 * (.stats-item, .service-item, .project-item, etc). Those inner
 * components already have their own CSS-driven entrance animation
 * that plays once on page load — re-animating the same elements a
 * second time on scroll would fight that and cause a flash/blink
 * once a visitor scrolls to them. Animating at the section level is
 * additive instead: it brings entrance motion to content that
 * currently has none (e.g. each block on the long Resume page),
 * without touching anything CSS already handles.
 *
 * Styling is applied via inline styles rather than a CSS class, since
 * this pass isn't allowed to add anything to the stylesheet. That
 * does mean a section already in the initial viewport (typically the
 * page header) can briefly render before this module hides/reveals
 * it — an unavoidable trade-off of a JS-only (no companion CSS)
 * implementation, similar in spirit to the theme flash noted in
 * theme.js. Runs as early as possible in the init order to minimize it.
 */

import { qsa } from '../core/dom.js';
import { onceInView } from '../core/observer.js';

const SELECTOR = '.main-content > article > section';
const OFFSET_PX = 16;
const DURATION_MS = 500;

export function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !('IntersectionObserver' in window)) return;

  const sections = qsa(SELECTOR);
  if (!sections.length) return;

  sections.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = `translateY(${OFFSET_PX}px)`;

    onceInView(el, () => {
      el.style.transition = `opacity ${DURATION_MS}ms ease-out, transform ${DURATION_MS}ms ease-out`;
      // next frame, so the transition actually has a starting state to animate from
      requestAnimationFrame(() => {
        el.style.opacity = '';
        el.style.transform = '';
      });
    });
  });
}
