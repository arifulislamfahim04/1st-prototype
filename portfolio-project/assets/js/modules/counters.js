/**
 * modules/counters.js
 * Animates each "At a Glance" stat from 0 up to its real value the
 * first time it scrolls into view, using the shared IntersectionObserver
 * from core/observer.js (one observer for this + scroll-reveal.js,
 * not five separate ones).
 *
 * The target number and its precision come straight from the existing
 * markup — `<data value="7">7+</data>` — so nothing needs to be
 * hand-duplicated in JS: `value` gives the number, decimal places are
 * inferred from it (handles the 3.91 CGPA case), and the visible
 * suffix ("+") is extracted from the element's own text and
 * reattached after each animated frame.
 *
 * Uses requestAnimationFrame (not setInterval) for smooth, tab-aware
 * animation, and skips the animation entirely — jumping straight to
 * the final value — when the visitor has requested reduced motion.
 */

import { qsa } from '../core/dom.js';
import { onceInView } from '../core/observer.js';

const DURATION_MS = 1200;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function formatValue(num, decimals, suffix) {
  const rounded = decimals > 0 ? num.toFixed(decimals) : String(Math.round(num));
  return rounded + suffix;
}

function animateCount(el) {
  const raw = el.getAttribute('value');
  const target = parseFloat(raw);
  if (!Number.isFinite(target)) return;

  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
  const suffixMatch = el.textContent.match(/[^\d.]+$/);
  const suffix = suffixMatch ? suffixMatch[0] : '';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    el.textContent = formatValue(target, decimals, suffix);
    return;
  }

  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / DURATION_MS, 1);
    const current = target * easeOutCubic(progress);
    el.textContent = formatValue(current, decimals, suffix);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

export function initCounters() {
  const numbers = qsa('.stats-number');
  if (!numbers.length) return;

  numbers.forEach((el) => {
    onceInView(el, () => animateCount(el));
  });
}
