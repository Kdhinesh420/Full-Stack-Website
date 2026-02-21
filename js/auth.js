// ===================================================
// AUTH.JS - Authentication Functions
// ===================================================
// Login, Signup, Logout எல்லாம் இங்க handle பண்ணுறோம்
// Token management and user session handling

/* 
    இந்த file-ல:
    1. Login function
    2. Signup/Register function
    3. Logout function
    4. Check if user logged in
    5. Get current user info
*/

// ===========================================
// AUTHENTICATION FUNCTIONS
// ===========================================

/**
 * login - User login பண்ணும் function
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Login response
 */
async function login(email, password) {
    try {
        showLoading('Logging in...');

        // Login API call
        // Note: FastAPI OAuth2 password flow uses form data, not JSON
        const formData = new FormData();
        formData.append('username', email); // FastAPI uses 'username' field
        formData.append('password', password);

        const response = await fetch(API_ENDPOINTS.auth.login, {
            method: 'POST',
            body: formData
        });

        hideLoading();

        const data = await response.json();

        if (response.ok) {
            // Success - Token save பண்ணுறோம்
            const token = data.access_token;
            const userRole = data.user?.role || 'buyer';

            // Local storage-ல save பண்ணுறோம்
            saveToLocalStorage('authToken', token);
            saveToLocalStorage('userRole', userRole);
            saveToLocalStorage('userEmail', email);

            // Login success message
            showModal('Login successful! Welcome back! 👋', 'success');

            console.log('✅ Login successful');
            return { success: true, token, userRole };

        } else {
            // Error handling
            const errorMsg = data.detail || 'Invalid email or password';
            showModal(errorMsg, 'error');
            throw new Error(errorMsg);
        }

    } catch (error) {
        hideLoading();
        console.error('❌ Login failed:', error);
        if (error.message === 'Failed to fetch') {
            showModal('Unable to connect to server', 'error');
        }
        throw error;
    }
}

/**
 * register - புதுசா user register பண்ணும் function
 * @param {object} userData - User registration data
 * @returns {Promise} - Registration response
 */
async function register(userData) {
    try {
        showLoading('Creating your account...');

        // Registration API call
        const response = await fetch(API_ENDPOINTS.auth.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        hideLoading();

        const data = await response.json();

        if (response.ok) {
            // Success
            showModal('Account created successfully! Please login. 🎉', 'success');
            console.log('✅ Registration successful');
            return { success: true, data };

        } else {
            // Error handling
            const errorMsg = data.detail || 'Registration failed';

            // Specific error messages
            if (errorMsg.includes('email') || errorMsg.includes('already exists')) {
                showModal('This email is already registered. Please login instead.', 'error');
            } else if (errorMsg.includes('phone')) {
                showModal('This phone number is already registered.', 'error');
            } else {
                showModal(errorMsg, 'error');
            }

            throw new Error(errorMsg);
        }

    } catch (error) {
        hideLoading();
        console.error('❌ Registration failed:', error);
        if (error.message === 'Failed to fetch') {
            showModal('Unable to connect to server', 'error');
        }
        throw error;
    }
}

/**
 * logout - User logout பண்ணும் function
 */
function logout() {
    // Confirmation modal காட்டுறோம்
    showConfirmModal(
        'Are you sure you want to logout?',
        () => {
            // Yes - Logout proceed பண்ணுறோம்

            // Local storage clear பண்ணுறோம்
            removeFromLocalStorage('authToken');
            removeFromLocalStorage('userRole');
            removeFromLocalStorage('userEmail');

            // User info இருந்தாலும் clear பண்ணுறோம்
            removeFromLocalStorage('currentUser');

            // Success message
            showModal('Logged out successfully! See you soon! 👋', 'info');

            // Login page-க்கு redirect பண்ணுறோம்
            setTimeout(() => {
                window.location.href = '../pages/login.html';
            }, 1500);

            console.log('✅ Logout successful');
        },
        () => {
            // Cancel - Nothing happens
            console.log('Logout cancelled');
        }
    );
}

/**
 * isLoggedIn - User logged in-ஆ இருக்காரா check பண்ணும்
 * @returns {boolean} - True if logged in
 */
function isLoggedIn() {
    const token = getFromLocalStorage('authToken');
    return token !== null && token !== '';
}

/**
 * requireAuth - Page-ஐ access பண்ண login required-னா check பண்ணும்
 * Login இல்லாட்டி login page-க்கு redirect பண்ணும்
 */
function requireAuth() {
    if (!isLoggedIn()) {
        showModal('Please login to continue', 'warning');
        setTimeout(() => {
            window.location.href = '../pages/login.html';
        }, 1500);
        return false;
    }
    return true;
}

/**
 * requireRole - Specific role வேண்டும்-னா check பண்ணும்
 * @param {string} requiredRole - Required role ('buyer', 'seller', 'admin')
 * @returns {boolean} - True if user has required role
 */
function requireRole(requiredRole) {
    if (!isLoggedIn()) {
        showModal('Please login to continue', 'warning');
        setTimeout(() => {
            window.location.href = '../pages/login.html';
        }, 1500);
        return false;
    }

    const userRole = getFromLocalStorage('userRole');
    if (userRole !== requiredRole) {
        showModal(`Access denied. This page is for ${requiredRole}s only.`, 'error');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        return false;
    }

    return true;
}

/**
 * getCurrentUser - Current user details get பண்ணும்
 * @returns {Promise} - User details
 */
async function getCurrentUser() {
    try {
        // Cache-ல check பண்ணுறோம்
        const cachedUser = getFromLocalStorage('currentUser');
        if (cachedUser) {
            return cachedUser;
        }

        // API-ல இருந்து fetch பண்ணுறோம்
        if (!isLoggedIn()) {
            return null;
        }

        const user = await getUserProfile();

        // Cache-ல save பண்ணுறோம்
        saveToLocalStorage('currentUser', user);

        return user;

    } catch (error) {
        console.error('Failed to get current user:', error);

        // Token invalid-ஆ இருந்தா logout பண்ணுறோம்
        if (error.status === 401) {
            removeFromLocalStorage('authToken');
            removeFromLocalStorage('currentUser');
            showModal('Session expired. Please login again.', 'warning');
            setTimeout(() => {
                window.location.href = '../pages/login.html';
            }, 2000);
        }

        return null;
    }
}

/**
 * updateUserDisplay - Header-ல user info காட்டும் function
 * Login/Logout buttons toggle பண்ணும்
 */
async function updateUserDisplay() {
    try {
        const userLinksContainer = document.querySelector('.user-links');

        if (!userLinksContainer) return;

        if (isLoggedIn()) {
            // User logged in - Profile link காட்டுறோம்
            const userEmail = getFromLocalStorage('userEmail');
            const userRole = getFromLocalStorage('userRole');

            // User icon with email
            const userName = userEmail ? userEmail.split('@')[0] : 'User';

            userLinksContainer.innerHTML = `
                <a href="../pages/user_details.html">👤 ${userName}</a>
                ${userRole === 'seller' ? '<a href="../pages/seller_dashboard.html">📊 Dashboard</a>' : ''}
                <a href="../pages/cart.html">🛒 Cart</a>
                <a href="#" onclick="logout(); return false;">🚪 Logout</a>
            `;
        } else {
            // User not logged in - Login button காட்டுறோம்
            userLinksContainer.innerHTML = `
                <a href="../pages/login.html">👤 Login</a>
                <a href="../pages/cart.html">🛒 Cart</a>
            `;
        }

    } catch (error) {
        console.error('Failed to update user display:', error);
    }
}

/**
 * initAuth - Authentication initialize பண்ணும் (Page load ஆகும்போது)
 * Automatically call ஆகும் every page-ல
 */
function initAuth() {
    // Token இருக்கா check பண்ணுறோம்
    if (isLoggedIn()) {
        console.log('✅ User is logged in');
        // User display update பண்ணுறோம்
        updateUserDisplay();
    } else {
        console.log('ℹ️ User is not logged in');
    }
}

/**
 * validateLoginForm - Login form validate பண்ணும்
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean} - True if valid
 */
function validateLoginForm(email, password) {
    // Email validation
    if (!email) {
        showModal('Please enter your email', 'warning');
        return false;
    }

    if (!validateEmail(email)) {
        showModal('Please enter a valid email address', 'warning');
        return false;
    }

    // Password validation
    if (!password) {
        showModal('Please enter your password', 'warning');
        return false;
    }

    if (password.length < 6) {
        showModal('Password must be at least 6 characters', 'warning');
        return false;
    }

    return true;
}

/**
 * validateRegisterForm - Registration form validate பண்ணும்
 * @param {object} userData - User data
 * @returns {boolean} - True if valid
 */
function validateRegisterForm(userData) {
    // Username validation
    if (!userData.username || userData.username.trim().length < 2) {
        showModal('Please enter your username (minimum 2 characters)', 'warning');
        return false;
    }

    // Email validation
    if (!userData.email) {
        showModal('Please enter your email', 'warning');
        return false;
    }

    if (!validateEmail(userData.email)) {
        showModal('Please enter a valid email address', 'warning');
        return false;
    }

    // Phone validation
    if (userData.phone && !validatePhone(userData.phone)) {
        showModal('Please enter a valid 10-digit phone number', 'warning');
        return false;
    }

    // Password validation
    if (!userData.password) {
        showModal('Please enter a password', 'warning');
        return false;
    }

    if (userData.password.length < 6) {
        showModal('Password must be at least 6 characters', 'warning');
        return false;
    }

    // Password strength check (optional but recommended)
    if (userData.password.length < 8) {
        showModal('For better security, use at least 8 characters', 'warning', 4000);
    }

    // Confirm password validation
    if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
        showModal('Passwords do not match', 'warning');
        return false;
    }

    return true;
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

// Page load ஆனதும் auth initialize பண்ணுறோம்
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    // Already loaded
    initAuth();
}

// Console-ல auth.js loaded message
console.log('✅ Auth.js loaded successfully!');
