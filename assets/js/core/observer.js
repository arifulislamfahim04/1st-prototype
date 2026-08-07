/**
 * core/observer.js
 * A single shared IntersectionObserver, reused by every module that
 * needs "run this once when the element scrolls into view" behavior
 * (counters.js, scroll-reveal.js). One observer watching many
 * elements is measurably cheaper than each module creating its own —
 * this is the performance-optimization seam for that pattern.
 *
 * Usage: onceInView(el, callback) — callback fires the first time
 * `el` enters the viewport, then the element is automatically
 * unobserved (no repeat firing on scroll up/down).
 *
 * Falls back to firing immediately when IntersectionObserver isn't
 * available at all (very old browsers) so nothing silently never runs.
 */

let observer;
const callbacks = new WeakMap();

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const callback = callbacks.get(entry.target);
          if (callback) {
            callback(entry);
            callbacks.delete(entry.target);
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
  }
  return observer;
}

export function onceInView(el, callback) {
  if (!el) return;

  if (!('IntersectionObserver' in window)) {
    callback();
    return;
  }

  callbacks.set(el, callback);
  getObserver().observe(el);
}
