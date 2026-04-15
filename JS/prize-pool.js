/**
 * Datacron 2026 — Prize Pool Animation Logic
 * Features: Scroll-triggered count-up, data-glitch effect, and canvas celebration.
 */

(() => {
    'use strict';

    const DURATION = 2000; // 2 seconds
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // Easing function: easeOutExpo
    const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    // Format number with commas: 60000 -> 60,000
    const formatNumber = (num) => {
        return Math.floor(num).toLocaleString('en-IN');
    };

    // Random choice from array
    const random = (min, max) => Math.random() * (max - min) + min;

    /* ── Canvas Celebration Logic ────────────────────────────── */
    class Particle {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.reset();
        }

        reset() {
            this.x = this.canvas.width / 2;
            this.y = this.canvas.height / 2;
            this.vx = random(-10, 10);
            this.vy = random(-15, -5); // Shoot upwards
            this.radius = random(1.5, 3.5);
            this.color = Math.random() > 0.5 ? '#00FF9F' : '#00D4AA';
            this.alpha = 1;
            this.decay = random(0.01, 0.02);
            this.gravity = 0.25;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.alpha -= this.decay;
        }

        draw() {
            this.ctx.save();
            this.ctx.globalAlpha = this.alpha;
            this.ctx.fillStyle = this.color;
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = this.color;
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    const initCelebration = (canvas) => {
        const ctx = canvas.getContext('2d');
        const particles = [];
        const particleCount = isMobile ? 50 : 100;

        const resize = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };

        resize();
        // Resize listener removed for one-shot animation to save memory

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(canvas));
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            particles.forEach(p => {
                if (p.alpha > 0) {
                    p.update();
                    p.draw();
                    alive = true;
                }
            });

            if (alive) requestAnimationFrame(render);
        };

        render();
    };

    /* ── Count-Up Logic ───────────────────────────────────────── */
    const startCountUp = (el) => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / DURATION, 1);
            const easedProgress = easeOutExpo(percentage);
            
            // "Data Loading" effect: faster cycling of digits early on
            if (percentage < 0.85) {
                // Randomly flicker digits
                const randomVal = Math.floor(Math.random() * target);
                el.innerText = formatNumber(randomVal) + '+';
            } else {
                // Smoothly settle into the final value
                const current = Math.floor(easedProgress * target);
                el.innerText = formatNumber(current) + '+';
            }

            if (percentage < 1) {
                requestAnimationFrame(animate);
            } else {
                el.innerText = formatNumber(target) + '+';
                el.classList.add('celebrate');
                
                const canvas = document.getElementById('prize-particles');
                if (canvas) initCelebration(canvas);
                
                setTimeout(() => el.classList.remove('celebrate'), 1000);
            }
        };

        requestAnimationFrame(animate);
    };

    /* ── Intersection Observer ────────────────────────────────── */
    const initPrizePool = () => {
        const section = document.getElementById('prize-pool');
        const numberEl = document.getElementById('prize-number');
        if (!section || !numberEl) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Small delay for better impact after reveal animation
                setTimeout(() => startCountUp(numberEl), 200);
                observer.unobserve(section);
            }
        }, { threshold: 0.8 });

        observer.observe(section);
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPrizePool);
    } else {
        initPrizePool();
    }
})();
