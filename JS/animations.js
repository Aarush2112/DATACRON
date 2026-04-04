/* =================================================================
   Datacron 2026 — Extended Animations JS
   Strict 55-FPS cap (≤ 18.18 ms frame budget).
   GPU-only operations (translate / scale / opacity / rotate).
   No layout reads inside rAF loops.
   ================================================================= */

(() => {
  'use strict';

  /* ── helpers ─────────────────────────────────────────────── */
  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const FPS_CAP    = 55;
  const FRAME_MIN  = 1000 / FPS_CAP;   // ≈ 18.18 ms
  const prefersRM  = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const isMobile   = window.matchMedia?.('(max-width: 768px)').matches;

  /* ── 1.  STAGGER entrance for card grids ──────────────────── */
  const initStagger = () => {
    const groups = [
      { container: '.events-grid',         child: '.event-card' },
      { container: '.grid--featured-events', child: '.event-card' },
      { container: '.grid--3',              child: '.card' },
      { container: '.team-grid',            child: '.team-card' },
      { container: '.feature-grid',         child: '.feature-card' },
    ];

    if (!('IntersectionObserver' in window)) return;

    groups.forEach(({ container, child }) => {
      qsa(container).forEach(grid => {
        const children = qsa(child, grid);
        children.forEach((el, i) => {
          el.classList.add('stagger-child');
          el.style.transitionDelay = `${i * 60}ms`;
        });

        const io = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            qsa('.stagger-child', grid).forEach(el => el.classList.add('is-visible'));
            io.unobserve(grid);
          }
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        io.observe(grid);
      });
    });
  };

  /* ── 2.  REVEAL-LEFT / REVEAL-RIGHT alternating ───────────── */
  const initAltReveal = () => {
    if (!('IntersectionObserver' in window)) return;

    // Sponsor section
    qsa('.sponsor-logo').forEach(el => {
      el.classList.add('reveal-left');
      const io = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { el.classList.add('is-visible'); io.unobserve(el); }
      }, { threshold: 0.2 });
      io.observe(el);
    });

    // feature cards on homepage: even=left, odd=right
    qsa('.feature-card').forEach((el, i) => {
      el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
      const io = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { el.classList.add('is-visible'); io.unobserve(el); }
      }, { threshold: 0.15 });
      io.observe(el);
    });
  };

  /* ── 3.  FLOATING PARTICLES on section titles ─────────────── */
  const floatingParticles = () => {
    if (isMobile || prefersRM) return;

    const titles = qsa('.section__title, .department__title, .events-section__title');
    const particles = [];

    titles.forEach(title => {
      const count = 5;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.setAttribute('aria-hidden', 'true');
        p.style.cssText = `
          position:absolute; pointer-events:none; border-radius:50%;
          width:3px; height:3px;
          background: ${i % 2 === 0 ? 'var(--glow)' : 'var(--accent)'};
          box-shadow: 0 0 6px ${i % 2 === 0 ? 'var(--glow)' : 'var(--accent)'};
          will-change: transform, opacity;
          opacity: 0; z-index: 10;
        `;

        const wrap = title.parentElement || title;
        if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
        wrap.appendChild(p);

        particles.push({
          el: p,
          x: Math.random() * 100,
          y: 50 + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(0.3 + Math.random() * 0.4),
          life: Math.random(),
          decay: 0.003 + Math.random() * 0.003,
        });
      }
    });

    if (particles.length === 0) return;

    let lastTime = performance.now();

    const tick = now => {
      requestAnimationFrame(tick);
      const delta = now - lastTime;
      if (delta < FRAME_MIN) return;
      lastTime = now - (delta % FRAME_MIN);

      particles.forEach(p => {
        p.life -= p.decay;
        if (p.life <= 0) {
          p.life = 1;
          p.x  = Math.random() * 100;
          p.y  = 80 + Math.random() * 20;
          p.vx = (Math.random() - 0.5) * 0.4;
          p.vy = -(0.3 + Math.random() * 0.5);
        }
        p.x += p.vx;
        p.y += p.vy;
        p.el.style.opacity = Math.min(1, p.life * 2);
        p.el.style.transform = `translate3d(${p.x}%, ${p.y}%, 0) scale(${p.life})`;
      });
    };

    requestAnimationFrame(tick);
  };

  /* ── 4.  TWINKLING STAR DOTS in the background ─────────────── */
  const initTwinkles = () => {
    if (isMobile || prefersRM) return;

    const container = qs('#background-container');
    if (!container) return;

    const count = 28;
    const stars = [];
    let lastTime = performance.now();

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.setAttribute('aria-hidden', 'true');

      const size = 1 + Math.random() * 2;
      dot.style.cssText = `
        position:absolute; border-radius:50%;
        width:${size}px; height:${size}px;
        background: rgba(255,255,255,0.9);
        box-shadow: 0 0 4px rgba(0,255,179,0.6);
        pointer-events:none; will-change: opacity, transform;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        opacity: 0; z-index: 0;
      `;
      container.appendChild(dot);

      stars.push({
        el: dot,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
      });
    }

    const tick = now => {
      requestAnimationFrame(tick);
      const delta = now - lastTime;
      if (delta < FRAME_MIN) return;
      lastTime = now - (delta % FRAME_MIN);

      const t = now / 1000;
      stars.forEach(s => {
        const opacity = (Math.sin(t * s.speed + s.phase) + 1) / 2 * 0.6;
        s.el.style.opacity = opacity;
      });
    };

    requestAnimationFrame(tick);
  };

  /* ── 5.  COUNTDOWN NUMBER — tick flash class ──────────────── */
  const initCountdownTick = () => {
    const nums = qsa('.countdown-num, [data-days], [data-hours], [data-minutes], [data-seconds]');
    if (!nums.length) return;

    const mo = new MutationObserver(mutations => {
      mutations.forEach(m => {
        const el = m.target.parentElement ?? m.target;
        if (el.classList.contains('countdown-num') || el.hasAttribute('data-days') ||
            el.hasAttribute('data-hours') || el.hasAttribute('data-minutes') ||
            el.hasAttribute('data-seconds')) {
          el.classList.remove('is-ticking');
          void el.offsetWidth; // reflow once — outside rAF, acceptable
          el.classList.add('is-ticking');
          setTimeout(() => el.classList.remove('is-ticking'), 260);
        }
      });
    });

    nums.forEach(n => mo.observe(n, { childList: true, characterData: true, subtree: true }));
  };

  /* ── 6.  GLOWING TRAIL on mouse (desktop-only) ─────────────── */
  const initTrail = () => {
    if (isMobile || prefersRM) return;

    const TRAIL_COUNT = 10;
    const trail = [];
    let mouseX = -200, mouseY = -200;
    let lastTime = performance.now();

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const dot = document.createElement('div');
      dot.setAttribute('aria-hidden', 'true');
      const size = 4 - i * 0.28;
      dot.style.cssText = `
        position:fixed; border-radius:50%;
        width:${size}px; height:${size}px;
        background: var(--glow);
        pointer-events:none; z-index:9997;
        opacity:0; will-change:transform,opacity;
        margin-left:${-size/2}px; margin-top:${-size/2}px;
      `;
      document.body.appendChild(dot);
      trail.push({ el: dot, x: -200, y: -200 });
    }

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    const tick = now => {
      requestAnimationFrame(tick);
      const delta = now - lastTime;
      if (delta < FRAME_MIN) return;
      lastTime = now - (delta % FRAME_MIN);

      let px = mouseX, py = mouseY;
      trail.forEach((t, i) => {
        t.x += (px - t.x) * (0.35 - i * 0.025);
        t.y += (py - t.y) * (0.35 - i * 0.025);
        const opacity = (1 - i / TRAIL_COUNT) * 0.45;
        t.el.style.opacity  = opacity;
        t.el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`;
        px = t.x; py = t.y;
      });
    };

    requestAnimationFrame(tick);
  };

  /* ── 7.  CARD PARALLAX IMAGE on hover ──────────────────────── */
  const initCardParallax = () => {
    if (isMobile || prefersRM) return;

    const cards = qsa('.event-card, .team-card, .speaker-card');
    cards.forEach(card => {
      const img = qs('img', card);
      if (!img) return;

      card.addEventListener('mousemove', e => {
        const r   = card.getBoundingClientRect();
        const xPct = (e.clientX - r.left)  / r.width  - 0.5;
        const yPct = (e.clientY - r.top)   / r.height - 0.5;
        img.style.transform = `scale(1.08) translate3d(${xPct * -8}px, ${yPct * -8}px, 0)`;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        img.style.transform = '';
      });
    });
  };

  /* ── 8.  NEON-RING entrance for SPEAKER photos ─────────────── */
  const initSpeakerPhotoRings = () => {
    if (prefersRM) return;
    qsa('.card__media.mediaPlaceholder--avatar').forEach(media => {
      media.style.cssText +=
        'box-shadow: 0 0 0 2px rgba(0,255,159,0.12), 0 0 18px rgba(0,255,159,0.08);' +
        'transition: box-shadow 0.4s ease;';

      const card = media.closest('.speaker-card');
      if (!card) return;
      card.addEventListener('mouseenter', () => {
        media.style.boxShadow = '0 0 0 3px rgba(0,255,159,0.45), 0 0 30px rgba(0,255,159,0.2)';
      });
      card.addEventListener('mouseleave', () => {
        media.style.boxShadow = '0 0 0 2px rgba(0,255,159,0.12), 0 0 18px rgba(0,255,159,0.08)';
      });
    });
  };

  /* ── 9.  SECTION TITLE entrance: scale-up bounce ───────────── */
  const initTitleBounce = () => {
    if (prefersRM || !('IntersectionObserver' in window)) return;

    qsa('.section__title, .events-section__title, .department__title, .featured-title').forEach(el => {
      el.style.transformOrigin = 'center bottom';
      el.style.willChange = 'transform';

      const io = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          el.style.animation =
            `titleEntrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both`;
          io.unobserve(el);
        }
      }, { threshold: 0.5 });
      io.observe(el);
    });

    // Inject keyframe once
    if (!qs('#dc-title-bounce-kf')) {
      const s = document.createElement('style');
      s.id = 'dc-title-bounce-kf';
      s.textContent = `
        @keyframes titleEntrance {
          from { opacity: 0; transform: translateY(30px) scale(0.88); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `;
      document.head.appendChild(s);
    }
  };

  /* ── 10.  VIEW-MORE BUTTON — animated arrow ─────────────────── */
  const initViewMoreArrow = () => {
    qsa('.view-more-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        if (btn.dataset.originalText == null) btn.dataset.originalText = btn.textContent;
        btn.textContent = btn.getAttribute('aria-expanded') === 'true'
          ? '▲ ' + (btn.dataset.originalText || 'View Less')
          : '▼ ' + (btn.dataset.originalText || 'View More');
      });
      btn.addEventListener('mouseleave', () => {
        btn.textContent = btn.dataset.originalText || btn.textContent;
      });
    });
  };

  /* ── INIT ─────────────────────────────────────────────────── */
  const initAll = () => {
    if (!prefersRM) {
      initStagger();
      initAltReveal();
      if (!isMobile) {
        floatingParticles();
        initTwinkles();
        initTrail();
        initCardParallax();
      }
      initSpeakerPhotoRings();
      initTitleBounce();
    }
    initCountdownTick();
    initViewMoreArrow();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
