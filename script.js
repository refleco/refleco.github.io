document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initTheme();
    initStarfield();
    initScrollReveal();
    initTypingEffect();
    initTiltEffect();
    fixBtd6Link();
});

// --- Loader ---
function initLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 500); // Short delay to show off the loader a bit
        });
    }
}

// --- Theme Management ---
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconLight = document.getElementById('theme-icon-light');
    const themeIconDark = document.getElementById('theme-icon-dark');

    const applyTheme = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            themeIconLight.classList.add('hidden');
            themeIconDark.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            themeIconLight.classList.remove('hidden');
            themeIconDark.classList.add('hidden');
        }
        // Dispatch event for starfield to update colors
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark } }));
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
            applyTheme(isDark);
        });
    }

    const savedTheme = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme === 'dark' || (savedTheme === null && prefersDark));
}

// --- Starfield Animation ---
function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let animationId;
    
    // Configuration
    const starCount = 150;
    const connectionDistance = 100;
    let mouse = { x: null, y: null };
    
    // Colors
    let starColor = 'rgba(255, 255, 255, 0.8)';
    let lineColor = 'rgba(255, 255, 255, 0.1)';

    function updateColors(isDark) {
        if (isDark) {
            starColor = 'rgba(255, 255, 255, 0.8)';
            lineColor = 'rgba(255, 255, 255, 0.1)';
        } else {
            starColor = 'rgba(15, 23, 42, 0.6)'; // Dark blueish for light mode
            lineColor = 'rgba(15, 23, 42, 0.05)';
        }
    }

    // Initial color set
    updateColors(document.documentElement.classList.contains('dark'));

    // Listen for theme changes
    window.addEventListener('themeChanged', (e) => updateColors(e.detail.isDark));

    class Star {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (150 - distance) / 150;
                    const directionX = forceDirectionX * force * 0.5; // Repel strength
                    const directionY = forceDirectionY * force * 0.5;
                    this.vx -= directionX;
                    this.vy -= directionY;
                }
            }
        }

        draw() {
            ctx.fillStyle = starColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }
        animate();
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < stars.length; i++) {
            stars[i].update();
            stars[i].draw();

            // Draw connections
            for (let j = i; j < stars.length; j++) {
                let dx = stars[i].x - stars[j].x;
                let dy = stars[i].y - stars[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 1 - distance / connectionDistance;
                    ctx.beginPath();
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(stars[j].x, stars[j].y);
                    ctx.stroke();
                }
            }
        }
        animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        // Re-initialize stars to fit new screen? Or just let them be. 
        // Let's just update bounds.
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    init();
}

// --- Scroll Reveal ---
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(element => observer.observe(element));
}

// --- Typing Effect ---
function initTypingEffect() {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;

    const text = textElement.getAttribute('data-text');
    textElement.innerText = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            textElement.innerText += text.charAt(i);
            i++;
            setTimeout(type, 50 + Math.random() * 50); // Random typing speed
        }
    }

    // Start typing after a small delay
    setTimeout(type, 1000);
}

// --- 3D Tilt Effect ---
function initTiltEffect() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5; // Max rotation deg
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// --- BTD6 Link Fix (Legacy) ---
function fixBtd6Link() {
    const btd6Link = document.getElementById('btd6-link');
    if (btd6Link) {
        const currentPath = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
        const isIndex = currentPath.endsWith('index.html');
        const basePath = isIndex ? currentPath.substring(0, currentPath.lastIndexOf('/') + 1) : currentPath;
        btd6Link.href = basePath + 'btd6/';
    }
}
