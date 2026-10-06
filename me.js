// Generate random stars
function generateStars() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    for (let i = 0; i < 80; i++) {
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
    const particles = [];
    const particleCount = 60;

    function resizeCanvas() {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
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

        requestAnimationFrame(drawMesh);
    }

    resizeCanvas();
    createParticles();
    drawMesh();

    window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
    });
}

// Smooth scroll navigation
const navLinks = document.querySelectorAll('a[href^="#"]');
navLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Scroll reveal animation
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

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

// Initialize
generateStars();
initMeshBackground();

// Typing effect
const typingElement = document.querySelector('.typing-effect');
if (typingElement) {
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

// Advanced hover motion for cards
const interactiveCards = document.querySelectorAll('.service-box, .skill-category, .timeline-item, .stat-mini, .float-card, .metric-pill');

document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    interactiveCards.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(x - centerX, y - centerY);

        if (distance < 260) {
            const rotateY = ((x - centerX) / rect.width) * 12;
            const rotateX = ((centerY - y) / rect.height) * 12;
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        } else if (el.style.transform) {
            el.style.transform = '';
        }
    });
});

const heroCards = document.querySelectorAll('.float-card');
if (heroCards.length) {
    window.addEventListener('pointermove', (event) => {
        const offsetX = (event.clientX / window.innerWidth - 0.5) * 12;
        const offsetY = (event.clientY / window.innerHeight - 0.5) * 12;

        heroCards.forEach((card, index) => {
            const direction = index % 2 === 0 ? 1 : -1;
            card.style.transform = `translate(${offsetX * direction}px, ${offsetY * direction}px)`;
        });
    }, { passive: true });
}

// Hero slight parallax
const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('pointermove', (event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 16;
        const y = (event.clientY / window.innerHeight - 0.5) * 16;
        hero.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
    }, { passive: true });
}
