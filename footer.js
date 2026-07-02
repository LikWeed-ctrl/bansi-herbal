/* ═══════════════════════════════════════════════════════════
   BANSI HERBAL — FOOTER BEHAVIOR
   footer.js — Loads after footer.html is included and after
   supabaseClient is defined on the page. Pulls address, phone,
   WhatsApp number, tagline, and map embed from the `settings`
   table so the owner can update these from the admin panel —
   no code edits ever needed for this content.
   ═══════════════════════════════════════════════════════════ */

(function () {

  async function loadFooterSettings() {
    document.getElementById('footerYear').textContent = new Date().getFullYear();

    if (typeof supabaseClient === 'undefined') return;

    const { data: settings } = await supabaseClient.from('settings').select('*');
    if (!settings) return;

    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });

    if (map.address) document.getElementById('footerAddress').textContent = map.address;
    if (map.phone_display) document.getElementById('footerPhone').textContent = map.phone_display;
    if (map.about_text) document.getElementById('footerTagline').textContent = map.about_text;

    const waNumber = map.whatsapp_number || '91XXXXXXXXXX';
    document.getElementById('footerWhatsapp').href =
      `https://wa.me/${waNumber}?text=${encodeURIComponent('Hello Bansi Herbal! I have a question.')}`;

    // Google Maps embed URL — set this in Admin → Settings as `map_embed_url`
    // Accepts either a full embed URL or a plain address to search.
    if (map.map_embed_url) {
      const iframe = document.getElementById('footerMapEmbed');
      if (map.map_embed_url.startsWith('http')) {
        iframe.src = map.map_embed_url;
      } else {
        iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(map.map_embed_url)}&output=embed`;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', loadFooterSettings);

})();