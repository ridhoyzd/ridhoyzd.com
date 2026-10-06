// Generate random stars
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function generateStars() {
    const starfield = document.getElementById('starfield');
    if (!starfield || prefersReducedMotion) return;

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
        starfield.appendChild(star);
    }
}

// mesh/particle background
function initMeshBackground() {
    const canvas = document.getElementById('meshCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = [];
    const particleCount = window.innerWidth < 768 ? 24 : 42;
    let animationFrame;

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
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                r: Math.random() * 2.2 + 1.2
            });
        }
    }

    function drawMesh() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
            if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

            ctx.beginPath();
            ctx.fillStyle = 'rgba(126, 249, 198, 0.8)';
            ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
            ctx.fill();

            for (let j = index + 1; j < particles.length; j++) {
                const other = particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(126, 249, 198, ${0.2 - distance / 1000})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            }
        });

        if (!prefersReducedMotion && !document.hidden) {
            animationFrame = requestAnimationFrame(drawMesh);
        }
    }

    resizeCanvas();
    createParticles();
    drawMesh();

    window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
        if (prefersReducedMotion) drawMesh();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else if (!prefersReducedMotion) {
            drawMesh();
        }
    });
}

// Smooth scroll internal links without adding a fragment to the URL.
const internalLinks = document.querySelectorAll('a[href^="#"]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');
const nav = document.querySelector('nav');

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

// Scroll reveal animation
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

window.addEventListener('scroll', setStickyNav, { passive: true });
window.addEventListener('resize', setStickyNav, { passive: true });
window.addEventListener('load', setStickyNav);
setStickyNav();

// Initialize
generateStars();
initMeshBackground();

// Typing effect
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

    function typeEffect() {
        const currentText = texts[textIndex % texts.length];
        const displayText = isDeleting
            ? currentText.substring(0, charIndex--)
            : currentText.substring(0, charIndex++);

        typingElement.textContent = displayText;

        if (!isDeleting && charIndex > currentText.length) {
            isDeleting = true;
            setTimeout(typeEffect, 1400);
            return;
        }

        if (isDeleting && charIndex < 0) {
            isDeleting = false;
            textIndex++;
            charIndex = 0;
        }

        setTimeout(typeEffect, isDeleting ? 55 : 90);
    }

    typeEffect();
}
