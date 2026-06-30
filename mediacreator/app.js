/* ============================================================
   AI MEDIA CREATOR — shared behaviour (single source of truth)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- mobile drawer ---- */
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.drawer');
  const drawerClose = document.querySelector('.drawer-close');
  if (toggle && drawer) {
    const open = () => drawer.classList.add('open');
    const close = () => drawer.classList.remove('open');
    toggle.addEventListener('click', open);
    drawerClose?.addEventListener('click', close);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  /* ---- hero video: reliable muted autoplay + scroll cue ---- */
  const hero = document.getElementById('heroVideo');
  const cue  = document.getElementById('scrollCue');
  if (hero) {
    hero.muted = true;            // muted autoplay is the only kind browsers allow reliably
    hero.play().catch(() => {});
    if (cue) hero.addEventListener('ended', () => cue.classList.add('active'));
  }

  /* ---- lazy-load showcase videos when they scroll into view ---- */
  const lazies = document.querySelectorAll('video[data-lazy]');
  if (lazies.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const v = e.target;
        v.querySelectorAll('source[data-src]').forEach(s => { s.src = s.dataset.src; });
        v.load(); v.play().catch(() => {});
        io.unobserve(v);
      });
    }, { rootMargin: '200px' });
    lazies.forEach(v => io.observe(v));
  }

  /* ---- Nova assistant ---- */
  const fab   = document.getElementById('novaFab');
  const panel = document.getElementById('nova');
  const close = document.getElementById('novaClose');
  const log   = document.getElementById('novaLog');
  const input = document.getElementById('novaInput');
  const send  = document.getElementById('novaSend');
  if (!fab || !panel) return;

  fab.addEventListener('click', () => { panel.classList.add('open'); fab.style.display = 'none'; input?.focus(); });
  close?.addEventListener('click', () => { panel.classList.remove('open'); fab.style.display = 'flex'; });

  const append = (text, who) => {
    const el = document.createElement('div');
    el.className = `msg ${who}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  };

  async function ask() {
    const text = (input.value || '').trim();
    if (!text) return;
    append(text, 'me');
    input.value = '';
    send.disabled = true; send.textContent = '…';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      append(data.reply || 'Sorry — I could not read the reply. Please email us at info@ai-mediacreator.com.', 'ai');
    } catch {
      append('Connection issue. Please email us at info@ai-mediacreator.com and we will get straight back to you.', 'ai');
    } finally {
      send.disabled = false; send.textContent = 'Send';
    }
  }
  send.addEventListener('click', ask);
  input.addEventListener('keypress', e => { if (e.key === 'Enter') ask(); });
});
