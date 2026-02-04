/**
 * Seller Dashboard JavaScript
 * Handles seller statistics, product management, and order processing
 */

document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication and role
    if (!requireAuth()) return;
    if (!requireSeller()) return;

    // Initial Load
    try {
        await Promise.all([
            loadSellerProfile().catch(e => console.error('Profile fail:', e)),
            loadSellerStats().catch(e => console.error('Stats fail:', e)),
            loadSellerOrders().catch(e => console.error('Orders fail:', e)),
            loadSellerProducts().catch(e => console.error('Products fail:', e)),
            loadSellerReports().catch(e => console.error('Reports fail:', e))
        ]);

        setupEventListeners();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Don't show full error if it's just one section
    }
});

let currentEditingProductId = null;

/**
 * Load seller profile info
 */
async function loadSellerProfile() {
    const user = getUser();
    if (user) {
        setText('#sellerName', user.username);
        setText('#storeName', `${user.username}'s Store`); // Or address user.store_name if available

        const emailEl = document.querySelector('.seller-email');
        if (emailEl) emailEl.innerHTML = `<i class="fas fa-envelope"></i> ${user.email}`;

        const phoneEl = document.querySelector('.seller-phone');
        if (phoneEl) phoneEl.innerHTML = `<i class="fas fa-phone"></i> ${user.phone}`;

        setText('#sellerAddress', user.address || 'Address not provided');
    }
}

/**
 * Load seller statistics (Products, Orders, Revenue)
 */
async function loadSellerStats() {
    // Fetch my products to count
    const products = await apiGet(API_CONFIG.PRODUCTS.MY_PRODUCTS);
    const productCount = products.length;

    // Fetch seller orders
    const orders = await apiGet(API_CONFIG.ORDERS.SELLER_ORDERS);
    const orderCount = orders.length;

    // Calculate revenue
    const revenue = orders.reduce((sum, order) => {
        // Simple logic: Sum of all items in the order that belong to this seller
        // The API returns grouped orders, we need to sum item prices * quantity for this seller's products
        // For simplicity in V1, we'll take the total from the order object provided by backend, 
        // assuming backend filters appropriately or we process it here.
        // Looking at backend code: /orders/seller/orders returns list where items are included.
        // We need to iterate items to be precise, or just use order total (simplify)
        // Backend text SQL query returns grouped orders.
        const orderTotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        return sum + orderTotal;
    }, 0);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    // Update UI
    setText('.stat-card:nth-child(1) .stat-number', orderCount); // Total Orders
    setText('.stat-card:nth-child(2) .stat-number', pendingOrders); // Pending
    setText('.stat-card:nth-child(3) .stat-number', formatPrice(revenue)); // Revenue
    setText('.stat-card:nth-child(4) .stat-number', productCount); // Products
}

/**
 * Load and display seller orders
 */
async function loadSellerOrders() {
    const orders = await apiGet(API_CONFIG.ORDERS.SELLER_ORDERS);
    const tbody = document.getElementById('ordersTableBody');

    if (!tbody) return;
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No orders found</td></tr>';
        return;
    }

    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.className = 'order-row';
        tr.dataset.status = order.status;

        // Product names summary
        const productNames = order.items.map(i => i.product_name).join(', ');
        const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
        const orderTotal = order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

        tr.innerHTML = `
            <td class="order-id">#ORD-${order.order_id}</td>
            <td>
                <div class="customer-info">
                    <i class="fas fa-user-circle"></i>
                    <span>${order.customer_name || 'Customer'}</span>
                </div>
            </td>
            <td title="${productNames}">${truncateText(productNames, 20)}</td>
            <td>${totalItems} items</td>
            <td class="amount">${formatPrice(orderTotal)}</td>
            <td>${formatDate(order.order_date)}</td>
            <td><span class="status-badge ${order.status}">${capitalize(order.status)}</span></td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button class="action-btn view" title="View" onclick="viewOrderDetails(${order.order_id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${getActionButtons(order)}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Get action buttons based on status
 */
function getActionButtons(order) {
    const id = order.order_id;
    if (order.status === 'pending') {
        return `<button class="action-btn process" title="Process" onclick="updateStatus(${id}, 'processing')"><i class="fas fa-check"></i></button>`;
    } else if (order.status === 'processing') {
        return `<button class="action-btn ship" title="Ship" onclick="updateStatus(${id}, 'shipped')"><i class="fas fa-shipping-fast"></i></button>`;
    } else if (order.status === 'shipped') {
        return `<button class="action-btn" title="Mark Delivered" onclick="updateStatus(${id}, 'delivered')" style="background-color: #4caf50; color: white;"><i class="fas fa-box-open"></i></button>`;
    }
    return '';
}

/**
 * Load and display reports from buyers
 */
async function loadSellerReports() {
    const reportsList = document.getElementById('reportsList');
    if (!reportsList) return;

    try {
        console.log('Fetching reports from:', API_CONFIG.REPORTS.SELLER);
        const reports = await apiGet(API_CONFIG.REPORTS.SELLER);
        console.log('Fetched reports:', reports);
        reportsList.innerHTML = '';

        if (reports.length === 0) {
            reportsList.innerHTML = `
                <div style="text-align: center; padding: 30px; background: #fff9f8; border-radius: 10px; border: 1px dashed #ffa4a2;">
                    <p style="color: #666;">No buyer reports found. Great job!</p>
                </div>
            `;
            return;
        }

        reports.forEach(report => {
            if (report.status === 'resolved') return; // Hide resolved for now

            const item = document.createElement('div');
            item.className = 'report-item';
            item.dataset.subject = report.subject.toLowerCase();
            item.dataset.desc = report.description.toLowerCase();

            item.innerHTML = `
                <div class="report-header">
                    <h4><i class="fas fa-exclamation-circle"></i> ${report.issue_type.toUpperCase()}</h4>
                    <span class="report-date">${formatDate(report.created_at)}</span>
                </div>
                <div class="report-body">
                    <h3>${report.subject}</h3>
                    <p>${report.description}</p>
                </div>
                <div class="report-footer">
                    <div class="report-meta">
                        <span><i class="fas fa-user"></i> Reported by: <strong>${report.username}</strong></span>
                        ${report.order_id ? `<span style="margin-left: 20px;"><i class="fas fa-receipt"></i> Order: <strong>${report.order_id}</strong></span>` : ''}
                    </div>
                    <button class="btn-resolve" onclick="resolveReport(${report.id})">Mark Resolved</button>
                </div>
            `;
            reportsList.appendChild(item);
        });

    } catch (err) {
        console.error('Error loading reports:', err);
        reportsList.innerHTML = '<p class="error">Failed to load buyer reports.</p>';
    }
}

/**
 * Mark a report as resolved
 */
async function resolveReport(reportId) {
    if (!confirm('Mark this issue as resolved?')) return;

    try {
        const baseUrl = API_CONFIG.REPORTS.BASE;
        const endpoint = baseUrl.endsWith('/') ? `${baseUrl}${reportId}/status?status=resolved` : `${baseUrl}/${reportId}/status?status=resolved`;
        await apiPut(endpoint, {});
        showSuccess('Report marked as resolved');
        await loadSellerReports();
    } catch (err) {
        alert('Failed to update report status');
    }
}

/**
 * Load and display seller's listed products
 */
async function loadSellerProducts() {
    const productsGrid = document.getElementById('sellerProductsGrid');
    if (!productsGrid) return;

    try {
        const products = await apiGet(API_CONFIG.PRODUCTS.MY_PRODUCTS);
        productsGrid.innerHTML = '';

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px;">
                    <p>You haven't listed any products yet.</p>
                    <button class="btn-add-product" style="margin: 20px auto;" onclick="window.location.href='product_adding_page.html'">List Your First Product</button>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'seller-product-card';

            const isLowStock = product.stock_quantity < 10;
            const imageUrl = product.image_url || '../assets/images/logoooo.png';

            card.innerHTML = `
                <div class="product-meta">
                    <img src="${imageUrl}" alt="${product.name}">
                    <div class="product-info-mini">
                        <h4>${product.name}</h4>
                        <p>${formatPrice(product.price)}</p>
                    </div>
                </div>
                <div class="stock-status-box">
                    <div>
                        <span class="stock-label">Current Stock</span>
                        <span class="stock-count ${isLowStock ? 'low' : ''}">${product.stock_quantity}</span>
                    </div>
                    <button class="btn-update-stock" onclick="openStockModal(${product.id}, '${product.name}', ${product.stock_quantity})">
                        <i class="fas fa-plus"></i> Add Stock
                    </button>
                </div>
                <div style="display: flex; gap: 10px; margin-top: auto;">
                    <a href="product.html?id=${product.id}" class="action-btn view" style="flex: 1; text-decoration: none; display: flex; align-items: center; justify-content: center;"><i class="fas fa-external-link-alt" style="margin-right: 5px;"></i> View</a>
                    <button class="action-btn delete" onclick="deleteProduct(${product.id}, '${product.name}')" style="background-color: #ff5252; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; flex: 1;">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            `;
            productsGrid.appendChild(card);
        });

    } catch (err) {
        console.error('Error loading seller products:', err);
        productsGrid.innerHTML = '<p class="error">Failed to load inventory.</p>';
    }
}

/**
 * Open Stock Update Modal
 */
function openStockModal(id, name, currentStock) {
    currentEditingProductId = id;
    const modal = document.getElementById('stockModal');
    const nameEl = document.getElementById('modalProductName');
    const input = document.getElementById('newStockInput');

    if (modal && nameEl && input) {
        nameEl.textContent = name;
        input.value = currentStock;
        modal.style.display = 'flex';
        input.focus();
    }
}

/**
 * Close Stock Update Modal
 */
function closeStockModal() {
    const modal = document.getElementById('stockModal');
    if (modal) modal.style.display = 'none';
    currentEditingProductId = null;
}

/**
 * Save Stock Update
 */
async function saveStockUpdate() {
    if (!currentEditingProductId) return;

    const input = document.getElementById('newStockInput');
    const newStock = parseInt(input.value);

    if (isNaN(newStock) || newStock < 0) {
        alert('Please enter a valid stock quantity.');
        return;
    }

    const btn = document.getElementById('saveStockBtn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const baseUrl = API_CONFIG.PRODUCTS.BASE;
        const endpoint = baseUrl.endsWith('/') ? `${baseUrl}${currentEditingProductId}` : `${baseUrl}/${currentEditingProductId}`;
        await apiPut(endpoint, {
            stock_quantity: newStock
        });

        showSuccess('Stock updated successfully');
        closeStockModal();
        await loadSellerProducts(); // Refresh grid
        await loadSellerStats(); // Refresh stats count
    } catch (error) {
        console.error('Stock update failed:', error);
        alert(error.message || 'Failed to update stock');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/**
 * Setup event listeners for dashboard actions
 */
function setupEventListeners() {
    // Save Stock Button
    const saveStockBtn = document.getElementById('saveStockBtn');
    if (saveStockBtn) {
        saveStockBtn.addEventListener('click', saveStockUpdate);
    }

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('stockModal');
        if (e.target === modal) closeStockModal();
    });

    // Make functions global for onclick attrs
    window.openStockModal = openStockModal;
    window.closeStockModal = closeStockModal;
    window.resolveReport = resolveReport;

    // Report Search
    const reportSearch = document.getElementById('reportSearch');
    if (reportSearch) {
        reportSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.report-item').forEach(item => {
                const text = item.dataset.subject + " " + item.dataset.desc;
                item.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    // Search
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.order-row').forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    // Filter
    const filterSelect = document.getElementById('orderFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const status = e.target.value;
            document.querySelectorAll('.order-row').forEach(row => {
                if (status === 'all') row.style.display = '';
                else row.style.display = row.dataset.status === status ? '' : 'none';
            });
        });
    }

    // Seller Avatar Upload
    const avatarBtn = document.getElementById('sellerAvatarBtn');
    const avatarInput = document.getElementById('sellerAvatarInput');
    const sellerAvatarImg = document.getElementById('sellerAvatar');

    if (avatarBtn && avatarInput) {
        avatarBtn.addEventListener('click', () => avatarInput.click());

        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            const originalBtnContent = avatarBtn.innerHTML;
            avatarBtn.disabled = true;
            avatarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            try {
                const formData = new FormData();
                formData.append('file', file);

                console.log('Uploading seller avatar...');
                const result = await apiPostFormData(API_CONFIG.UPLOAD.IMAGE, formData);

                if (result && result.url) {
                    sellerAvatarImg.src = result.url;
                    showSuccess('Store profile picture updated!');
                }
            } catch (error) {
                console.error('Seller avatar upload failed:', error);
                alert(error.message || 'Failed to upload image');
            } finally {
                avatarBtn.disabled = false;
                avatarBtn.innerHTML = originalBtnContent;
                avatarInput.value = '';
            }
        });
    }

    // Quick Actions - Add Product
    // We need to find the "Add New Product" button in the Quick Actions section
    // It's the first button in .actions-grid
    const addProductBtn = document.querySelector('.action-card:first-child');
    if (addProductBtn) {
        addProductBtn.onclick = () => window.location.href = 'product_adding_page.html';
    }
}

/**
 * Update order status
 */
async function updateStatus(orderId, newStatus) {
    if (!confirm(`Update order #${orderId} to ${newStatus}?`)) return;

    try {
        const baseUrl = API_CONFIG.ORDERS.BASE;
        const endpoint = baseUrl.endsWith('/') ? `${baseUrl}${orderId}/status` : `${baseUrl}/${orderId}/status`;
        await apiPut(endpoint, { status: newStatus });
        showSuccess(`Order updated to ${newStatus}`);
        await loadSellerOrders(); // Refresh table
        await loadSellerStats(); // Refresh stats (pending count might change)
    } catch (error) {
        console.error('Error updating status:', error);
        alert(error.message || 'Failed to update status');
    }
}

/**
 * View order details (Simple alert for now, or modal if we had one)
 */
async function viewOrderDetails(orderId) {
    try {
        const baseUrl = API_CONFIG.ORDERS.BASE;
        const endpoint = baseUrl.endsWith('/') ? `${baseUrl}${orderId}` : `${baseUrl}/${orderId}`;
        const order = await apiGet(endpoint);
        const itemsList = order.items.map(i => `- ${i.product_name} x${i.quantity} (${formatPrice(i.price)})`).join('\n');

        alert(`Order #${order.order_id} Details:\n\nCustomer: ${order.customer_name || 'N/A'}\nStatus: ${order.status}\nTotal: ${formatPrice(order.total_amount)}\n\nItems:\n${itemsList}`);
    } catch (error) {
        alert('Could not fetch details');
    }
}

// Helpers
function setText(selector, text) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Delete a product
 */
async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) return;

    try {
        const baseUrl = API_CONFIG.PRODUCTS.BASE;
        const endpoint = baseUrl.endsWith('/') ? `${baseUrl}${productId}` : `${baseUrl}/${productId}`;
        await apiDelete(endpoint);
        showSuccess(`Product "${productName}" deleted successfully`);
        await loadSellerProducts(); // Refresh list
        await loadSellerStats(); // Refresh stats
    } catch (error) {
        console.error('Delete product failed:', error);
        alert(error.message || 'Failed to delete product');
    }
}

// Global exposure
window.updateStatus = updateStatus;
window.viewOrderDetails = viewOrderDetails;
window.viewOrder = viewOrderDetails; // Alias for existing HTML onclicks if any
window.deleteProduct = deleteProduct;
