/**
 * script.js — entry point
 *
 * Deliberately written with dynamic import() rather than static
 * `import` statements. Static imports would require every page that
 * loads this file to have `type="module"` on its <script> tag — true
 * for the 5 main pages, but the 3 project/article detail pages
 * (outside this pass's approved HTML changes) still load this file
 * as a classic script. Dynamic import() is valid in both contexts,
 * so this one file works correctly everywhere without needing those
 * pages touched at all.
 *
 * Every init function guards internally on whatever DOM it needs
 * (see each module) and simply no-ops on pages that don't have the
 * relevant markup — so importing and calling all of them here is
 * safe on every page; each page only pays for what it actually uses.
 */

(async () => {
  const [
    { initTheme },
    { initSidebar },
    { initTestimonialsModal },
    { initFilterSelect },
    { initPortfolio },
    { initArticles },
    { initContactForm },
    { initCounters },
    { initScrollReveal },
  ] = await Promise.all([
    import('./modules/theme.js'),
    import('./modules/sidebar.js'),
    import('./modules/testimonials-modal.js'),
    import('./modules/filter-select.js'),
    import('./modules/portfolio.js'),
    import('./modules/articles.js'),
    import('./modules/contact-form.js'),
    import('./modules/counters.js'),
    import('./modules/scroll-reveal.js'),
  ]);

  // scroll-reveal runs first (see its own comment on the FOIC trade-off
  // of a JS-only, no-companion-CSS reveal — earlier is better here)
  const inits = [
    ['scrollReveal', initScrollReveal],
    ['theme', initTheme],
    ['sidebar', initSidebar],
    ['testimonialsModal', initTestimonialsModal],
    ['filterSelect', initFilterSelect],
    ['portfolio', initPortfolio],
    ['articles', initArticles],
    ['contactForm', initContactForm],
    ['counters', initCounters],
  ];

  inits.forEach(([name, fn]) => {
    // a couple of these init functions are async (they await JSON
    // data) — a plain try/catch only catches synchronous throws, so
    // any rejected promise they return also needs its own .catch()
    try {
      const result = fn();
      if (result && typeof result.catch === 'function') {
        result.catch((error) => console.error(`[init:${name}] failed to initialize`, error));
      }
    } catch (error) {
      // one module failing (e.g. unexpected markup on a page) should
      // never take the rest of the page's interactivity down with it
      console.error(`[init:${name}] failed to initialize`, error);
    }
  });
})();
