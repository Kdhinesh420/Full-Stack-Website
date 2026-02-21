// ===================================================
// API.JS - Backend Communication Functions
// ===================================================
// Backend FastAPI-ஓட communicate பண்ற எல்லா functions-ம் இங்க இருக்கும்
// Beginner-friendly-ஆ error handling-ஓட

/* 
    இந்த file-ல இருக்கும் main functions:
    1. makeRequest() - Generic API call function
    2. Product related functions
    3. Auth related functions
    4. Cart related functions
    5. Order related functions
*/

// ===========================================
// GENERIC API REQUEST FUNCTION
// ===========================================

/**
 * makeRequest - Backend-க்கு API call பண்ணும் generic function
 * @param {string} url - API endpoint URL
 * @param {string} method - HTTP method ('GET', 'POST', 'PUT', 'DELETE')
 * @param {object} data - Request body data (optional)
 * @param {boolean} requiresAuth - Token தேவையா? (default: false)
 * @returns {Promise} - API response
 */
async function makeRequest(url, method = 'GET', data = null, requiresAuth = false) {
    try {
        // Request headers prepare பண்ணுறோம்
        const headers = {
            'Content-Type': 'application/json'
        };

        // Authorization token add பண்ணுறோம் (if needed)
        if (requiresAuth) {
            const token = getFromLocalStorage('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                showModal('Please login to continue', 'error');
                redirectTo('../pages/login.html', 1500);
                throw new Error('Authentication required');
            }
        }

        // Request options prepare பண்ணுறோம்
        const options = {
            method: method,
            headers: headers
        };

        // Data இருந்தா request body-ல add பண்ணுறோம்
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        // API call பண்ணுறோம்
        console.log(`🌐 API Call: ${method} ${url}`);
        const response = await fetch(url, options);

        // Response JSON-ஆ parse பண்ணுறோம்
        const responseData = await response.json();

        // Success-ஆ இருந்தா data return பண்ணுறோம்
        if (response.ok) {
            console.log('✅ API Success:', responseData);
            return responseData;
        } else {
            // Error-ஆ இருந்தா handle பண்ணுறோம்
            console.error('❌ API Error:', responseData);
            throw responseData;
        }

    } catch (error) {
        console.error('❌ Request Failed:', error);

        // Network error-ஆ இருந்தா
        if (error.message === 'Failed to fetch') {
            showModal('Unable to connect to server. Please check your internet connection.', 'error');
        } else if (error.detail) {
            // Backend-ல இருந்து வந்த error message
            showModal(error.detail, 'error');
        } else {
            showModal(error.message || 'Something went wrong', 'error');
        }

        throw error;
    }
}

/**
 * makeFormDataRequest - Form data (files) upload பண்ண
 * @param {string} url - API endpoint URL
 * @param {FormData} formData - FormData object with files
 * @param {boolean} requiresAuth - Token தேவையா?
 * @returns {Promise} - API response
 */
async function makeFormDataRequest(url, formData, requiresAuth = true) {
    try {
        const headers = {};

        // Authorization token
        if (requiresAuth) {
            const token = getFromLocalStorage('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const options = {
            method: 'POST',
            headers: headers,
            body: formData
        };

        console.log(`📤 Uploading to: ${url}`);
        const response = await fetch(url, options);
        const responseData = await response.json();

        if (response.ok) {
            console.log('✅ Upload Success:', responseData);
            return responseData;
        } else {
            console.error('❌ Upload Error:', responseData);
            throw responseData;
        }

    } catch (error) {
        console.error('❌ Upload Failed:', error);
        showModal(error.detail || 'Upload failed', 'error');
        throw error;
    }
}

// ===========================================
// CATEGORY API FUNCTIONS
// ===========================================

/**
 * getCategories - எல்லா categories-ம் get பண்ணும்
 * @returns {Promise} - Categories array
 */
async function getCategories() {
    try {
        return await makeRequest(API_ENDPOINTS.categories.getAll, 'GET');
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
    }
}

/**
 * createCategory - புதுசா category create பண்ணும்
 * @param {string} name - Category name
 * @param {string} description - Category description (optional)
 * @returns {Promise} - Created category
 */
async function createCategory(name, description = '') {
    try {
        return await makeRequest(
            API_ENDPOINTS.categories.create,
            'POST',
            { name, description },
            // Authentication required (usually)
            true
        );
    } catch (error) {
        console.error('Failed to create category:', error);
        throw error;
    }
}

// ===========================================
// PRODUCT API FUNCTIONS
// ===========================================

/**
 * getAllProducts - எல்லா products-ம் get பண்ணும்
 * @param {object} filters - Filter options (category, search, etc.)
 * @returns {Promise} - Products array
 */
async function getAllProducts(filters = {}) {
    try {
        let url = API_ENDPOINTS.products.getAll;

        // Query parameters add பண்ணுறோம்
        const params = new URLSearchParams();
        // Backend expects 'category_id' not 'category'
        if (filters.category) params.append('category_id', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.min_price) params.append('min_price', filters.min_price);
        if (filters.max_price) params.append('max_price', filters.max_price);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        return await makeRequest(url, 'GET');
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}

/**
 * getProductById - Specific product details get பண்ணும்
 * @param {number} productId - Product ID
 * @returns {Promise} - Product details
 */
async function getProductById(productId) {
    try {
        const url = API_ENDPOINTS.products.getById(productId);
        return await makeRequest(url, 'GET');
    } catch (error) {
        console.error('Failed to fetch product details:', error);
        throw error;
    }
}

/**
 * createProduct - புதுசா product create பண்ணும் (Seller only)
 * @param {object} productData - Product details
 * @returns {Promise} - Created product
 */
async function createProduct(productData) {
    try {
        return await makeRequest(
            API_ENDPOINTS.products.create,
            'POST',
            productData,
            true // Authentication required
        );
    } catch (error) {
        console.error('Failed to create product:', error);
        throw error;
    }
}

/**
 * updateProduct - Existing product update பண்ணும்
 * @param {number} productId - Product ID
 * @param {object} productData - Updated data
 * @returns {Promise} - Updated product
 */
async function updateProduct(productId, productData) {
    try {
        return await makeRequest(
            API_ENDPOINTS.products.update(productId),
            'PUT',
            productData,
            true
        );
    } catch (error) {
        console.error('Failed to update product:', error);
        throw error;
    }
}

/**
 * deleteProduct - Product delete பண்ணும்
 * @param {number} productId - Product ID
 * @returns {Promise}
 */
async function deleteProduct(productId) {
    try {
        return await makeRequest(
            API_ENDPOINTS.products.delete(productId),
            'DELETE',
            null,
            true
        );
    } catch (error) {
        console.error('Failed to delete product:', error);
        throw error;
    }
}

/**
 * searchProducts - Products-ஐ search பண்ணும்
 * @param {string} query - Search query
 * @returns {Promise} - Matching products
 */
async function searchProducts(query) {
    try {
        const url = `${API_ENDPOINTS.products.search}?q=${encodeURIComponent(query)}`;
        return await makeRequest(url, 'GET');
    } catch (error) {
        console.error('Search failed:', error);
        return [];
    }
}

/**
 * getBestSellingProducts - Best selling products get பண்ணும்
 * @param {number} limit - How many products?
 * @returns {Promise} - Best selling products
 */
async function getBestSellingProducts(limit = 10) {
    try {
        const url = `${API_ENDPOINTS.products.bestSelling}?limit=${limit}`;
        return await makeRequest(url, 'GET');
    } catch (error) {
        console.error('Failed to fetch best sellers:', error);
        return [];
    }
}

// ===========================================
// CART API FUNCTIONS
// ===========================================

/**
 * getCart - User-ஓட cart items get பண்ணும்
 * @returns {Promise} - Cart items
 */
async function getCart() {
    try {
        return await makeRequest(API_ENDPOINTS.cart.getCart, 'GET', null, true);
    } catch (error) {
        console.error('Failed to fetch cart:', error);
        return { items: [], total: 0 };
    }
}

/**
 * addToCart - Product-ஐ cart-ல add பண்ணும்
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity
 * @returns {Promise}
 */
async function addToCart(productId, quantity = 1) {
    try {
        const result = await makeRequest(
            API_ENDPOINTS.cart.addItem,
            'POST',
            { product_id: productId, quantity: quantity },
            true
        );
        showModal('Product added to cart! 🛒', 'success');
        return result;
    } catch (error) {
        console.error('Failed to add to cart:', error);
        throw error;
    }
}

/**
 * updateCartItem - Cart item quantity update பண்ணும்
 * @param {number} cartItemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise}
 */
async function updateCartItem(cartItemId, quantity) {
    try {
        return await makeRequest(
            API_ENDPOINTS.cart.updateItem(cartItemId),
            'PUT',
            { quantity: quantity },
            true
        );
    } catch (error) {
        console.error('Failed to update cart:', error);
        throw error;
    }
}

/**
 * removeFromCart - Cart-ல இருந்து item remove பண்ணும்
 * @param {number} cartItemId - Cart item ID
 * @returns {Promise}
 */
async function removeFromCart(cartItemId) {
    try {
        const result = await makeRequest(
            API_ENDPOINTS.cart.removeItem(cartItemId),
            'DELETE',
            null,
            true
        );
        showModal('Item removed from cart', 'info');
        return result;
    } catch (error) {
        console.error('Failed to remove from cart:', error);
        throw error;
    }
}

/**
 * clearCart - Cart-ஐ முழுசா empty பண்ணும்
 * @returns {Promise}
 */
async function clearCart() {
    try {
        return await makeRequest(API_ENDPOINTS.cart.clearCart, 'DELETE', null, true);
    } catch (error) {
        console.error('Failed to clear cart:', error);
        throw error;
    }
}

// ===========================================
// ORDER API FUNCTIONS
// ===========================================

/**
 * createOrder - புதுசா order create பண்ணும்
 * @param {object} orderData - Order details
 * @returns {Promise} - Created order
 */
async function createOrder(orderData) {
    try {
        const result = await makeRequest(
            API_ENDPOINTS.orders.create,
            'POST',
            orderData,
            true
        );
        showModal('Order placed successfully! 🎉', 'success');
        return result;
    } catch (error) {
        console.error('Failed to create order:', error);
        throw error;
    }
}

/**
 * getUserOrders - User-ஓட எல்லா orders-ம் get பண்ணும்
 * @returns {Promise} - Orders array
 */
async function getUserOrders() {
    try {
        return await makeRequest(API_ENDPOINTS.orders.getAll, 'GET', null, true);
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return [];
    }
}

/**
 * getOrderById - Specific order details get பண்ணும்
 * @param {number} orderId - Order ID
 * @returns {Promise} - Order details
 */
async function getOrderById(orderId) {
    try {
        return await makeRequest(
            API_ENDPOINTS.orders.getById(orderId),
            'GET',
            null,
            true
        );
    } catch (error) {
        console.error('Failed to fetch order:', error);
        throw error;
    }
}

/**
 * trackOrder - Order tracking info get பண்ணும்
 * @param {number} orderId - Order ID
 * @returns {Promise} - Tracking info
 */
async function trackOrder(orderId) {
    try {
        return await makeRequest(
            API_ENDPOINTS.orders.track(orderId),
            'GET',
            null,
            true
        );
    } catch (error) {
        console.error('Failed to track order:', error);
        throw error;
    }
}

// ===========================================
// USER/PROFILE API FUNCTIONS
// ===========================================

/**
 * getUserProfile - Current user profile get பண்ணும்
 * @returns {Promise} - User profile
 */
async function getUserProfile() {
    try {
        return await makeRequest(API_ENDPOINTS.users.getProfile, 'GET', null, true);
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        throw error;
    }
}

/**
 * updateUserProfile - User profile update பண்ணும்
 * @param {object} profileData - Updated profile data
 * @returns {Promise} - Updated profile
 */
async function updateUserProfile(profileData) {
    try {
        const result = await makeRequest(
            API_ENDPOINTS.users.updateProfile,
            'PUT',
            profileData,
            true
        );
        showModal('Profile updated successfully!', 'success');
        return result;
    } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
    }
}

/**
 * getUserAddresses - User addresses get பண்ணும்
 * @returns {Promise} - Addresses array
 */
async function getUserAddresses() {
    try {
        return await makeRequest(API_ENDPOINTS.users.getAddresses, 'GET', null, true);
    } catch (error) {
        console.error('Failed to fetch addresses:', error);
        return [];
    }
}

/**
 * addUserAddress - புதுசா address add பண்ணும்
 * @param {object} addressData - Address details
 * @returns {Promise} - Created address
 */
async function addUserAddress(addressData) {
    try {
        const result = await makeRequest(
            API_ENDPOINTS.users.addAddress,
            'POST',
            addressData,
            true
        );
        showModal('Address added successfully!', 'success');
        return result;
    } catch (error) {
        console.error('Failed to add address:', error);
        throw error;
    }
}

// ===========================================
// FEEDBACK API FUNCTIONS
// ===========================================

async function submitFeedback(feedbackData) {
    try {
        // Feedback-kku login mandatory illai (Public)
        // Aana token irundha anupurom (to identify user)
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(feedbackData)
        });

        if (!response.ok) throw new Error('Feedback submission failed');

        const result = await response.json();
        showModal('Thank you for your feedback! 🙏', 'success');
        return result;
    } catch (error) {
        console.error('Failed to submit feedback:', error);
        throw error;
    }
}

/**
 * getProductFeedback - Product-க்கான feedback get பண்ணும்
 * @param {number} productId - Product ID
 * @returns {Promise} - Feedback array
 */
async function getProductFeedback(productId) {
    try {
        return await makeRequest(
            API_ENDPOINTS.feedback.getProductFeedback(productId),
            'GET'
        );
    } catch (error) {
        console.error('Failed to fetch feedback:', error);
        return [];
    }
}

/**
 * getUserReports - User-ஓட reports get பண்ணும்
 * @returns {Promise} - Reports array
 */
async function getUserReports() {
    try {
        return await makeRequest(API_ENDPOINTS.reports.myReports, 'GET', null, true);
    } catch (error) {
        console.error('Failed to fetch reports:', error);
        return [];
    }
}

/**
 * submitReport - Puthusa report submit pannum (Issue complaint)
 * @param {object} reportData - Report details
 */
async function submitReport(reportData) {
    try {
        const result = await makeRequest(
            API_ENDPOINTS.reports.create,
            'POST',
            reportData,
            true
        );
        showModal('Your report has been submitted! Our team will help you soon. 🙏', 'success');
        return result;
    } catch (error) {
        console.error('Failed to submit report:', error);
        throw error;
    }
}

// ===========================================

/**
 * uploadImage - Single image upload பண்ணும்
 * @param {File} file - Image file
 * @returns {Promise} - Upload response with URL
 */
async function uploadImage(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        return await makeFormDataRequest(API_ENDPOINTS.upload.image, formData);
    } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
    }
}

/**
 * uploadMultipleImages - Multiple images upload பண்ணும்
 * @param {FileList} files - Image files
 * @returns {Promise} - Upload response with URLs
 */
async function uploadMultipleImages(files) {
    try {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        return await makeFormDataRequest(API_ENDPOINTS.upload.multipleImages, formData);
    } catch (error) {
        console.error('Multiple images upload failed:', error);
        throw error;
    }
}

// Console-ல api.js loaded message
console.log('✅ API.js loaded successfully!');
