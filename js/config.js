/**
 * API Configuration
 * Central configuration for all API endpoints
 */

const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000',

    // Authentication endpoints
    AUTH: {
        SIGNUP: '/users/signup',
        LOGIN: '/users/login',
        ME: '/users/me'
    },

    // Product endpoints
    PRODUCTS: {
        BASE: '/products',
        MY_PRODUCTS: '/products/my-products'
    },

    // Cart endpoints
    CART: {
        BASE: '/cart'
    },

    // Order endpoints
    ORDERS: {
        BASE: '/orders',
        MY_ORDERS: '/orders/my-orders',
        SELLER_ORDERS: '/orders/seller/orders'
    },

    // Category endpoints
    CATEGORIES: {
        BASE: '/categories'
    },

    // Report endpoints
    REPORTS: {
        BASE: '/reports',
        MY_REPORTS: '/reports/my-reports',
        SELLER: '/reports/seller'
    },

    // Upload endpoints
    UPLOAD: {
        IMAGE: '/upload/image'
    }
};

// Local storage keys
const STORAGE_KEYS = {
    TOKEN: 'ulavan_token',
    USER: 'ulavan_user'
};

// Product Categories defined for the application
const PRODUCT_CATEGORIES = [
    { id: 1, name: 'Fruits Seeds', image: 'fruits.webp' },
    { id: 2, name: 'Flower Seeds', image: 'Poppy_Seeds.webp' },
    { id: 3, name: 'Vegetable Seeds', image: 'Gemini_Generated_Image_d9qbpkd9qbpkd9qb.png' },
    { id: 4, name: 'Tomato Seeds', image: 'Gemini_Generated_Image_ynyn7aynyn7aynyn.png' },
    { id: 5, name: 'Watermelon Seeds', image: 'Gemini_Generated_Image_ynyn7aynyn7aynyn.png' },
    { id: 6, name: 'Herb Seeds', image: 'Gemini_Generated_Image_ynyn7aynyn7aynyn.png' },
    { id: 7, name: 'Cattle Feed', image: 'Gemini_Generated_Image_ynyn7aynyn7aynyn.png' },
    { id: 8, name: 'Organic Fertilizers', image: 'Gemini_Generated_Image_ynyn7aynyn7aynyn.png' }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, STORAGE_KEYS, PRODUCT_CATEGORIES };
}
