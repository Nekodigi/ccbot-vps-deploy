// share.js - Information Sharing Module

let currentUser;

// Wait for user authentication
function waitForAuth() {
    return new Promise((resolve) => {
        window.addEventListener('user-authenticated', (e) => {
            currentUser = e.detail.user;
            resolve();
        });
    });
}

// Initialize share module
async function initShare() {
    await waitForAuth();

    // UI Elements
    const shareModal = document.getElementById('share-modal');
    const modalClose = shareModal.querySelector('.modal-close');
    const shareLinkInput = document.getElementById('share-link');
    const copyLinkBtn = document.getElementById('copy-link-btn');

    // Listen for share-info event
    window.addEventListener('share-info', (e) => {
        const item = e.detail.item;
        showShareModal(item);
    });

    // Show share modal
    function showShareModal(item) {
        // Generate share link
        const baseUrl = window.location.origin + window.location.pathname;
        const shareParams = new URLSearchParams({
            shared: 'true',
            id: item.id,
            title: item.title,
            content: item.content,
            author: item.userEmail
        });

        const shareUrl = `${baseUrl}?${shareParams.toString()}`;
        shareLinkInput.value = shareUrl;

        shareModal.style.display = 'flex';
    }

    // Close modal
    modalClose.addEventListener('click', () => {
        shareModal.style.display = 'none';
    });

    // Close modal when clicking outside
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.style.display = 'none';
        }
    });

    // Copy link to clipboard
    copyLinkBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(shareLinkInput.value);

            const originalText = copyLinkBtn.textContent;
            copyLinkBtn.textContent = 'コピーしました!';
            copyLinkBtn.style.backgroundColor = '#28a745';

            setTimeout(() => {
                copyLinkBtn.textContent = originalText;
                copyLinkBtn.style.backgroundColor = '';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);

            // Fallback: select the text
            shareLinkInput.select();
            shareLinkInput.setSelectionRange(0, 99999);

            try {
                document.execCommand('copy');
                copyLinkBtn.textContent = 'コピーしました!';
                setTimeout(() => {
                    copyLinkBtn.textContent = 'コピー';
                }, 2000);
            } catch (err) {
                alert('コピーに失敗しました。手動でコピーしてください。');
            }
        }
    });

    // Check if page was loaded with shared content
    checkSharedContent();
}

// Check if URL contains shared content parameters
function checkSharedContent() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('shared') === 'true') {
        const title = urlParams.get('title');
        const content = urlParams.get('content');
        const author = urlParams.get('author');

        if (title && content) {
            // Display shared content in a modal or notification
            showSharedContentModal(title, content, author);
        }
    }
}

// Show shared content modal
function showSharedContentModal(title, content, author) {
    // Create a custom modal for viewing shared content
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal';
    modalOverlay.style.display = 'flex';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    });

    const heading = document.createElement('h2');
    heading.textContent = '共有された情報';

    const titleLabel = document.createElement('h3');
    titleLabel.textContent = title;
    titleLabel.style.marginTop = '20px';
    titleLabel.style.color = 'var(--black)';

    const contentPara = document.createElement('p');
    contentPara.textContent = content;
    contentPara.style.marginTop = '10px';
    contentPara.style.whiteSpace = 'pre-wrap';
    contentPara.style.lineHeight = '1.6';

    const authorPara = document.createElement('p');
    authorPara.textContent = `共有者: ${author || '不明'}`;
    authorPara.style.marginTop = '15px';
    authorPara.style.fontSize = '0.9rem';
    authorPara.style.color = 'var(--medium-gray)';
    authorPara.style.fontStyle = 'italic';

    const closeButton = document.createElement('button');
    closeButton.className = 'btn-primary';
    closeButton.textContent = '閉じる';
    closeButton.style.marginTop = '20px';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    });

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(heading);
    modalContent.appendChild(titleLabel);
    modalContent.appendChild(contentPara);
    if (author) {
        modalContent.appendChild(authorPara);
    }
    modalContent.appendChild(closeButton);

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Close when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    });
}

// Initialize when user is authenticated
window.addEventListener('user-authenticated', initShare);

// Also check for shared content on page load (before auth)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check immediately if there's shared content in URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('shared') === 'true') {
            const title = urlParams.get('title');
            const content = urlParams.get('content');
            const author = urlParams.get('author');
            if (title && content) {
                // Wait a bit for auth container to be visible
                setTimeout(() => {
                    showSharedContentModal(title, content, author);
                }, 100);
            }
        }
    });
} else {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('shared') === 'true') {
        const title = urlParams.get('title');
        const content = urlParams.get('content');
        const author = urlParams.get('author');
        if (title && content) {
            setTimeout(() => {
                showSharedContentModal(title, content, author);
            }, 100);
        }
    }
}
