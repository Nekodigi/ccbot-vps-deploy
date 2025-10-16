// ========================================
// モバイルメニューの開閉
// ========================================
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// メニューリンクをクリックしたらメニューを閉じる
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ========================================
// スムーススクロール（古いブラウザ対応）
// ========================================
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ========================================
// ヘッダーの背景色変更（スクロール時）
// ========================================
const header = document.querySelector('.header');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
    }

    lastScrollTop = scrollTop;
});

// ========================================
// フォーム送信処理（デモ用）
// ========================================
const contactForm = document.querySelector('.contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // 実際の送信処理はここに実装します
    // 今回はデモとして、送信完了メッセージを表示

    alert(`お問い合わせありがとうございます！\n\nお名前: ${name}\nメール: ${email}\n\n内容を確認の上、ご連絡いたします。`);

    // フォームをリセット
    contactForm.reset();
});

// ========================================
// スクロールアニメーション（要素が表示されたときにフェードイン）
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observerCallback = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

// アニメーション対象の要素を設定
const animateElements = document.querySelectorAll('.about-card, .feature-item, .contact-form');

animateElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(element);
});

// ========================================
// CTAボタンのクリックイベント
// ========================================
const ctaButton = document.querySelector('.cta-button');

ctaButton.addEventListener('click', () => {
    const aboutSection = document.getElementById('about');
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = aboutSection.offsetTop - headerHeight;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
});

// ========================================
// パフォーマンス最適化：画像の遅延読み込み
// ========================================
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // IntersectionObserverを使用したフォールバック
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ========================================
// コンソールメッセージ
// ========================================
console.log('%c🎨 Simple & Modern Website', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%cGenerated with Claude Code', 'font-size: 12px; color: #666;');
console.log('%cPure HTML/CSS/JavaScript - No frameworks required!', 'font-size: 12px; color: #3498db;');
