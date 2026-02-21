// ===================================================
// SIGNUP.JS - Signup/Registration Page JavaScript
// ===================================================
// User registration form handling

// ===========================================
// PAGE INITIALIZATION
// ===========================================

function initSignupPage() {
    console.log('📝 Initializing signup page...');

    // Already logged in-ஆ இருந்தா home page-க்கு redirect
    if (isLoggedIn()) {
        showModal('You are already logged in!', 'info');
        redirectTo('../index.html', 1000);
        return;
    }

    // Signup form setup
    setupSignupForm();
}

// ===========================================
// SIGNUP FORM HANDLING
// ===========================================

/**
 * setupSignupForm - Signup form events setup பண்ணும்
 */
function setupSignupForm() {
    const signupForm = document.getElementById('signup-form');

    if (!signupForm) {
        console.warn('Signup form not found');
        return;
    }

    // Form submit event
    signupForm.addEventListener('submit', handleSignupSubmit);

    console.log('✅ Signup form initialized');
}

/**
 * handleSignupSubmit - Signup form submit handle பண்ணும்
 * @param {Event} e - Submit event
 */
async function handleSignupSubmit(e) {
    e.preventDefault(); // Page reload prevent பண்ணுறோம்

    try {
        // Form data எடுக்குறோம்
        const userData = {
            username: document.getElementById('name')?.value.trim(), // Backend 'username' expect பண்றது
            email: document.getElementById('email')?.value.trim(),
            phone: document.getElementById('phone')?.value.trim(),
            password: document.getElementById('password')?.value,
            confirmPassword: document.getElementById('confirm-password')?.value,
            role: document.getElementById('role')?.value || 'buyer',
            address: '' // Address removed from UI
        };

        // Validation (auth.js-ல defined)
        if (!validateRegisterForm(userData)) {
            return;
        }

        // confirmPassword remove பண்ணுறோம் (backend-க்கு தேவையில்ல)
        delete userData.confirmPassword;

        // Registration API call (auth.js-ல defined)
        const result = await register(userData);

        if (result.success) {
            // Registration success - Login page-க்கு redirect
            showModal('Registration successful! Redirecting to login...', 'success');
            redirectTo('./login.html', 2000);
        }

    } catch (error) {
        console.error('Signup error:', error);
    }
}

// ===========================================
// ADDITIONAL FUNCTIONS
// ===========================================

/**
 * goToLogin - Login page-க்கு redirect பண்ணும்
 */
function goToLogin() {
    window.location.href = './login.html';
}

/**
 * togglePasswordVisibility - Password காட்ட/மறைக்க
 * @param {string} fieldId - Password field ID
 */
function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    if (field.type === 'password') {
        field.type = 'text';
    } else {
        field.type = 'password';
    }
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSignupPage);
} else {
    initSignupPage();
}

console.log('✅ Signup.js loaded successfully!');
