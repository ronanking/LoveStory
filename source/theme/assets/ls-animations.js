/* Love Story Atelier — Animation layer */

/* ---- Hero crossfade slideshow ---- */
(function () {
  var slides = document.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;

  var current = 0;
  var dots = document.querySelectorAll('.hero-dot');

  function goTo(n) {
    slides[current].classList.remove('active');
    if (dots.length) dots[current].classList.remove('active');

    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots.length) dots[current].classList.add('active');

    /* Reset Ken Burns on newly active slide */
    var img = slides[current].querySelector('img');
    if (img) {
      img.style.animation = 'none';
      img.getBoundingClientRect(); /* force reflow */
      img.style.animation = '';
    }
  }

  /* Dot click */
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      clearInterval(timer);
      goTo(i);
      timer = setInterval(function () { goTo(current + 1); }, 5800);
    });
  });

  var timer = setInterval(function () { goTo(current + 1); }, 5800);
})();

/* ---- Process steps — staggered reveal ---- */
(function () {
  var steps = document.querySelectorAll('.process-step');
  if (!steps.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var idx = Array.prototype.indexOf.call(steps, entry.target);
      setTimeout(function () {
        entry.target.classList.add('ls-step-in');
      }, idx * 165);
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

  steps.forEach(function (s) { io.observe(s); });
})();

/* ---- Final CTA — parallax background ---- */
(function () {
  var el = document.querySelector('.final-cta__parallax');
  if (!el) return;

  var cta = el.closest('.final-cta');
  var ticking = false;

  function update() {
    var rect = cta.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) { ticking = false; return; }
    var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    el.style.transform = 'translateY(' + ((progress - 0.5) * -40) + 'px)';
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  update();
})();

/* ---- Custom cursor (ring + dot) ---- */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var dot = document.createElement('div');
  dot.className = 'ls-cursor';
  var ring = document.createElement('div');
  ring.className = 'ls-cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  var mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    document.body.classList.remove('ls-cursor-out');
  });
  document.addEventListener('mouseleave', function () {
    document.body.classList.add('ls-cursor-out');
  });

  (function tick() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = (Math.round(rx * 10) / 10) + 'px';
    ring.style.top  = (Math.round(ry * 10) / 10) + 'px';
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a, button, [data-veil-card], .filter-chip, .form-chip, .veil-card').forEach(function (el) {
    el.addEventListener('mouseenter', function () { document.body.classList.add('ls-cursor-hover'); });
    el.addEventListener('mouseleave', function () { document.body.classList.remove('ls-cursor-hover'); });
  });
})();

/* ---- Quick view on veil cards ---- */
(function () {
  var cards = document.querySelectorAll('[data-veil-card]');
  if (!cards.length) return;

  var overlay = document.createElement('div');
  overlay.className = 'ls-qv-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML =
    '<div class="ls-qv-modal">' +
      '<button class="ls-qv-close" aria-label="Close">&#10005;</button>' +
      '<div class="ls-qv-img"><img id="ls-qv-img" src="" alt=""></div>' +
      '<div class="ls-qv-body">' +
        '<div class="ls-eyebrow" id="ls-qv-eyebrow"></div>' +
        '<h2 class="ls-qv-title" id="ls-qv-title"></h2>' +
        '<div class="ls-qv-meta">' +
          '<span id="ls-qv-silhouette"></span>' +
          '<span id="ls-qv-edge"></span>' +
        '</div>' +
        '<div class="ls-qv-mto" id="ls-qv-mto"></div>' +
        '<a href="/pages/contact#enquiry" class="ls-qv-btn">Enquire about this veil</a>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  function openQV(card) {
    var img        = card.querySelector('.veil-card__img img');
    var eyebrow    = card.querySelector('.ls-photo__eyebrow');
    var title      = card.querySelector('.veil-card__name');
    var silhouette = card.querySelector('.veil-card__silhouette');
    var edge       = card.querySelector('.veil-card__edge');
    var mto        = card.querySelector('.veil-card__mto');

    overlay.querySelector('#ls-qv-img').src       = img        ? img.src         : '';
    overlay.querySelector('#ls-qv-img').alt       = img        ? img.alt         : '';
    overlay.querySelector('#ls-qv-eyebrow').textContent = eyebrow ? eyebrow.textContent : '';
    overlay.querySelector('#ls-qv-title').textContent   = title    ? title.textContent   : '';
    overlay.querySelector('#ls-qv-silhouette').textContent = silhouette ? silhouette.textContent : '';
    overlay.querySelector('#ls-qv-edge').innerHTML = edge ? edge.innerHTML : '';
    overlay.querySelector('#ls-qv-mto').textContent = mto  ? mto.textContent  : '';

    overlay.classList.add('ls-qv-open');
    document.body.style.overflow = 'hidden';
  }

  function closeQV() {
    overlay.classList.remove('ls-qv-open');
    document.body.style.overflow = '';
  }

  cards.forEach(function (card) {
    var imgWrap = card.querySelector('.ls-photo.veil-card__img');
    if (!imgWrap) return;
    var btn = document.createElement('button');
    btn.className = 'ls-qv-trigger';
    btn.textContent = 'Quick view';
    btn.setAttribute('type', 'button');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openQV(card);
    });
    imgWrap.appendChild(btn);
  });

  overlay.querySelector('.ls-qv-close').addEventListener('click', closeQV);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeQV(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeQV(); });
})();

/* ---- Silhouette guide — lazy-susan carousel ---- */
(function () {
  var guide = document.querySelector('[data-sg-carousel]');
  if (!guide) return;

  var photos = Array.prototype.slice.call(guide.querySelectorAll('[data-sg-photo]'));
  var panels = Array.prototype.slice.call(guide.querySelectorAll('[data-sg-panel]'));
  var dots   = Array.prototype.slice.call(guide.querySelectorAll('.sg-dot'));
  var btnPrev = guide.querySelector('.sg-arrow--prev');
  var btnNext = guide.querySelector('.sg-arrow--next');
  var count  = photos.length;
  var current = 0;

  function getPositions() {
    var w = guide.querySelector('.sg-stage').offsetWidth;
    var mobile = w < 500;
    if (mobile) {
      return [
        { x: -160, size: 64,  opacity: 0.20, z: 0, y: 10 },
        { x:  -88, size: 96,  opacity: 0.50, z: 2, y: 4  },
        { x:    0, size: 136, opacity: 1.00, z: 4, y: 0  },
        { x:   88, size: 96,  opacity: 0.50, z: 2, y: 4  },
        { x:  160, size: 64,  opacity: 0.20, z: 0, y: 10 },
      ];
    }
    return [
      { x: -440, size: 88,  opacity: 0.20, z: 0, y: 14 },
      { x: -240, size: 136, opacity: 0.55, z: 2, y: 5  },
      { x:    0, size: 196, opacity: 1.00, z: 4, y: 0  },
      { x:  240, size: 136, opacity: 0.55, z: 2, y: 5  },
      { x:  440, size: 88,  opacity: 0.20, z: 0, y: 14 },
    ];
  }

  function render() {
    var positions = getPositions();
    photos.forEach(function (photo, i) {
      var offset = ((i - current) % count + count) % count;
      if (offset > Math.floor(count / 2)) offset -= count;
      var clampedOffset = Math.max(-2, Math.min(2, offset));
      var pos = positions[clampedOffset + 2];
      photo.style.width   = pos.size + 'px';
      photo.style.height  = pos.size + 'px';
      photo.style.opacity = pos.opacity;
      photo.style.zIndex  = pos.z;
      photo.style.transform = 'translate(calc(-50% + ' + pos.x + 'px), calc(-50% + ' + pos.y + 'px))';
      photo.classList.toggle('sg-active', offset === 0);
    });

    panels.forEach(function (panel, i) {
      var wasActive = panel.classList.contains('sg-panel-active');
      var willActive = i === current;
      if (!wasActive && willActive) {
        panel.classList.add('sg-panel-active');
        /* Reset fill width to 0 then let CSS transition animate to --lw */
        var fill = panel.querySelector('.sg-length-fill');
        if (fill) {
          fill.style.width = '0';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { fill.style.width = ''; });
          });
        }
      } else if (wasActive && !willActive) {
        panel.classList.remove('sg-panel-active');
      }
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('sg-dot-active', i === current);
    });
  }

  function goTo(n) {
    current = ((n % count) + count) % count;
    render();
  }

  /* Arrows */
  if (btnPrev) btnPrev.addEventListener('click', function () { goTo(current - 1); });
  if (btnNext) btnNext.addEventListener('click', function () { goTo(current + 1); });

  /* Dots */
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { goTo(i); });
  });

  /* Photo clicks — clicking non-active photo navigates to it */
  photos.forEach(function (photo, i) {
    photo.addEventListener('click', function () { if (i !== current) goTo(i); });
  });

  /* Keyboard */
  guide.setAttribute('tabindex', '0');
  guide.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  /* Touch swipe */
  var touchStartX = 0;
  guide.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  guide.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  /* "View this style" CTA — click matching filter chip then scroll */
  guide.addEventListener('click', function (e) {
    var cta = e.target.closest('.sg-panel__cta');
    if (!cta) return;
    var filterVal = cta.getAttribute('data-sg-filter');
    if (!filterVal) return;
    var chip = document.querySelector('.filter-chip[data-filter="' + filterVal + '"]');
    if (chip) {
      chip.click();
      setTimeout(function () {
        chip.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }
  });

  /* Resize — re-render with new position config */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 120);
  });

  /* Initial render */
  render();
})();

/* ---- Social feed — marquee on mobile ---- */
(function () {
  if (window.innerWidth >= 720) return;
  var grid = document.querySelector('.social-grid');
  if (!grid) return;

  var tiles = Array.prototype.slice.call(grid.children);
  if (!tiles.length) return;

  var track = document.createElement('div');
  track.className = 'ls-marquee-track';

  tiles.forEach(function (t) { track.appendChild(t); });

  /* Clone for seamless loop */
  tiles.forEach(function (t) {
    track.appendChild(t.cloneNode(true));
  });

  grid.appendChild(track);

  /* Pause on touch */
  track.addEventListener('touchstart', function () {
    track.style.animationPlayState = 'paused';
  }, { passive: true });
  track.addEventListener('touchend', function () {
    track.style.animationPlayState = 'running';
  }, { passive: true });
})();
