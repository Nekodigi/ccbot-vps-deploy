/**
 * Business Solutions Website
 * Main JavaScript File
 */

// DOMContentLoadedイベント
document.addEventListener('DOMContentLoaded', function() {
    // モバイルメニュートグル
    initMobileMenu();

    // スムーススクロール
    initSmoothScroll();

    // フォーム送信処理
    initContactForm();

    // スクロールアニメーション
    initScrollAnimations();
});

/**
 * モバイルメニューの初期化
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-list a');

    if (!menuToggle || !nav) return;

    // メニュートグルボタンのクリックイベント
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');

        // ハンバーガーメニューのアニメーション
        const spans = menuToggle.querySelectorAll('span');
        if (nav.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // ナビゲーションリンクをクリックしたらメニューを閉じる
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });

    // メニュー外をクリックしたら閉じる
    document.addEventListener('click', function(event) {
        if (!nav.contains(event.target) && !menuToggle.contains(event.target)) {
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    });
}

/**
 * スムーススクロールの初期化
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // ハッシュのみの場合はスキップ
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                // ヘッダーの高さを取得
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;

                // スクロール位置を計算
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                // スムーススクロール
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * お問い合わせフォームの初期化
 */
function initContactForm() {
    const form = document.getElementById('contactForm');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // フォームデータの取得
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            company: document.getElementById('company').value,
            message: document.getElementById('message').value
        };

        // バリデーション
        if (!validateForm(formData)) {
            return;
        }

        // 送信処理（実際のAPIエンドポイントに置き換えてください）
        submitForm(formData);
    });
}

/**
 * フォームのバリデーション
 */
function validateForm(data) {
    // 名前のチェック
    if (!data.name.trim()) {
        showAlert('お名前を入力してください。', 'error');
        return false;
    }

    // メールアドレスのチェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showAlert('有効なメールアドレスを入力してください。', 'error');
        return false;
    }

    // メッセージのチェック
    if (!data.message.trim()) {
        showAlert('お問い合わせ内容を入力してください。', 'error');
        return false;
    }

    return true;
}

/**
 * フォームの送信処理
 */
function submitForm(data) {
    // ローディング表示
    const submitButton = document.querySelector('#contactForm button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '送信中...';
    submitButton.disabled = true;

    // 実際のAPI送信処理をここに実装
    // この例ではダミーの処理を実行
    setTimeout(() => {
        console.log('送信データ:', data);

        // 成功メッセージ
        showAlert('お問い合わせを受け付けました。ご連絡ありがとうございます。', 'success');

        // フォームのリセット
        document.getElementById('contactForm').reset();

        // ボタンを元に戻す
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 1500);
}

/**
 * アラートメッセージの表示
 */
function showAlert(message, type = 'info') {
    // 既存のアラートを削除
    const existingAlert = document.querySelector('.alert-message');
    if (existingAlert) {
        existingAlert.remove();
    }

    // アラート要素の作成
    const alert = document.createElement('div');
    alert.className = `alert-message alert-${type}`;
    alert.textContent = message;

    // スタイルの設定
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 16px 24px;
        background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideDown 0.3s ease;
        max-width: 90%;
        text-align: center;
    `;

    // アニメーションの定義
    if (!document.querySelector('#alert-animation-style')) {
        const style = document.createElement('style');
        style.id = 'alert-animation-style';
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            @keyframes slideUp {
                from {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // DOMに追加
    document.body.appendChild(alert);

    // 3秒後に削除
    setTimeout(() => {
        alert.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            alert.remove();
        }, 300);
    }, 3000);
}

/**
 * スクロールアニメーションの初期化
 */
function initScrollAnimations() {
    // Intersection Observer APIを使用した要素の表示アニメーション
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

    // アニメーション対象の要素
    const animateElements = document.querySelectorAll('.service-card, .feature-item, .contact-wrapper > *');

    animateElements.forEach((element, index) => {
        // 初期状態を設定
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;

        // 監視開始
        observer.observe(element);
    });
}

/**
 * ヘッダーのスクロール時の動作
 */
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');

    if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
});
