/* ═══════════════════════════════════════════════════════════
   BANSI HERBAL — PRODUCT ACTIONS + TABS (Task 12)
   product-actions.js — Waits for pdVariantsReady (fired by
   product-variants.js, Task 11), then:
     - Injects Add to Cart + Buy via WhatsApp buttons
     - Injects Benefits / Ingredients / Description tabs
     - Handles cart logic (respects variant selection)
     - Builds the pre-filled WhatsApp message with
       product name, selected variant, quantity, and prompts
       customer for address
   Load order in product-detail.html:
     product-detail.js → product-variants.js → product-actions.js
   ═══════════════════════════════════════════════════════════ */

(function () {

  const CART_KEY = 'bansi_cart';
  const WA_NUMBER = '919861920320'; // ← replace with your number

  /* ── CART HELPERS ──────────────────────────────────────────── */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    if (typeof window.refreshCartBadge === 'function') window.refreshCartBadge();
  }

  /* ── VALIDATE: variant must be selected if variants exist ──── */
  function variantOk(hasVariants) {
    if (!hasVariants) return true;
    if (window.pdSelectedVariant) return true;
    if (typeof window.pdShowVariantWarning === 'function') window.pdShowVariantWarning();
    return false;
  }

  /* ── ADD TO CART ───────────────────────────────────────────── */
  function addToCart(product, hasVariants) {
    if (!variantOk(hasVariants)) return;

    const variant = window.pdSelectedVariant;
    const qty = window.pdQty || 1;
    const price = variant ? variant.price : product.price;
    const variantLabel = variant ? variant.label : null;

    // Cart key includes variant so same product in diff sizes = diff line items
    const cartKey = variant ? `${product.id}__${variant.id}` : product.id;

    const cart = getCart();
    const existing = cart.find(c => c.cartKey === cartKey);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        cartKey,
        id: product.id,
        name: product.name,
        price,
        variantLabel,
        imageUrl: product.image_url || '',
        qty,
      });
    }

    saveCart(cart);

    // Button feedback
    const btn = document.getElementById('pdAddToCartBtn');
    if (btn) {
      btn.textContent = '✓ Added to Cart!';
      btn.style.background = 'var(--color-primary)';
      setTimeout(() => {
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none"><path d="M3 4h2l1.4 9.4a2 2 0 002 1.6h7.6a2 2 0 002-1.5L19.5 8H6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="19" r="1.3" fill="currentColor"/><circle cx="16" cy="19" r="1.3" fill="currentColor"/></svg>
          Add to Cart
        `;
        btn.style.background = '';
      }, 1800);
    }

    showToast(`${product.name}${variantLabel ? ` (${variantLabel})` : ''} added to cart`);
  }

  /* ── BUY VIA WHATSAPP ──────────────────────────────────────── */
  function buyViaWhatsApp(product, hasVariants) {
    if (!variantOk(hasVariants)) return;

    const variant = window.pdSelectedVariant;
    const qty = window.pdQty || 1;
    const price = variant ? variant.price : product.price;
    const total = price * qty;

    const lines = [
      `🌿 *New Order – Bansi Herbal*`,
      ``,
      `📦 *Product:* ${product.name}`,
      variant ? `📐 *Size:* ${variant.label}` : null,
      `🔢 *Quantity:* ${qty}`,
      `💰 *Price:* ₹${price} × ${qty} = ₹${total}`,
      ``,
      `📍 *My delivery address:* `,
      `📱 *My phone number:* `,
      ``,
      `Please confirm my order. Thank you! 🙏`,
    ].filter(l => l !== null).join('\n');

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank');
  }

  /* ── RENDER ACTION BUTTONS ─────────────────────────────────── */
  function renderActions(product, hasVariants) {
    const slot = document.getElementById('pdActionsSlot');
    if (!slot) return;

    slot.innerHTML = `
      <div class="pd-actions">
        <div class="pd-actions__row">
          <button class="btn btn--primary" id="pdAddToCartBtn" type="button">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 4h2l1.4 9.4a2 2 0 002 1.6h7.6a2 2 0 002-1.5L19.5 8H6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="19" r="1.3" fill="currentColor"/><circle cx="16" cy="19" r="1.3" fill="currentColor"/></svg>
            Add to Cart
          </button>
          <button class="btn btn--whatsapp" id="pdWhatsAppBtn" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.7 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.2-3.8-.8-3.2-1.3-5.2-4.5-5.4-4.7-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.6l1 2.4c.1.2.1.4 0 .6l-.5.7c-.1.2-.3.4-.1.7.2.3.9 1.5 1.9 2.4 1.3 1.2 2.4 1.6 2.7 1.7.3.1.5.1.7-.1l.8-1c.2-.3.5-.2.7-.1l2.1 1c.2.1.4.2.5.3.1.2.1 1-.1 1.7z"/></svg>
            Buy via WhatsApp
          </button>
        </div>
        <div class="pd-actions__note">
          WhatsApp order — we'll confirm stock &amp; deliver to your door
        </div>
      </div>
    `;

    document.getElementById('pdAddToCartBtn').addEventListener('click', () => addToCart(product, hasVariants));
    document.getElementById('pdWhatsAppBtn').addEventListener('click', () => buyViaWhatsApp(product, hasVariants));
  }

  /* ── RENDER TABS ───────────────────────────────────────────── */
  function renderTabs(product) {
    const slot = document.getElementById('pdTabsSlot');
    if (!slot) return;

    // Benefits: admin types one benefit per line in the benefits field
    const benefitLines = (product.benefits || '').trim().split('\n').filter(l => l.trim());
    const benefitsHTML = benefitLines.length > 0
      ? `<ul class="pd-benefits-list">
          ${benefitLines.map(b => `
            <li>
              <svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              ${b.trim()}
            </li>
          `).join('')}
        </ul>`
      : `<p class="pd-tabs__empty">Benefits information coming soon.</p>`;

    const ingredientsHTML = (product.ingredients || '').trim()
      ? `<p>${product.ingredients.trim()}</p>`
      : `<p class="pd-tabs__empty">Ingredients information coming soon.</p>`;

    const descHTML = (product.description || '').trim()
      ? `<p>${product.description.trim()}</p>`
      : `<p class="pd-tabs__empty">No additional description available.</p>`;

    slot.innerHTML = `
      <div class="pd-tabs">
        <div class="pd-tabs__nav">
          <button class="pd-tabs__tab is-active" data-tab="benefits">Benefits</button>
          <button class="pd-tabs__tab" data-tab="ingredients">Ingredients</button>
          <button class="pd-tabs__tab" data-tab="description">Description</button>
        </div>
        <div class="pd-tabs__panel is-active" id="pdTab-benefits">${benefitsHTML}</div>
        <div class="pd-tabs__panel" id="pdTab-ingredients">${ingredientsHTML}</div>
        <div class="pd-tabs__panel" id="pdTab-description">${descHTML}</div>
      </div>
    `;

    // Wire tab switching
    slot.querySelectorAll('.pd-tabs__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        slot.querySelectorAll('.pd-tabs__tab').forEach(t => t.classList.remove('is-active'));
        slot.querySelectorAll('.pd-tabs__panel').forEach(p => p.classList.remove('is-active'));
        tab.classList.add('is-active');
        document.getElementById(`pdTab-${tab.dataset.tab}`).classList.add('is-active');
      });
    });
  }

  /* ── TOAST ─────────────────────────────────────────────────── */
  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast show';
    clearTimeout(window._pdToastTimer);
    window._pdToastTimer = setTimeout(() => { toast.className = 'toast'; }, 2600);
  }

  /* ── INIT — wait for variants to be resolved first ─────────── */
  document.addEventListener('pdVariantsReady', (e) => {
    const product = window.pdProduct;
    if (!product) return;
    const hasVariants = e.detail && e.detail.length > 0;
    renderActions(product, hasVariants);
    renderTabs(product);
  });

})();