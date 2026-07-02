/* ═══════════════════════════════════════════════════════════
   BANSI HERBAL — HERO BEHAVIOR
   hero.js — Loads after hero.html is included and after
   supabaseClient is defined. Handles:
     - Live "products in stock" count on the floating card
     - Swaps in a real hero image if one is set in Admin → Settings
       (key: hero_image_url), otherwise keeps the leaf fallback
   ═══════════════════════════════════════════════════════════ */

(function () {

  async function loadHeroData() {
    if (typeof supabaseClient === 'undefined') return;

    // Live product count
    const { count } = await supabaseClient
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const countEl = document.getElementById('heroProductCount');
    if (countEl) countEl.textContent = count != null ? `${count}+` : '—';

    // Optional hero image from settings (falls back to leaf icon if unset)
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('key, value')
      .eq('key', 'hero_image_url')
      .single();

    const frame = document.getElementById('heroVisualFrame');
    if (frame && settings && settings.value) {
      frame.classList.remove('is-fallback');
      frame.innerHTML = `<img src="${settings.value}" alt="Bansi Herbal Ayurvedic products" />`;
    }
  }

  document.addEventListener('DOMContentLoaded', loadHeroData);

})();