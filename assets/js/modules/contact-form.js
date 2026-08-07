/**
 * modules/contact-form.js
 * Enables the submit button once all required fields pass native
 * HTML5 validation. Same behavior as the original template, ported
 * into its own module.
 */

import { qs, qsa } from '../core/dom.js';

export function initContactForm() {
  const form = qs('[data-form]');
  const inputs = qsa('[data-form-input]');
  const submitBtn = qs('[data-form-btn]');
  if (!form || !submitBtn) return;

  function updateState() {
    submitBtn.toggleAttribute('disabled', !form.checkValidity());
  }

  inputs.forEach((input) => input.addEventListener('input', updateState));
  updateState();
}
