// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Navigation smooth scroll
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerOffset = 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');

    const highlightNavigation = () => {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink?.classList.add('active');
            } else {
                navLink?.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', highlightNavigation);

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Elements to animate
    const animatedElements = document.querySelectorAll(
        '.feature-card, .advanced-card, .tip-card, .scenario-item, .price-item'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // PWA Install Prompt
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Create install button if not exists
        if (!document.querySelector('.install-button')) {
            const installButton = document.createElement('button');
            installButton.className = 'install-button';
            installButton.textContent = 'アプリをインストール';
            installButton.style.cssText = `
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                padding: 1rem 2rem;
                background-color: #e94560;
                color: white;
                border: none;
                border-radius: 50px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
                z-index: 1000;
                transition: all 0.3s ease;
            `;

            installButton.addEventListener('mouseenter', () => {
                installButton.style.transform = 'translateY(-2px)';
                installButton.style.boxShadow = '0 6px 20px rgba(233, 69, 96, 0.5)';
            });

            installButton.addEventListener('mouseleave', () => {
                installButton.style.transform = 'translateY(0)';
                installButton.style.boxShadow = '0 4px 15px rgba(233, 69, 96, 0.4)';
            });

            installButton.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;

                    if (outcome === 'accepted') {
                        console.log('PWA installed');
                    }

                    deferredPrompt = null;
                    installButton.remove();
                }
            });

            document.body.appendChild(installButton);
        }
    });

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }

    // Scroll to top button
    const scrollToTopButton = document.createElement('button');
    scrollToTopButton.innerHTML = '↑';
    scrollToTopButton.className = 'scroll-to-top';
    scrollToTopButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 2rem;
        width: 50px;
        height: 50px;
        background-color: #0f3460;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    `;

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    document.body.appendChild(scrollToTopButton);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopButton.style.opacity = '1';
            scrollToTopButton.style.visibility = 'visible';
        } else {
            scrollToTopButton.style.opacity = '0';
            scrollToTopButton.style.visibility = 'hidden';
        }
    });

    // Header shadow on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 0) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.boxShadow = 'none';
        }
    });

    // Copy code functionality (if needed later)
    const addCopyButton = (codeBlock) => {
        const button = document.createElement('button');
        button.textContent = 'Copy';
        button.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.25rem 0.75rem;
            background-color: #0f3460;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        codeBlock.style.position = 'relative';
        codeBlock.appendChild(button);

        codeBlock.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
        });

        codeBlock.addEventListener('mouseleave', () => {
            button.style.opacity = '0';
        });

        button.addEventListener('click', () => {
            const code = codeBlock.querySelector('code')?.textContent || codeBlock.textContent;
            navigator.clipboard.writeText(code).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
        });
    };

    // Apply to all pre/code blocks if any
    document.querySelectorAll('pre').forEach(addCopyButton);

    // Performance logging
    if (window.performance) {
        window.addEventListener('load', () => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page load time: ${pageLoadTime}ms`);
        });
    }

    // Mobile menu toggle (for future enhancement)
    const createMobileMenu = () => {
        const nav = document.querySelector('.nav');
        const menuButton = document.createElement('button');
        menuButton.className = 'mobile-menu-button';
        menuButton.innerHTML = '☰';
        menuButton.style.cssText = `
            display: none;
            font-size: 1.5rem;
            background: none;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
        `;

        if (window.innerWidth <= 968) {
            menuButton.style.display = 'block';
            document.querySelector('.header-content').appendChild(menuButton);

            menuButton.addEventListener('click', () => {
                nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.right = '0';
                nav.style.backgroundColor = 'var(--primary-color)';
                nav.style.padding = '1rem';
                nav.style.borderTop = '1px solid var(--border-color)';
            });
        }
    };

    window.addEventListener('resize', createMobileMenu);
    createMobileMenu();
});
