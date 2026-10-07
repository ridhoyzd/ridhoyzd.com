// Feature detection and performance optimization
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 1000 / 60);
    };
}
if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}

// Polyfill untuk IntersectionObserver (untuk browser lama)
if (!window.IntersectionObserver) {
    window.IntersectionObserver = function(callback, options = {}) {
        const threshold = options.threshold || 0;
        const rootMargin = parseMargin(options.rootMargin || '0px');
        
        return {
            observe(el) {
                function check() {
                    const rect = el.getBoundingClientRect();
                    const inView = rect.top + rootMargin.top < window.innerHeight &&
                                 rect.bottom + rootMargin.bottom > 0;
                    callback([{target: el, isIntersecting: inView}]);
                }
                window.addEventListener('scroll', check, { passive: true });
                window.addEventListener('resize', check, { passive: true });
                check();
            }
        };
    };
    
    function parseMargin(str) {
        const parts = str.split(' ').map(p => parseInt(p) || 0);
        return {top: parts[0], right: parts[1] || parts[0], bottom: parts[2] || parts[0], left: parts[3] || parts[1] || parts[0]};
    }
}

// Smooth scroll polyfill untuk browser yang tidak support
if (!CSS.supports('scroll-behavior', 'smooth')) {
    window.scrollTo = (function() {
        const original = window.scrollTo;
        return function(x, y) {
            if (typeof x === 'object' && x.behavior === 'smooth') {
                const target = x.top !== undefined ? x.top : window.scrollY;
                smoothScroll(target);
            } else {
                original.call(window, x, y);
            }
        };
    })();
    
    function smoothScroll(target) {
        const start = window.scrollY;
        const distance = target - start;
        const duration = 500;
        const startTime = performance.now();
        
        function animation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            window.scrollY !== window.scrollY + distance * easeInOutQuad(progress) &&
                window.scroll(0, start + distance * easeInOutQuad(progress));
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }
        
        function easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }
        
        requestAnimationFrame(animation);
    }
}

// Generate random stars
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function generateStars() {
    const starfield = document.getElementById('starfield');
    if (!starfield || prefersReducedMotion) return;

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 48; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.opacity = (Math.random() * 0.8 + 0.2).toFixed(2);
        star.style.willChange = 'opacity';
        fragment.appendChild(star);
    }
    starfield.appendChild(fragment);
}

// mesh/particle background with optimized rendering
function initMeshBackground() {
    const canvas = document.getElementById('meshCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
    if (!ctx) return;

    const particles = [];
    const particleCount = window.innerWidth < 768 ? 20 : 35;
    let animationFrame;
    let lastTime = performance.now();
    const fps = 60;
    const frameInterval = 1000 / fps;

    function resizeCanvas() {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function createParticles() {
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 2 + 1
            });
        }
    }

    function drawMesh(timestamp) {
        const elapsed = timestamp - lastTime;
        
        if (elapsed < frameInterval) {
            animationFrame = requestAnimationFrame(drawMesh);
            return;
        }
        
        lastTime = timestamp - (elapsed % frameInterval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(126, 249, 198, 0.75)';

        const distanceThreshold = 120;
        const distanceSq = distanceThreshold * distanceThreshold;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
            if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const other = particles[j];
                const dx = p.x - other.x;
                const dy = p.y - other.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < distanceSq) {
                    const distance = Math.sqrt(distSq);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(126, 249, 198, ${Math.max(0, 0.2 - distance / 1000)})`;
                    ctx.lineWidth = 0.7;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            }
        }

        if (!prefersReducedMotion && !document.hidden) {
            animationFrame = requestAnimationFrame(drawMesh);
        }
    }

    resizeCanvas();
    createParticles();
    requestAnimationFrame(drawMesh);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            createParticles();
        }, 250);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else if (!prefersReducedMotion) {
            lastTime = performance.now();
            requestAnimationFrame(drawMesh);
        }
    });
}

// Smooth scroll internal links without adding a fragment to the URL.
const internalLinks = document.querySelectorAll('a[href^="#"]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');
const nav = document.querySelector('nav');

// Theme is dark by default; remember an explicit choice when storage is available.
const themeToggle = document.querySelector('.theme-toggle');

function setTheme(theme, persist = false) {
    const isLight = theme === 'light';
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark';

    if (themeToggle) {
        const label = `Switch to ${isLight ? 'dark' : 'light'} theme`;
        themeToggle.innerHTML = `<i class="bi ${isLight ? 'bi-moon-fill' : 'bi-sun-fill'}" aria-hidden="true"></i>`;
        themeToggle.setAttribute('aria-label', label);
        themeToggle.setAttribute('title', label);
        themeToggle.setAttribute('aria-pressed', String(isLight));
    }

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isLight ? '#f4f7fb' : '#080d15');

    if (persist) {
        try {
            localStorage.setItem('ridho-theme', isLight ? 'light' : 'dark');
        } catch (error) {
            console.warn('Unable to save the theme preference.', error);
        }
    }
}

setTheme(document.documentElement.dataset.theme || 'dark');
themeToggle?.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light', true);
});

internalLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href')?.slice(1);
        if (!targetId) return;

        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();
        const targetPosition = target.getBoundingClientRect().top + window.scrollY;
        const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
        const destinationProgress = scrollableDistance > 0
            ? targetPosition / scrollableDistance
            : 0;
        const navWillBeVisible = nav?.classList.contains('is-visible') || destinationProgress >= 0.15;
        const navOffset = navWillBeVisible && nav ? nav.offsetHeight + 24 : 24;
        const top = targetPosition - navOffset;

        window.scrollTo({
            top: Math.max(0, top),
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    });
});

// Scroll reveal animation with Intersection Observer
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
};

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
}

// Active nav link on scroll
function setActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 180 && rect.bottom >= 180) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        link.classList.toggle('active', href === `#${current}`);
    });
}

window.addEventListener('scroll', setActiveNav, { passive: true });
window.addEventListener('load', setActiveNav);

function setStickyNav() {
    if (!nav) return;

    const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollableDistance > 0 ? window.scrollY / scrollableDistance : 0;
    const isVisible = scrollProgress >= 0.15;

    nav.classList.toggle('is-visible', isVisible);
}

// Optimized Sticky Nav with debounce
let scrollTimeout;
function setStickyNav() {
    if (!nav) return;

    const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollableDistance > 0 ? window.scrollY / scrollableDistance : 0;
    const isVisible = scrollProgress >= 0.15;

    nav.classList.toggle('is-visible', isVisible);
}

window.addEventListener('scroll', setStickyNav, { passive: true });
window.addEventListener('resize', setStickyNav, { passive: true });
window.addEventListener('load', setStickyNav);
setStickyNav();

// Initialize
generateStars();
initMeshBackground();

// Optimized Typing effect with better performance
const typingElement = document.querySelector('.typing-effect');
if (typingElement && prefersReducedMotion) {
    typingElement.textContent = 'Custom OJS templates, plugins, and scholarly publishing systems.';
} else if (typingElement) {
    const texts = [
        'Custom OJS templates & journals...',
        'Publication systems & plugins...',
        'Academic workflows & digital publishing...',
        'Modern interfaces for research communities...'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeTimeout;
    let lastUpdateTime = 0;

    function typeEffect() {
        const currentText = texts[textIndex % texts.length];
        const displayText = isDeleting
            ? currentText.substring(0, charIndex--)
            : currentText.substring(0, charIndex++);

        typingElement.textContent = displayText;

        if (!isDeleting && charIndex > currentText.length) {
            isDeleting = true;
            typeTimeout = setTimeout(typeEffect, 1400);
            return;
        }

        if (isDeleting && charIndex < 0) {
            isDeleting = false;
            textIndex++;
            charIndex = 0;
        }

        typeTimeout = setTimeout(typeEffect, isDeleting ? 50 : 85);
    }

    // Start typing effect after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', typeEffect);
    } else {
        typeEffect();
    }

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
        clearTimeout(typeTimeout);
    });
}
