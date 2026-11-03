/* =====================================================
   HERA WELLNESS STUDIO — home.js
   Homepage interactions. Other pages keep script.js.
===================================================== */
(() => {
  'use strict';
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Header: solid on scroll ---------- */
  const header = $('#header');
  const hero = $('.hero');
  const setHeader = () => {
    const threshold = hero ? Math.min(hero.offsetHeight - 100, 120) : 40;
    header.classList.toggle('is-solid', window.scrollY > threshold);
  };
  window.addEventListener('scroll', setHeader, { passive: true });
  setHeader();

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  const mq = window.matchMedia('(max-width: 1080px)');
  const setMenu = (open) => {
    header.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
  mq.addEventListener('change', () => setMenu(false));

  /* ---------- Treatments dropdown ---------- */
  const drop = $('.hd__drop');
  const dropBtn = $('.hd__drop-btn');
  const setDrop = (open) => {
    drop.classList.toggle('is-open', open);
    dropBtn.setAttribute('aria-expanded', String(open));
  };
  dropBtn.addEventListener('click', (e) => {
    // On touch / mobile the first tap opens the list instead of jumping
    if (mq.matches || !drop.classList.contains('is-open') && window.matchMedia('(hover: none)').matches) {
      e.preventDefault();
      setDrop(!drop.classList.contains('is-open'));
    }
  });
  drop.addEventListener('mouseenter', () => !mq.matches && dropBtn.setAttribute('aria-expanded', 'true'));
  drop.addEventListener('mouseleave', () => !mq.matches && setDrop(false));
  document.addEventListener('click', (e) => { if (!drop.contains(e.target) && !mq.matches) setDrop(false); });

  // Close the menu after following any in-menu link
  $$('a', nav).forEach((a) => a.addEventListener('click', () => {
    if (a === dropBtn && mq.matches) return;
    setMenu(false); setDrop(false);
  }));

  /* ---------- Smooth anchor scroll (header-aware) ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2 || a.hasAttribute('data-book')) return;
      const el = document.getElementById(id.slice(1));
      if (!el || (a === dropBtn && (mq.matches || window.matchMedia('(hover: none)').matches))) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - (id === '#home' ? 0 : 64);
      window.scrollTo({ top: y, behavior: reduce.matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Scroll reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Gentle parallax ---------- */
  const para = $$('[data-parallax]');
  if (para.length && !reduce.matches) {
    let ticking = false;
    const run = () => {
      const vh = window.innerHeight;
      para.forEach((img) => {
        const box = img.parentElement.getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) return;
        const k = parseFloat(img.dataset.parallax) || 0.1;
        const offset = (box.top + box.height / 2 - vh / 2) * -k;
        img.style.translate = `0 ${offset.toFixed(1)}px`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- Featured carousel ---------- */
  const track = $('#featTrack');
  const bar = $('#featBar');
  const prev = $('[data-feat="prev"]');
  const next = $('[data-feat="next"]');
  if (track) {
    const step = () => {
      const card = $('.fc', track);
      const gap = parseFloat(getComputedStyle(track).columnGap) || 24;
      return card ? card.offsetWidth + gap : 320;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      const w = Math.max(track.clientWidth / track.scrollWidth, 0.12);
      if (bar) { bar.style.width = `${w * 100}%`; bar.style.transform = `translateX(${(p * (1 / w - 1)) * 100}%)`; }
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
    };
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduce.matches ? 'auto' : 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduce.matches ? 'auto' : 'smooth' }));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next?.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev?.click(); }
    });
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();

    // Mouse drag for desktop
    let down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
      track.style.scrollSnapType = 'none'; track.style.scrollBehavior = 'auto';
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      track.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false; track.style.scrollSnapType = ''; track.style.scrollBehavior = '';
    });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());
  }

  /* ---------- Testimonials ---------- */
  const stage = $('#revStage');
  if (stage) {
    const slides = $$('.rq', stage);
    const dots = $$('.rev__dots button', stage);
    let i = 0, timer;
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
      dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === i)));
    };
    const auto = () => {
      clearInterval(timer);
      if (!reduce.matches) timer = setInterval(() => go(i + 1), 7000);
    };
    $('[data-rev="prev"]', stage).addEventListener('click', () => { go(i - 1); auto(); });
    $('[data-rev="next"]', stage).addEventListener('click', () => { go(i + 1); auto(); });
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); auto(); }));
    stage.addEventListener('mouseenter', () => clearInterval(timer));
    stage.addEventListener('mouseleave', auto);
    stage.addEventListener('focusin', () => clearInterval(timer));
    let sx = 0;
    stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) { go(dx < 0 ? i + 1 : i - 1); auto(); }
    });
    go(0); auto();
  }

  /* ---------- Booking dialog (the site's existing consultation form) ---------- */
  const overlay = $('#popupOverlay');
  if (overlay) {
    const form = $('#popupForm');
    const success = $('#popupSuccess');
    const closeBtn = $('#popupClose');
    let lastFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      setMenu(false);
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add('active'));
      document.body.style.overflow = 'hidden';
      setTimeout(() => $('#popup-name')?.focus(), 60);
    };
    const close = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => { overlay.hidden = true; }, reduce.matches ? 0 : 400);
      lastFocus?.focus?.();
    };

    $$('[data-book]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); open(); }));
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => {
      if (overlay.hidden) {
        if (e.key === 'Escape' && header.classList.contains('is-open')) setMenu(false);
        return;
      }
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = $$('button, input, select, textarea, a[href]', overlay).filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });

    // Same behaviour as the existing script.js popup handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach((f) => {
        const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute('aria-invalid', String(bad));
        if (bad) ok = false;
      });
      if (!ok) { $('[aria-invalid="true"]', form)?.focus(); return; }
      const btn = $('.popup-form__submit', form);
      btn.textContent = 'Sending…'; btn.disabled = true;
      setTimeout(() => {
        form.hidden = true;
        success.hidden = false;
        setTimeout(close, 2800);
      }, 1200);
    });
  }

  /* ---------- Footer year ---------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
