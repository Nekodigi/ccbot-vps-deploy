// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

// Form Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Simple validation
        if (name && email && message) {
            // Success animation
            const submitButton = this.querySelector('.submit-button');
            const originalText = submitButton.textContent;

            submitButton.textContent = '送信中...';
            submitButton.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';

            // Simulate sending
            setTimeout(() => {
                submitButton.textContent = '送信完了！';

                // Reset form
                setTimeout(() => {
                    contactForm.reset();
                    submitButton.textContent = originalText;
                    submitButton.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-light))';
                }, 2000);
            }, 1000);

            // In a real application, you would send the data to a server here
            console.log('Form submitted:', { name, email, message });
        }
    });
}

// Scroll Animation Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards
document.querySelectorAll('.about-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// CTA Button Click Effect
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ctaButton.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);

        // Scroll to contact section
        document.querySelector('#contact').scrollIntoView({
            behavior: 'smooth'
        });
    });
}

// Add ripple effect CSS dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        width: 100px;
        height: 100px;
        margin-top: -50px;
        margin-left: -50px;
        animation: ripple-animation 0.6s;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        from {
            opacity: 1;
            transform: scale(0);
        }
        to {
            opacity: 0;
            transform: scale(2);
        }
    }
`;
document.head.appendChild(style);

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    }

    lastScroll = currentScroll;
});

// Add active nav link based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add active state CSS
const activeStyle = document.createElement('style');
activeStyle.textContent = `
    .nav-links a.active {
        color: var(--accent);
    }

    .nav-links a.active::after {
        width: 100%;
    }
`;
document.head.appendChild(activeStyle);

// Console message
console.log('%c超シンプルなWebサイト ', 'background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 10px 20px; font-size: 16px; font-weight: bold;');
console.log('%cGenerated with Claude Code', 'color: #667eea; font-size: 12px;');
