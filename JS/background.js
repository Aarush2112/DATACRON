/* ============================================
   AI Energy Waves — Canvas Background Animation
   Datacron 2026
   ============================================ */
(function () {
  'use strict';

  const canvas = document.getElementById('galaxy-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  let particles = [];
  let scrollY = 0;
  const particleCount = window.innerWidth < 768 ? 40 : 120;
  
  // Colors: Emerald, Soft Green, Subtle Gold
  const COLORS = ['#00ffb3', '#1affc6', '#e6d5a3'];

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
  }

  let mouseX = -1000;
  let mouseY = -1000;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.baseX = this.x;
      this.baseY = this.y;
      this.size = Math.random() * 2 + 0.5;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.speedX = Math.random() * 0.4 + 0.1;
      this.frequency = Math.random() * 0.005 + 0.002;
      this.phase = Math.random() * Math.PI * 2;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.parallax = Math.random() * 0.15 + 0.05;
      this.dx = 0;
      this.dy = 0;
    }

    update() {
      this.x += this.speedX;
      // Wave motion
      this.y += Math.sin(this.x * this.frequency + this.phase) * 0.3;
      
      // Mouse Reactivity (Drift away)
      const drawY = this.y - scrollY * this.parallax;
      const dx = mouseX - this.x;
      const dy = mouseY - drawY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 150;
      
      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        const directionX = dx / distance;
        const directionY = dy / distance;
        this.dx -= directionX * force * 1.5;
        this.dy -= directionY * force * 1.5;
      }

      // Return to path
      this.dx *= 0.95;
      this.dy *= 0.95;
      
      if (this.x > W + 20) {
        this.x = -20;
        this.y = Math.random() * H;
        this.dx = 0;
        this.dy = 0;
      }
    }

    draw() {
      const drawX = this.x + this.dx;
      const drawY = this.y - scrollY * this.parallax + this.dy;
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function drawWave(t, speed, amplitude, color, yOffset) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    
    for (let i = -50; i < W + 50; i += 20) {
      const y = (H / 2 + yOffset) + 
                Math.sin(i * 0.003 + t * speed * 0.001) * amplitude + 
                Math.sin(i * 0.008 + t * speed * 0.0015) * (amplitude / 2);
      if (i === -50) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();
  }

  function drawVortex(t) {
    const cx = W / 2;
    const cy = H / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.0002);
    
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 150 + Math.sin(t * 0.001 + i) * 20, 50, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 179, 0.03)';
      ctx.stroke();
    }
    ctx.restore();
  }

  let time = 0;
  let rafId = 0;
  let isRunning = false;
  let lastTime = 0;
  const FPS = window.innerWidth < 768 ? 20 : 60; // Throttle to 20 FPS on mobile
  const frameInterval = 1000 / FPS;

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    
    time++;
    
    const currentParticles = window.innerWidth < 768 ? particles.slice(0, 40) : particles;
    
    drawWave(time, 1, 40, 'rgba(0, 255, 179, 0.04)', -20);
    drawWave(time, 0.7, 30, 'rgba(230, 213, 163, 0.03)', 20);
    
    drawVortex(time);
    
    // Draw connections (Neural Network Effect)
    if (window.innerWidth > 768) {
      drawConnections();
    }
    
    currentParticles.forEach(p => {
      p.update();
      p.draw();
    });
  }

  function animate(timestamp) {
    if (!isRunning) return;
    rafId = requestAnimationFrame(animate);

    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;

    if (elapsed > frameInterval) {
      lastTime = timestamp - (elapsed % frameInterval);
      drawFrame();
    }
  }

  function startAnimation() {
    if (isRunning) return;
    isRunning = true;
    lastTime = 0;
    rafId = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    isRunning = false;
    cancelAnimationFrame(rafId);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      createParticles();
      // Only draw static frame if paused
      if (!isRunning) drawFrame();
    }, 200);
  });

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        scrollY = window.pageYOffset || document.documentElement.scrollTop;
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  const init = () => {
    resize();
    createParticles();
    drawFrame();
    startAnimation();
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(init);
  } else {
    setTimeout(init, 100);
  }
})();
