// ===================================================
// LOGIN.JS - Login Page JavaScript
// ===================================================
// Login form handling

// ===========================================
// PAGE INITIALIZATION
// ===========================================

function initLoginPage() {
    console.log('🔐 Initializing login page...');

    // Already logged in-ஆ இருந்தா home page-க்கு redirect
    if (isLoggedIn()) {
        showModal('You are already logged in!', 'info');
        redirectTo('../index.html', 1000);
        return;
    }

    // Login form setup
    setupLoginForm();
}

// ===========================================
// LOGIN FORM HANDLING
// ===========================================

/**
 * setupLoginForm - Login form events setup பண்ணும்
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');

    if (!loginForm) {
        console.warn('Login form not found');
        return;
    }

    // Form submit event
    loginForm.addEventListener('submit', handleLoginSubmit);

    console.log('✅ Login form initialized');
}

/**
 * handleLoginSubmit - Login form submit handle பண்ணும்
 * @param {Event} e - Submit event
 */
async function handleLoginSubmit(e) {
    e.preventDefault(); // Page reload ஆகாம prevent பண்ணுறோம்

    try {
        // Form data எடுக்குறோம்
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value;

        // Validation
        if (!validateLoginForm(email, password)) {
            return;
        }

        // Login API call (auth.js-ல defined)
        const result = await login(email, password);

        if (result.success) {
            // Login success - Role-க்கு ஏற்ற page-க்கு redirect
            if (result.userRole === 'seller') {
                redirectTo('../pages/seller_dashboard.html', 1500);
            } else {
                redirectTo('../index.html', 1500);
            }
        }

    } catch (error) {
        console.error('Login error:', error);
    }
}

// ===========================================
// ADDITIONAL FUNCTIONS
// ===========================================

/**
 * goToSignup - Signup page-க்கு redirect பண்ணும்
 */
function goToSignup() {
    window.location.href = './sign up.html';
}

/**
 * forgotPassword - Forgot password handle பண்ணும் (Future implementation)
 */
function forgotPassword() {
    showModal('Password reset functionality coming soon!', 'info');
    // TODO: Implement forgot password flow
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoginPage);
} else {
    initLoginPage();
}

console.log('✅ Login.js loaded successfully!');
