/* ============================================
   Antigravity Physics Particle Network
   Datacron 2026 - Premium Edition
   ============================================ */

(function () {
    'use strict';

    const canvas = document.getElementById('galaxy-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    let particles = [];
    const particleCount = 128; // Reduced for a cleaner look (was 160)
    const connectionDist = 120;
    
    // Mouse tracking
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0, speed: 0 };
    let isMouseMoving = false;
    let mouseTimer;

    // FPS control
    const targetFPS = 55;
    const frameInterval = 1000 / targetFPS;
    let lastTime = 0;

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

    const handleMouseMove = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.vx = mouse.x - mouse.lastX;
        mouse.vy = mouse.y - mouse.lastY;
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;
        mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
        
        isMouseMoving = true;
        clearTimeout(mouseTimer);
        mouseTimer = setTimeout(() => { isMouseMoving = false; mouse.vx = 0; mouse.vy = 0; }, 100);
    };

    // Throttle move listener to ~60fps (16ms)
    let moveTicking = false;
    window.addEventListener('mousemove', (e) => {
        if (!moveTicking) {
            handleMouseMove(e);
            moveTicking = true;
            requestAnimationFrame(() => moveTicking = false);
        }
    }, { passive: true });

    class Particle {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.z = Math.random(); // Depth: 0 (back) to 1 (front)
            
            this.mass = 1 + this.z * 2;
            this.size = (1.5 + this.z * 2.5);
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            
            this.phase = Math.random() * Math.PI * 2;
            this.freq = 0.001 + Math.random() * 0.002;
            this.amplitude = 0.05 + this.z * 0.1;
            
            // Muted emerald tones for a more subtle look
            this.color = this.z > 0.6 ? '#3A8C6D' : (this.z > 0.3 ? '#2A6650' : '#1A4032');
            this.opacity = 0.05 + this.z * 0.45; // Reduced opacity range (was 0.1 - 0.7)
        }

        update(dt, time) {
            // 1. Antigravity/Buoyancy Effect
            const buoyancy = Math.sin(time * this.freq + this.phase) * this.amplitude;
            this.vy += buoyancy / this.mass;

            // 2. Antigravity Repulsion (Gravity Field Physics - Optimized)
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distSq = dx * dx + dy * dy; // Squared distance check (PageSpeed optimized)
            const thresholdSq = 57600; // 240 * 240
            
            if (distSq < thresholdSq) {
                const force = (thresholdSq - distSq) / thresholdSq;
                const repulsionStrength = 0.01;
                
                // Acceleration away from mouse (No Math.sqrt for TBT < 50ms)
                this.vx += dx * force * repulsionStrength;
                this.vy += dy * force * repulsionStrength;
            }

            // Apply velocity
            this.x += this.vx * (dt / 16);
            this.y += this.vy * (dt / 16);

            // Friction/Damping
            this.vx *= 0.98;
            this.vy *= 0.98;

            // Boundary wrap with reset
            if (this.x < -50) this.x = W + 50;
            if (this.x > W + 50) this.x = -50;
            if (this.y < -50) this.y = H + 50;
            if (this.y > H + 50) this.y = -50;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        // Sort once at creation for correct depth layering
        particles.sort((a, b) => a.z - b.z);
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDist) {
                    const alpha = (1 - dist / connectionDist) * 0.15 * (p1.z + p2.z) / 2;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = '#3A8C6D'; // Dull emerald to match particles
                    ctx.lineWidth = 0.5 + (p1.z + p2.z) / 2;
                    ctx.globalAlpha = alpha;
                    ctx.stroke();
                }
            }
        }
    }


    function animate(now) {
        requestAnimationFrame(animate);

        const delta = now - lastTime;
        if (delta >= frameInterval) {
            lastTime = now - (delta % frameInterval);

            ctx.clearRect(0, 0, W, H);
            
            // NOTE: particles.sort() removed from here. 
            // It is now called once in createParticles() since this.z is constant.

            particles.forEach(p => {
                p.update(delta, now);
                p.draw();
            });

            drawConnections();
        }
    }

    function init() {
        resize();
        createParticles();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
    });

    // Start
    // Defer initialization for LCP optimization
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

})();
