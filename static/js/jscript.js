(function () {
  const preloadCache = new Map(); // url -> Image

  function buildSrc(prefix, idx, suffix) {
    return `${prefix}${idx}${suffix || ""}`;
  }

  function preloadOne(url) {
    if (preloadCache.has(url)) return preloadCache.get(url);
    const im = new Image();
    im.decoding = "async";
    im.src = url;
    preloadCache.set(url, im);
    return im;
  }

  function preloadAllInChunks(prefix, suffix, min, max, chunkSize, delayMs) {
    let cur = min;
    function tick() {
      const end = Math.min(cur + chunkSize - 1, max);
      for (let i = cur; i <= end; i++) {
        preloadOne(buildSrc(prefix, i, suffix));
      }
      cur = end + 1;
      if (cur <= max) setTimeout(tick, delayMs);
    }
    tick();
  }

  function setStepText(slider, value) {
    const stepEl = document.querySelector(`[data-step-for="${slider.id}"]`);
    if (stepEl) stepEl.textContent = String(value);
  }

  function initTraversalSlider(slider) {
    const imgId = slider.dataset.targetImg;
    const imgEl = document.getElementById(imgId);
    if (!imgEl) return;

    const prefix = slider.dataset.prefix;
    const suffix = slider.dataset.suffix || "";

    const min = parseInt(slider.min, 10);
    const max = parseInt(slider.max, 10);

    // ---- Fix common error: value outside [min,max]
    let v0 = parseInt(slider.value, 10);
    if (Number.isNaN(v0)) v0 = min;
    if (v0 < min) v0 = min;
    if (v0 > max) v0 = max;
    slider.value = String(v0);

    const doPreload = slider.dataset.preload === "true";
    const radius = parseInt(slider.dataset.preloadRadius || "2", 10);
    const chunkSize = parseInt(slider.dataset.preloadChunk || "6", 10);
    const delayMs = parseInt(slider.dataset.preloadDelay || "25", 10);

    function update(val) {
      const v = parseInt(val, 10);
      imgEl.src = buildSrc(prefix, v, suffix);
      setStepText(slider, v);

      // opportunistic near-preload
      if (doPreload) {
        const a = Math.max(min, v - radius);
        const b = Math.min(max, v + radius);
        for (let i = a; i <= b; i++) preloadOne(buildSrc(prefix, i, suffix));
      }
    }

    // init
    update(slider.value);

    // preload
    if (doPreload) {
      const cur = parseInt(slider.value, 10);
      const a = Math.max(min, cur - radius);
      const b = Math.min(max, cur + radius);
      for (let i = a; i <= b; i++) preloadOne(buildSrc(prefix, i, suffix));
      preloadAllInChunks(prefix, suffix, min, max, chunkSize, delayMs);
    }

    slider.addEventListener("input", (e) => update(e.target.value));
    slider.addEventListener("change", (e) => update(e.target.value));
  }

  document.addEventListener("DOMContentLoaded", () => {
    // ✅兼容两种 class：trv-slider / slider2
    const sliders = document.querySelectorAll(
      'input[type="range"].trv-slider, input[type="range"].slider2'
    );
    sliders.forEach(initTraversalSlider);
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("range_skin3d");
  const img = document.getElementById("img_skin3d");

  if (!slider) { console.error("❌ slider #range_skin3d not found"); return; }
  if (!img) { console.error("❌ image #img_skin3d not found"); return; }

  console.log("✅ slider found:", slider);
  console.log("✅ img found:", img);

  function update() {
    const v = slider.value;
    const prefix = slider.dataset.prefix;
    const suffix = slider.dataset.suffix || "";
    const newSrc = `${prefix}${v}${suffix}`;

    console.log("➡️ update image to:", newSrc);
    img.src = newSrc;
  }

  // init + bind
  update();
  slider.addEventListener("input", update);
  slider.addEventListener("change", update);
});