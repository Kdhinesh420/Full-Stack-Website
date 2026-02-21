// ===================================================
// CONFIG.JS - Configuration File
// ===================================================
// இந்த file-ல backend URL and app settings இருக்கும்
// Beginner-friendly-ஆ எழுதியிருக்கேன்

/* 
    BACKEND_URL என்பது உங்க Python FastAPI backend run ஆகற address
    Local development-க்கு: http://localhost:8000
    Production-க்கு: உங்க deployed URL (e.g., Render, Heroku)
*/

// Backend API Base URL - இதை உங்க backend URL-க்கு மாத்துங்க
const API_BASE_URL = "https://uzhavan-planet-frontend.onrender.com";

// API Endpoints - எல்லா API routes-ம் இங்க define பண்ணியிருக்கேன்
const API_ENDPOINTS = {
    // Authentication endpoints
    auth: {
        register: `${API_BASE_URL}/users/signup`,
        login: `${API_BASE_URL}/users/login`,
        logout: `${API_BASE_URL}/logout`,
        getCurrentUser: `${API_BASE_URL}/users/me`
    },

    // Product endpoints
    products: {
        getAll: `${API_BASE_URL}/products`,
        getById: (id) => `${API_BASE_URL}/products/${id}`,
        create: `${API_BASE_URL}/products`,
        update: (id) => `${API_BASE_URL}/products/${id}`,
        delete: (id) => `${API_BASE_URL}/products/${id}`,
        search: `${API_BASE_URL}/products/search`,
        bestSelling: `${API_BASE_URL}/products/best-selling`
    },

    // Category endpoints
    categories: {
        getAll: `${API_BASE_URL}/categories`,
        create: `${API_BASE_URL}/categories`
    },

    // Cart endpoints
    cart: {
        getCart: `${API_BASE_URL}/cart`,
        addItem: `${API_BASE_URL}/cart`,
        updateItem: (id) => `${API_BASE_URL}/cart/${id}`,
        removeItem: (id) => `${API_BASE_URL}/cart/${id}`,
        clearCart: `${API_BASE_URL}/cart`
    },

    // Order endpoints
    orders: {
        create: `${API_BASE_URL}/orders`,
        getAll: `${API_BASE_URL}/orders/my-orders`,
        getById: (id) => `${API_BASE_URL}/orders/${id}`,
        updateStatus: (id) => `${API_BASE_URL}/orders/${id}/status`,
        track: (id) => `${API_BASE_URL}/orders/${id}/track`
    },

    // User endpoints
    users: {
        getProfile: `${API_BASE_URL}/users/me`,
        updateProfile: `${API_BASE_URL}/users/me`,
        getAddresses: `${API_BASE_URL}/users/me/addresses`,
        addAddress: `${API_BASE_URL}/users/me/addresses`,
        updateAddress: (id) => `${API_BASE_URL}/users/me/addresses/${id}`,
        deleteAddress: (id) => `${API_BASE_URL}/users/me/addresses/${id}`
    },

    // Seller endpoints
    seller: {
        getDashboard: `${API_BASE_URL}/seller/dashboard`,
        getProducts: `${API_BASE_URL}/seller/products`,
        getOrders: `${API_BASE_URL}/seller/orders`
    },

    // Feedback endpoints
    feedback: {
        create: `${API_BASE_URL}/feedback`,
        getAll: `${API_BASE_URL}/feedback`,
        getProductFeedback: (productId) => `${API_BASE_URL}/feedback/product/${productId}`
    },

    // Report endpoints
    reports: {
        create: `${API_BASE_URL}/reports`,
        getSeller: `${API_BASE_URL}/reports/seller`,
        myReports: `${API_BASE_URL}/reports/my-reports`
    },

    // Upload endpoints
    upload: {
        image: `${API_BASE_URL}/upload/image`,
        multipleImages: `${API_BASE_URL}/upload/images`
    }
};

// Product Categories - Products-ஐ categorize பண்ண
const PRODUCT_CATEGORIES = [
    { id: "seeds", name: "Seeds", icon: "🌱" },
    { id: "fertilizers", name: "Fertilizers", icon: "🧪" },
    { id: "pesticides", name: "Pesticides", icon: "🛡️" },
    { id: "tools", name: "Tools & Equipment", icon: "🔧" },
    { id: "organic", name: "Organic Products", icon: "🍃" },
    { id: "fodder", name: "Animal Fodder", icon: "🐄" }
];

// App Settings
const APP_CONFIG = {
    appName: "UZHAVAN PLANET",
    currency: "₹",
    maxCartItems: 50,
    itemsPerPage: 12,
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

// User Roles
const USER_ROLES = {
    BUYER: 'buyer',
    SELLER: 'seller',
    ADMIN: 'admin'
};

// Order Status Types
const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

// Payment Methods
const PAYMENT_METHODS = {
    COD: 'cash_on_delivery',
    ONLINE: 'online_payment',
    UPI: 'upi'
};

// Export பண்ணுறோம் - மத்த files-ல use பண்ண
// (Browser environment-க்கு automatic-ஆ global scope-ல available ஆகும்)
