/**
 * NEXUS - Main JavaScript
 * シンプルで洗練されたビジネスサイト用インタラクティブ機能
 */

(function() {
    'use strict';

    // ================================================
    // Theme Management (Dark Mode)
    // ================================================

    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // テーマの初期化
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            html.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            html.setAttribute('data-theme', 'dark');
        }
    }

    // テーマ切り替え
    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // ================================================
    // Mobile Navigation
    // ================================================

    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    function toggleMobileMenu() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    }

    function closeMobileMenu() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }

    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }

    // メニューリンクをクリックしたら閉じる
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // ================================================
    // Smooth Scroll
    // ================================================

    function smoothScroll(target) {
        const element = document.querySelector(target);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // すべてのアンカーリンクにスムーススクロールを適用
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                smoothScroll(href);
            }
        });
    });

    // ================================================
    // Header Scroll Behavior
    // ================================================

    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    function handleHeaderScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            header.style.boxShadow = '0 2px 10px var(--color-shadow)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScrollTop = scrollTop;
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });

    // ================================================
    // Back to Top Button
    // ================================================

    const backToTopButton = document.getElementById('backToTop');

    function toggleBackToTopButton() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    if (backToTopButton) {
        window.addEventListener('scroll', toggleBackToTopButton, { passive: true });
        backToTopButton.addEventListener('click', scrollToTop);
    }

    // ================================================
    // Stats Counter Animation
    // ================================================

    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // Intersection Observerで統計が表示されたらアニメーション開始
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                entry.target.classList.add('counted');
            }
        });
    }, {
        threshold: 0.5
    });

    document.querySelectorAll('.stat__number').forEach(stat => {
        statsObserver.observe(stat);
    });

    // ================================================
    // Scroll Reveal Animation
    // ================================================

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // アニメーションを適用する要素
    const animateElements = document.querySelectorAll(
        '.service-card, .feature, .contact__form, .contact__info, .footer__content'
    );

    animateElements.forEach(element => {
        element.style.opacity = '0';
        revealObserver.observe(element);
    });

    // ================================================
    // Contact Form Handling
    // ================================================

    const contactForm = document.getElementById('contactForm');

    function handleFormSubmit(e) {
        e.preventDefault();

        // フォームデータの取得
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            company: formData.get('company'),
            message: formData.get('message')
        };

        // デモ用: コンソールにデータを表示
        console.log('フォーム送信データ:', data);

        // 成功メッセージを表示
        showNotification('お問い合わせを受け付けました。担当者より3営業日以内にご連絡いたします。', 'success');

        // フォームをリセット
        contactForm.reset();
    }

    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // ================================================
    // Notification System
    // ================================================

    function showNotification(message, type = 'info') {
        // 既存の通知があれば削除
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 通知要素の作成
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <p>${message}</p>
                <button class="notification__close" aria-label="閉じる">&times;</button>
            </div>
        `;

        // スタイルの適用
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            maxWidth: '400px',
            padding: '1rem 1.5rem',
            backgroundColor: type === 'success' ? '#4CAF50' : '#2E5CFF',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '10000',
            animation: 'slideIn 0.3s ease',
            fontFamily: 'var(--font-primary)'
        });

        document.body.appendChild(notification);

        // 閉じるボタンのイベント
        const closeButton = notification.querySelector('.notification__close');
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            margin-left: 1rem;
            line-height: 1;
        `;

        function removeNotification() {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }

        closeButton.addEventListener('click', removeNotification);

        // 5秒後に自動で削除
        setTimeout(removeNotification, 5000);
    }

    // アニメーションのスタイルを追加
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        .notification__content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .notification__content p {
            margin: 0;
            line-height: 1.6;
        }
    `;
    document.head.appendChild(style);

    // ================================================
    // Active Navigation Link
    // ================================================

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.pageYOffset + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });

    // ================================================
    // Performance Optimization
    // ================================================

    // 画像の遅延読み込み (ブラウザネイティブをサポート)
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    } else {
        // フォールバック: Intersection Observer
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ================================================
    // Accessibility Enhancements
    // ================================================

    // フォーカス可視化
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    // キーボードナビゲーション用のスタイル
    const a11yStyle = document.createElement('style');
    a11yStyle.textContent = `
        .keyboard-navigation *:focus {
            outline: 2px solid var(--color-accent);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(a11yStyle);

    // ================================================
    // Initialize
    // ================================================

    function init() {
        initTheme();
        updateActiveNavLink();

        // ページ読み込み完了時の処理
        console.log('NEXUS - Website Initialized');
    }

    // DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ================================================
    // Prevent Animation on Page Load
    // ================================================

    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

})();
