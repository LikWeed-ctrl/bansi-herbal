/* ═══════════════════════════════════════════════════════════
   BANSI HERBAL — HOMEPAGE CART
   home-cart.js — Cart sidebar, order modal, WhatsApp order.
   Shared cart key with category-bestsellers.js and product pages.
   ═══════════════════════════════════════════════════════════ */

(function () {

  const CART_KEY = 'bansi_cart';
  const WA_NUMBER = '91XXXXXXXXXX'; // ← replace with your number

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const cart = getCart();
    const count = cart.reduce((s, c) => s + (c.qty || 1), 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  function openCart() {
    document.getElementById('cartOverlay').classList.add('is-open');
    document.getElementById('cartSidebar').classList.add('is-open');
    renderCartItems();
  }

  function closeCart() {
    document.getElementById('cartOverlay').classList.remove('is-open');
    document.getElementById('cartSidebar').classList.remove('is-open');
  }

  function openOrderModal() {
    closeCart();
    document.getElementById('orderModal').classList.add('is-open');
  }

  function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('is-open');
  }

  function renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    const footer = document.getElementById('cartFooter');
    const cart = getCart();

    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;color:var(--color-ink-soft)">
          <div style="font-size:3rem;margin-bottom:1rem">🛒</div>
          <div style="font-weight:600">Your cart is empty</div>
          <div style="font-size:var(--fs-sm);margin-top:4px">Add some products to get started!</div>
        </div>`;
      footer.style.display = 'none';
      return;
    }

    footer.style.display = 'block';
    const total = cart.reduce((s, c) => s + (c.price * c.qty), 0);
    document.getElementById('cartGrandTotal').textContent = `₹${total}`;

    container.innerHTML = cart.map(item => `
      <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--color-border)">
        <div style="width:60px;height:60px;border-radius:8px;background:var(--color-bg-alt);flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden">
          ${item.imageUrl ? `<img src="${item.imageUrl}" style="width:100%;height:100%;object-fit:cover" />` : '🌿'}
        </div>
        <div style="flex:1">
          <div style="font-size:var(--fs-sm);font-weight:600;line-height:1.3">${item.name}</div>
          ${item.variantLabel ? `<div style="font-size:var(--fs-xs);color:var(--color-ink-soft)">${item.variantLabel}</div>` : ''}
          <div style="font-size:var(--fs-sm);color:var(--color-secondary);font-weight:700;margin-top:2px">₹${item.price}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
            <button onclick="changeQty('${item.cartKey || item.id}', -1)" style="width:26px;height:26px;border-radius:6px;border:1px solid var(--color-border);background:var(--color-bg-alt);font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center">−</button>
            <span style="font-size:var(--fs-sm);font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
            <button onclick="changeQty('${item.cartKey || item.id}', 1)" style="width:26px;height:26px;border-radius:6px;border:1px solid var(--color-border);background:var(--color-bg-alt);font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center">+</button>
            <button onclick="removeItem('${item.cartKey || item.id}')" style="margin-left:auto;background:none;border:none;color:var(--color-danger);cursor:pointer;font-size:18px">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function changeQty(cartKey, delta) {
    const cart = getCart();
    const item = cart.find(c => (c.cartKey || c.id) === cartKey);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      saveCart(cart.filter(c => (c.cartKey || c.id) !== cartKey));
    } else {
      saveCart(cart);
    }
    renderCartItems();
  }

  function removeItem(cartKey) {
    saveCart(getCart().filter(c => (c.cartKey || c.id) !== cartKey));
    renderCartItems();
  }

  function sendWhatsAppOrder() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const notes = document.getElementById('custNotes').value.trim();

    if (!name || !phone || !address) {
      const toast = document.getElementById('toast');
      toast.textContent = '⚠️ Please fill in all required fields';
      toast.className = 'toast show error';
      setTimeout(() => { toast.className = 'toast'; }, 2500);
      return;
    }

    const cart = getCart();
    const itemsList = cart.map(c =>
      `  • ${c.name}${c.variantLabel ? ` (${c.variantLabel})` : ''} × ${c.qty} = ₹${c.price * c.qty}`
    ).join('\n');
    const total = cart.reduce((s, c) => s + (c.price * c.qty), 0);

    const message =
      `🌿 *New Order – Bansi Herbal*\n\n` +
      `👤 *Name:* ${name}\n` +
      `📱 *Phone:* ${phone}\n` +
      `📍 *Address:* ${address}\n` +
      (notes ? `📝 *Notes:* ${notes}\n` : '') +
      `\n🛒 *Order:*\n${itemsList}\n\n` +
      `💰 *Total: ₹${total}*\n\n` +
      `Please confirm my order. Thank you! 🙏`;

    const waNum = typeof supabaseClient !== 'undefined'
      ? WA_NUMBER
      : WA_NUMBER;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    closeOrderModal();
    saveCart([]);
    renderCartItems();
  }

  // Expose to global scope so inline onclick handlers work
  window.openCart = openCart;
  window.closeCart = closeCart;
  window.openOrderModal = openOrderModal;
  window.closeOrderModal = closeOrderModal;
  window.changeQty = changeQty;
  window.removeItem = removeItem;
  window.sendWhatsAppOrder = sendWhatsAppOrder;
  window.refreshCartBadge = updateCartBadge;

  document.addEventListener('DOMContentLoaded', updateCartBadge);

})();
