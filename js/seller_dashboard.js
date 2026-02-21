// ===================================================
// SELLER_DASHBOARD.JS - Seller Dashboard Page JavaScript
// ===================================================
// Seller products management, orders, statistics
let currentStockProductId = null;
let sellerOrders = []; // Global storage for orders

// ===========================================
// PAGE INITIALIZATION
// ===========================================

async function initSellerDashboard() {
    console.log('📊 Initializing seller dashboard...');

    // Seller role check (Only sellers can access)
    if (!requireRole('seller')) {
        return;
    }

    try {
        // Dashboard data load பண்ணுறோம்
        await loadSellerProfile(); // Profile load first
        await loadDashboardStats();
        await loadSellerProducts();
        await loadSellerOrders();
        await loadSellerFeedback(); // Buyer feedback-ai load pannurom

        // New: Filter setup (Beginner level code)
        setupOrderFilters();

        // Profile elements setup
        setupProfileActions();
        setupAddProductForm();
        setupStockModal();

    } catch (error) {
        console.error('Error initializing seller dashboard:', error);
        showModal('Failed to load dashboard', 'error');
    }
}

// ===========================================
// DASHBOARD STATISTICS
// ===========================================

/**
 * loadDashboardStats - Dashboard statistics load பண்ணும்
 */
async function loadDashboardStats() {
    try {
        // API call (seller dashboard endpoint)
        const dashboardData = await makeRequest(
            API_ENDPOINTS.seller.getDashboard,
            'GET',
            null,
            true
        );

        // Stats display பண்ணுறோம்
        displayStats(dashboardData);

        console.log('✅ Dashboard stats loaded');

    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

/**
 * displayStats - Statistics display பண்ணும்
 * @param {object} stats - Dashboard statistics
 */
function displayStats(stats) {
    // Total products
    const productsCountEl = document.getElementById('total-products');
    if (productsCountEl) {
        productsCountEl.textContent = stats.total_products || 0;
    }

    // Total orders
    const ordersCountEl = document.getElementById('total-orders');
    if (ordersCountEl) {
        ordersCountEl.textContent = stats.total_orders || 0;
    }

    // Total revenue
    const revenueEl = document.getElementById('total-revenue');
    if (revenueEl) {
        revenueEl.textContent = formatPrice(stats.total_revenue || 0);
    }

    // Pending orders
    const pendingOrdersEl = document.getElementById('pending-orders');
    if (pendingOrdersEl) {
        pendingOrdersEl.textContent = stats.pending_orders || 0;
    }
}

// ===========================================
// SELLER PROFILE
// ===========================================

/**
 * loadSellerProfile - Seller profile load பண்ணி display பண்ணும்
 */
async function loadSellerProfile() {
    try {
        const user = await getUserProfile();

        if (!user) {
            console.warn('No user profile found');
            return;
        }

        console.log('👤 Mapping user profile for dashboard:', user);

        // Display basic info
        setTextContent('sellerName', user.username || 'Seller');
        setTextContent('sellerEmail', user.email || 'No email');
        setTextContent('sellerPhone', user.phone || 'Not provided');
        setTextContent('sellerAddress', user.address || 'Not provided');

        // Store name? Backend might not have it yet, using username as fallback
        setTextContent('storeName', user.username + " Store");

    } catch (error) {
        console.error('Failed to load seller profile:', error);
    }
}

/**
 * setupProfileActions - Profile related buttons setup
 */
function setupProfileActions() {
    // Edit Profile button listener
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            window.location.href = './user_details.html';
        });
    }

    // Avatar upload setup (optional placeholder for future)
    const avatarBtn = document.getElementById('sellerAvatarBtn');
    if (avatarBtn) {
        avatarBtn.onclick = () => {
            showModal('Profile picture can be changed in User Details page.', 'info');
            setTimeout(() => {
                window.location.href = './user_details.html';
            }, 1500);
        };
    }
}

/**
 * setTextContent - Helper to set element text
 */
function setTextContent(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}


// ===========================================
// SELLER PRODUCTS
// ===========================================

/**
 * loadSellerProducts - Seller-ஓட products load பண்ணும்
 */
async function loadSellerProducts() {
    try {
        const productsContainer = document.getElementById('sellerProductsGrid');

        if (!productsContainer) return;

        // Loading indicator
        productsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 20px;">
                <i class="fas fa-spinner fa-spin"></i> Loading products...
            </div>
        `;

        // API call
        const products = await makeRequest(
            API_ENDPOINTS.seller.getProducts,
            'GET',
            null,
            true
        );

        // Products display பண்ணுறோம்
        if (products && products.length > 0) {
            productsContainer.innerHTML = '';
            products.forEach(product => {
                const card = createProductCard(product);
                productsContainer.appendChild(card);
            });
        } else {
            productsContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 20px; color: #666;">
                    No products added yet. Add your first product to get started!
                </div>
            `;
        }

        console.log(`✅ Loaded ${products.length} seller products`);

    } catch (error) {
        console.error('Failed to load seller products:', error);
        const productsContainer = document.getElementById('sellerProductsGrid');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: red; padding: 20px;">
                    Failed to load products. Please try again.
                </div>
            `;
        }
    }
}

/**
 * createProductCard - Product card create பண்ணும் (Grid View)
 * @param {object} product - Product data
 * @returns {HTMLElement} - Card element
 */
/**
 * createProductCard - Product card create பண்ணும் (Grid View)
 * @param {object} product - Product data
 * @returns {HTMLElement} - Card element
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card-dashboard';
    card.style = `
        background: white; 
        border-radius: 10px; 
        padding: 15px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        display: flex; 
        flex-direction: column; 
        gap: 10px;
        transition: transform 0.2s;
    `;

    card.innerHTML = `
        <div style="position: relative; height: 150px; overflow: hidden; border-radius: 8px;">
             <img src="${product.image_url || '../assets/images/placeholder.png'}" 
                  alt="${product.name}" 
                  style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div>
            <h3 style="margin: 0; font-size: 1.1em; color: #333;">${product.name}</h3>
            <p style="margin: 4px 0; color: #666; font-size: 0.9em;">Price: ${formatPrice(product.price)}</p>
            <p style="margin: 4px 0; color: #666; font-size: 0.9em;">Stock: <strong>${product.stock_quantity}</strong> units</p>
        </div>
        <div style="display: flex; gap: 8px; margin-top: auto;">
            <button onclick="openStockModal(${product.id}, ${product.stock_quantity})" style="
                flex: 1;
                padding: 8px;
                background: #f59e0b;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            ">Update Stock</button>
            <button onclick="deleteProductConfirm(${product.id})" style="
                flex: 1;
                padding: 8px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            ">Delete</button>
        </div>
    `;

    return card;
}

/**
 * editProduct - Product edit பண்ண (redirect to product adding page)
 * @param {number} productId - Product ID
 */
function editProduct(productId) {
    window.location.href = `./product_adding_page.html?id=${productId}`;
}


/**
 * deleteProductConfirm - Product delete confirmation
 * @param {number} productId - Product ID
 */
function deleteProductConfirm(productId) {
    showConfirmModal(
        'Are you sure you want to delete this product?',
        async () => {
            try {
                showLoading('Deleting product...');
                await deleteProduct(productId);
                await loadSellerProducts();
                hideLoading();
                showModal('Product deleted successfully!', 'success');
            } catch (error) {
                hideLoading();
                console.error('Failed to delete product:', error);
            }
        },
        null
    );
}

// ===========================================
// STOCK MODAL FUNCTIONS
// ===========================================

function setupStockModal() {
    const saveBtn = document.getElementById('saveStockBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveStockUpdate);
    }
}

function openStockModal(productId, currentStock) {
    currentStockProductId = productId;
    const modal = document.getElementById('stockModal');
    const input = document.getElementById('newStockInput');
    const nameEl = document.getElementById('modalProductName');

    if (modal && input) {
        input.value = currentStock;
        nameEl.textContent = `Product ID: ${productId}`; // Simple indicator
        modal.style.display = 'flex';
        input.focus();
    }
}

function closeStockModal() {
    const modal = document.getElementById('stockModal');
    if (modal) {
        modal.style.display = 'none';
        currentStockProductId = null;
    }
}

async function saveStockUpdate() {
    if (!currentStockProductId) return;

    const input = document.getElementById('newStockInput');
    const newStock = parseInt(input.value);

    if (isNaN(newStock) || newStock < 0) {
        alert('Please enter a valid stock quantity');
        return;
    }

    try {
        const saveBtn = document.getElementById('saveStockBtn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        // API Call to update stock
        // URL: /seller/products/{id}/stock?stock={qty} OR Body?
        // Backend: router.put("/products/{product_id}/stock", stock: int)
        // FastAPI expects query param if not Pydantic model.
        // Let's use Query Parameter for simplicity: ?stock=10

        await makeRequest(
            `${API_ENDPOINTS.seller.getProducts}/${currentStockProductId}/stock?stock=${newStock}`,
            'PUT',
            null,
            true
        );

        // Success
        closeStockModal();
        await loadSellerProducts(); // Refresh list to show new stock

        // Reset button
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;

        showModal('Stock updated successfully!', 'success');

    } catch (error) {
        console.error('Failed to update stock:', error);
        alert('Failed to update stock. Please try again.');
        const saveBtn = document.getElementById('saveStockBtn');
        saveBtn.textContent = 'Save Changes';
        saveBtn.disabled = false;
    }
}

// Make globally available for onclick
window.openStockModal = openStockModal;
window.closeStockModal = closeStockModal;

/**
 * deleteProduct - Product delete API call
 * @param {number} productId - Product ID
 */
async function deleteProduct(productId) {
    if (!API_ENDPOINTS.products || !API_ENDPOINTS.products.delete) {
        throw new Error('Delete endpoint configuration missing');
    }

    const url = API_ENDPOINTS.products.delete(productId);
    await makeRequest(url, 'DELETE', null, true);
}

// ===========================================
// SELLER ORDERS
// ===========================================

/**
 * loadSellerOrders - Seller-ஓட orders load பண்ணும்
 */
async function loadSellerOrders() {
    try {
        const ordersContainer = document.getElementById('ordersTableBody');

        if (!ordersContainer) return;

        // Loading indicator
        ordersContainer.innerHTML = `
            <tr><td colspan="8" style="text-align: center; padding: 20px;">
                <i class="fas fa-spinner fa-spin"></i> Loading orders...
            </td></tr>
        `;

        // API call
        const orders = await makeRequest(
            API_ENDPOINTS.seller.getOrders,
            'GET',
            null,
            true
        );

        // Orders display பண்ணுறோம்
        if (orders && orders.length > 0) {
            sellerOrders = orders; // Save to global variable
            ordersContainer.innerHTML = '';
            orders.forEach(order => {
                const row = createOrderRow(order);
                ordersContainer.appendChild(row);
            });
        } else {
            ordersContainer.innerHTML = `
                <tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                    No orders received yet
                </td></tr>
            `;
        }

        console.log(`✅ Loaded ${orders.length} seller orders`);

    } catch (error) {
        console.error('Failed to load seller orders:', error);
        const ordersContainer = document.getElementById('ordersTableBody');
        if (ordersContainer) {
            ordersContainer.innerHTML = `
                <tr><td colspan="8" style="text-align: center; color: red; padding: 20px;">
                    Failed to load orders.
                </td></tr>
            `;
        }
    }
}

/**
 * createOrderRow - Each order row produce பண்ணும்
 */
function createOrderRow(order) {
    const row = document.createElement('tr');

    // Robust ID Check
    const orderId = order.id || order.order_id || order._id;

    const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'near by', 'delivery zone', 'completed', 'cancelled'];

    // Status dropdown
    let selectHtml = `<select onchange="updateOrderStatus('${orderId}', this.value)" style="padding: 5px; border-radius: 4px; border: 1px solid #ddd;">`;
    statusOptions.forEach(opt => {
        const selected = opt === order.status ? 'selected' : '';
        selectHtml += `<option value="${opt}" ${selected}>${opt.toUpperCase()}</option>`;
    });
    selectHtml += `</select>`;

    // Customer name extraction
    const customer = order.customer_name ||
        (order.user && (order.user.username || order.user.full_name)) ||
        order.username ||
        'Customer';

    const total = order.total_amount || order.total || 0;

    row.innerHTML = `
        <td style="font-weight: bold;">#${orderId}</td>
        <td><i class="fas fa-user"></i> ${customer}</td>
        <td>${order.product_name || 'Multiple Items'}</td>
        <td style="text-align: center;">${order.quantity || 1}</td>
        <td style="font-weight: 600;">${formatPrice(total)}</td>
        <td>${new Date(order.created_at || Date.now()).toLocaleDateString()}</td>
        <td>${selectHtml}</td>
        <td>
            <button onclick="viewDetailedOrder('${orderId}')" style="
                padding: 6px 12px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
            "><i class="fas fa-eye"></i> Info</button>
        </td>
    `;

    return row;
}

/**
 * updateOrderStatus - Order status-ஐ மாத்த help பண்ணும்
 */
async function updateOrderStatus(orderId, newStatus) {
    try {
        console.log(`Updating order ${orderId} to ${newStatus}`);

        // API_ENDPOINTS logic use பண்ணுறோம் for consistency
        const url = `${API_ENDPOINTS.orders.updateStatus(orderId)}?status=${newStatus}`;

        // Data-vai body-layum anupuvom (Safety-ku)
        await makeRequest(url, 'PUT', { status: newStatus }, true);

        showModal(`Order #${orderId} status has been updated to ${newStatus.toUpperCase()}!`, 'success');

        // Stats refresh and list refresh so seller sees change immediately
        loadDashboardStats();
        await loadSellerOrders();

    } catch (error) {
        console.error('Status update failed:', error);
        alert('Status update failed. Please refresh and try again.');
    }
}

/**
 * viewDetailedOrder - Smart order display logic
 */
async function viewDetailedOrder(orderId) {
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderModalContent');

    if (!modal || !content) return;

    modal.style.display = 'flex';
    content.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Loading data...</p>';

    try {
        // 1. Get initial data from our global list (Source of Contact Info)
        const listData = sellerOrders.find(o => (o.id || o.order_id || o._id || "").toString() === orderId.toString());

        let order = listData ? { ...listData } : {};

        // 2. Fetch fresh details (Mainly for full item list)
        try {
            const fresh = await makeRequest(`${API_BASE_URL}/orders/${orderId}`, 'GET', null, true);
            if (fresh) {
                // Merge common fields, but keep listData contact info if fresh is missing it
                order = { ...order, ...fresh };
            }
        } catch (e) {
            console.warn("Detail fetch failed, using list data only", e);
        }

        if (!order || Object.keys(order).length === 0) {
            content.innerHTML = "<p style='color:red;'>Order details not found.</p>";
            return;
        }

        // 🧠 ULTRA-SMART FIELD EXTRACTOR 🧠
        const findValue = (obj, targetKeys) => {
            if (!obj || typeof obj !== 'object') return null;

            // Current level check
            for (let key of Object.keys(obj)) {
                if (targetKeys.some(tk => key.toLowerCase() === tk.toLowerCase())) {
                    if (obj[key]) return obj[key];
                }
            }

            // Nested check
            const subObjects = ['user', 'customer', 'buyer', 'address_data', 'profile'];
            for (let sub of subObjects) {
                if (obj[sub]) {
                    const found = findValue(obj[sub], targetKeys);
                    if (found) return found;
                }
            }
            return null;
        };

        // Target keys expanded based on Backend discovery
        const name = findValue(order, ['customer_name', 'full_name', 'username', 'name', 'buyer_name']) || 'Not Available';
        const phone = findValue(order, ['customer_phone', 'phone', 'mobile', 'user_phone', 'contact']) || 'Not Available';
        const email = findValue(order, ['customer_email', 'email', 'user_email', 'buyer_email']) || 'Not Available';

        // Added 'customer_address' here specifically!
        const address = findValue(order, ['customer_address', 'shipping_address', 'address', 'full_address', 'location']) || 'Not Provided';

        const oId = order.order_id || order.id || order._id || orderId;
        const oDate = order.order_date || order.created_at || order.date || Date.now();

        // Items logic
        let itemsHtml = '';
        const items = order.items || order.order_items || [];
        if (items.length > 0) {
            itemsHtml = '<table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:0.9em; border: 1px solid #e8f5e9;">';
            itemsHtml += '<tr style="background:#f0fdf4;"><th style="padding:8px;border:1px solid #ddd;">Product</th><th style="padding:8px;border:1px solid #ddd;">Qty</th></tr>';
            items.forEach(item => {
                itemsHtml += `<tr><td style="padding:8px;border:1px solid #ddd;">${item.product_name || 'Item'}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity || 1}</td></tr>`;
            });
            itemsHtml += '</table>';
        } else {
            itemsHtml = '<p style="color:#666;">No item details available.</p>';
        }

        content.innerHTML = `
            <div style="background: white;">
                <h4 style="color:#1b5e20; border-bottom:2px solid #e8f5e9; padding-bottom:10px; margin-bottom:15px; font-size: 1.1rem;">
                    <i class="fas fa-user-circle"></i> BUYER CONTACT DETAILS
                </h4>
                <div style="display:grid; grid-template-columns:1fr; gap:12px; margin-bottom:20px; background: #fdfdfd; padding: 10px; border-radius: 8px;">
                    <p style="margin:0;"><strong>Name:</strong> <span style="color:#2e7d32; font-weight: 500;">${name}</span></p>
                    <p style="margin:0;"><strong>Phone:</strong> <span style="color:#2e7d32; font-weight: 500;">${phone}</span></p>
                    <p style="margin:0;"><strong>Email:</strong> <span style="color:#2e7d32; font-weight: 500;">${email}</span></p>
                    <p style="margin:0;"><strong>Address:</strong><br><span style="color:#555; font-size:0.95em;">${address}</span></p>
                </div>

                <h4 style="color:#1b5e20; border-bottom:2px solid #e8f5e9; padding-bottom:10px; margin-bottom:10px; font-size: 1.1rem;">
                    <i class="fas fa-shopping-bag"></i> ORDERED ITEMS
                </h4>
                ${itemsHtml}

                <div style="margin-top:25px; background: linear-gradient(to right, #fbfdfb, #f0fdf4); padding:15px; border-radius:10px; border:1px solid #e8f5e9;">
                    <p style="margin:5px 0;"><strong>Order ID:</strong> #${oId}</p>
                    <p style="margin:5px 0;"><strong>Placed On:</strong> ${new Date(oDate).toLocaleString()}</p>
                    <p style="margin:10px 0 0 0; font-size:1.2rem; color:#1b5e20; font-weight: 800;">
                        <strong>Total Amount:</strong> ${formatPrice(order.total_amount || order.total || 0)}
                    </p>
                    <p style="margin:5px 0; font-size: 0.9rem; color: #166534;">
                        <strong>Current Status:</strong> ${(order.status || 'pending').toUpperCase()}
                    </p>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Popup Error:", error);
        content.innerHTML = "<p style='color:red; text-align:center;'>Failed to display order info. Please try again.</p>";
    }
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'none';
}

// Global scope-க்கு functions-ஐ expose பண்ணுறோம் (onclick works ஆகணும்-ல)
window.updateOrderStatus = updateOrderStatus;
window.viewDetailedOrder = viewDetailedOrder;
window.closeOrderModal = closeOrderModal;

// ===========================================
// ORDER FILTER & SEARCH (Beginner Level)
// ===========================================

/**
 * setupOrderFilters - Filter and Search listeners add pannum
 */
function setupOrderFilters() {
    const filterSelect = document.getElementById('orderFilter');
    const searchInput = document.getElementById('orderSearch');

    // 1. Dropdown change aanaal filter pannu
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            applyOrderFilters();
        });
    }

    // 2. Search box-la type pannaal filter pannu
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyOrderFilters();
        });
    }
}

/**
 * applyOrderFilters - Actual filtering logic
 */
function applyOrderFilters() {
    const filterSelect = document.getElementById('orderFilter');
    const searchInput = document.getElementById('orderSearch');
    const container = document.getElementById('ordersTableBody');

    if (!container || !filterSelect || !searchInput) return;

    const filterValue = filterSelect.value; // Example: 'pending'
    const searchText = searchInput.value.toLowerCase(); // Example: 'kumar'

    // First: Filter logic (Simple check)
    const filteredList = sellerOrders.filter(order => {
        // Status check
        const matchStatus = (filterValue === 'all') || (order.status.toLowerCase() === filterValue.toLowerCase());

        // Search text check (ID, Name, Product mix pannurom)
        const orderId = (order.id || order.order_id || "").toString();
        const customer = (order.customer_name || order.username || "").toLowerCase();
        const product = (order.product_name || "").toLowerCase();

        const matchSearch = orderId.includes(searchText) ||
            customer.includes(searchText) ||
            product.includes(searchText);

        // Rendum match aanaal selection okay!
        return matchStatus && matchSearch;
    });

    // Second: Table-ai update pannu
    container.innerHTML = ''; // Old rows clear pannu

    if (filteredList.length > 0) {
        filteredList.forEach(order => {
            const row = createOrderRow(order);
            container.appendChild(row);
        });
    } else {
        container.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No matching orders found.</td></tr>';
    }
}


// ===========================================
// ADD PRODUCT FORM
// ===========================================

/**
 * setupAddProductForm - Add product form setup பண்ணும்
 */
function setupAddProductForm() {
    const addProductBtn = document.getElementById('add-product-btn');

    if (addProductBtn) {
        addProductBtn.addEventListener('click', goToAddProduct);
    }
}

/**
 * goToAddProduct - Add product page-க்கு redirect
 */
function goToAddProduct() {
    window.location.href = './product_adding_page.html';
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSellerDashboard);
} else {
    initSellerDashboard();
}

console.log('✅ Seller Dashboard.js loaded successfully!');
// ===========================================
// BUYER FEEDBACK (Reports Section)
// ===========================================

/**
 * loadSellerFeedback - Buyer feedback-ai API-la irunthu edukum
 */
async function loadSellerFeedback() {
    try {
        const container = document.getElementById('reportsList');
        if (!container) return;

        // Container-la loading message podurom
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Fetching latest data... ⏳</p>';

        // 1. Parallel-a Feedback and Reports-ai edukkurom (Safe way)
        const [feedbackList, reportsList] = await Promise.all([
            makeRequest(API_ENDPOINTS.feedback.getAll, 'GET', null, true).catch(err => {
                console.error('Feedback API Error:', err);
                return [];
            }),
            makeRequest(API_ENDPOINTS.reports.getSeller, 'GET', null, true).catch(err => {
                console.error('Reports API Error:', err);
                return [];
            })
        ]);

        console.log(`📊 Data Loaded: Feedback(${feedbackList.length}), Reports(${reportsList.length})`);

        // 2. Data types-ai check pannurom (Array-a iruntha dhaan merge panna mudiyum)
        const safeFeedback = Array.isArray(feedbackList) ? feedbackList : [];
        const safeReports = Array.isArray(reportsList) ? reportsList : [];

        // UI header-la count update pannurom (Optional)
        const headerTitle = document.querySelector('.reports-section .section-header h2');
        if (headerTitle) {
            headerTitle.innerHTML = `<i class="fas fa-comments"></i> Buyer Interactions (${safeFeedback.length + safeReports.length})`;
        }

        // 3. Rendaiyum merge panni sort pannurom
        const combined = [
            ...safeFeedback.map(f => ({ ...f, entryType: 'feedback' })),
            ...safeReports.map(r => ({ ...r, entryType: 'report' }))
        ];

        // Sort latest first (Date check pannurom)
        combined.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });

        displayFeedback(combined);

    } catch (error) {
        console.error('Critical Error in loadSellerFeedback:', error);
        const container = document.getElementById('reportsList');
        if (container) {
            container.innerHTML = `<p style="text-align:center; color:red; padding: 20px;">
                Error loading data. <br> 
                <button onclick="loadSellerFeedback()" style="margin-top:10px; cursor:pointer;">Retry</button>
            </p>`;
        }
    }
}

/**
 * displayFeedback - Feedback and Reports rendaiyum show pannum
 */
function displayFeedback(list) {
    const container = document.getElementById('reportsList');
    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 40px; color:#666;">No feedback or reports received yet.</p>';
        return;
    }

    container.innerHTML = '';

    list.forEach(item => {
        const isReport = item.entryType === 'report';
        const card = document.createElement('div');
        card.className = 'report-card';

        // Report-na red border, Feedback-na green/orange border
        const borderColor = isReport ? '#e53935' : (item.rating >= 4 ? '#2e7d32' : '#f59e0b');

        card.style = `
            background: white; 
            padding: 20px; 
            border-radius: 12px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border-left: 6px solid ${borderColor};
            margin-bottom: 20px;
            position: relative;
        `;

        // Entry Badge (Feedback vs Complaint)
        const badgeHtml = isReport ?
            `<span style="background:#ffebee; color:#c62828; padding:3px 8px; border-radius:4px; font-size:0.7em; font-weight:bold; margin-left:10px;">COMPLAINT</span>` :
            `<span style="background:#e8f5e9; color:#2e7d32; padding:3px 8px; border-radius:4px; font-size:0.7em; font-weight:bold; margin-left:10px;">FEEDBACK</span>`;

        // Stars handle
        let stars = '';
        if (!isReport) {
            for (let i = 1; i <= 5; i++) stars += i <= item.rating ? '⭐' : '☆';
        } else {
            stars = `<span style="color:#e53935;"><i class="fas fa-exclamation-triangle"></i> ${item.issue_type || 'Issue'}</span>`;
        }

        const title = isReport ? (item.subject || 'Complaint Report') : (item.username || 'Anonymous User');
        const content = isReport ? item.description : (item.comments || 'No comments left.');
        const subTitle = isReport ? `By ${item.username || 'User'} | Order: ${item.order_id || 'N/A'}` : (item.email || '');

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <div>
                    <h4 style="margin:0; color:#1b5e20; display:flex; align-items:center;">
                        ${title} ${badgeHtml}
                    </h4>
                    <small style="color:#666;">${subTitle}</small>
                </div>
                <div style="font-size: 1rem;">${stars}</div>
            </div>
            <p style="margin:10px 0; font-size:0.95em; color:#333; line-height:1.5;">
                "${content}"
            </p>
            <div style="text-align:right; border-top:1px solid #f0f0f0; padding-top:10px; margin-top:10px;">
                <small style="color:#999; font-size:0.8em;">
                    <i class="far fa-clock"></i> ${new Date(item.created_at).toLocaleString()}
                </small>
            </div>
        `;
        container.appendChild(card);
    });
}
