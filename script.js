/* =====================================================
   HERA WELLNESS STUDIO — script.js v4
===================================================== */

/* ── 1. CUSTOM CURSOR ── */
(function initCursor() {
  const spotlight = document.getElementById('cursorSpotlight');
  const dot       = document.getElementById('cursorDot');
  const ring      = document.getElementById('cursorRing');
  if (!spotlight || !dot || !ring) return;

  let mx = -999, my = -999, rx = -999, ry = -999;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    spotlight.style.left = mx + 'px'; spotlight.style.top = my + 'px';
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    spotlight.classList.remove('hidden');
    dot.classList.remove('hidden');
    ring.classList.remove('hidden');
  });

  function animateRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.addEventListener('mouseleave', () => {
    spotlight.classList.add('hidden');
    dot.classList.add('hidden');
    ring.classList.add('hidden');
  });

  const hoverables = 'a,button,.btn,.blog-card,.svc-img-card,.svc-page-card,.team__card,.testi__card,.nav__link,.ba__wrap';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverables)) {
      dot.classList.add('hovering');
      ring.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverables)) {
      dot.classList.remove('hovering');
      ring.classList.remove('hovering');
    }
  });
  document.addEventListener('mousedown', () => ring.classList.add('clicking'));
  document.addEventListener('mouseup',   () => ring.classList.remove('clicking'));
})();

/* ── 2. HEADER SCROLL ── */
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── 3. MOBILE BURGER ── */
(function initBurger() {
  const burger  = document.getElementById('burger');
  const nav     = document.getElementById('nav');
  const backdrop = document.getElementById('navBackdrop');
  if (!burger || !nav) return;

  function closeMenu() {
    burger.classList.remove('open');
    nav.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openMenu() {
    burger.classList.add('open');
    nav.classList.add('open');
    if (backdrop) backdrop.classList.add('show');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  burger.addEventListener('click', () => {
    burger.classList.contains('open') ? closeMenu() : openMenu();
  });
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // Mobile dropdown toggle
  document.querySelectorAll('.nav__has-drop').forEach(item => {
    item.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.stopPropagation();
        item.classList.toggle('open');
      }
    });
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
})();

/* ── 4. SCROLL REVEAL ── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ── 5. COUNTER ANIMATION ── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const dur = 1600;
      let start = null;
      function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => io.observe(c));
})();

/* ── 6. SERVICE SLIDER ── */
(function initSvcSlider() {
  const slider = document.getElementById('svcSlider');
  if (!slider) return;
  const track = slider.querySelector('.svc-slider__track');
  const slides = slider.querySelectorAll('.svc-slide');
  const dots   = slider.querySelectorAll('.svc-dot');
  const prevBtn = slider.querySelector('.svc-prev');
  const nextBtn = slider.querySelector('.svc-next');
  if (!track || !slides.length) return;

  let current = 0, autoTimer, isDragging = false, startX = 0, dragDist = 0;
  const total = slides.length;

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetAuto(); }));
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }
  resetAuto();

  // Touch swipe
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; });
  track.addEventListener('touchmove', e => { if (isDragging) dragDist = e.touches[0].clientX - startX; });
  track.addEventListener('touchend', () => {
    if (isDragging && Math.abs(dragDist) > 50) goTo(dragDist < 0 ? current + 1 : current - 1);
    isDragging = false; dragDist = 0; resetAuto();
  });

  goTo(0);
})();

/* ── 7. ACCORDION / FAQ ── */
(function initAccordion() {
  document.querySelectorAll('.acc__head').forEach(head => {
    head.addEventListener('click', () => {
      const acc = head.closest('.acc');
      const body = acc.querySelector('.acc__body');
      const isOpen = acc.classList.contains('open');
      // Close all
      document.querySelectorAll('.acc').forEach(a => {
        a.classList.remove('open');
        a.querySelector('.acc__body').classList.remove('open');
        a.querySelector('.acc__head').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        acc.classList.add('open');
        body.classList.add('open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
    head.setAttribute('aria-expanded', 'false');
  });
})();

/* ── 8. SCROLL TO TOP ── */
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── 9. POPUP ── */
(function initPopup() {
  const overlay = document.getElementById('popupOverlay');
  const closeBtn = document.getElementById('popupClose');
  const form    = document.getElementById('popupForm');
  const success = document.getElementById('popupSuccess');
  if (!overlay) return;

  const KEY = 'heraPopupShown';

  function openPopup() { overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closePopup() { overlay.classList.remove('active'); document.body.style.overflow = ''; }

  if (!sessionStorage.getItem(KEY)) {
    setTimeout(() => { openPopup(); sessionStorage.setItem(KEY, '1'); }, 2000);
  }
  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(f => {
        if (!f.value.trim()) { f.style.borderColor = '#e05a5a'; valid = false; }
        else f.style.borderColor = '';
      });
      if (!valid) return;
      const btn = form.querySelector('.popup-form__submit');
      btn.textContent = 'Sending…'; btn.disabled = true;
      setTimeout(() => {
        form.style.display = 'none';
        if (success) { success.style.display = 'block'; success.classList.add('show'); }
        setTimeout(closePopup, 2800);
      }, 1200);
    });
  }

  // Allow external trigger
  document.querySelectorAll('[data-popup]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openPopup(); });
  });
})();

/* ── 10. BEFORE/AFTER SLIDER ── */
(function initBA() {
  document.querySelectorAll('.ba__wrap').forEach(wrap => {
    const divider = wrap.querySelector('.ba__divider');
    const afterImg = wrap.querySelector('.ba__img--after');
    if (!divider || !afterImg) return;

    let dragging = false;

    function setPosition(x) {
      const rect = wrap.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(5, Math.min(95, pct));
      divider.style.left = pct + '%';
      afterImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    }

    divider.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
    window.addEventListener('mousemove', e => { if (dragging) setPosition(e.clientX); });
    window.addEventListener('mouseup',   () => { dragging = false; });

    divider.addEventListener('touchstart', e => { dragging = true; e.preventDefault(); }, { passive: false });
    window.addEventListener('touchmove',  e => { if (dragging) setPosition(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend',   () => { dragging = false; });

    setPosition(wrap.getBoundingClientRect().left + wrap.getBoundingClientRect().width * 0.5);
  });
})();

/* ── 11. ACTIVE NAV HIGHLIGHT ── */
(function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ── 12. SMOOTH SCROLL FOR ANCHOR LINKS ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const offset = document.getElementById('header')?.offsetHeight || 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});

