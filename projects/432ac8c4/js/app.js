// Main Application Module
import { initAuthStateObserver } from './auth.js';

// Initialize the app
function initApp() {
    console.log('TaskFlow App Started');

    // Initialize authentication state observer
    initAuthStateObserver();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
