// pwa-init.js - PWA Initialization and Service Worker Registration

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then((registration) => {
                console.log('[PWA] Service Worker registered successfully:', registration.scope);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            if (confirm('新しいバージョンが利用可能です。更新しますか?')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('[PWA] Service Worker registration failed:', error);
            });

        // Listen for controller change (new service worker activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] New service worker activated');
        });
    });
}

// Handle install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] Install prompt available');

    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Stash the event so it can be triggered later
    deferredPrompt = e;

    // Show install button or notification (optional)
    showInstallPromotion();
});

// Show install promotion
function showInstallPromotion() {
    // Create install banner
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--primary-red, #dc3545);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 90%;
        animation: slideUp 0.3s ease;
    `;

    const message = document.createElement('span');
    message.textContent = 'このアプリをホーム画面に追加';
    message.style.fontSize = '0.95rem';

    const installBtn = document.createElement('button');
    installBtn.textContent = 'インストール';
    installBtn.style.cssText = `
        background-color: white;
        color: var(--primary-red, #dc3545);
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.9rem;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        background-color: transparent;
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0 5px;
        line-height: 1;
    `;

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('[PWA] User response to install prompt:', outcome);

            deferredPrompt = null;
            document.body.removeChild(installBanner);
        }
    });

    closeBtn.addEventListener('click', () => {
        document.body.removeChild(installBanner);
    });

    installBanner.appendChild(message);
    installBanner.appendChild(installBtn);
    installBanner.appendChild(closeBtn);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                transform: translateX(-50%) translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(installBanner);

    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (document.body.contains(installBanner)) {
            installBanner.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(installBanner)) {
                    document.body.removeChild(installBanner);
                }
            }, 300);
        }
    }, 10000);
}

// Track installation
window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;

    // Hide install banner if it exists
    const installBanner = document.getElementById('install-banner');
    if (installBanner) {
        document.body.removeChild(installBanner);
    }

    // Show success message
    showInstallSuccess();
});

// Show install success message
function showInstallSuccess() {
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-size: 0.95rem;
    `;
    successMessage.textContent = 'アプリのインストールが完了しました!';

    document.body.appendChild(successMessage);

    setTimeout(() => {
        if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage);
        }
    }, 3000);
}

// Check if running as PWA
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}

// Log PWA status
if (isPWA()) {
    console.log('[PWA] Running as installed PWA');
} else {
    console.log('[PWA] Running in browser');
}

// Handle online/offline events
window.addEventListener('online', () => {
    console.log('[PWA] Back online');
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
        offlineIndicator.style.display = 'none';
    }
});

window.addEventListener('offline', () => {
    console.log('[PWA] Offline mode');
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
        offlineIndicator.style.display = 'block';
    }
});
