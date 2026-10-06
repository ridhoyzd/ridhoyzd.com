// Generate random stars
function generateStars() {
    const starfield = document.getElementById('starfield');
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starfield.appendChild(star);
    }
}

// Smooth scroll navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll reveal animation
const observerOptions = {
    threshold: 0.1,
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
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('nav a').forEach(link => {
        link.style.textShadow = '';
        if (link.getAttribute('href').slice(1) === current) {
            link.style.color = 'var(--primary)';
            link.style.textShadow = '0 0 10px rgba(0, 255, 136, 0.5)';
        }
    });
});

// Initialize
generateStars();

// Typing effect
const typingElement = document.querySelector('.typing-effect');
if (typingElement) {
    const texts = [
        'Building next-generation web solutions...',
        'Crafting elegant code architecture...',
        'Optimizing for performance...',
        'Delivering enterprise solutions...'
    ];
    let index = 0;
    let textIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentText = texts[index % texts.length];
        const displayText = isDeleting 
            ? currentText.substring(0, textIndex--) 
            : currentText.substring(0, textIndex++);

        typingElement.textContent = displayText;

        if (!isDeleting && textIndex === currentText.length) {
            isDeleting = true;
            setTimeout(typeEffect, 2000);
            return;
        }

        if (isDeleting && textIndex === 0) {
            isDeleting = false;
            index++;
        }

        setTimeout(typeEffect, isDeleting ? 50 : 100);
    }

    typeEffect();
}

// Particle cursor effect (optional)
document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    document.querySelectorAll('.service-box, .skill-category, .timeline-item').forEach(el => {
        const rect = el.getBoundingClientRect();
        const elX = rect.left + rect.width / 2;
        const elY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(Math.pow(x - elX, 2) + Math.pow(y - elY, 2));
        
        if (distance < 200) {
            el.style.transform = `perspective(1000px) rotateX(${(y - elY) * 0.05}deg) rotateY(${(x - elX) * 0.05}deg) translateZ(20px)`;
        } else {
            el.style.transform = '';
        }
    });
});
