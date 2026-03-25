/* =========================
   Datacron — JS (all pages)
   - Galaxy particle cursor
   - Hero starfield (index only)
   - Scroll reveal, mobile nav
   ========================= */

(() => {
  "use strict";

  // Mark JS ready immediately so .reveal hiding activates
  document.documentElement.classList.add("js-ready");

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

  // ---------- Cinematic Scroll Transition ----------
  const heroSection = qs(".hero");
  const heroContent = qs(".hero__content");
  const heroBgGlow = qs(".hero__bgGlow");
  const featuredSection = qs("#featured");
  const cubeWrapper = qs(".cube-wrapper");

  if (heroSection && heroContent && featuredSection) {
    const initCinematicScroll = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const intensity = isMobile ? 0.7 : 1.0;

      let ticking = false;
      let lastScrollY = 0;

      const handleCinematicScroll = () => {
        const scrollY = lastScrollY;
        const heroHeight = heroSection.offsetHeight;

        const rawProgress = Math.max(0, Math.min(1, scrollY / heroHeight));

        const contentOffset = rawProgress * 60 * intensity;
        const contentOpacity = 1 - rawProgress * 1.2;
        heroContent.style.transform = `translate3d(0, -${contentOffset}px, 0)`;
        heroContent.style.opacity = Math.max(0, contentOpacity);

        if (heroBgGlow && !isMobile) {
          const zoomScale = 1 + rawProgress * 0.08 * intensity;
          heroBgGlow.style.transform = `scale(${zoomScale})`;
        }

        if (cubeWrapper) {
          const featuredRect = featuredSection.getBoundingClientRect();
          const viewH = window.innerHeight;
          const featuredProgress = Math.max(0, Math.min(1,
            (viewH - featuredRect.top) / (viewH * 0.4)
          ));
          const cubeScale = 0.9 + featuredProgress * 0.1;
          cubeWrapper.style.transform = `scale(${cubeScale})`;
        }

        ticking = false;
      };

      const onScroll = () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(handleCinematicScroll);
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });

      lastScrollY = window.scrollY;
      handleCinematicScroll();
    };

    // Defer cinematic scroll setup to avoid blocking first paint
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initCinematicScroll);
    } else {
      setTimeout(initCinematicScroll, 80);
    }
  }

  // ---------- Ultra-Lightweight Hero Starfield ----------
  const canvas = qs("#starfield");
  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (ctx) {

  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  let nodes = [];
  let rafId = 0;
  let lastTime = 0;
  let isRunning = false;
  
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
    const maxParticles = isMobile ? 12 : 25;
    const target = clamp(Math.floor((w * h) / 25000), 8, maxParticles);
    
    nodes = Array.from({ length: target }, () => ({
      x: rand(0, w),
      y: rand(0, h),
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

    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${n.a})`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

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
      draw();
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

      // Tab visibility
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          pause();
        } else {
          play();
        }
      });

      // Draw one static frame immediately for visual parity, defer animation loop
      resize();
      draw();

      // Start animation loop after idle
      const startLoop = () => {
        play();
        let resizeTimer = 0;
        window.addEventListener("resize", () => {
          window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(start, 200);
        });
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(startLoop);
      } else {
        setTimeout(startLoop, 150);
      }
    }
  }

  // ---------- Event Modal Logic ----------
  const initEventModal = () => {
    const modal = qs("#eventModal");
    if (!modal) return;

    const modalClose = qs("#modalClose", modal);
    const modalBanner = qs("#modalBanner", modal);
    const modalTitle = qs("#modalTitle", modal);
    const modalDesc = qs("#modalDesc", modal);
    const modalRegister = qs("#modalRegister", modal);
    const modalRules = qs("#modalRules", modal);
    const eventCards = qsa(".event-card");

    // Preload modal banner on hover
    eventCards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        const bannerPath = card.getAttribute("data-banner");
        if (bannerPath && bannerPath !== "#") {
          const img = new Image();
          img.src = bannerPath;
        }
      }, { once: true });
    });

    const openModal = (card) => {
      const data = {
        title: card.getAttribute("data-title"),
        brief: card.getAttribute("data-brief"),
        banner: card.getAttribute("data-banner"),
        register: card.getAttribute("data-register"),
        rules: card.getAttribute("data-rules")
      };

      if (modalTitle) modalTitle.textContent = data.title || "";
      if (modalDesc) modalDesc.textContent = data.brief || "";
      
      if (modalBanner) {
        modalBanner.classList.remove("error");
        modalBanner.src = data.banner || "";
      }

      if (modalRegister) modalRegister.href = data.register || "#";
      if (modalRules) modalRules.href = data.rules || "#";

      modal.classList.add("is-visible");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
      modal.classList.remove("is-visible");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      
      // Reset banner after transition to prevent flicker on next open
      setTimeout(() => {
        if (modalBanner) {
          modalBanner.src = "";
          modalBanner.classList.remove("error");
        }
      }, 350);
    };

    // Handle banner loading error
    if (modalBanner) {
      modalBanner.onerror = () => {
        modalBanner.classList.add("error");
      };
    }

    eventCards.forEach(card => {
      const btn = qs(".js-view-details", card);
      if (btn) {
        btn.addEventListener("click", () => openModal(card));
      }
    });

    if (modalClose) {
      modalClose.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-visible")) {
        closeModal();
      }
    });
  };

  initEventModal();

  // ---------- Flip Countdown Logic ----------
  const initCountdown = () => {
    // Target date set to April 18, 2026
    const targetDate = new Date("April 17, 2026 00:00:00").getTime();
    const countdownEl = qs("#featured-countdown");
    if (!countdownEl) return;

    const elements = {
      days: qs("[data-days]", countdownEl),
      hours: qs("[data-hours]", countdownEl),
      minutes: qs("[data-minutes]", countdownEl),
      seconds: qs("[data-seconds]", countdownEl),
    };

    const lastValues = { days: "", hours: "", minutes: "", seconds: "" };

    const animateValue = (el, newVal) => {
      if (el.textContent !== newVal) {
        el.style.opacity = "0.4";
        setTimeout(() => {
          el.textContent = newVal;
          el.style.opacity = "1";
        }, 200);
      }
    };

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        Object.values(elements).forEach(el => { if (el) el.textContent = "00"; });
        return;
      }

      const d = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0");
      const h = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, "0");
      const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
      const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0");

      if (elements.days) animateValue(elements.days, d);
      if (elements.hours) animateValue(elements.hours, h);
      if (elements.minutes) animateValue(elements.minutes, m);
      if (elements.seconds) animateValue(elements.seconds, s);
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  };

  initCountdown();

  // ---------- Team Mobile "View More" Toggle ----------
  const initTeamToggle = () => {
    const viewMoreBtns = qsa(".view-more-btn");
    
    viewMoreBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const section = btn.closest(".department");
        if (!section) return;
        
        const isExpanded = section.classList.toggle("expanded");
        
        // Update button text and accessibility
        btn.textContent = isExpanded ? "View Less" : "View More";
        btn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
        
        // Smooth scroll back to section title when collapsing for better UX
        if (!isExpanded) {
          const header = qs(".department__header", section);
          if (header) {
            header.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  };

  initTeamToggle();



  // ---------- Auto-Reload Logic ----------
  // If tab hidden for 30+ mins, reload on return
  let reloadTimeoutToken = null;
  let reloadRequired = false;
  const THIRTY_MINUTES = 30 * 60 * 1000;

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Start timer when tab is hidden
      reloadTimeoutToken = setTimeout(() => {
        reloadRequired = true;
      }, THIRTY_MINUTES);
    } else {
      // User returned
      clearTimeout(reloadTimeoutToken);
      if (reloadRequired) {
        location.reload();
      }
    }
  });

  // ---------- Lazy-load background.js after first paint ----------
  const loadBackground = () => {
    const bgScript = document.createElement('script');
    bgScript.src = './JS/background.js';
    bgScript.defer = true;
    document.body.appendChild(bgScript);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadBackground, { timeout: 2000 });
  } else {
    window.addEventListener('load', () => setTimeout(loadBackground, 100));
  }
})();
