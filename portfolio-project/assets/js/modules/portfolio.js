/**
 * modules/portfolio.js
 * Owns the Portfolio page: loads projects from data/projects.json and
 * renders them, then wires category filtering (buttons + the custom
 * select) and search on top.
 *
 * Rendering strategy: if the JSON loads successfully, the entire
 * `.project-list` is rebuilt from data, using the exact same markup
 * shape (classes, data-filter-item/data-category attributes) the
 * static HTML already used — so the CSS needs zero changes either
 * way. If the JSON fails to load (missing file, bad network, GitHub
 * Pages misconfiguration, whatever), this module leaves the existing
 * static markup completely alone and just wires filtering/search on
 * top of it — the page still works, it just isn't data-driven that
 * particular visit.
 *
 * Filtering and searching both operate on whatever is currently in
 * the DOM (queried fresh each time) rather than on a separate
 * in-memory copy, so the two code paths above stay in sync for free.
 */

import { qs, qsa, escapeHTML } from '../core/dom.js';
import { debounce } from '../core/debounce.js';
import { loadJSON } from '../core/data-loader.js';

const DATA_PATH = './data/projects.json';

function buildProjectCard(project) {
  const li = document.createElement('li');
  li.className = 'project-item active';
  li.dataset.filterItem = '';
  li.dataset.category = project.category.toLowerCase();

  li.innerHTML = `
    <a href="${escapeHTML(project.url)}">
      <figure class="project-img">
        <div class="project-item-icon-box">
          <ion-icon name="eye-outline" aria-hidden="true"></ion-icon>
        </div>
        <img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.title)} project" loading="lazy">
      </figure>
      <h3 class="project-title">${escapeHTML(project.title)}</h3>
      <p class="project-category">${escapeHTML(project.category)}</p>
    </a>
  `;

  return li;
}

function buildPlaceholder(category, label) {
  const li = document.createElement('li');
  li.className = 'project-item active project-item-placeholder';
  li.dataset.filterItem = '';
  li.dataset.category = category;

  const p = document.createElement('p');
  p.className = 'project-placeholder-text';
  p.textContent = label;
  p.dataset.default = label;

  li.appendChild(p);
  return li;
}

function pluralizeCategory(category) {
  // known, narrow vocabulary ("academic project" / "lab project") —
  // a full pluralizer would be overkill for two known category names
  return /project$/i.test(category) ? category.replace(/project$/i, 'projects') : `${category}s`;
}

function renderProjects(list, data) {
  const categories = [...new Set(data.map((p) => p.category.toLowerCase()))];
  const fragment = document.createDocumentFragment();

  categories.forEach((category) => {
    data
      .filter((p) => p.category.toLowerCase() === category)
      .forEach((project) => fragment.appendChild(buildProjectCard(project)));

    fragment.appendChild(buildPlaceholder(category, `More ${pluralizeCategory(category)} coming soon`));
  });

  list.innerHTML = '';
  list.appendChild(fragment);
}

function applyFilters(list, state) {
  const items = qsa('[data-filter-item]', list);
  const visibleRealCountByCategory = {};

  items.forEach((item) => {
    const isPlaceholder = item.classList.contains('project-item-placeholder');
    const matchesCategory = state.category === 'all' || item.dataset.category === state.category;

    if (isPlaceholder) {
      item.classList.toggle('active', matchesCategory);
      return;
    }

    const title = item.querySelector('.project-title')?.textContent.toLowerCase() || '';
    const matchesQuery = !state.query || title.includes(state.query);
    item.classList.toggle('active', matchesCategory && matchesQuery);

    if (matchesCategory && matchesQuery) {
      const cat = item.dataset.category;
      visibleRealCountByCategory[cat] = (visibleRealCountByCategory[cat] || 0) + 1;
    }
  });

  // when a search query hides every real project in an otherwise-
  // visible category, swap that category's "coming soon" placeholder
  // to a search-specific message instead — possible because this
  // module owns the placeholder text now that it's rendered dynamically
  qsa('.project-item-placeholder.active', list).forEach((placeholder) => {
    const textEl = placeholder.querySelector('.project-placeholder-text');
    if (!textEl) return;

    const hasMatches = visibleRealCountByCategory[placeholder.dataset.category] > 0;
    if (state.query && !hasMatches) {
      textEl.textContent = 'No projects match your search.';
    } else if (textEl.dataset.default) {
      textEl.textContent = textEl.dataset.default;
    }
  });
}

function syncControlsUI(category, buttons, selectValueEl) {
  buttons.forEach((btn) => {
    btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === category);
  });

  if (selectValueEl) {
    const match = buttons.find((btn) => btn.textContent.trim().toLowerCase() === category);
    if (match) selectValueEl.textContent = match.textContent.trim();
  }
}

export async function initPortfolio() {
  const list = qs('.project-list');
  const section = qs('.projects');
  if (!list || !section) return;

  const searchInput = qs('[data-portfolio-search]');
  const filterButtons = qsa('[data-filter-btn]', section);
  const selectValueEl = qs('[data-selecct-value]', section);

  const data = await loadJSON(DATA_PATH);
  if (Array.isArray(data) && data.length > 0) {
    renderProjects(list, data);
  }
  // else: JSON unavailable — leave the static server-rendered cards as-is

  const state = { category: 'all', query: '' };

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.category = btn.textContent.trim().toLowerCase();
      syncControlsUI(state.category, filterButtons, selectValueEl);
      applyFilters(list, state);
    });
  });

  section.addEventListener('filter:change', (event) => {
    state.category = event.detail.value;
    syncControlsUI(state.category, filterButtons, selectValueEl);
    applyFilters(list, state);
  });

  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce((event) => {
        state.query = event.target.value.trim().toLowerCase();
        applyFilters(list, state);
      }, 200)
    );
  }

  applyFilters(list, state);
}
