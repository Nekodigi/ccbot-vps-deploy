// ===========================
// Mobile Menu Toggle
// ===========================
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
}

// ===========================
// Header Scroll Effect
// ===========================
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow on scroll
    if (currentScroll > 10) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ===========================
// Smooth Scroll for Anchor Links
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===========================
// Intersection Observer for Fade-in Animations
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all sections and cards
const fadeElements = document.querySelectorAll(`
    .section-header,
    .service-card,
    .result-card,
    .about-content,
    .contact-wrapper,
    .about-stats
`);

fadeElements.forEach(element => {
    element.classList.add('fade-in');
    observer.observe(element);
});

// Add staggered animation for service cards and result cards
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});

const resultCards = document.querySelectorAll('.result-card');
resultCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});

// ===========================
// Form Handling
// ===========================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = '送信中...';
        submitButton.disabled = true;

        // Simulate form submission (replace with actual API call)
        try {
            // In a real application, you would send the data to a server
            // await fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // });

            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success message
            showNotification('お問い合わせを送信しました。担当者より折り返しご連絡いたします。', 'success');
            contactForm.reset();
        } catch (error) {
            // Error message
            showNotification('送信に失敗しました。しばらくしてから再度お試しください。', 'error');
        } finally {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}

// ===========================
// Notification System
// ===========================
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        backgroundColor: type === 'success' ? '#00a86b' : '#e74c3c',
        color: 'white',
        fontWeight: '600',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
        zIndex: '10000',
        animation: 'slideInUp 0.3s ease',
        maxWidth: '400px'
    });

    // Add to DOM
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes slideOutDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===========================
// Counter Animation for Stats
// ===========================
function animateCounter(element, target, suffix = '') {
    let current = 0;
    const increment = target / 50; // 50 frames
    const duration = 2000; // 2 seconds
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, stepTime);
}

// Observe stats and animate when visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber) {
                const text = statNumber.textContent;
                const number = parseInt(text.match(/\d+/)[0]);
                const suffix = text.match(/[+%年]/)?.[0] || '';

                // Reset and animate
                const span = document.createElement('span');
                span.className = 'stat-unit';
                span.textContent = suffix;

                statNumber.textContent = '0';
                animateCounter(statNumber, number, '');

                // Add suffix back after animation
                setTimeout(() => {
                    statNumber.appendChild(span);
                }, 2000);

                entry.target.dataset.animated = 'true';
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(stat => {
    statsObserver.observe(stat);
});

// ===========================
// Parallax Effect for Hero
// ===========================
const heroSection = document.querySelector('.hero');
if (heroSection) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = heroSection.querySelector('.hero-content');
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });
}

// ===========================
// Form Input Focus Effect
// ===========================
const formInputs = document.querySelectorAll('.form-input, .form-textarea');
formInputs.forEach(input => {
    // Add floating label effect on focus
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', () => {
        if (!input.value) {
            input.parentElement.classList.remove('focused');
        }
    });

    // Check if input has value on load
    if (input.value) {
        input.parentElement.classList.add('focused');
    }
});

// ===========================
// Performance: Lazy Load Images
// ===========================
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ===========================
// Console Message (Easter Egg)
// ===========================
console.log('%c株式会社NEXUS', 'font-size: 24px; font-weight: bold; color: #0066cc;');
console.log('%cシンプルに、本質を。', 'font-size: 14px; color: #666;');
console.log('%c\n興味を持っていただきありがとうございます。\n一緒に働きたい方は採用ページをご覧ください。', 'font-size: 12px; color: #999;');

// ===========================
// Initialize on Load
// ===========================
window.addEventListener('load', () => {
    // Remove loading class if exists
    document.body.classList.remove('loading');

    // Log performance metrics (for development)
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`ページ読み込み時間: ${pageLoadTime}ms`);
    }
});
