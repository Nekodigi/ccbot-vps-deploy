// DOMの読み込みが完了したら実行
document.addEventListener('DOMContentLoaded', function() {

    // ハンバーガーメニューの処理
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navbar = document.getElementById('navbar');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        // モバイルメニューのリンクをクリックしたらメニューを閉じる
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    // スクロール時のナビゲーション処理
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        // スクロール時にナビゲーションにシャドウを追加
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // メニューのタブ切り替え機能
    const menuTabs = document.querySelectorAll('.menu-tab');
    const menuItems = document.querySelectorAll('.menu-item');

    if (menuTabs.length > 0 && menuItems.length > 0) {
        menuTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const category = this.getAttribute('data-category');

                // アクティブなタブを更新
                menuTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // メニューアイテムをフィルタリング
                menuItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');

                    if (category === 'all' || itemCategory === category) {
                        item.style.display = 'block';
                        // フェードインアニメーション
                        item.style.opacity = '0';
                        setTimeout(() => {
                            item.style.transition = 'opacity 0.5s ease-in-out';
                            item.style.opacity = '1';
                        }, 10);
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // スムーススクロールの実装
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // # だけの場合は処理しない
            if (href === '#' || href === '#home') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();
                const offsetTop = targetElement.offsetTop - 80; // ナビゲーションの高さを考慮

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // カードのホバーエフェクト（3D効果）
    const cards = document.querySelectorAll('.featured-card, .menu-item, .location-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // インターセクションオブザーバーでスクロールアニメーション
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // アニメーション対象の要素を観察
    const animateElements = document.querySelectorAll('.featured-card, .menu-item, .location-card, .story-content, .rewards-card');

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // ヒーローセクションのボタンアクション
    const heroButtons = document.querySelectorAll('.btn-hero-primary, .btn-hero-secondary');

    heroButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('btn-hero-primary')) {
                // メニューセクションにスクロール
                const menuSection = document.getElementById('menu');
                if (menuSection) {
                    const offsetTop = menuSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            } else if (this.classList.contains('btn-hero-secondary')) {
                // 店舗情報セクションにスクロール
                const locationsSection = document.getElementById('locations');
                if (locationsSection) {
                    const offsetTop = locationsSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ローディング完了後のフェードイン
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in';

    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
    });

    // リワードカードのホバーエフェクト
    const rewardsCard = document.querySelector('.rewards-card');

    if (rewardsCard) {
        rewardsCard.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        rewardsCard.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    }

    // パララックス効果（ヒーローセクション）
    const hero = document.querySelector('.hero');

    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            hero.style.transform = `translateY(${parallax}px)`;
        });
    }

    // ナビゲーションアクション（サインイン・店舗を探すボタン）のモーダル代替
    const navButtons = document.querySelectorAll('.nav-actions button');

    navButtons.forEach(button => {
        if (button.textContent.includes('サインイン')) {
            button.addEventListener('click', function() {
                alert('サインイン機能は準備中です。');
            });
        } else if (button.textContent.includes('店舗を探す')) {
            button.addEventListener('click', function() {
                const locationsSection = document.getElementById('locations');
                if (locationsSection) {
                    const offsetTop = locationsSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

    // モバイルメニューのボタンアクション
    const mobileMenuButtons = document.querySelectorAll('.mobile-menu-actions button');

    mobileMenuButtons.forEach(button => {
        if (button.textContent.includes('サインイン')) {
            button.addEventListener('click', function() {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                alert('サインイン機能は準備中です。');
            });
        } else if (button.textContent.includes('店舗を探す')) {
            button.addEventListener('click', function() {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                const locationsSection = document.getElementById('locations');
                if (locationsSection) {
                    const offsetTop = locationsSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

    // パフォーマンス最適化：画像の遅延読み込み（将来の拡張用）
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // スクロール時の要素の表示状態を追跡
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', function() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});