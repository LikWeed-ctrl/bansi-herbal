/* ═══════════════════════════════════════════════════════════
   BANSI HERBAL — HEADER BEHAVIOR
   header.js — Loads after header.html is included and after
   supabaseClient is defined on the page. Handles:
     - Categories dropdown (desktop) + category list (mobile)
     - Live product search
     - Mobile nav open/close
     - Cart badge count (reads from localStorage, shared cart)
   ═══════════════════════════════════════════════════════════ */

(function () {

  /* ── CATEGORIES DROPDOWN ──────────────────────────────────── */
  async function loadHeaderCategories() {
    const panel = document.getElementById('categoriesPanel');
    const mobileList = document.getElementById('mobileCategoriesList');
    if (!panel || typeof supabaseClient === 'undefined') return;

    const { data: cats, error } = await supabaseClient
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !cats || cats.length === 0) {
      panel.innerHTML = '<div class="nav-dropdown__item">No categories yet</div>';
      return;
    }

    panel.innerHTML = cats.map(c => `
      <a href="category.html?cat=${c.id}" class="nav-dropdown__item">
        <span class="nav-dropdown__item-icon">${c.emoji || '🌿'}</span>
        ${c.name}
      </a>
    `).join('') + `
      <div class="nav-dropdown__footer">
        <a href="category.html">View All Categories →</a>
      </div>
    `;

    if (mobileList) {
      mobileList.innerHTML = cats.map(c => `
        <a href="category.html?cat=${c.id}" class="mobile-nav__cat">
          <span class="nav-dropdown__item-icon">${c.emoji || '🌿'}</span>
          ${c.name}
        </a>
      `).join('');
    }
  }

  // Click-to-toggle on the dropdown (works alongside hover for touch devices)
  const dropdown = document.getElementById('categoriesDropdown');
  if (dropdown) {
    const trigger = dropdown.querySelector('.nav-dropdown__trigger');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', dropdown.classList.contains('is-open'));
    });
    document.addEventListener('click', () => dropdown.classList.remove('is-open'));
  }

  /* ── SEARCH ────────────────────────────────────────────────── */
  let searchProductsCache = null;

  async function ensureSearchCache() {
    if (searchProductsCache) return searchProductsCache;
    if (typeof supabaseClient === 'undefined') return [];
    const { data } = await supabaseClient
      .from('products')
      .select('id, name, price, image_url, description, categories(name)')
      .eq('is_active', true);
    searchProductsCache = data || [];
    return searchProductsCache;
  }

  const searchInput = document.getElementById('siteSearchInput');
  const searchPanel = document.getElementById('siteSearchPanel');

  if (searchInput && searchPanel) {
    searchInput.addEventListener('input', async (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) { searchPanel.classList.remove('is-open'); return; }

      const products = await ensureSearchCache();
      const results = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.categories?.name || '').toLowerCase().includes(q)
      ).slice(0, 6);

      searchPanel.innerHTML = results.length === 0
        ? `<div class="site-search__empty">No products found for "${e.target.value}"</div>`
        : results.map(p => `
            <a href="product-detail.html?id=${p.id}" class="site-search__result">
              <img class="site-search__result-thumb" src="${p.image_url || ''}" alt="" onerror="this.style.display='none'" />
              <div>
                <div class="site-search__result-name">${p.name}</div>
                <div class="site-search__result-cat">${p.categories?.name || ''}</div>
              </div>
              <div class="site-search__result-price">₹${p.price}</div>
            </a>
          `).join('');

      searchPanel.classList.add('is-open');
    });

    document.addEventListener('click', (e) => {
      if (!document.getElementById('siteSearch').contains(e.target)) {
        searchPanel.classList.remove('is-open');
      }
    });
  }

  /* ── MOBILE NAV ────────────────────────────────────────────── */
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileClose = document.getElementById('mobileClose');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => mobileNav.classList.add('is-open'));
    mobileClose?.addEventListener('click', () => mobileNav.classList.remove('is-open'));
    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) mobileNav.classList.remove('is-open');
    });
  }

  /* ── CART BADGE ────────────────────────────────────────────── */
  function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    try {
      const cart = JSON.parse(localStorage.getItem('bansi_cart') || '[]');
      const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    } catch (e) {
      badge.style.display = 'none';
    }
  }

  /* ── INIT ──────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    loadHeaderCategories();
    updateCartBadge();
  });

  // Expose so cart-modifying pages can refresh the badge after add/remove
  window.refreshCartBadge = updateCartBadge;

})();