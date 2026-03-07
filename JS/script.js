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

  // ---------- Hero starfield / node network ----------
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
  const FPS = 45;
  const frameInterval = 1000 / FPS;

  let mouseX = -1000;
  let mouseY = -1000;
  const interactionRadius = 80;

  document.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * DPR;
    mouseY = (e.clientY - rect.top) * DPR;
  });

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
    const maxParticles = isMobile ? 30 : 60;
    const target = clamp(Math.floor((w * h) / 18000), 10, maxParticles);
    
    // Slow down velocity for calm floating dust effect
    nodes = Array.from({ length: target }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.08, 0.08),
      vy: rand(-0.06, 0.06),
      r: rand(0.8, 1.9),
      a: rand(0.35, 0.9),
    }));
  };

  const draw = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const isMobile = w < 768;

    ctx.clearRect(0, 0, w, h);

    // Soft vignette
    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
    vignette.addColorStop(0, "rgba(0,242,255,0.05)");
    vignette.addColorStop(1, "rgba(0,0,0,0.0)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // Update positions
    for (const n of nodes) {
      // Subtle mouse repulsion logic
      if (!isMobile) {
        const dx = (mouseX / DPR) - n.x;
        const dy = (mouseY / DPR) - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < interactionRadius) {
          const force = (interactionRadius - dist) / interactionRadius;
          n.x -= (dx / dist) * force * 0.5; // Very subtle repulsion
          n.y -= (dy / dist) * force * 0.5;
        }
      }

      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;
    }

    // Connections
    if (!isMobile) {
      const maxDist = 120;
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > maxDist) continue;

          const t = 1 - d / maxDist;
          const alpha = 0.06 * t; // subtle lines

          const hue = (i + j) % 3;
          const stroke =
            hue === 0
              ? `rgba(0,242,255,${alpha})`
              : hue === 1
                ? `rgba(123,97,255,${alpha})`
                : `rgba(255,0,230,${alpha * 0.85})`;

          ctx.strokeStyle = stroke;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Nodes / stars
    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${0.12 + n.a * 0.18})`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      // Glow dot
      ctx.beginPath();
      ctx.fillStyle = `rgba(0,242,255,${0.06 + n.a * 0.08})`;
      ctx.arc(n.x, n.y, n.r * 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const loop = (timestamp) => {
    rafId = window.requestAnimationFrame(loop);

    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;

    if (elapsed > frameInterval) {
      lastTime = timestamp - (elapsed % frameInterval);
      draw();
    }
  };

  const start = () => {
    window.cancelAnimationFrame(rafId);
    lastTime = 0;
    resize();
    if (!prefersReduced) loop(performance.now());
    else draw();
  };

  // Resize + start
  start();

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(start, 120);
  });
})();
