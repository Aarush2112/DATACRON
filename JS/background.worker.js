/* ============================================
   Antigravity Physics Particle Network (Worker)
   Optimized for OffscreenCanvas
   ============================================ */

let canvas, ctx, W, H;
let particles = [];
const particleCount = 160;
const connectionDist = 120;
let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };

const targetFPS = 55;
const frameInterval = 1000 / targetFPS;
let lastTime = 0;

self.onmessage = function(e) {
    const { type, data } = e.data;
    
    if (type === 'init') {
        canvas = data.canvas;
        ctx = canvas.getContext('2d');
        W = data.width;
        H = data.height;
        createParticles();
        requestAnimationFrame(animate);
    } else if (type === 'resize') {
        W = data.width;
        H = data.height;
        canvas.width = W;
        canvas.height = H;
    } else if (type === 'mouse') {
        mouse.x = data.x;
        mouse.y = data.y;
    }
};

class Particle {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.z = Math.random();
        this.mass = 1 + this.z * 2;
        this.size = 1.5 + this.z * 2.5;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.phase = Math.random() * Math.PI * 2;
        this.freq = 0.001 + Math.random() * 0.002;
        this.amplitude = 0.05 + this.z * 0.1;
        this.color = this.z > 0.6 ? '#00FF9F' : (this.z > 0.3 ? '#00D182' : '#00A365');
        this.opacity = 0.1 + this.z * 0.6;
    }

    update(dt, time) {
        const buoyancy = Math.sin(time * this.freq + this.phase) * this.amplitude;
        this.vy += buoyancy / this.mass;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const threshold = 240;
        
        if (dist < threshold) {
            const force = Math.pow((threshold - dist) / threshold, 1.5);
            this.vx += (dx / dist) * force * 0.75;
            this.vy += (dy / dist) * force * 0.75;
        }

        this.x += this.vx * (dt / 16);
        this.y += this.vy * (dt / 16);
        this.vx *= 0.98;
        this.vy *= 0.98;

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
                ctx.strokeStyle = '#00FF9F';
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
        particles.sort((a, b) => a.z - b.z);
        particles.forEach(p => {
            p.update(delta, now);
            p.draw();
        });
        drawConnections();
    }
}
