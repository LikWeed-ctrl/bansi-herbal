/* ═══════════════════════════════════════════════════════════
   BANSI HERBAL — PRODUCT DETAIL PAGE LOGIC
   product-detail.js — Reads ?id= from the URL, fetches the
   product from Supabase, and populates every slot in
   product-detail.html. Also wires the quantity stepper.
   Task 11 (weight selector) and Task 12 (action buttons + tabs)
   inject into the #pdWeightSelectorSlot, #pdActionsSlot, and
   #pdTabsSlot elements — this file just exposes the loaded
   product via window.pdProduct so those scripts can read it.
   ═══════════════════════════════════════════════════════════ */

(function () {

  // Shared quantity state — read by Task 12 action buttons
  window.pdQty = 1;
  window.pdProduct = null;

  /* ── LOAD PRODUCT ──────────────────────────────────────────── */
  async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id || typeof supabaseClient === 'undefined') {
      showNotFound();
      return;
    }

    const { data: product, error } = await supabaseClient
      .from('products')
      .select('*, categories(id, name)')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      showNotFound();
      return;
    }

    window.pdProduct = product;
    populatePage(product);
  }

  /* ── POPULATE PAGE ─────────────────────────────────────────── */
  function populatePage(p) {
    // <title> and meta
    document.getElementById('pageTitleTag').textContent = `${p.name} – Bansi Herbal`;
    const metaDesc = document.getElementById('metaDescTag');
    if (metaDesc && p.description) metaDesc.setAttribute('content', p.description);

    // Breadcrumb
    document.getElementById('pdBreadcrumbCurrent').textContent = p.name;
    const catLink = document.getElementById('pdCategoryLink');
    if (p.categories) {
      catLink.textContent = p.categories.name;
      catLink.href = `category.html?cat=${p.categories.id}`;
    } else {
      catLink.closest('.pd-details__cat').style.display = 'none';
    }

    // Title
    document.getElementById('pdTitle').textContent = p.name;

    // Image
    const galleryMain = document.getElementById('pdGalleryMain');
    if (p.image_url) {
      galleryMain.innerHTML = `
        <img src="${p.image_url}" alt="${p.name}" />
        ${p.is_bestseller ? '<span class="badge badge--accent pd-gallery__badge">⚡ Bestseller</span>' : ''}
      `;
    } else {
      galleryMain.innerHTML = `
        <span class="fallback-emoji">🌿</span>
        ${p.is_bestseller ? '<span class="badge badge--accent pd-gallery__badge">⚡ Bestseller</span>' : ''}
      `;
    }

    // Price
    document.getElementById('pdPrice').textContent = `₹${p.price}`;
    if (p.mrp && p.mrp > p.price) {
      const savings = Math.round(((p.mrp - p.price) / p.mrp) * 100);
      document.getElementById('pdMrp').textContent = `₹${p.mrp}`;
      document.getElementById('pdMrp').style.display = 'inline';
      document.getElementById('pdDiscount').textContent = `${savings}% off`;
      document.getElementById('pdDiscount').style.display = 'inline';
    }

    // Description
    document.getElementById('pdDesc').textContent = p.description || 'Pure Ayurvedic formulation.';

    // Show layout, hide loading
    document.getElementById('pdLoading').style.display = 'none';
    document.getElementById('pdLayout').style.display = 'grid';

    // Fire an event so Task 11 + Task 12 scripts know the product is ready
    document.dispatchEvent(new CustomEvent('pdProductReady', { detail: p }));
  }

  /* ── NOT FOUND ─────────────────────────────────────────────── */
  function showNotFound() {
    document.getElementById('pdLoading').style.display = 'none';
    document.getElementById('pdNotFound').style.display = 'block';
  }

  /* ── QUANTITY STEPPER ──────────────────────────────────────── */
  function initQtyStepper() {
    const minusBtn = document.getElementById('pdQtyMinus');
    const plusBtn  = document.getElementById('pdQtyPlus');
    const display  = document.getElementById('pdQtyValue');

    if (!minusBtn || !plusBtn || !display) return;

    minusBtn.addEventListener('click', () => {
      if (window.pdQty > 1) {
        window.pdQty--;
        display.textContent = window.pdQty;
      }
    });

    plusBtn.addEventListener('click', () => {
      window.pdQty++;
      display.textContent = window.pdQty;
    });
  }

  /* ── INIT ──────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initQtyStepper();
    loadProduct();
  });

})();