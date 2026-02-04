window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

})


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