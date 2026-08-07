/**
 * modules/articles.js
 * Owns the Articles page: loads articles from data/articles.json and
 * renders them, then wires the category filter buttons — which exist
 * in the HTML (data-article-filter-btn) but had no JS behind them at
 * all before this module.
 *
 * Same render-once/fallback-safe shape as portfolio.js, kept as a
 * separate module rather than sharing one generic "filterable list"
 * abstraction with it — the two data shapes (categories+search vs.
 * categories+date+excerpt) differ enough that forcing a shared
 * implementation now would cost more flexibility than it'd save.
 *
 * Note: the static articles.html markup has no search input (unlike
 * portfolio.html's [data-portfolio-search]), so there's no article
 * search — adding one would require an HTML change outside this
 * pass's approved scope. Category filtering still fully works via
 * the existing buttons, both here and against the static fallback
 * article (once this module adds the data-filter-item/data-category
 * attributes those static cards were originally missing).
 */

import { qs, qsa, escapeHTML } from '../core/dom.js';
import { loadJSON } from '../core/data-loader.js';

const DATA_PATH = './data/articles.json';

function buildArticleCard(article) {
  const li = document.createElement('li');
  li.className = 'blog-post-item active';
  li.dataset.filterItem = '';
  li.dataset.category = article.category.toLowerCase();

  li.innerHTML = `
    <a href="${escapeHTML(article.url)}">
      <figure class="blog-banner-box">
        <img src="${escapeHTML(article.image)}" alt="${escapeHTML(article.title)}" loading="lazy">
      </figure>
      <div class="blog-content">
        <div class="blog-meta">
          <p class="blog-category">${escapeHTML(article.category)}</p>
          <span class="dot"></span>
          <time datetime="${escapeHTML(article.date)}">${escapeHTML(article.dateDisplay)}</time>
        </div>
        <h3 class="blog-item-title">${escapeHTML(article.title)}</h3>
        <p class="blog-text">${escapeHTML(article.excerpt)}</p>
      </div>
    </a>
  `;

  return li;
}

function buildPlaceholder() {
  const li = document.createElement('li');
  li.className = 'blog-post-item active blog-post-item-placeholder';

  const p = document.createElement('p');
  p.className = 'project-placeholder-text';
  p.textContent = 'More articles coming soon';

  li.appendChild(p);
  return li;
}

function renderArticles(list, data) {
  const fragment = document.createDocumentFragment();
  data.forEach((article) => fragment.appendChild(buildArticleCard(article)));
  fragment.appendChild(buildPlaceholder());

  list.innerHTML = '';
  list.appendChild(fragment);
}

function applyFilter(list, category) {
  qsa('[data-filter-item]', list).forEach((item) => {
    const matches = category === 'all' || item.dataset.category === category;
    item.classList.toggle('active', matches);
  });
}

export async function initArticles() {
  const list = qs('.blog-posts-list');
  if (!list) return;

  const filterButtons = qsa('[data-article-filter-btn]');

  const data = await loadJSON(DATA_PATH);
  const rendered = Array.isArray(data) && data.length > 0;
  if (rendered) {
    renderArticles(list, data);
  }
  // else: JSON unavailable — the static fallback article stays as-is,
  // but (having no data-filter-item attribute in the original HTML)
  // won't itself respond to the category buttons below

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.textContent.trim().toLowerCase();
      filterButtons.forEach((b) => b.classList.toggle('active', b === btn));
      applyFilter(list, category);
    });
  });
}
