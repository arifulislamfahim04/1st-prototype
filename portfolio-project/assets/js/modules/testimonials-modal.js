/**
 * modules/testimonials-modal.js
 * Clicking a testimonial card opens a modal with its full content.
 * Same data hooks as the original template, plus Escape-to-close and
 * focus moved into the modal's close button on open, so keyboard
 * users land somewhere sensible.
 */

import { qs, qsa } from '../core/dom.js';

export function initTestimonialsModal() {
  const items = qsa('[data-testimonials-item]');
  const modalContainer = qs('[data-modal-container]');
  const modalCloseBtn = qs('[data-modal-close-btn]');
  const overlay = qs('[data-overlay]');
  if (!items.length || !modalContainer || !overlay) return;

  const modalImg = qs('[data-modal-img]');
  const modalTitle = qs('[data-modal-title]');
  const modalText = qs('[data-modal-text]');

  function toggleModal() {
    modalContainer.classList.toggle('active');
    overlay.classList.toggle('active');
  }

  function openFrom(item) {
    const avatar = item.querySelector('[data-testimonials-avatar]');
    const title = item.querySelector('[data-testimonials-title]');
    const text = item.querySelector('[data-testimonials-text]');

    if (avatar && modalImg) {
      modalImg.src = avatar.src;
      modalImg.alt = avatar.alt;
    }
    if (title && modalTitle) modalTitle.innerHTML = title.innerHTML;
    if (text && modalText) modalText.innerHTML = text.innerHTML;

    toggleModal();
    modalCloseBtn?.focus();
  }

  items.forEach((item) => {
    item.addEventListener('click', () => openFrom(item));
  });

  modalCloseBtn?.addEventListener('click', toggleModal);
  overlay.addEventListener('click', toggleModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalContainer.classList.contains('active')) {
      toggleModal();
    }
  });
}
