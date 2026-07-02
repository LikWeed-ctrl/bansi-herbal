/* ═══════════════════════════════════════════════════════════
   BANSI HERBAL — PRODUCT VARIANT SELECTOR (Task 11)
   product-variants.js — Waits for the pdProductReady event
   fired by product-detail.js, then:
     - Fetches variants for that product from product_variants
     - Renders pill buttons into #pdWeightSelectorSlot
     - Updates the displayed price live when a pill is selected
     - Exposes window.pdSelectedVariant for Task 12 (cart/WA)
   ═══════════════════════════════════════════════════════════ */

(function () {

  // Shared state — read by product-actions.js (Task 12)
  window.pdSelectedVariant = null;

  /* ── LOAD VARIANTS ─────────────────────────────────────────── */
  async function loadVariants(product) {
    const slot = document.getElementById('pdWeightSelectorSlot');
    if (!slot || typeof supabaseClient === 'undefined') return;

    const { data: variants, error } = await supabaseClient
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true });

    // If no variants exist for this product, slot stays empty —
    // the base price shown by product-detail.js is used as-is,
    // and Task 12 won't require a variant selection before ordering.
    if (error || !variants || variants.length === 0) {
      window.pdSelectedVariant = null;
      // Fire event so Task 12 knows variants are resolved (even if empty)
      document.dispatchEvent(new CustomEvent('pdVariantsReady', { detail: [] }));
      return;
    }

    renderVariantSelector(product, variants);
    document.dispatchEvent(new CustomEvent('pdVariantsReady', { detail: variants }));
  }

  /* ── RENDER SELECTOR ───────────────────────────────────────── */
  function renderVariantSelector(product, variants) {
    const slot = document.getElementById('pdWeightSelectorSlot');

    slot.innerHTML = `
      <div class="pd-variants">
        <div class="pd-variants__label">
          Size / Quantity
          <span id="pdSelectedVariantLabel">— select one</span>
        </div>
        <div class="pd-variants__pills" id="pdVariantPills">
          ${variants.map(v => `
            <button
              class="pd-variant-pill"
              data-id="${v.id}"
              data-label="${v.label}"
              data-price="${v.price}"
              type="button"
            >
              <span class="pd-variant-pill__label">${v.label}</span>
              <span class="pd-variant-pill__price">₹${v.price}</span>
            </button>
          `).join('')}
        </div>
        <div class="pd-variants__warning" id="pdVariantWarning">
          <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v4M8 11v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Please select a size before adding to cart
        </div>
      </div>
    `;

    // Wire up pill clicks
    slot.querySelectorAll('.pd-variant-pill').forEach(pill => {
      pill.addEventListener('click', () => selectVariant(pill, variants));
    });

    // Auto-select first variant for better UX
    const firstPill = slot.querySelector('.pd-variant-pill');
    if (firstPill) selectVariant(firstPill, variants);
  }

  /* ── SELECT A VARIANT ──────────────────────────────────────── */
  function selectVariant(pill, variants) {
    // Deselect all pills
    document.querySelectorAll('.pd-variant-pill').forEach(p => p.classList.remove('is-selected'));

    // Select clicked pill
    pill.classList.add('is-selected');

    // Store selected variant globally
    const variantId = pill.dataset.id;
    window.pdSelectedVariant = variants.find(v => v.id === variantId);

    // Update the label next to "Size / Quantity"
    const labelEl = document.getElementById('pdSelectedVariantLabel');
    if (labelEl && window.pdSelectedVariant) {
      labelEl.textContent = window.pdSelectedVariant.label;
    }

    // Update the main price display live
    const priceEl = document.getElementById('pdPrice');
    if (priceEl && window.pdSelectedVariant) {
      priceEl.textContent = `₹${window.pdSelectedVariant.price}`;
    }

    // Hide any "please select" warning
    const warning = document.getElementById('pdVariantWarning');
    if (warning) warning.classList.remove('is-visible');
  }

  /* Show the warning — called by Task 12 if user tries to order
     without selecting a variant. Exposed on window so Task 12
     can call it without needing to know the DOM itself. */
  window.pdShowVariantWarning = function () {
    const warning = document.getElementById('pdVariantWarning');
    if (warning) {
      warning.classList.add('is-visible');
      warning.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  /* ── INIT — wait for product to load first ─────────────────── */
  document.addEventListener('pdProductReady', (e) => {
    loadVariants(e.detail);
  });

})();