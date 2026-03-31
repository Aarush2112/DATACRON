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

  // ---------- Smooth Scroll (Lenis) ----------
  let lenis;
  const initLenis = () => {
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  };

  // ---------- Scroll Progress Bar ----------
  const scrollProgress = qs("#scroll-progress");
  let scrollTicking = false;
  const updateScrollProgress = () => {
    if (!scrollProgress) return;
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollProgress.style.width = scrolled + "%";
    scrollTicking = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScrollProgress);
    }
  }, { passive: true });

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
    
    // Magnetic intensity
    let magneticX = 0;
    let magneticY = 0;

    let mouseTicking = false;
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        cursorX = mouseX;
        cursorY = mouseY;
        cursor.style.opacity = "1";
      }
    }, { passive: true });

    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest("a, button, .card, .feature-card, .event-card, .speaker-card, .nav__register-btn, .nav__link");
      if (target) {
        targetScale = 1.35;
        cursor.classList.add("is-hovering");
        
        // Handle Magnetic attraction
        if (target.classList.contains('btn') || target.classList.contains('social__icon') || target.classList.contains('nav__register-btn') || target.closest('.hero__actions .btn')) {
          const actualTarget = target.classList.contains('btn') ? target : target.closest('.btn'); 
          actualTarget.addEventListener('mousemove', handleMagnetic);
          actualTarget.addEventListener('mouseleave', resetMagnetic);
        }
      }
    });

    const handleMagnetic = (e) => {
      const item = e.currentTarget;
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      magneticX = x * 0.45;
      magneticY = y * 0.45;
      item.style.transform = `translate3d(${x * 0.35}px, ${y * 0.35}px, 0) scale(1.08)`;
    };

    const resetMagnetic = (e) => {
      const item = e.currentTarget;
      magneticX = 0;
      magneticY = 0;
      item.style.transform = '';
      item.removeEventListener('mousemove', handleMagnetic);
      item.removeEventListener('mouseleave', resetMagnetic);
    };

    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, .card, .feature-card, .event-card, .speaker-card")) {
        targetScale = 1;
        cursor.classList.remove("is-hovering");
      }
    });

    // Particle Burst on Click
    document.addEventListener("click", (e) => {
      createClickParticles(e.clientX, e.clientY);
      
      // Button Ripple effect
      const btn = e.target.closest(".btn, .nav__register-btn");
      if (btn) {
        const ripple = document.createElement("span");
        ripple.className = "btn-ripple";
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
        ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }
    });

    const createClickParticles = (x, y) => {
      const count = 8;
      for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "cursor-particle";
        p.style.backgroundColor = i % 2 === 0 ? "var(--glow)" : "var(--accent)";
        p.style.left = x + "px";
        p.style.top = y + "px";
        
        const angle = (Math.PI * 2 / count) * i;
        const velocity = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        document.body.appendChild(p);
        
        let px = x, py = y, opacity = 1;
        const anim = () => {
          px += vx;
          py += vy;
          opacity -= 0.04;
          p.style.transform = `translate(${px - x}px, ${py - y}px) scale(${opacity})`;
          p.style.opacity = opacity;
          
          if (opacity > 0) requestAnimationFrame(anim);
          else p.remove();
        };
        requestAnimationFrame(anim);
      }
    };

    function tick() {
      if (hasMoved) {
        cursorX += (mouseX + magneticX - cursorX) * 0.16;
        cursorY += (mouseY + magneticY - cursorY) * 0.16;
        currentScale += (targetScale - currentScale) * 0.16;
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) scale(${currentScale})`;
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
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Apply staggered delay if multiple elements are intersecting at once
            const siblings = Array.from(entry.target.parentElement.children).filter(el => el.classList.contains('reveal'));
            const staggerIndex = siblings.indexOf(entry.target);
            
            if (staggerIndex !== -1) {
              const isEventCard = entry.target.classList.contains('event-card') || entry.target.classList.contains('speaker-card');
              entry.target.style.transitionDelay = `${staggerIndex * (isEventCard ? 0.15 : 0.1)}s`;
            }

            entry.target.classList.add("is-visible");
            
            // Add glow pulse for headings
            if (entry.target.querySelector('.section__title')) {
               entry.target.querySelector('.section__title').classList.add('glow-pulse');
            }
            
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
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
      // IntersectionObserver to pause when off-screen
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) play();
          else pause();
        });
      }, { threshold: 0.01 });
      obs.observe(canvas);

  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  let nodes = [];
  let rafId = 0;
  let lastTime = 0;
  let isRunning = false;
  
  const FPS = 10;
  const frameInterval = 1000 / FPS;

  const mouse = { x: -1000, y: -1000 };
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
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
    // Performance Guard: Check for low-end device or battery saver
    const isLowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
    const maxParticles = isMobile ? (isLowEnd ? 8 : 12) : 25;
    const target = clamp(Math.floor((w * h) / 25000), 8, maxParticles);
    
    nodes = Array.from({ length: target }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.25, 0.25),
      vy: rand(-0.25, 0.25),
      r: rand(1.0, 2.2),
      a: rand(0.5, 0.9),
      dx: 0,
      dy: 0,
    }));
  };

  const draw = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const isMobile = w < 768;

    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      if (!isMobile) {
        n.x += n.vx;
        n.y += n.vy;
        
        // Mouse reactivity
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;
        
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          n.dx -= (dx / dist) * force * 1.2;
          n.dy -= (dy / dist) * force * 1.2;
        }
        
        n.dx *= 0.92;
        n.dy *= 0.92;

        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${n.a})`;
      ctx.arc(n.x + n.dx, n.y + n.dy, n.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgba(0, 255, 179, ${n.a * 0.3})`;
      ctx.arc(n.x + n.dx, n.y + n.dy, n.r + 3, 0, Math.PI * 2); 
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
    if (!prefersReduced) {
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

  // ---------- Typewriter Effect ----------
  const initTypewriter = () => {
    const target = qs(".hero__event-date");
    if (!target) return;
    
    const text = target.textContent.trim();
    target.textContent = "";
    target.style.opacity = "1";
    target.style.visibility = "visible";
    
    let i = 0;
    const speed = 100;
    
    function type() {
      if (i < text.length) {
        target.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    
    // Start after cinematic delay
    setTimeout(type, 800);
  };

  // ---------- Staggered Letter Reveal ----------
  const initStaggeredReveal = () => {
    const headings = qsa(".featured-title, .section__title");
    
    headings.forEach(heading => {
      const text = heading.textContent.trim();
      heading.innerHTML = "";
      heading.setAttribute('aria-label', text);
      
      const words = text.split(" ");
      words.forEach((word, wIndex) => {
        const wordSpan = document.createElement("span");
        wordSpan.style.display = "inline-block";
        wordSpan.style.whiteSpace = "nowrap";
        
        [...word].forEach((char, cIndex) => {
          const span = document.createElement("span");
          span.textContent = char;
          span.className = "letter-reveal";
          span.style.display = "inline-block";
          span.style.opacity = "0";
          span.style.transform = "translateY(20px)";
          span.style.transition = "opacity 0.4s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
          wordSpan.appendChild(span);
        });
        
        heading.appendChild(wordSpan);
        if (wIndex < words.length - 1) {
          heading.appendChild(document.createTextNode(" "));
        }
      });
      
      // Use Observer to trigger
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const letters = heading.querySelectorAll(".letter-reveal");
          letters.forEach((l, index) => {
            setTimeout(() => {
              l.style.opacity = "1";
              l.style.transform = "translateY(0)";
            }, index * 40);
          });
          io.unobserve(heading);
        }
      }, { threshold: 0.5 });
      
      io.observe(heading);
    });
  };

  // ---------- Team Mobile "View More" Toggle ----------
  // Ensures the last row is visually centered when using fixed-width CSS grid columns.
  const centerTeamGridLastRow = () => {
    const grids = qsa(".team-grid");
    const isVisible = (el) => {
      const style = window.getComputedStyle(el);
      return style.display !== "none" && el.getClientRects().length > 0;
    };

    const getCols = () => {
      const w = window.innerWidth;
      if (w <= 500) return 1;
      if (w <= 800) return 2;
      if (w <= 1200) return 3;
      return 4;
    };

    grids.forEach((grid) => {
      const cards = qsa(".team-card", grid);
      cards.forEach((c) => {
        c.style.marginLeft = "";
      });

      const visibleCards = cards.filter(isVisible);
      const cols = getCols();
      if (cols <= 1) return;

      const n = visibleCards.length;
      const r = n % cols;
      if (r === 0) return;

      const lastRowCards = visibleCards.slice(n - r);
      if (!lastRowCards.length) return;

      const gridRect = grid.getBoundingClientRect();
      const rects = lastRowCards.map((c) => c.getBoundingClientRect());

      const left = Math.min(...rects.map((rct) => rct.left));
      const right = Math.max(...rects.map((rct) => rct.right));
      const groupWidth = right - left;

      const desiredLeft = gridRect.left + (gridRect.width - groupWidth) / 2;
      const dx = desiredLeft - left;

      lastRowCards.forEach((card) => {
        card.style.marginLeft = `${dx}px`;
      });
    });
  };

  let centerScheduled = false;
  const scheduleCenterTeamGridLastRow = () => {
    if (centerScheduled) return;
    centerScheduled = true;
    window.requestAnimationFrame(() => {
      centerScheduled = false;
      centerTeamGridLastRow();
    });
  };

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

        // Recalculate centering after cards visibility changes.
        scheduleCenterTeamGridLastRow();
      });
    });
  };

  initTeamToggle();
  scheduleCenterTeamGridLastRow();

  let teamGridResizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(teamGridResizeTimer);
    teamGridResizeTimer = window.setTimeout(scheduleCenterTeamGridLastRow, 100);
  });



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

  // ---------- Card Interactions (Tilt & Spotlight) ----------
  const initCardInteractions = () => {
    const interactiveEls = qsa(".card, .feature-card, .event-card, .speaker-card, .cube-wrapper, .nav__register-btn");
    
    interactiveEls.forEach(el => {
      // Add spotlight div
      const spotlight = document.createElement('div');
      spotlight.className = 'spotlight';
      el.appendChild(spotlight);
      
      // Add shimmer div for event cards and register button
      if (el.classList.contains('event-card') || el.classList.contains('nav__register-btn')) {
        const shimmer = document.createElement('div');
        shimmer.className = 'card-shimmer';
        el.appendChild(shimmer);
      }

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Spotlight position
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
        
        // 3D Tilt calculation
        if (!isTouchDevice) {
           const centerX = rect.width / 2;
           const centerY = rect.height / 2;
           const rotateX = (y - centerY) / 14;
           const rotateY = (centerX - x) / 14;
           el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        }
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  };

  // ---------- Hero Cinematic Entrance ----------
  const triggerHeroEntrance = () => {
    const hero = qs(".hero__content");
    if (hero) {
      setTimeout(() => {
        hero.classList.add("is-ready");
      }, 300);
    }
  };

  // ---------- Initialize All ----------
  const initAll = () => {
    initLenis();
    initCardInteractions();
    triggerHeroEntrance();
    updateScrollProgress();
    initTypewriter();
    initStaggeredReveal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

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
