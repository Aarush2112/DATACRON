/* =========================
   Datacron — JS (all pages)
   - Galaxy particle cursor
   - Hero starfield (index only)
   - Scroll reveal, mobile nav
   ========================= */

(() => {
  "use strict";

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Custom highlight cursor ----------
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window;
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!isTouchDevice && !prefersReducedMotion) {
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
    document.body.classList.add("has-custom-cursor");

    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let hasMoved = false;
    let currentScale = 1;
    let targetScale = 1;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        cursorX = mouseX;
        cursorY = mouseY;
        cursor.style.opacity = "1";
      }
    });

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, .card")) {
        targetScale = 1.5;
        cursor.classList.add("is-hovering");
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, .card")) {
        targetScale = 1;
        cursor.classList.remove("is-hovering");
      }
    });

    function tick() {
      if (hasMoved) {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        currentScale += (targetScale - currentScale) * 0.2;
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) scale(${currentScale})`;
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ---------- Footer year ----------
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Mobile nav ----------
  const navToggle = qs(".nav__toggle");
  const navMenu = qs("#navMenu");
  const navLinks = qsa(".nav__link", navMenu || document);

  const setMenuOpen = (open) => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!expanded);
    });

    // Close menu when clicking a link (especially anchors)
    navLinks.forEach((a) => {
      a.addEventListener("click", () => setMenuOpen(false));
    });

    // Close menu on outside click (mobile)
    document.addEventListener("click", (e) => {
      const target = e.target;
      const isInsideNav = target && (target.closest(".nav") || target.closest("#navMenu"));
      const isOpen = navMenu.classList.contains("is-open");
      if (isOpen && !isInsideNav) setMenuOpen(false);
    });

    // Close menu on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    });
  }

  // ---------- Scroll reveal ----------
  const revealEls = qsa(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Ultra-Lightweight Hero Starfield ----------
  const canvas = qs("#starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  /** @type {{x:number,y:number,vx:number,vy:number,r:number,a:number}[]} */
  let nodes = [];
  let rafId = 0;
  let lastTime = 0;
  let isRunning = false;
  
  // High performance cap: ~80-120ms per frame update (approx 10 FPS)
  const FPS = 10;
  const frameInterval = 1000 / FPS;

  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const isMobile = w < 768;
    // Aggressive particle reduction
    const maxParticles = isMobile ? 12 : 25;
    const target = clamp(Math.floor((w * h) / 25000), 8, maxParticles);
    
    nodes = Array.from({ length: target }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      // Very slow cosmic dust drift speed (mapped slightly differently for 10 FPS delta bounds)
      vx: rand(-0.25, 0.25) * (Math.random() > 0.5 ? 1 : -1),
      vy: rand(-0.25, 0.25) * (Math.random() > 0.5 ? 1 : -1),
      r: rand(1.0, 2.2),
      a: rand(0.5, 0.9),
    }));
  };

  const draw = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const isMobile = w < 768;

    ctx.clearRect(0, 0, w, h);

    // Update positions - completely decoupled from mouse tracking/repulsion
    // Mobile entirely disables movement for zero computation overhead
    if (!isMobile) {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }
    }

    // Draw only standalone stars/particles (no expensive neural connections)
    for (const n of nodes) {
      // Small core star
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${n.a})`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      // Simple, tight glowing ring without heavy filters or shadow gradients
      ctx.beginPath();
      ctx.fillStyle = `rgba(0, 255, 179, ${n.a * 0.3})`;
      ctx.arc(n.x, n.y, n.r + 3, 0, Math.PI * 2); 
      ctx.fill();
    }
  };

  const loop = (timestamp) => {
    if (!isRunning) return;
    rafId = window.requestAnimationFrame(loop);

    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;

    // Throttle rendering tightly to FPS cap
    if (elapsed > frameInterval) {
      lastTime = timestamp - (elapsed % frameInterval);
      draw();
    }
  };

  const play = () => {
    if (isRunning) return;
    isRunning = true;
    lastTime = 0;
    if (!prefersReduced && canvas.clientWidth >= 768) {
      loop(performance.now());
    } else {
      draw(); // Render statically once if reduced motion or mobile
    }
  };

  const pause = () => {
    isRunning = false;
    window.cancelAnimationFrame(rafId);
  };

  const start = () => {
    pause();
    resize();
    play();
  };

  // Tab visibility logic (Pauses everything instantly off-screen)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pause();
    } else {
      play();
    }
  });

  // Resize listener
  start();

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(start, 200);
  });
})();
