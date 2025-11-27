export class Universe {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.resize(this.width, this.height);
        this.initParticles();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }

    initParticles() {
        this.particles = [];
        const particleCount = Math.min(150, (this.width * this.height) / 10000); // Responsive count

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(this.width, this.height));
        }
    }

    tick() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update(this.width, this.height);
            particle.draw(this.ctx);
        });

        // Draw connections
        this.ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)'; // Cyan with low opacity
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.globalAlpha = 1 - (distance / 120);
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1.0;
                }
            }
        }
    }
}

class Particle {
    constructor(width, height) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;

        const colors = ["#22d3ee", "#67e8f9", "#a5f3fc", "#ffffff"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.2;
    }

    update(width, height) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}
