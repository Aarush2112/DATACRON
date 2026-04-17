(function() {
    "use strict";

    document.documentElement.classList.add("js-ready");

    /* =================================================================
       Utility Functions
       ================================================================= */
    const qS = (selector, context = document) => context.querySelector(selector);
    const qSA = (selector, context = document) => Array.from(context.querySelectorAll(selector));

    /* =================================================================
       Scroll Progress Indicator
       ================================================================= */
    const scrollProgress = qS("#scroll-progress");
    let isScrollTicking = false;

    const updateScrollProgress = () => {
        if (!scrollProgress) return;
        const scrollPercent = (document.body.scrollTop || document.documentElement.scrollTop) / 
                              (document.documentElement.scrollHeight - document.documentElement.clientHeight) * 100;
        scrollProgress.style.width = scrollPercent + "%";
        isScrollTicking = false;
    };

    window.addEventListener("scroll", () => {
        if (!isScrollTicking) {
            isScrollTicking = true;
            requestAnimationFrame(updateScrollProgress);
        }
    }, {
        passive: true
    });

    /* =================================================================
       Custom Cursor & Interactive Effects
       ================================================================= */
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isTouchDevice && !prefersReducedMotion) {
        const cursor = document.createElement("div");
        cursor.className = "custom-cursor";
        cursor.setAttribute("aria-hidden", "true");
        document.body.appendChild(cursor);
        document.body.classList.add("has-custom-cursor");

        let mouseX = -100,
            mouseY = -100;
        let cursorX = -100,
            cursorY = -100;
        let isCursorActive = false;
        let scale = 1,
            targetScale = 1;
        let offsetX = 0,
            offsetY = 0;

        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isCursorActive) {
                isCursorActive = true;
                cursorX = mouseX;
                cursorY = mouseY;
                cursor.style.opacity = "1";
            }
        }, {
            passive: true
        });

        document.addEventListener("mouseover", (e) => {
            const hoverTarget = e.target.closest("a, button, .card, .feature-card, .event-card, .speaker-card, .nav__register-btn, .nav__link");
            if (hoverTarget) {
                targetScale = 1.35;
                cursor.classList.add("is-hovering");

                const isMagnetic = hoverTarget.classList.contains("btn") || 
                                   hoverTarget.classList.contains("social__icon") || 
                                   hoverTarget.classList.contains("nav__register-btn") || 
                                   hoverTarget.closest(".hero__actions .btn");

                if (isMagnetic) {
                    const btn = hoverTarget.classList.contains("btn") ? hoverTarget : hoverTarget.closest(".btn");
                    btn.addEventListener("mousemove", handleMagneticMove);
                    btn.addEventListener("mouseleave", handleMagneticLeave);
                }
            }
        });

        const handleMagneticMove = (e) => {
            const btn = e.currentTarget;
            const rect = btn.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width / 2;
            const relY = e.clientY - rect.top - rect.height / 2;
            offsetX = relX * 0.45;
            offsetY = relY * 0.45;
            btn.style.transform = `translate3d(${relX * 0.35}px, ${relY * 0.35}px, 0) scale(1.08)`;
        };

        const handleMagneticLeave = (e) => {
            const btn = e.currentTarget;
            offsetX = 0;
            offsetY = 0;
            btn.style.transform = "";
            btn.removeEventListener("mousemove", handleMagneticMove);
            btn.removeEventListener("mouseleave", handleMagneticLeave);
        };

        document.addEventListener("mouseout", (e) => {
            if (e.target.closest("a, button, .card, .feature-card, .event-card, .speaker-card")) {
                targetScale = 1;
                cursor.classList.remove("is-hovering");
            }
        });

        document.addEventListener("click", (e) => {
            createClickParticles(e.clientX, e.clientY);
            const btn = e.target.closest(".btn, .nav__register-btn");
            if (btn) {
                const ripple = document.createElement("span");
                ripple.className = "btn-ripple";
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + "px";
                ripple.style.left = e.clientX - rect.left - size / 2 + "px";
                ripple.style.top = e.clientY - rect.top - size / 2 + "px";
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }
        });

        const createClickParticles = (x, y) => {
            for (let i = 0; i < 8; i++) {
                const p = document.createElement("div");
                p.className = "cursor-particle";
                p.style.backgroundColor = i % 2 == 0 ? "var(--glow)" : "var(--accent)";
                p.style.left = x + "px";
                p.style.top = y + "px";

                const angle = (2 * Math.PI / 8) * i;
                const speed = 2 + 3 * Math.random();
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;

                document.body.appendChild(p);

                let curX = x;
                let curY = y;
                let opacity = 1;

                const animateParticle = () => {
                    curX += vx;
                    curY += vy;
                    opacity -= 0.04;
                    p.style.transform = `translate(${curX - x}px, ${curY - y}px) scale(${opacity})`;
                    p.style.opacity = opacity;

                    if (opacity > 0) {
                        requestAnimationFrame(animateParticle);
                    } else {
                        p.remove();
                    }
                };
                requestAnimationFrame(animateParticle);
            }
        };

        let lastFrameTime = 0;
        const frameInterval = 1000 / 60;

        function updateCursor(currentTime) {
            if (!isBrowserActive) {
                cursorRequestId = requestAnimationFrame(updateCursor);
                return;
            }

            cursorRequestId = requestAnimationFrame(updateCursor);
            const deltaTime = currentTime - lastFrameTime;

            if (deltaTime < frameInterval) return;

            lastFrameTime = currentTime - (deltaTime % frameInterval);

            if (isCursorActive) {
                cursorX += (mouseX + offsetX - cursorX) * 0.16;
                cursorY += (mouseY + offsetY - cursorY) * 0.16;
                scale += (targetScale - scale) * 0.16;
                cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) scale(${scale})`;
            }
        }

        let isBrowserActive = true;
        let cursorRequestId = requestAnimationFrame(updateCursor);

        document.addEventListener("visibilitychange", () => {
            isBrowserActive = !document.hidden;
        });
    }

    /* =================================================================
       Footer Year
       ================================================================= */
    const yearEl = qS("#year");
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    /* =================================================================
       Navigation Menu
       ================================================================= */
    const navToggle = qS(".nav__toggle");
    const navMenu = qS("#navMenu");
    const navLinks = qSA(".nav__link", navMenu || document);

    const toggleMenu = (isOpen) => {
        if (navToggle && navMenu) {
            navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            navMenu.classList.toggle("is-open", isOpen);
            navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
        }
    };

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            const isOpen = navToggle.getAttribute("aria-expanded") === "true";
            toggleMenu(!isOpen);
        });

        navLinks.forEach(link => {
            link.addEventListener("click", () => toggleMenu(false));
        });

        document.addEventListener("click", (e) => {
            const target = e.target;
            const isInsideNav = target && (target.closest(".nav") || target.closest("#navMenu"));
            if (navMenu.classList.contains("is-open") && !isInsideNav) {
                toggleMenu(false);
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                toggleMenu(false);
            }
        });
    }

    /* =================================================================
       Scroll Reveals
       ================================================================= */
    (function initReveals() {
        const revealEls = qSA(".reveal");
        if (!revealEls.length) return;

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px"
            });

            revealEls.forEach(el => observer.observe(el));
        } else {
            revealEls.forEach(el => el.classList.add("is-visible"));
        }
    })();

    /* =================================================================
       Hero Paralax & Effects
       ================================================================= */
    const hero = qS(".hero");
    const heroContent = qS(".hero__content");
    const heroBgGlow = qS(".hero__bgGlow");
    const featuredSection = qS("#featured");
    const cubeWrapper = qS(".cube-wrapper");

    if (hero && heroContent && featuredSection) {
        const initHeroEffects = () => {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            const strength = isMobile ? 0.7 : 1;
            let isTicking = false;
            let lastScrollY = 0;

            const updateHero = () => {
                const currentY = lastScrollY;
                const heroHeight = hero.offsetHeight;
                const progress = Math.max(0, Math.min(1, currentY / heroHeight));

                const translateY = 60 * progress * strength;
                const opacity = 1 - (1.2 * progress);

                heroContent.style.transform = `translate3d(0, -${translateY}px, 0)`;
                heroContent.style.opacity = Math.max(0, opacity);

                if (heroBgGlow && !isMobile) {
                    const scale = 1 + (0.08 * progress * strength);
                    heroBgGlow.style.transform = `scale(${scale})`;
                }

                if (cubeWrapper) {
                    const rect = featuredSection.getBoundingClientRect();
                    const viewportH = window.innerHeight;
                    const cubeScale = 0.9 + 0.1 * Math.max(0, Math.min(1, (viewportH - rect.top) / (0.4 * viewportH)));
                    cubeWrapper.style.transform = `scale(${cubeScale})`;
                }

                isTicking = false;
            };

            window.addEventListener("scroll", () => {
                lastScrollY = window.scrollY;
                if (!isTicking) {
                    isTicking = true;
                    requestAnimationFrame(updateHero);
                }
            }, {
                passive: true
            });

            lastScrollY = window.scrollY;
            updateHero();
        };

        if ("requestIdleCallback" in window) {
            requestIdleCallback(initHeroEffects);
        } else {
            setTimeout(initHeroEffects, 80);
        }
    }

    /* =================================================================
       Countdown Timer
       ================================================================= */
    (function initCountdown() {
        const targetDate = new Date("April 17, 2026 00:00:00").getTime();
        const countdownEl = qS("#featured-countdown");

        if (!countdownEl) return;

        const timeUnits = {
            days: qS("[data-days]", countdownEl),
            hours: qS("[data-hours]", countdownEl),
            minutes: qS("[data-minutes]", countdownEl),
            seconds: qS("[data-seconds]", countdownEl)
        };

        const updateUnit = (el, val) => {
            if (el.textContent !== val) {
                el.style.opacity = "0.4";
                setTimeout(() => {
                    el.textContent = val;
                    el.style.opacity = "1";
                }, 200);
            }
        };

        const calculateTime = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance <= 0) {
                const wrapper = countdownEl.closest('.event-countdown');
                if (wrapper && !wrapper.classList.contains('fest-started')) {
                    wrapper.classList.add('fest-started');
                    wrapper.innerHTML = `
                        <div class="fest-started-message">
                            <div class="fest-initiated-text glow-pulse" data-text="DATACRON IS LIVE">DATACRON IS LIVE</div>
                            <p style="color: var(--muted); margin-top: 15px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">The data realm is now open</p>
                        </div>
                    `;

                }
                return;
            }

            const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, "0");
            const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, "0");
            const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
            const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, "0");

            if (timeUnits.days) updateUnit(timeUnits.days, days);
            if (timeUnits.hours) updateUnit(timeUnits.hours, hours);
            if (timeUnits.minutes) updateUnit(timeUnits.minutes, minutes);
            if (timeUnits.seconds) updateUnit(timeUnits.seconds, seconds);
        };

        calculateTime();
        setInterval(calculateTime, 1000);
    })();

    /* =================================================================
       Team Grid Alignment & View More
       ================================================================= */
    const alignTeamGrid = () => {
        const grids = qSA(".team-grid");
        const isVisible = el => window.getComputedStyle(el).display !== "none" && el.getClientRects().length > 0;

        grids.forEach(grid => {
            const cards = qSA(".team-card", grid);
            cards.forEach(card => {
                card.style.marginLeft = "";
            });

            const visibleCards = cards.filter(isVisible);
            const cardsPerRow = (() => {
                const w = window.innerWidth;
                if (w <= 500) return 1;
                if (w <= 800) return 2;
                if (w <= 1200) return 3;
                return 4;
            })();

            if (cardsPerRow <= 1) return;

            const totalVisible = visibleCards.length;
            const remainder = totalVisible % cardsPerRow;

            if (remainder === 0) return;

            const lastRowCards = visibleCards.slice(totalVisible - remainder);
            if (!lastRowCards.length) return;

            const gridRect = grid.getBoundingClientRect();
            const cardRects = lastRowCards.map(c => c.getBoundingClientRect());
            const minLeft = Math.min(...cardRects.map(r => r.left));
            const rowWidth = Math.max(...cardRects.map(r => r.right)) - minLeft;
            const targetOffset = gridRect.left + (gridRect.width - rowWidth) / 2 - minLeft;

            lastRowCards.forEach(card => {
                card.style.marginLeft = `${targetOffset}px`;
            });
        });
    };

    let alignmentPending = false;
    const requestAlignment = () => {
        if (!alignmentPending) {
            alignmentPending = true;
            window.requestAnimationFrame(() => {
                alignmentPending = false;
                alignTeamGrid();
            });
        }
    };

    qSA(".view-more-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const dept = btn.closest(".department");
            if (!dept) return;

            const isExpanded = dept.classList.toggle("expanded");
            btn.textContent = isExpanded ? "View Less" : "View More";
            btn.setAttribute("aria-expanded", isExpanded ? "true" : "false");

            if (!isExpanded) {
                const header = qS(".department__header", dept);
                if (header) {
                    header.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                } else {
                    dept.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
            requestAlignment();
        });
    });

    requestAlignment();

    let resizeTimeout = null;
    window.addEventListener("resize", () => {
        window.clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(requestAlignment, 100);
    });

    /* =================================================================
       Session Management
       ================================================================= */
    let sessionTimeout = null;
    let hasTimedOut = false;

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            sessionTimeout = setTimeout(() => {
                hasTimedOut = true;
            }, 1800000); // 30 mins
        } else {
            clearTimeout(sessionTimeout);
            if (hasTimedOut) {
                location.reload();
            }
        }
    });

    /* =================================================================
       Spotlight & Tilt Effects
       ================================================================= */
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const interactiveSelectors = ".card, .feature-card, .event-card, .speaker-card, .cube-wrapper, .nav__register-btn";

    const handleInteractiveMove = (e) => {
        const target = e.target.closest(interactiveSelectors);
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        target.style.setProperty("--mouse-x", `${x}px`);
        target.style.setProperty("--mouse-y", `${y}px`);

        if (!isTouchDevice) {
            const centerX = rect.width / 2;
            const rotateX = (y - rect.height / 2) / 20;
            const rotateY = (centerX - x) / 20;
            target.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        }
    };

    const handleInteractiveLeave = (e) => {
        const target = e.target.closest(interactiveSelectors);
        if (target) {
            target.style.transform = "";
        }
    };

    /* =================================================================
       Data Heist Ember Particles
       ================================================================= */
    const initEmberEffect = () => {
        const heistCards = qSA(".data-heist-card");
        if (heistCards.length === 0) return;

        const frameRate = 1000 / 55;
        let lastUpdateTime = performance.now();
        const activeCards = new Set();
        const particles = [];

        class Ember {
            constructor(card) {
                this.card = card;
                this.el = document.createElement("div");
                this.el.className = "ember";
                const rect = card.getBoundingClientRect();
                this.width = rect.width;
                this.x = Math.random() * (rect.width - 10) + 5;
                this.y = rect.height - 10;
                this.vY = -(0.8 + 1.5 * Math.random());
                this.vX = 0.6 * (Math.random() - 0.5);
                this.opacity = 1;
                this.rotation = 360 * Math.random();
                this.scale = 0.5 + 0.8 * Math.random();
                this.life = 1;
                this.decay = 0.01 + 0.015 * Math.random();
                card.appendChild(this.el);
                this.render();
            }

            update() {
                this.y += this.vY;
                this.x += this.vX + 0.4 * Math.sin(0.08 * this.y);
                this.life -= this.decay;
                this.opacity = Math.max(0, this.life);
                this.rotation += 3;
                return this.life > 0;
            }

            render() {
                this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.rotation}deg) scale(${this.scale})`;
                this.el.style.opacity = this.opacity;
            }

            remove() {
                this.el.remove();
            }
        }

        const loop = (timestamp) => {
            requestAnimationFrame(loop);
            const delta = timestamp - lastUpdateTime;

            if (delta < frameRate) return;

            lastUpdateTime = timestamp - (delta % frameRate);

            activeCards.forEach(card => {
                if (particles.length < 60) {
                    particles.push(new Ember(card));
                }
            });

            for (let i = particles.length - 1; i >= 0; i--) {
                if (particles[i].update()) {
                    particles[i].render();
                } else {
                    particles[i].remove();
                    particles.splice(i, 1);
                }
            }
        };

        heistCards.forEach(card => {
            card.addEventListener("mouseenter", () => activeCards.add(card));
            card.addEventListener("mouseleave", () => activeCards.delete(card));
        });

        requestAnimationFrame(loop);
    };

    /* =================================================================
       Core Initialization
       ================================================================= */
    const initializeSite = () => {
        /* Preloader Initialization */
        (function initPreloader() {
            const preloader = qS("#video-preloader");
            const video = qS("#preloader-video");
            const percentEl = qS("#preloader-percent");
            const barEl = qS("#preloader-bar");

            if (!preloader || !video) return;

            window.scrollTo(0, 0);

            const hidePreloader = () => {
                if (preloader.classList.contains("hidden")) return;
                window.scrollTo(0, 0);
                if (percentEl) percentEl.textContent = "100%";
                if (barEl) barEl.style.width = "100%";
                preloader.classList.add("hidden");
                document.body.classList.remove("loading");
                setTimeout(() => preloader.remove(), 700);
            };

            let lastPercent = -1;
            const updateProgress = () => {
                if (video.duration) {
                    const progress = Math.min((video.currentTime / video.duration) * 100, 100);
                    const currentPercent = Math.floor(progress);
                    if (currentPercent !== lastPercent) {
                        if (percentEl) percentEl.textContent = currentPercent + "%";
                        lastPercent = currentPercent;
                    }
                    if (barEl) barEl.style.transform = `scaleX(${progress / 100})`;
                }
                if (!preloader.classList.contains("hidden")) {
                    requestAnimationFrame(updateProgress);
                }
            };

            requestAnimationFrame(updateProgress);
            video.addEventListener("ended", hidePreloader);
            
            video.addEventListener("canplay", () => {
                video.playbackRate = 2.2;
            }, { once: true });
            video.playbackRate = 2.2;

            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => hidePreloader());
            }

            setTimeout(hidePreloader, 3000);
        })();

        /* Smooth Scrolling Initialization */
        (function initLenis() {
            if (typeof Lenis !== 'undefined') {
                const lenis = new Lenis({
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    wheelMultiplier: 1,
                    touchMultiplier: 2,
                    infinite: false
                });

                function raf(time) {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);
            }
        })();

        /* Spotlight & Shimmer Setup */
        qSA(interactiveSelectors).forEach(card => {
            if (!qS(".spotlight", card)) {
                const spotlight = document.createElement("div");
                spotlight.className = "spotlight";
                card.appendChild(spotlight);
            }
            if ((card.classList.contains("event-card") || card.classList.contains("nav__register-btn")) && !qS(".card-shimmer", card)) {
                const shimmer = document.createElement("div");
                shimmer.className = "card-shimmer";
                card.appendChild(shimmer);
            }
        });

        document.addEventListener("mousemove", throttle(handleInteractiveMove, 16), {
            passive: true
        });
        document.addEventListener("mouseout", handleInteractiveLeave, {
            passive: true
        });

        /* Hero Preparation */
        (() => {
            const content = qS(".hero__content");
            if (content) {
                setTimeout(() => {
                    content.classList.add("is-ready");
                }, 300);
            }
        })();

        updateScrollProgress();

        /* Hero Typewriter Effect */
        (() => {
            const dateEl = qS(".hero__event-date");
            if (!dateEl) return;

            const text = dateEl.textContent.trim();
            dateEl.textContent = "";
            dateEl.style.opacity = "1";
            dateEl.style.visibility = "visible";

            let i = 0;
            setTimeout(function type() {
                if (i < text.length) {
                    dateEl.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, 100);
                }
            }, 800);
        })();

        /* Title Letter Reveals */
        qSA(".featured-title, .section__title").forEach(title => {
            const text = title.textContent.trim();
            title.innerHTML = "";
            title.setAttribute("aria-label", text);

            const words = text.split(" ");
            words.forEach((word, wordIdx) => {
                const wordSpan = document.createElement("span");
                wordSpan.style.display = "inline-block";
                wordSpan.style.whiteSpace = "nowrap";

                [...word].forEach((char, charIdx) => {
                    const span = document.createElement("span");
                    span.textContent = char;
                    span.className = "letter-reveal";
                    span.style.display = "inline-block";
                    span.style.opacity = "0";
                    span.style.transform = "translateY(20px)";
                    span.style.transition = "opacity 0.4s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
                    wordSpan.appendChild(span);
                });

                title.appendChild(wordSpan);
                if (wordIdx < words.length - 1) {
                    title.appendChild(document.createTextNode(" "));
                }
            });

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    title.querySelectorAll(".letter-reveal").forEach((letter, i) => {
                        setTimeout(() => {
                            letter.style.opacity = "1";
                            letter.style.transform = "translateY(0)";
                        }, 40 * i);
                    });
                    observer.unobserve(title);
                }
            }, {
                threshold: 0.5
            });

            observer.observe(title);
        });

        /* Event Card Entrance Animation */
        (() => {
            const section = qS("#events");
            const initialCards = qSA(".event-card--initial", section);
            if (!section || initialCards.length === 0) return;

            if ("IntersectionObserver" in window) {
                const observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        initialCards.forEach((card, i) => {
                            setTimeout(() => {
                                card.classList.remove("event-card--initial");
                                card.classList.add("event-card--flash");
                                setTimeout(() => {
                                    card.classList.add("event-card--pulse");
                                }, 550);
                            }, 250 * i);
                        });
                        observer.unobserve(section);
                    }
                }, {
                    threshold: 0.15
                });
                observer.observe(section);
            } else {
                initialCards.forEach(card => {
                    card.classList.remove("event-card--initial");
                    card.classList.add("event-card--flash");
                });
            }
        })();

        initEmberEffect();
    };

    /* Execution Gate */
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeSite);
    } else {
        initializeSite();
    }

    /* Background Service Loading */
    const loadBackground = () => {
        const script = document.createElement("script");
        script.src = "./JS/background.js";
        script.defer = true;
        document.body.appendChild(script);
    };

    if ("requestIdleCallback" in window) {
        requestIdleCallback(loadBackground, {
            timeout: 2000
        });
    } else {
        window.addEventListener("load", () => setTimeout(loadBackground, 100));
    }

})();