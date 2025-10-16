// ==============================================
// 和風Webサイト - JavaScript
// ==============================================

// ==============================================
// 桜の花びらアニメーション
// ==============================================
function createSakura() {
    const sakuraContainer = document.getElementById('sakura');
    const sakuraCount = 15; // 桜の花びらの数

    for (let i = 0; i < sakuraCount; i++) {
        const sakura = document.createElement('div');
        sakura.classList.add('sakura');

        // ランダムな位置と速度
        const startPositionX = Math.random() * 100;
        const duration = 15 + Math.random() * 15; // 15-30秒
        const delay = Math.random() * 10; // 0-10秒の遅延
        const size = 10 + Math.random() * 10; // 10-20px

        sakura.style.left = `${startPositionX}%`;
        sakura.style.width = `${size}px`;
        sakura.style.height = `${size}px`;
        sakura.style.animationDuration = `${duration}s`;
        sakura.style.animationDelay = `${delay}s`;

        sakuraContainer.appendChild(sakura);
    }
}

// ページ読み込み時に桜を生成
window.addEventListener('load', createSakura);

// ==============================================
// スムーズスクロール
// ==============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // モバイルメニューを閉じる
            const navLinks = document.querySelector('.nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        }
    });
});

// ==============================================
// ハンバーガーメニュー
// ==============================================
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');

        // ボディのスクロールを制御
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
}

// ==============================================
// ヘッダーのスクロールエフェクト
// ==============================================
let lastScroll = 0;
const header = document.querySelector('header');
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // スクロール位置に応じてヘッダーのスタイルを変更
    if (currentScroll > 100) {
        nav.style.padding = '0.8rem 5%';
        header.style.background = 'rgba(44, 44, 44, 0.98)';
    } else {
        nav.style.padding = '1.2rem 5%';
        header.style.background = 'rgba(44, 44, 44, 0.95)';
    }

    lastScroll = currentScroll;
});

// ==============================================
// スクロールアニメーション（Intersection Observer）
// ==============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // 一度表示されたら監視を停止
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// アニメーション対象の要素を監視
window.addEventListener('load', () => {
    // サービスカード
    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.classList.add('fade-in');
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // 価値観カード
    document.querySelectorAll('.value-card').forEach((card, index) => {
        card.classList.add('fade-in');
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // ギャラリーアイテム
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        item.classList.add('fade-in');
        item.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(item);
    });

    // セクションタイトル
    document.querySelectorAll('.section-title').forEach(title => {
        title.classList.add('fade-in');
        observer.observe(title);
    });
});

// ==============================================
// フォーム送信処理
// ==============================================
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // フォームデータの取得
        const formData = {
            name: this.querySelector('#name').value,
            email: this.querySelector('#email').value,
            phone: this.querySelector('#phone').value,
            subject: this.querySelector('#subject').value,
            message: this.querySelector('#message').value
        };

        // バリデーション
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            showNotification('必須項目をすべて入力してください。', 'error');
            return;
        }

        // メール形式の確認
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email)) {
            showNotification('正しいメールアドレスを入力してください。', 'error');
            return;
        }

        // 送信ボタンを無効化
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';

        // 実際の送信処理（ここではシミュレート）
        setTimeout(() => {
            showNotification('お問い合わせを受け付けました。\nご連絡ありがとうございます。', 'success');
            this.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1500);

        console.log('フォームデータ:', formData);
    });
}

// ==============================================
// 通知表示
// ==============================================
function showNotification(message, type = 'success') {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 通知要素を作成
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span class="notification-message">${message.replace(/\n/g, '<br>')}</span>
        </div>
    `;

    // スタイルを追加
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#1B5E20' : '#C41E3A'};
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 0;
        border-left: 5px solid #D4AF37;
        box-shadow: 0 8px 24px rgba(44, 44, 44, 0.2);
        z-index: 10000;
        animation: slideInRight 0.4s ease;
        max-width: 400px;
        font-family: 'Noto Serif JP', serif;
    `;

    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 1rem;
    `;

    const icon = notification.querySelector('.notification-icon');
    icon.style.cssText = `
        font-size: 1.5rem;
        font-weight: bold;
    `;

    const messageEl = notification.querySelector('.notification-message');
    messageEl.style.cssText = `
        line-height: 1.6;
        font-size: 1rem;
    `;

    document.body.appendChild(notification);

    // 3秒後に自動的に削除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 3000);
}

// アニメーションのキーフレームを追加
if (!document.querySelector('#notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==============================================
// ボタンのクリック処理
// ==============================================
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (!this.type || this.type !== 'submit') {
            e.preventDefault();

            // ボタンのテキストに応じて処理
            const btnText = this.textContent.trim();

            if (btnText === '詳しく見る') {
                // サービスセクションへスクロール
                const servicesSection = document.getElementById('services');
                if (servicesSection) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = servicesSection.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            } else if (btnText === 'お問合せ') {
                // お問合せセクションへスクロール
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = contactSection.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        }
    });
});

// ==============================================
// パララックス効果（オプション）
// ==============================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-content');

    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ==============================================
// ページトップへ戻るボタン（自動生成）
// ==============================================
window.addEventListener('load', () => {
    // トップへ戻るボタンを作成
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--gold);
        color: var(--charcoal);
        border: 2px solid var(--gold);
        border-radius: 0;
        font-size: 1.5rem;
        font-weight: bold;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.4s ease;
        z-index: 999;
        box-shadow: 0 4px 16px rgba(44, 44, 44, 0.2);
    `;

    document.body.appendChild(scrollTopBtn);

    // スクロール位置に応じて表示/非表示
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.visibility = 'visible';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
        }
    });

    // クリックで上へスクロール
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ホバーエフェクト
    scrollTopBtn.addEventListener('mouseenter', () => {
        scrollTopBtn.style.background = 'transparent';
        scrollTopBtn.style.color = 'var(--gold)';
        scrollTopBtn.style.transform = 'translateY(-3px)';
    });

    scrollTopBtn.addEventListener('mouseleave', () => {
        scrollTopBtn.style.background = 'var(--gold)';
        scrollTopBtn.style.color = 'var(--charcoal)';
        scrollTopBtn.style.transform = 'translateY(0)';
    });
});

// ==============================================
// タグのホバーエフェクト
// ==============================================
document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', function(e) {
        e.preventDefault();
        // タグクリック時のアニメーション
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1.05)';
        }, 100);
    });
});

// ==============================================
// ギャラリーのライトボックス効果（簡易版）
// ==============================================
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function() {
        const title = this.querySelector('h4').textContent;
        const description = this.querySelector('p').textContent;

        // 簡易モーダル表示
        showNotification(`${title}\n${description}`, 'success');
    });
});

// ==============================================
// レスポンシブ対応：ウィンドウリサイズ時の処理
// ==============================================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // モバイルメニューが開いている場合は閉じる
        if (window.innerWidth > 768) {
            const navLinks = document.querySelector('.nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }, 250);
});

// ==============================================
// コンソールに和風メッセージを表示
// ==============================================
console.log('%c和の心 - Wa no Kokoro', 'font-size: 24px; font-weight: bold; color: #D4AF37; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);');
console.log('%c日本の伝統美を現代に伝える', 'font-size: 14px; color: #641220;');
console.log('%cWebsite loaded successfully ✓', 'font-size: 12px; color: #1B5E20;');

// ==============================================
// デバッグ用：パフォーマンス測定
// ==============================================
if (performance && performance.timing) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`%cページ読み込み時間: ${loadTime}ms`, 'color: #8B4513;');
        }, 0);
    });
}
