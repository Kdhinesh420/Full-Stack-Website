// ===================================================
// UTILS.JS - Utility Functions & Modal System
// ===================================================
// Alert-க்கு பதிலா nice-ஆன popup/modal காட்டும் functions
// Beginner-friendly helper functions

/* 
    இந்த file-ல common functions இருக்கும்:
    1. showModal() - Success/Error/Info messages காட்ட
    2. showLoading() - Loading spinner காட்ட
    3. hideLoading() - Loading hide பண்ண
    4. formatPrice() - Price format பண்ண
    5. formatDate() - Date format பண்ண
*/

// ===========================================
// MODAL/POPUP SYSTEM (Alert-க்கு பதிலா)
// ===========================================

/**
 * showModal - Beautiful popup காட்டும் function (alert-க்கு பதிலா)
 * @param {string} message - காட்ட வேண்டிய message
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {number} duration - எத்தனை milliseconds காட்டணும் (default: 3000)
 */
function showModal(message, type = 'info', duration = 3000) {
    // Modal இருக்கா check பண்ணுறோம், இல்லனா create பண்ணுறோம்
    let modalContainer = document.getElementById('custom-modal-container');

    if (!modalContainer) {
        // Modal container இல்லைனா create பண்ணுறோம்
        modalContainer = document.createElement('div');
        modalContainer.id = 'custom-modal-container';
        modalContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 100001;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(modalContainer);
    }

    // Modal element create பண்ணுறோம்
    const modal = document.createElement('div');
    modal.className = `custom-modal custom-modal-${type}`;

    // Type-க்கு ஏற்ற icon select பண்ணுறோம்
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    // Type-க்கு ஏற்ற colors
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    // Modal styling
    modal.style.cssText = `
        background: white;
        border-left: 4px solid ${colors[type]};
        border-radius: 8px;
        padding: 16px 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
        margin-bottom: 10px;
        min-width: 300px;
    `;

    // Modal content
    modal.innerHTML = `
        <span style="font-size: 24px;">${icons[type]}</span>
        <span style="flex: 1; color: #333; font-size: 14px;">${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 24px;
            height: 24px;
        ">×</button>
    `;

    // Animation CSS (first time only)
    if (!document.getElementById('modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Modal-ஐ container-ல add பண்ணுறோம்
    modalContainer.appendChild(modal);

    // Duration கழிச்சு auto-ஆ remove பண்ணுறோம்
    setTimeout(() => {
        modal.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }, duration);
}

/**
 * showConfirmModal - Confirmation popup (Yes/No question-க்கு)
 * @param {string} message - Question message
 * @param {function} onConfirm - Yes click பண்ணா run ஆகும் function
 * @param {function} onCancel - No click பண்ணா run ஆகும் function
 */
function showConfirmModal(message, onConfirm, onCancel) {
    // Overlay create பண்ணுறோம் (background dark)
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
    `;

    // Modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 30px;
        max-width: 400px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        animation: scaleIn 0.3s ease-out;
    `;

    modal.innerHTML = `
        <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px;">Confirmation</h3>
        <p style="margin: 0 0 24px 0; color: #666; line-height: 1.5;">${message}</p>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="confirm-cancel-btn" style="
                padding: 10px 24px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                color: #666;
            ">Cancel</button>
            <button id="confirm-yes-btn" style="
                padding: 10px 24px;
                border: none;
                background: #10b981;
                color: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            ">Yes, Continue</button>
        </div>
    `;

    // Animations
    if (!document.getElementById('confirm-animations')) {
        const style = document.createElement('style');
        style.id = 'confirm-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Yes button click event
    document.getElementById('confirm-yes-btn').addEventListener('click', () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    });

    // Cancel button click event
    document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
        overlay.remove();
        if (onCancel) onCancel();
    });

    // Overlay click பண்ணாலும் close ஆகும்
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
            if (onCancel) onCancel();
        }
    });
}

// ===========================================
// LOADING SPINNER FUNCTIONS
// ===========================================

/**
 * showLoading - Loading spinner காட்டும் function
 * @param {string} message - Loading message (default: "Loading...")
 */
function showLoading(message = 'Loading...') {
    // Loading spinner இருக்கா check பண்ணுறோம்
    let loader = document.getElementById('global-loader');

    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            z-index: 100000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
        `;

        loader.innerHTML = `
            <div style="
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #10b981;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <p id="loader-message" style="
                color: #666;
                font-size: 16px;
                margin: 0;
            ">${message}</p>
        `;

        // Spinner animation
        if (!document.getElementById('spinner-animation')) {
            const style = document.createElement('style');
            style.id = 'spinner-animation';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(loader);
    } else {
        // Message update பண்ணுறோம்
        const messageEl = document.getElementById('loader-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        loader.style.display = 'flex';
    }
}

/**
 * hideLoading - Loading spinner hide பண்ணும் function
 */
function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// ===========================================
// FORMATTING HELPER FUNCTIONS
// ===========================================

/**
 * formatPrice - Price-ஐ Indian Rupee format-ல காட்டும்
 * @param {number} price - Price amount
 * @returns {string} - Formatted price with ₹ symbol
 */
function formatPrice(price) {
    if (!price && price !== 0) return '₹0.00';
    return `₹${parseFloat(price).toFixed(2)}`;
}

/**
 * formatDate - Date-ஐ readable format-ல convert பண்ணும்
 * @param {string|Date} date - Date string or Date object
 * @returns {string} - Formatted date
 */
function formatDate(date) {
    if (!date) return '';

    const d = new Date(date);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return d.toLocaleDateString('en-IN', options);
}

/**
 * truncateText - Long text-ஐ truncate பண்ணும் (... add பண்ணும்)
 * @param {string} text - Input text
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * debounce - Function calls-ஐ delay பண்ணும் (search-க்கு useful)
 * @param {function} func - Execute பண்ண வேண்டிய function
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} - Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * validateEmail - Email valid-ஆ இருக்கா check பண்ணும்
 * @param {string} email - Email address
 * @returns {boolean} - True if valid, false otherwise
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * validatePhone - Indian phone number valid-ஆ இருக்கா check பண்ணும்
 * @param {string} phone - Phone number
 * @returns {boolean} - True if valid, false otherwise
 */
function validatePhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/**
 * generateUniqueId - Random unique ID generate பண்ணும்
 * @returns {string} - Unique ID
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * getQueryParam - URL-ல இருந்து query parameter-ஐ எடுக்கும்
 * @param {string} param - Parameter name
 * @returns {string|null} - Parameter value
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * redirectTo - Another page-க்கு redirect பண்ணும்
 * @param {string} url - Target URL
 * @param {number} delay - Delay in milliseconds (optional)
 */
function redirectTo(url, delay = 0) {
    if (delay > 0) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    } else {
        window.location.href = url;
    }
}

// ===========================================
// LOCAL STORAGE HELPER FUNCTIONS
// ===========================================

/**
 * saveToLocalStorage - Browser local storage-ல data save பண்ணும்
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

/**
 * getFromLocalStorage - Local storage-ல இருந்து data எடுக்கும்
 * @param {string} key - Storage key
 * @returns {any} - Stored value
 */
function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

/**
 * removeFromLocalStorage - Local storage-ல இருந்து data remove பண்ணும்
 * @param {string} key - Storage key
 */
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

// Console-ல utils loaded message
console.log('✅ Utils.js loaded successfully!');
