// ===================================================
// COMMON.JS - Common JavaScript for All Pages
// ===================================================
// Shared functionality across all pages
// Header, navigation, common UI elements

/* 
    இந்த file எல்லா pages-லும் include பண்ணலாம்
    Common features:
    1. Navigation menu active state
    2. User greeting in header
    3. Cart count badge
*/

// ===========================================
// HEADER USER DISPLAY
// ===========================================

/**
 * updateHeaderUserInfo - Header-ல user info update பண்ணும்
 */
async function updateHeaderUserInfo() {
    try {
        const userLinksContainer = document.querySelector('.user-links');
        if (!userLinksContainer) return;

        // Path base-ai kandu pidikuroom (index page-a illai pages folder-a-nu)
        const isInPagesFolder = window.location.pathname.includes('/pages/');
        const base = isInPagesFolder ? './' : './pages/';

        if (isLoggedIn()) {
            const userEmail = getFromLocalStorage('userEmail');
            const userRole = getFromLocalStorage('userRole');
            const userName = userEmail ? userEmail.split('@')[0] : 'User';

            // User Info update
            userLinksContainer.innerHTML = `
                <a href="${userRole === 'seller' ? base + 'seller_dashboard.html' : base + 'user_details.html'}">
                    👤 ${userName}
                </a>
                <a href="${base}cart.html" style="position: relative;">
                    🛒 Cart
                    <span id="cart-count-badge" style="
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        background: #f44336;
                        color: white;
                        font-size: 10px;
                        padding: 2px 6px;
                        border-radius: 10px;
                        display: none;
                    "></span>
                </a>
                <a href="#" onclick="logout(); return false;">
                    🚪 Logout
                </a>
            `;

            // Update cart count
            updateCartCount();

        } else {
            userLinksContainer.innerHTML = `
                <a href="${base}login.html">👤 Login</a>
                <a href="${base}cart.html">🛒 Cart</a>
            `;
        }
    } catch (error) {
        console.error('Failed to update header user info:', error);
    }
}

/**
 * updateCartCount - Cart count badge update பண்ணும்
 */
async function updateCartCount() {
    try {
        if (!isLoggedIn()) return;

        const cartData = await getCart();
        const cartCountBadge = document.getElementById('cart-count-badge');

        if (cartCountBadge && cartData && cartData.items && cartData.items.length > 0) {
            cartCountBadge.textContent = cartData.items.length;
            cartCountBadge.style.display = 'block';
        }

    } catch (error) {
        console.error('Failed to update cart count:', error);
    }
}

// ===========================================
// NAVIGATION ACTIVE STATE
// ===========================================

/**
 * setActiveNavLink - Current page-க்கான nav link-ஐ highlight பண்ணும்
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');

        // Remove ./ and ../ for easier matching
        const cleanLinkPath = linkPath.replace('./', '').replace('../', '');

        if (currentPath.endsWith(cleanLinkPath) || (currentPath === '/' && cleanLinkPath === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===========================================
// MOBILE MENU TOGGLE (Optional)
// ===========================================

/**
 * toggleMobileMenu - Mobile menu toggle பண்ணும்
 */
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');

    if (navMenu) {
        navMenu.classList.toggle('mobile-active');
    }
}

// ===========================================
// SCROLL TO TOP BUTTON (Optional)
// ===========================================

/**
 * addScrollToTopButton - Scroll to top button add பண்ணும்
 */
function addScrollToTopButton() {
    // Check if button already exists
    if (document.getElementById('scroll-to-top')) return;

    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        display: none;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;

    scrollBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
    });

    document.body.appendChild(scrollBtn);
}

// ===========================================
// PAGE LOAD HANDLER
// ===========================================

/**
 * initCommonFeatures - Common features initialize பண்ணும்
 */
function initCommonFeatures() {
    console.log('🔧 Initializing common features...');

    // Update header user info
    updateHeaderUserInfo();

    // Set active nav link
    setActiveNavLink();

    // Add scroll to top button (optional)
    addScrollToTopButton();

    console.log('✅ Common features initialized');
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

// Page load ஆனதும் common features initialize பண்ணுறோம்
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonFeatures);
} else {
    initCommonFeatures();
}

console.log('✅ Common.js loaded successfully!');
