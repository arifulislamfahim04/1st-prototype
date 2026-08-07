/**
 * modules/filter-select.js
 * Generic custom-select dropdown behavior (open/close, pick an item,
 * update the visible label). Only one instance exists in the HTML
 * today (the portfolio category select), but this is written against
 * `[data-select]` generically via qsa so a second instance elsewhere
 * would work with zero changes to this file.
 *
 * Deliberately decoupled from what a selection *means* — it doesn't
 * know anything about projects or filtering. It just dispatches a
 * `filter:change` custom event (bubbling, so a listener anywhere
 * above it in the DOM can react) with the chosen label/value. portfolio.js
 * listens for that event rather than this module reaching into
 * portfolio-specific logic.
 */

import { qs, qsa } from '../core/dom.js';

export function initFilterSelect() {
  const selects = qsa('[data-select]');
  if (!selects.length) return;

  selects.forEach((select) => {
    const box = select.closest('.filter-select-box');
    if (!box) return;

    const valueEl = qs('[data-selecct-value]', box);
    const items = qsa('[data-select-item]', box);

    function close() {
      select.classList.remove('active');
    }

    select.addEventListener('click', (event) => {
      event.stopPropagation();
      select.classList.toggle('active');
    });

    items.forEach((item) => {
      item.addEventListener('click', () => {
        const label = item.textContent.trim();
        if (valueEl) valueEl.textContent = label;
        close();
        box.dispatchEvent(
          new CustomEvent('filter:change', {
            detail: { label, value: label.toLowerCase() },
            bubbles: true,
          })
        );
      });
    });

    document.addEventListener('click', (event) => {
      if (!box.contains(event.target)) close();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
  });
}
