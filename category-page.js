/* ═══════════════════════════════════════════════════════════
   BANSI HERBAL — CATEGORY PAGE LOGIC
   category-page.js — Drives category.html only. Reads URL
   params (?cat=, ?filter=bestsellers), live filtering, sorting,
   and pagination. Uses window.bansiAddToCart and
   window.bansiShowToast exposed by category-bestsellers.js,
   so that script must load BEFORE this one.
   ═══════════════════════════════════════════════════════════ */

(function () {

  const PAGE_SIZE = 12;

  let state = {
    allProducts: [],
    allCategories: [],
    selectedCategoryId: null,   // null = all categories
    bestsellerOnly: false,
    newOnly: false,
    priceMin: null,
    priceMax: null,
    sort: 'newest',
    page: 1,
  };

  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      cat: params.get('cat'),
      filter: params.get('filter'),
    };
  }

  /* ── DATA LOADING ──────────────────────────────────────────── */
  async function loadData() {
    if (typeof supabaseClient === 'undefined') return;

    const [{ data: products }, { data: cats }] = await Promise.all([
      supabaseClient.from('products').select('*, categories(id, name)').eq('is_active', true),
      supabaseClient.from('categories').select('*, products(id)').order('sort_order', { ascending: true }),
    ]);

    state.allProducts = products || [];
    state.allCategories = cats || [];

    applyUrlParams();
    renderFilterSidebar();
    applyFiltersAndRender();
  }

  function applyUrlParams() {
    const { cat, filter } = getUrlParams();
    if (cat) state.selectedCategoryId = cat;
    if (filter === 'bestsellers') state.bestsellerOnly = true;
  }

  /* ── SIDEBAR: CATEGORY CHECKBOXES ──────────────────────────── */
  function renderFilterSidebar() {
    const list = document.getElementById('filterCategoryList');
    if (state.allCategories.length === 0) {
      list.innerHTML = '<div class="filters__option" style="color:var(--color-ink-soft)">No categories yet</div>';
      return;
    }

    list.innerHTML = state.allCategories.map(cat => `
      <label class="filters__option">
        <input type="radio" name="catFilter" value="${cat.id}" ${state.selectedCategoryId === cat.id ? 'checked' : ''} />
        ${cat.emoji || '🌿'} ${cat.name}
        <span class="filters__option-count">${cat.products?.length || 0}</span>
      </label>
    `).join('');

    list.querySelectorAll('input[name="catFilter"]').forEach(input => {
      input.addEventListener('change', () => {
        state.selectedCategoryId = input.value;
        state.page = 1;
        updateUrl();
        applyFiltersAndRender();
        closeMobileFilters();
      });
    });
  }

  function updateUrl() {
    const params = new URLSearchParams();
    if (state.selectedCategoryId) params.set('cat', state.selectedCategoryId);
    if (state.bestsellerOnly) params.set('filter', 'bestsellers');
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }

  /* ── FILTER + SORT + PAGINATE ─────────────────────────────── */
  function applyFiltersAndRender() {
    let list = [...state.allProducts];

    if (state.selectedCategoryId) {
      list = list.filter(p => p.category_id === state.selectedCategoryId);
    }
    if (state.bestsellerOnly) list = list.filter(p => p.is_bestseller);
    if (state.newOnly) list = list.filter(p => p.is_new);
    if (state.priceMin != null) list = list.filter(p => p.price >= state.priceMin);
    if (state.priceMax != null) list = list.filter(p => p.price <= state.priceMax);

    switch (state.sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    renderPageHead(list.length);
    renderActiveFilterChips();

    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = list.slice(start, start + PAGE_SIZE);

    renderGrid(pageItems, list.length);
    renderPagination(list.length);
  }

  /* ── PAGE HEAD (title, breadcrumb, count) ─────────────────── */
  function renderPageHead(total) {
    const titleEl = document.getElementById('pageTitle');
    const iconEl = document.getElementById('pageIcon');
    const breadcrumbEl = document.getElementById('breadcrumbCurrent');
    const subcountEl = document.getElementById('pageSubcount');

    if (state.selectedCategoryId) {
      const cat = state.allCategories.find(c => c.id === state.selectedCategoryId);
      if (cat) {
        titleEl.textContent = cat.name;
        iconEl.textContent = cat.emoji || '🌿';
        breadcrumbEl.textContent = cat.name;
      }
    } else if (state.bestsellerOnly) {
      titleEl.textContent = 'Best Sellers';
      iconEl.textContent = '⚡';
      breadcrumbEl.textContent = 'Best Sellers';
    } else {
      titleEl.textContent = 'All Products';
      iconEl.textContent = '🛍️';
      breadcrumbEl.textContent = 'All Products';
    }

    subcountEl.textContent = `${total} product${total !== 1 ? 's' : ''} available`;
    document.getElementById('resultCount').innerHTML = `Showing <strong>${total}</strong> result${total !== 1 ? 's' : ''}`;
  }

  /* ── ACTIVE FILTER CHIPS ───────────────────────────────────── */
  function renderActiveFilterChips() {
    const container = document.getElementById('activeFilters');
    const chips = [];

    if (state.selectedCategoryId) {
      const cat = state.allCategories.find(c => c.id === state.selectedCategoryId);
      if (cat) chips.push({ label: cat.name, clear: () => { state.selectedCategoryId = null; } });
    }
    if (state.bestsellerOnly) chips.push({ label: 'Bestsellers', clear: () => { state.bestsellerOnly = false; document.getElementById('filterBestseller').checked = false; } });
    if (state.newOnly) chips.push({ label: 'New Arrivals', clear: () => { state.newOnly = false; document.getElementById('filterNew').checked = false; } });
    if (state.priceMin != null || state.priceMax != null) {
      chips.push({
        label: `₹${state.priceMin || 0} – ₹${state.priceMax || '∞'}`,
        clear: () => { state.priceMin = null; state.priceMax = null; document.getElementById('priceMin').value = ''; document.getElementById('priceMax').value = ''; }
      });
    }

    container.innerHTML = chips.map((chip, i) => `
      <span class="active-filter-chip">${chip.label} <button data-chip-index="${i}">✕</button></span>
    `).join('');

    container.querySelectorAll('button[data-chip-index]').forEach(btn => {
      btn.addEventListener('click', () => {
        chips[+btn.dataset.chipIndex].clear();
        state.page = 1;
        updateUrl();
        renderFilterSidebar();
        applyFiltersAndRender();
      });
    });
  }

  /* ── PRODUCT GRID ──────────────────────────────────────────── */
  function renderGrid(items, totalCount) {
    const grid = document.getElementById('catProductGrid');

    if (totalCount === 0) {
      grid.innerHTML = `
        <div class="cat-grid__empty">
          <div class="cat-grid__empty-icon">🌿</div>
          <h3>No products match your filters</h3>
          <p>Try adjusting or clearing your filters to see more products.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(p => `
      <div class="product-card">
        <a href="product-detail.html?id=${p.id}" class="product-card__media">
          ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" loading="lazy" />` : `<span class="fallback-emoji">🌿</span>`}
          ${p.is_bestseller ? '<span class="badge badge--accent product-card__badge">⚡ Bestseller</span>' : ''}
        </a>
        <div class="product-card__body">
          <div class="product-card__cat">${p.categories?.name || ''}</div>
          <a href="product-detail.html?id=${p.id}" class="product-card__name">${p.name}</a>
          <div class="product-card__desc">${p.description || ''}</div>
          <div class="product-card__footer">
            <div class="product-card__price">
              ₹${p.price}${p.mrp && p.mrp > p.price ? `<span class="mrp">₹${p.mrp}</span>` : ''}
            </div>
            <button class="product-card__add" data-id="${p.id}" aria-label="Add to cart">
              <svg viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.product-card__add').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = state.allProducts.find(p => p.id === btn.dataset.id);
        if (product && typeof window.bansiAddToCart === 'function') window.bansiAddToCart(product, btn);
      });
    });
  }

  /* ── PAGINATION ────────────────────────────────────────────── */
  function renderPagination(totalCount) {
    const container = document.getElementById('catPagination');
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let buttons = `<button id="pagePrev" ${state.page === 1 ? 'disabled' : ''}>‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      buttons += `<button data-page="${i}" class="${i === state.page ? 'is-active' : ''}">${i}</button>`;
    }
    buttons += `<button id="pageNext" ${state.page === totalPages ? 'disabled' : ''}>›</button>`;

    container.innerHTML = buttons;

    container.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => { state.page = +btn.dataset.page; applyFiltersAndRender(); scrollToTop(); });
    });
    document.getElementById('pagePrev')?.addEventListener('click', () => { state.page--; applyFiltersAndRender(); scrollToTop(); });
    document.getElementById('pageNext')?.addEventListener('click', () => { state.page++; applyFiltersAndRender(); scrollToTop(); });
  }

  function scrollToTop() {
    document.querySelector('.cat-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── FILTER CONTROLS ───────────────────────────────────────── */
  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    state.sort = e.target.value;
    state.page = 1;
    applyFiltersAndRender();
  });

  document.getElementById('filterBestseller')?.addEventListener('change', (e) => {
    state.bestsellerOnly = e.target.checked;
    state.page = 1;
    updateUrl();
    applyFiltersAndRender();
  });

  document.getElementById('filterNew')?.addEventListener('change', (e) => {
    state.newOnly = e.target.checked;
    state.page = 1;
    applyFiltersAndRender();
  });

  document.getElementById('applyPriceFilter')?.addEventListener('click', () => {
    const min = document.getElementById('priceMin').value;
    const max = document.getElementById('priceMax').value;
    state.priceMin = min ? Number(min) : null;
    state.priceMax = max ? Number(max) : null;
    state.page = 1;
    applyFiltersAndRender();
    closeMobileFilters();
  });

  document.getElementById('clearCategoryFilter')?.addEventListener('click', (e) => {
    e.preventDefault();
    state.selectedCategoryId = null;
    document.querySelectorAll('input[name="catFilter"]').forEach(i => i.checked = false);
    state.page = 1;
    updateUrl();
    applyFiltersAndRender();
  });

  /* ── MOBILE FILTER DRAWER ──────────────────────────────────── */
  function openMobileFilters() {
    document.getElementById('filtersPanel').classList.add('is-open');
    document.getElementById('filtersBackdrop').classList.add('is-open');
  }
  function closeMobileFilters() {
    document.getElementById('filtersPanel').classList.remove('is-open');
    document.getElementById('filtersBackdrop').classList.remove('is-open');
  }
  document.getElementById('filtersOpenBtn')?.addEventListener('click', openMobileFilters);
  document.getElementById('filtersClose')?.addEventListener('click', closeMobileFilters);
  document.getElementById('filtersBackdrop')?.addEventListener('click', closeMobileFilters);

  /* ── INIT ──────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', loadData);

})();