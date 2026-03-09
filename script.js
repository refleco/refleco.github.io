document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initTheme();
    initSettings();
    initStarfield();
    initScrollReveal();
    initTypingEffect();
    initTiltEffect();
    initScrollToTop();
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
    let starCount = parseInt(localStorage.getItem('star-count')) || 150;
    let speedMultiplier = parseFloat(localStorage.getItem('star-speed')) || 1.0;
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

    // Listen for settings changes
    window.addEventListener('settingsChanged', (e) => {
        if (e.detail.starCount !== undefined) {
            starCount = e.detail.starCount;
            init(); // Re-init stars
        }
        if (e.detail.starSpeed !== undefined) {
            speedMultiplier = e.detail.starSpeed;
        }
    });

    class Star {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.baseVx = (Math.random() - 0.5) * 0.5;
            this.baseVy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
        }

        update() {
            this.x += this.baseVx * speedMultiplier;
            this.y += this.baseVy * speedMultiplier;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.baseVx *= -1;
            if (this.y < 0 || this.y > height) this.baseVy *= -1;

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
                    this.baseVx -= directionX * 0.1; // Soften impact
                    this.baseVy -= directionY * 0.1;
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
        if (!animationId) animate();
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

// --- Typing Effect ---
function initTypingEffect() {
    // 1. Main Subtitle (Looping/Cursor)
    const mainSubtitle = document.getElementById('typing-text');
    if (mainSubtitle) {
        const text = mainSubtitle.getAttribute('data-text');
        mainSubtitle.innerText = '';
        let i = 0;
        function typeMain() {
            if (i < text.length) {
                mainSubtitle.innerText += text.charAt(i);
                i++;
                setTimeout(typeMain, 50 + Math.random() * 50);
            }
        }
        setTimeout(typeMain, 1000);
    }

    // 2. General Text (One-time reveal)
    // Target headers, paragraphs, list items, and spans that are NOT in cards, tags, or the main header
    const elements = document.querySelectorAll('h1, h2, h3, p, li, span');

    const typeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
                entry.target.classList.add('typed');
                typeElement(entry.target);
            }
        });
    }, { threshold: 0.1 }); // Lower threshold for better triggering

    elements.forEach(el => {
        // Filter out elements we don't want to animate
        if (el.id === 'typing-text') return; // Main subtitle handled above
        if (el.closest('header') && el.tagName !== 'H2') return; // Skip main header elements except section titles
        if (el.closest('.card')) return; // Skip cards
        if (el.closest('.tilt-card')) return; // Skip tilt cards
        if (el.closest('.tag')) return; // Skip tags
        if (el.closest('button')) return; // Skip buttons
        if (el.closest('#settings-modal')) return; // Skip settings
        if (el.classList.contains('typing-cursor')) return; // Skip cursor itself
        if (el.innerText.trim() === '') return; // Skip empty

        // Prepare element
        el.dataset.originalText = el.innerText;
        el.innerText = ''; // Clear text
        el.style.visibility = 'hidden'; // Hide initially
        typeObserver.observe(el);
    });

    function typeElement(element) {
        const text = element.dataset.originalText;
        element.style.visibility = 'visible';
        element.innerText = '';

        // Add cursor
        element.classList.add('typing-cursor-active');

        let i = 0;
        // Adjust speed based on text length (longer text = faster typing)
        const speed = Math.max(5, 30 - Math.floor(text.length / 50));

        function typeChar() {
            if (i < text.length) {
                element.innerText += text.charAt(i);
                i++;
                setTimeout(typeChar, speed);
            } else {
                // Remove cursor after done
                setTimeout(() => {
                    element.classList.remove('typing-cursor-active');
                }, 500);
            }
        }
        typeChar();
    }
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

// --- BTD6 Link Fix ---
function fixBtd6Link() {
    const btd6Link = document.getElementById('btd6-link');
    if (btd6Link) {
        // Ensure we don't double-stack index.html or get stuck in a loop
        // If we are at /index.html, we want ./btd6/ which resolves to /btd6/
        // The default href="btd6/" is usually correct for both / and /index.html
        // But just in case, let's force an absolute-ish path relative to the current directory

        const pathname = window.location.pathname;
        const basePath = pathname.substring(0, pathname.lastIndexOf('/') + 1);
        btd6Link.href = basePath + 'btd6/';
    }
}

// --- Settings Modal ---
function initSettings() {
    // Inject Modal HTML if not present
    if (!document.getElementById('settings-modal')) {
        const modalHTML = `
            <div id="settings-modal" class="fixed inset-0 z-[100] hidden flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-300">
                <div class="bg-card border border-theme p-8 rounded-3xl shadow-2xl w-full max-w-md transform scale-95 transition-transform duration-300">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold border-b-0">Theme Settings</h2>
                        <button id="close-settings" class="text-light-secondary dark:text-dark-secondary hover:text-accent-color transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-6">
                        <div>
                            <label class="flex justify-between text-sm font-bold text-light-secondary dark:text-dark-secondary mb-2">
                                Star Count <span id="star-count-val" class="text-accent-color">100</span>
                            </label>
                            <input type="range" id="star-count" min="20" max="300" value="100" class="w-full accent-accent-color">
                        </div>
                        
                        <div>
                            <label class="flex justify-between text-sm font-bold text-light-secondary dark:text-dark-secondary mb-2">
                                Star Speed <span id="star-speed-val" class="text-accent-color">1.0x</span>
                            </label>
                            <input type="range" id="star-speed" min="0.1" max="3.0" step="0.1" value="1.0" class="w-full accent-accent-color">
                        </div>

                        <div class="pt-4 border-t border-theme flex justify-end">
                            <button id="reset-settings" class="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <button id="settings-toggle"
                class="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-card shadow-lg flex items-center justify-center text-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color border border-theme transition-transform duration-300 hover:scale-110 z-50">
                <i class="fas fa-cog text-light-secondary dark:text-dark-secondary"></i>
            </button>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const toggleBtn = document.getElementById('settings-toggle');
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('close-settings');
    const resetBtn = document.getElementById('reset-settings');

    // Inputs
    const starCountInput = document.getElementById('star-count');
    const starSpeedInput = document.getElementById('star-speed');
    const starCountVal = document.getElementById('star-count-val');
    const starSpeedVal = document.getElementById('star-speed-val');

    if (!toggleBtn || !modal) return;

    // Load saved settings
    const savedCount = localStorage.getItem('star-count') || 150;
    const savedSpeed = localStorage.getItem('star-speed') || 1.0;

    starCountInput.value = savedCount;
    starSpeedInput.value = savedSpeed;
    starCountVal.textContent = savedCount;
    starSpeedVal.textContent = savedSpeed + 'x';

    const openModal = () => {
        modal.classList.remove('hidden');
        // Trigger reflow
        void modal.offsetWidth;
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
        modal.querySelector('div').classList.add('scale-100');
    };

    const closeModal = () => {
        modal.classList.add('opacity-0');
        modal.querySelector('div').classList.remove('scale-100');
        modal.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    toggleBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Input Handlers
    starCountInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        starCountVal.textContent = val;
        localStorage.setItem('star-count', val);
        window.dispatchEvent(new CustomEvent('settingsChanged', { detail: { starCount: val } }));
    });

    starSpeedInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        starSpeedVal.textContent = val + 'x';
        localStorage.setItem('star-speed', val);
        window.dispatchEvent(new CustomEvent('settingsChanged', { detail: { starSpeed: val } }));
    });

    resetBtn.addEventListener('click', () => {
        starCountInput.value = 150;
        starSpeedInput.value = 1.0;
        starCountVal.textContent = 150;
        starSpeedVal.textContent = '1.0x';

        localStorage.setItem('star-count', 150);
        localStorage.setItem('star-speed', 1.0);

        window.dispatchEvent(new CustomEvent('settingsChanged', { detail: { starCount: 150, starSpeed: 1.0 } }));
    });
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

// --- Scroll to Top ---
function initScrollToTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('opacity-0', window.scrollY < 300);
        btn.classList.toggle('pointer-events-none', window.scrollY < 300);
        btn.classList.toggle('translate-y-4', window.scrollY < 300);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
