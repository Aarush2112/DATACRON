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

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 2 + 0.5;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.speedX = Math.random() * 0.4 + 0.1;
      this.frequency = Math.random() * 0.005 + 0.002;
      this.phase = Math.random() * Math.PI * 2;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.parallax = Math.random() * 0.15 + 0.05;
    }

    update() {
      this.x += this.speedX;
      // Wave motion
      this.y += Math.sin(this.x * this.frequency + this.phase) * 0.3;
      
      if (this.x > W + 20) {
        this.x = -20;
        this.y = Math.random() * H;
      }
    }

    draw() {
      const drawY = this.y - scrollY * this.parallax;
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, drawY, this.size, 0, Math.PI * 2);
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
  function animate() {
    ctx.clearRect(0, 0, W, H);
    
    time++;
    
    // Low particle count on mobile check
    const currentParticles = window.innerWidth < 768 ? particles.slice(0, 40) : particles;
    
    // Draw background waves
    drawWave(time, 1, 40, 'rgba(0, 255, 179, 0.04)', -20);
    drawWave(time, 0.7, 30, 'rgba(230, 213, 163, 0.03)', 20);
    
    // Center vortex pattern
    drawVortex(time);
    
    // Draw particles
    currentParticles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  window.addEventListener('scroll', () => {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
  }, { passive: true });

  resize();
  createParticles();
  animate();
})();
