/**
 * Authentication Helper Functions
 * Handles user authentication, token management, and session
 */

/**
 * Save authentication token to localStorage
 */
function saveToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

/**
 * Get authentication token from localStorage
 */
function getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/**
 * Remove authentication token from localStorage
 */
function removeToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

/**
 * Save user data to localStorage
 */
function saveUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * Get user data from localStorage
 */
function getUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Remove user data from localStorage
 */
function removeUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return getToken() !== null;
}

/**
 * Check if user is a seller
 */
function isSeller() {
    const user = getUser();
    return user && user.role === 'seller';
}

/**
 * Check if user is a buyer
 */
function isBuyer() {
    const user = getUser();
    return user && (user.role === 'buyer' || user.role === 'customer');
}

/**
 * Logout user
 */
function logout() {
    removeToken();
    removeUser();
    const isInPages = window.location.pathname.includes('/pages/');
    window.location.href = isInPages ? '../index.html' : 'index.html';
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
    if (!isAuthenticated()) {
        const isInPages = window.location.pathname.includes('/pages/');
        const loginPath = isInPages ? 'login.html' : './pages/login.html';
        window.location.href = loginPath;
        return false;
    }
    return true;
}

/**
 * Redirect to login if not a seller
 */
function requireSeller() {
    if (!isAuthenticated()) {
        const isInPages = window.location.pathname.includes('/pages/');
        window.location.href = isInPages ? 'login.html' : './pages/login.html';
        return false;
    }
    if (!isSeller()) {
        alert('Access denied. Sellers only.');
        const isInPages = window.location.pathname.includes('/pages/');
        window.location.href = isInPages ? '../index.html' : 'index.html';
        return false;
    }
    return true;
}

/**
 * Redirect to login if not a buyer
 */
function requireBuyer() {
    if (!isAuthenticated()) {
        const isInPages = window.location.pathname.includes('/pages/');
        window.location.href = isInPages ? 'login.html' : './pages/login.html';
        return false;
    }
    if (!isBuyer()) {
        alert('Access denied. Buyers only.');
        const isInPages = window.location.pathname.includes('/pages/');
        window.location.href = isInPages ? '../index.html' : 'index.html';
        return false;
    }
    return true;
}

/**
 * Update UI based on authentication status
 */
function updateAuthUI() {
    const user = getUser();
    const userLinks = document.querySelector('.user-links');

    if (user && userLinks) {
        // Update login link to show username
        const loginLink = userLinks.querySelector('a[href*="login"]');
        if (loginLink) {
            const isInPages = window.location.pathname.includes('/pages/');
            loginLink.innerHTML = `👤 ${user.username}`;
            loginLink.href = isInPages ? 'user_details.html' : './pages/user_details.html';
        }

        // Add logout button if not exists
        if (!document.getElementById('logout-btn')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'logout-btn';
            logoutBtn.href = '#';
            logoutBtn.innerHTML = '🚪 Logout';
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                logout();
            };
            userLinks.appendChild(logoutBtn);
        }

        // Add seller dashboard link for sellers
        if (isSeller() && !document.getElementById('seller-dashboard-link')) {
            const isInPages = window.location.pathname.includes('/pages/');
            const dashboardLink = document.createElement('a');
            dashboardLink.id = 'seller-dashboard-link';
            dashboardLink.href = isInPages ? 'seller_dashboard.html' : './pages/seller_dashboard.html';
            dashboardLink.innerHTML = '📊 Dashboard';
            userLinks.insertBefore(dashboardLink, userLinks.firstChild);
        }
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthUI);
} else {
    updateAuthUI();
}
