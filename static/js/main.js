// ============================================================
// Causal-Adapter Project Page — Main JavaScript (v2)
// ============================================================

(function () {
  // ---- Image preload cache ----
  const cache = new Map();

  function buildSrc(prefix, idx, suffix) {
    return `${prefix}${idx}${suffix || ''}`;
  }

  function preloadOne(url) {
    if (cache.has(url)) return;
    const im = new Image();
    im.decoding = 'async';
    im.src = url;
    cache.set(url, im);
  }

  function preloadChunked(prefix, suffix, min, max, chunk, delay) {
    let cur = min;
    (function tick() {
      const end = Math.min(cur + chunk - 1, max);
      for (let i = cur; i <= end; i++) preloadOne(buildSrc(prefix, i, suffix));
      cur = end + 1;
      if (cur <= max) setTimeout(tick, delay);
    })();
  }

  // ---- Init traversal sliders ----
  function initSlider(slider) {
    const imgEl = document.getElementById(slider.dataset.targetImg);
    if (!imgEl) return;

    const prefix = slider.dataset.prefix;
    const suffix = slider.dataset.suffix || '';
    const min = parseInt(slider.min, 10);
    const max = parseInt(slider.max, 10);
    const radius = parseInt(slider.dataset.preloadRadius || '3', 10);
    const chunk = parseInt(slider.dataset.preloadChunk || '8', 10);
    const delay = parseInt(slider.dataset.preloadDelay || '30', 10);

    let v0 = parseInt(slider.value, 10);
    if (isNaN(v0) || v0 < min) v0 = min;
    if (v0 > max) v0 = max;
    slider.value = String(v0);

    function update(val) {
      const v = parseInt(val, 10);
      imgEl.src = buildSrc(prefix, v, suffix);
      const a = Math.max(min, v - radius);
      const b = Math.min(max, v + radius);
      for (let i = a; i <= b; i++) preloadOne(buildSrc(prefix, i, suffix));
    }

    update(slider.value);
    preloadChunked(prefix, suffix, min, max, chunk, delay);

    slider.addEventListener('input', e => update(e.target.value));
    slider.addEventListener('change', e => update(e.target.value));
  }

  // ---- Abstract toggle ----
  function initAbstractToggle() {
    const btn = document.getElementById('abstractToggle');
    const panel = document.getElementById('fullAbstract');
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
      const open = panel.classList.toggle('show');
      btn.querySelector('.toggle-text').textContent = open ? 'Hide Abstract' : 'Read Full Abstract';
      const icon = btn.querySelector('.toggle-icon');
      if (icon) icon.style.transform = open ? 'rotate(180deg)' : '';
    });
  }

  // ---- Insight Tabs ----
  function initInsightTabs() {
    const tabs = document.querySelectorAll('.insight-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // deactivate all
        document.querySelectorAll('.insight-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.insight-panel').forEach(p => p.classList.remove('active'));
        // activate clicked
        tab.classList.add('active');
        const panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ---- Copy BibTeX ----
  window.copyBibTeX = function () {
    const code = document.getElementById('bibtex-code');
    const btn = document.getElementById('copyBtn');
    if (!code || !btn) return;

    navigator.clipboard.writeText(code.textContent).then(() => {
      btn.classList.add('copied');
      btn.querySelector('.copy-label').textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.querySelector('.copy-label').textContent = 'Copy';
      }, 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = code.textContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  };

  // ---- Scroll to top ----
  function initScrollTop() {
    const btn = document.querySelector('.scroll-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Teaser height match ----
  function initTeaserHeight() {
    const img = document.querySelector('.teaser-card .teaser-img');
    const text = document.querySelector('.teaser-card .teaser-text');
    if (!img || !text) return;
    function sync() {
      const h = img.getBoundingClientRect().height;
      if (h > 0) text.style.maxHeight = h + 'px';
    }
    if (img.complete && img.naturalHeight > 0) sync();
    else img.addEventListener('load', sync);
    window.addEventListener('resize', sync);
  }

  // ---- Method highlight hover ----
  function initMethodHighlights() {
    document.querySelectorAll('.method-stage[data-highlight]').forEach(stage => {
      const hl = document.getElementById(stage.dataset.highlight);
      if (!hl) return;
      stage.addEventListener('mouseenter', () => hl.classList.add('active'));
      stage.addEventListener('mouseleave', () => hl.classList.remove('active'));
    });
  }

  // ---- Boot ----
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="range"].demo-slider').forEach(initSlider);
    initAbstractToggle();
    initInsightTabs();
    initScrollTop();
    initTeaserHeight();
    initMethodHighlights();
  });
})();
