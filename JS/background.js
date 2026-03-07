/* ============================================
   AI Data Galaxy — Canvas Background Animation
   Datacron 2026
   ============================================ */
(function () {
  'use strict';

  /* ---------- DOM ---------- */
  const canvas = document.getElementById('galaxy-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ---------- Config ---------- */
  const COLORS = ['#00f2ff', '#7b61ff', '#ff00e6'];
  const CONNECTION_DIST = 140;       // px – max distance for neural-net lines
  const MOUSE_RADIUS = 160;          // px – repulsion radius
  const MOUSE_REPEL_STRENGTH = 0.6;  // how strongly particles move away
  const PARALLAX_FACTOR = 0.35;      // how much slower than scroll
  const TRAIL_SPAWN_INTERVAL = 60;   // ms between mouse-trail particles

  let particles = [];
  let mouseX = -9999;
  let mouseY = -9999;
  let scrollY = 0;
  let W = 0;
  let H = 0;
  let trailParticles = [];
  let lastTrailTime = 0;

  /* ---------- Helpers ---------- */
  function isMobile() {
    return window.innerWidth < 768;
  }

  function particleCount() {
    if (isMobile()) return 50;
    const area = window.innerWidth * window.innerHeight;
    // Scale between 80 and 120 based on viewport area
    return Math.min(120, Math.max(80, Math.round(area / 18000)));
  }

  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /* ---------- Resize ---------- */
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---------- Particle class ---------- */
  class Particle {
    constructor(x, y, isTrail) {
      this.x = x !== undefined ? x : Math.random() * W;
      this.y = y !== undefined ? y : Math.random() * H;
      this.baseRadius = isTrail
        ? Math.random() * 1.5 + 0.8
        : Math.random() * 2.5 + 1;
      this.radius = this.baseRadius;
      this.color = randomColor();
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.isTrail = !!isTrail;
      this.life = isTrail ? 1.0 : -1; // -1 means permanent
      this.decay = isTrail ? 0.012 + Math.random() * 0.008 : 0;
    }

    update() {
      /* Parallax offset (visual only, stored scroll delta) */
      const pY = scrollY * PARALLAX_FACTOR;

      /* Mouse repulsion */
      const dx = this.x - mouseX;
      const dy = this.y - (mouseY + pY);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0.1) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_REPEL_STRENGTH;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      /* Friction */
      this.vx *= 0.98;
      this.vy *= 0.98;

      this.x += this.vx;
      this.y += this.vy;

      /* Wrap edges */
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;

      /* Trail particle fading */
      if (this.isTrail) {
        this.life -= this.decay;
      }
    }

    draw(offset) {
      const alpha = this.isTrail ? Math.max(this.life, 0) : 0.9;
      const drawY = this.y - offset;

      ctx.beginPath();
      ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = hexToRGBA(this.color, alpha);
      ctx.shadowBlur = 14 + this.radius * 3;
      ctx.shadowColor = hexToRGBA(this.color, alpha * 0.7);
      ctx.fill();
      ctx.closePath();
    }
  }

  /* ---------- Init particles ---------- */
  function initParticles() {
    particles = [];
    const count = particleCount();
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  /* ---------- Draw connections ---------- */
  function drawConnections(offset) {
    const all = particles.concat(trailParticles);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const dx = all[i].x - all[j].x;
        const dy = (all[i].y - offset) - (all[j].y - offset);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alphaBase = 1 - dist / CONNECTION_DIST;
          const alpha = alphaBase * 0.25;
          // Blend colors between the two particles
          ctx.strokeStyle = hexToRGBA(all[i].color, alpha);
          ctx.shadowBlur = 6;
          ctx.shadowColor = hexToRGBA(all[i].color, alpha * 0.5);
          ctx.beginPath();
          ctx.moveTo(all[i].x, all[i].y - offset);
          ctx.lineTo(all[j].x, all[j].y - offset);
          ctx.stroke();
        }
      }
    }
    ctx.shadowBlur = 0;
  }

  /* ---------- Animation Loop ---------- */
  function animate() {
    ctx.clearRect(0, 0, W, H);

    const pOffset = scrollY * PARALLAX_FACTOR;

    /* Update & draw permanent particles */
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(pOffset);
    }

    /* Update & draw trail particles, remove dead ones */
    for (let i = trailParticles.length - 1; i >= 0; i--) {
      trailParticles[i].update();
      trailParticles[i].draw(pOffset);
      if (trailParticles[i].life <= 0) {
        trailParticles.splice(i, 1);
      }
    }

    /* Neural-network connections */
    drawConnections(pOffset);

    /* Reset canvas shadow */
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    requestAnimationFrame(animate);
  }

  /* ---------- Events ---------- */
  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const now = performance.now();
    if (now - lastTrailTime > TRAIL_SPAWN_INTERVAL && trailParticles.length < 20) {
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      trailParticles.push(
        new Particle(mouseX + offsetX, mouseY + scrollY * PARALLAX_FACTOR + offsetY, true)
      );
      lastTrailTime = now;
    }
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }

  function onMouseLeave() {
    mouseX = -9999;
    mouseY = -9999;
  }

  function onScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      initParticles();
    }, 200);
  }

  /* ---------- Boot ---------- */
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  resize();
  initParticles();
  onScroll();
  requestAnimationFrame(animate);
})();
