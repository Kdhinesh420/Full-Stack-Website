/**
 * API Helper Functions
 * Generic fetch wrapper with authentication and error handling
 */

/**
 * Make an authenticated API call
 * @param {string} endpoint - API endpoint (e.g., '/products')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise} - Response data or error
 */
async function apiCall(endpoint, options = {}) {
    // Sanitize URL Construction
    const baseUrl = API_CONFIG.BASE_URL.endsWith('/') ? API_CONFIG.BASE_URL.slice(0, -1) : API_CONFIG.BASE_URL;
    const sanitizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${sanitizedEndpoint}`;

    // Default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Add authentication token if available
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge options
    const fetchOptions = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, fetchOptions);

        // Handle different status codes
        if (response.status === 401) {
            // Unauthorized - token expired or invalid
            removeToken();
            removeUser();
            const isInPages = window.location.pathname.includes('/pages/');
            window.location.href = isInPages ? 'login.html' : './pages/login.html';
            throw new Error('Session expired. Please login again.');
        }

        if (response.status === 403) {
            // Forbidden - insufficient permissions
            const error = await response.json();
            throw new Error(error.detail || 'Access denied');
        }

        if (response.status === 404) {
            // Not found
            const error = await response.json();
            throw new Error(error.detail || 'Resource not found');
        }

        if (response.status === 400) {
            // Bad request
            const error = await response.json();
            throw new Error(error.detail || 'Invalid request');
        }

        if (!response.ok) {
            // Other errors
            let errorMessage = 'An error occurred';
            try {
                const error = await response.json();
                errorMessage = error.detail || errorMessage;
            } catch (e) {
                // If not JSON, use the status text
                errorMessage = `Server Error (${response.status}): ${response.statusText || 'Internal Server Error'}`;
            }
            throw new Error(errorMessage);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return null;
        }

        // Parse and return JSON response
        return await response.json();

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * GET request
 */
async function apiGet(endpoint) {
    return apiCall(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
async function apiPost(endpoint, data) {
    return apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * PUT request
 */
async function apiPut(endpoint, data) {
    return apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * DELETE request
 */
async function apiDelete(endpoint) {
    return apiCall(endpoint, { method: 'DELETE' });
}

/**
 * POST request with form data (for file uploads)
 */
async function apiPostFormData(endpoint, formData) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const headers = {};

    // Add authentication token if available
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData
        });

        if (!response.ok) {
            let errorMessage = 'Upload failed';
            try {
                const error = await response.json();
                errorMessage = error.detail || errorMessage;
            } catch (e) {
                // If not JSON, use the status text
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        return await response.json();

    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
}

/**
 * Show loading spinner
 */
function showLoading(element) {
    if (element) {
        element.disabled = true;
        element.innerHTML = '<span class="spinner">⏳</span> Loading...';
    }
}

/**
 * Hide loading spinner
 */
function hideLoading(element, originalText) {
    if (element) {
        element.disabled = false;
        element.innerHTML = originalText;
    }
}

/**
 * Show error message
 */
function showError(message, containerId = 'error-message') {
    const container = document.getElementById(containerId);
    if (container) {
        container.textContent = message;
        container.style.display = 'block';
        container.className = 'error-message';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            container.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

/**
 * Show success message
 */
function showSuccess(message, containerId = 'success-message') {
    const container = document.getElementById(containerId);
    if (container) {
        container.textContent = message;
        container.style.display = 'block';
        container.className = 'success-message';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            container.style.display = 'none';
        }, 3000);
    } else {
        alert(message);
    }
}

/**
 * Format price in Indian Rupees
 */
function formatPrice(price) {
    return `₹${parseFloat(price).toFixed(2)}`;
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
