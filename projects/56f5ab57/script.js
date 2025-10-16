// モバイルメニューの制御
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// メニューリンクをクリックしたときにメニューを閉じる
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// スムーズスクロール（セクションIDへのリンク）
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = 80;
            const targetPosition = targetElement.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// スクロール時のヘッダー背景変更
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});

// フォーム送信処理
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // フォームデータの取得
    const formData = new FormData(contactForm);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // 送信中の表示
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '送信中...';
    submitButton.disabled = true;

    // 実際のAPI送信処理はここに実装
    // 現在はデモ用のシミュレーション
    setTimeout(() => {
        // 成功時の処理
        alert('お問い合わせありがとうございます。\n担当者より3営業日以内にご連絡いたします。');

        // フォームのリセット
        contactForm.reset();

        // ボタンを元に戻す
        submitButton.textContent = originalText;
        submitButton.disabled = false;

        // コンソールにデータを出力（開発用）
        console.log('送信データ:', data);
    }, 1500);
});

// 入力フィールドのバリデーション
const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea');

inputs.forEach(input => {
    input.addEventListener('blur', () => {
        if (input.required && !input.value.trim()) {
            input.style.borderColor = '#ef4444';
        } else {
            input.style.borderColor = '';
        }
    });

    input.addEventListener('input', () => {
        if (input.style.borderColor === 'rgb(239, 68, 68)') {
            if (input.value.trim()) {
                input.style.borderColor = '';
            }
        }
    });
});

// メールアドレスのバリデーション
const emailInput = document.getElementById('email');
emailInput.addEventListener('blur', () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value && !emailPattern.test(emailInput.value)) {
        emailInput.style.borderColor = '#ef4444';
    }
});

// 電話番号の自動フォーマット（オプション）
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^\d-]/g, '');
    e.target.value = value;
});

// スクロールアニメーション（要素が表示されたときにフェードイン）
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

// アニメーション対象要素
const animatedElements = document.querySelectorAll('.service-card, .feature-item, .case-card, .stat-item');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// 数値カウントアニメーション
const statNumbers = document.querySelectorAll('.stat-number');

const animateNumber = (element, target) => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + (target.toString().includes('+') ? '+' : target.toString().includes('%') ? '%' : '');
        }
    }, duration / steps);
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target.textContent;
            const numericValue = parseInt(target.replace(/[^\d]/g, ''));
            const suffix = target.replace(/[\d]/g, '');

            let current = 0;
            const duration = 2000;
            const steps = 60;
            const increment = numericValue / steps;

            const timer = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                    entry.target.textContent = numericValue + suffix;
                    clearInterval(timer);
                } else {
                    entry.target.textContent = Math.floor(current) + suffix;
                }
            }, duration / steps);

            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => {
    statsObserver.observe(stat);
});

// ページ読み込み完了時の処理
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// ページ離脱前の警告（フォーム入力中の場合）
let formChanged = false;

contactForm.addEventListener('input', () => {
    formChanged = true;
});

contactForm.addEventListener('submit', () => {
    formChanged = false;
});

window.addEventListener('beforeunload', (e) => {
    if (formChanged) {
        e.preventDefault();
        e.returnValue = '';
    }
});