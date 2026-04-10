(function() {
    "use strict";

    const canvas = document.getElementById("galaxy-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width, height, particles = [];
    let mouseTimeout;
    let mouse = {
        x: -1000,
        y: -1000,
        vx: 0,
        vy: 0,
        lastX: 0,
        lastY: 0,
        speed: 0
    };
    let isMouseMoving = false;

    /* =================================================================
       Configuration & Sizing
       ================================================================= */
    const frameRate = 1000 / 55;
    let lastFrameTime = 0;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    }

    /* =================================================================
       Interaction Handling
       ================================================================= */
    let moveRequestPending = false;
    window.addEventListener("mousemove", (e) => {
        if (!moveRequestPending) {
            handleMove(e);
            moveRequestPending = true;
            requestAnimationFrame(() => moveRequestPending = false);
        }
    }, {
        passive: true
    });

    function handleMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.vx = mouse.x - mouse.lastX;
        mouse.vy = mouse.y - mouse.lastY;
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;
        mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
        
        isMouseMoving = true;
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
            mouse.vx = 0;
            mouse.vy = 0;
        }, 100);
    }

    /* =================================================================
       Particle System
       ================================================================= */
    class Particle {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.z = Math.random();
            this.mass = 1 + (this.z * 2);
            this.size = 1.5 + (this.z * 2.5);
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.phase = Math.random() * Math.PI * 2;
            this.freq = 0.001 + Math.random() * 0.002;
            this.amplitude = 0.05 + this.z * 0.1;
            
            // Color based on depth (Z)
            if (this.z > 0.6) {
                this.color = "#3A8C6D";
            } else if (this.z > 0.3) {
                this.color = "#2A6650";
            } else {
                this.color = "#1A4032";
            }
            
            this.opacity = 0.05 + (this.z * 0.45);
        }

        update(deltaTime, timestamp) {
            // Drift based on frequency
            const freqDrift = Math.sin(timestamp * this.freq + this.phase) * this.amplitude;
            this.vy += freqDrift / this.mass;

            // Repel from mouse
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distSq = dx * dx + dy * dy;
            const radiusSq = 57600; // 240px range

            if (distSq < radiusSq) {
                const force = (radiusSq - distSq) / radiusSq;
                const strength = 0.01;
                this.vx += dx * force * strength;
                this.vy += dy * force * strength;
            }

            // Normal movement
            this.x += this.vx * (deltaTime / 16);
            this.y += this.vy * (deltaTime / 16);
            
            // Friction
            this.vx *= 0.98;
            this.vy *= 0.98;

            // Wrap around screen
            if (this.x < -50) this.x = width + 50;
            if (this.x > width + 50) this.x = -50;
            if (this.y < -50) this.y = height + 50;
            if (this.y > height + 50) this.y = -50;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
        }
    }

    /* =================================================================
       Animation Loop
       ================================================================= */
    function render(timestamp) {
        requestAnimationFrame(render);
        const deltaTime = timestamp - lastFrameTime;

        if (deltaTime >= frameRate) {
            lastFrameTime = timestamp - (deltaTime % frameRate);
            
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                p.update(deltaTime, timestamp);
                p.draw();
            });

            drawConnections();
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = (1 - distance / 120) * 0.15 * (p1.z + p2.z) / 2;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = "#3A8C6D";
                    ctx.lineWidth = 0.5 + (p1.z + p2.z) / 2;
                    ctx.globalAlpha = opacity;
                    ctx.stroke();
                }
            }
        }
    }

    /* =================================================================
       Initialization
       ================================================================= */
    function init() {
        resize();
        
        particles = [];
        for (let i = 0; i < 128; i++) {
            particles.push(new Particle());
        }
        
        // Sort by Z to draw distant particles first
        particles.sort((a, b) => a.z - b.z);
        
        requestAnimationFrame(render);
    }

    window.addEventListener("resize", () => {
        resize();
    });

    if (document.readyState === "complete") {
        init();
    } else {
        window.addEventListener("load", init);
    }

})();