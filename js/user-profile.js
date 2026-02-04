/**
 * User Profile JavaScript
 * Handles fetching and updating user profile information
 */

document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication
    if (!requireAuth()) return;

    // UI Elements
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // Check auth status regularly
    updateAuthUI();

    try {
        await loadUserProfile();
        await loadUserStats();
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile data');
    }

    // Event Listeners
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            viewMode.style.display = 'none';
            editMode.style.display = 'block';
            populateEditForm();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            editMode.style.display = 'none';
            viewMode.style.display = 'block';
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await saveUserProfile();
        });
    }

    // Modal Listeners
    const totalOrdersStat = document.getElementById('totalOrdersStat');
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');

    const reviewsGivenStat = document.getElementById('reviewsGivenStat');
    const reportsModal = document.getElementById('reportsModal');
    const closeReportsModal = document.getElementById('closeReportsModal');

    if (totalOrdersStat) {
        totalOrdersStat.addEventListener('click', () => {
            showOrdersHistory();
        });
    }

    if (closeOrderModal) {
        closeOrderModal.addEventListener('click', () => {
            orderModal.style.display = 'none';
        });
    }

    if (reviewsGivenStat) {
        reviewsGivenStat.addEventListener('click', () => {
            showReportsHistory();
        });
    }

    if (closeReportsModal) {
        closeReportsModal.addEventListener('click', () => {
            reportsModal.style.display = 'none';
        });
    }

    // Avatar Upload Listeners
    const avatarBtn = document.getElementById('avatarUploadBtn');
    const avatarInput = document.getElementById('avatarInput');
    const userAvatarImg = document.getElementById('userAvatar');

    if (avatarBtn && avatarInput) {
        avatarBtn.addEventListener('click', () => {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate type
            if (!file.type.startsWith('image/')) {
                showError('Please select a valid image file');
                return;
            }

            const originalBtnContent = avatarBtn.innerHTML;
            avatarBtn.disabled = true;
            avatarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            try {
                const formData = new FormData();
                formData.append('file', file);

                console.log('Uploading avatar...');
                const result = await apiPostFormData(API_CONFIG.UPLOAD.IMAGE, formData);

                if (result && result.url) {
                    userAvatarImg.src = result.url;
                    showSuccess('Profile picture uploaded successfully!');

                    // Note: We don't have a profile_image field in the User model yet,
                    // so we can't save this persistent link to the user record.
                    // For now, we just update the UI.
                }
            } catch (error) {
                console.error('Avatar upload failed:', error);
                showError(error.message || 'Failed to upload image');
            } finally {
                avatarBtn.disabled = false;
                avatarBtn.innerHTML = originalBtnContent;
                avatarInput.value = ''; // Reset input
            }
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
        }
        if (e.target === reportsModal) {
            reportsModal.style.display = 'none';
        }
    });
});

let currentUserData = null;

/**
 * Load user profile from API
 */
async function loadUserProfile() {
    const user = await apiGet(API_CONFIG.AUTH.ME);
    currentUserData = user;

    // Header Info
    setText('#displayName', user.username);
    setText('#displayEmail', user.email);

    // View Mode Info
    setText('#viewFullName', user.username);
    setText('#viewEmail', user.email);
    setText('#viewPhone', user.phone || 'Not provided');
    setText('#viewAddress', user.address || 'Not provided');

    // Hide fields not supported by backend for now to avoid confusion
    // City, State, Postal, DOB are not in User model
    hideElements(['#viewCity', '#viewState', '#viewPostal', '#viewDob']);
    hideParents(['#viewCity', '#viewState', '#viewPostal', '#viewDob']); // Hide parent .info-item
}

/**
 * Load user stats
 */
async function loadUserStats() {
    if (isBuyer()) {
        try {
            // Fetch Orders
            const orders = await apiGet(API_CONFIG.ORDERS.MY_ORDERS);
            const orderCount = orders.length;

            const orderCountText = document.getElementById('orderCountText');
            if (orderCountText) orderCountText.textContent = orderCount;

            window.userOrders = orders;

            // Fetch Reports/Feedback history
            const reports = await apiGet(API_CONFIG.REPORTS.MY_REPORTS);

            const reportsCountText = document.getElementById('reportsCountText');
            if (reportsCountText) reportsCountText.textContent = reports.length;

            window.userReports = reports;

        } catch (e) {
            console.error('Stats error:', e);
        }
    }
}

/**
 * Show reports/feedback history in modal
 */
async function showReportsHistory() {
    const modal = document.getElementById('reportsModal');
    const listContainer = document.getElementById('reportsListContainer');

    if (!modal || !listContainer) return;

    modal.style.display = 'flex';
    listContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;"><i class="fas fa-spinner fa-spin"></i> Fetching your feedback...</p>';

    try {
        const reports = window.userReports || await apiGet(API_CONFIG.REPORTS.MY_REPORTS);

        if (!reports || reports.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No feedback or reports found. <br><a href="feedback.html" style="color: #2e7d32; font-weight: bold;">Share your thoughts!</a></p>';
            return;
        }

        renderReportsItems(listContainer, reports);
    } catch (error) {
        listContainer.innerHTML = '<p style="text-align: center; color: red; padding: 20px;">Failed to load feedback history.</p>';
    }
}

/**
 * Render report items 
 */
function renderReportsItems(container, reports) {
    container.innerHTML = '';

    // Sort by date desc
    reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    reports.forEach(report => {
        const card = document.createElement('div');
        card.className = 'order-item-card'; // Reuse styling

        const date = new Date(report.created_at).toLocaleDateString();
        const isResolved = report.status === 'resolved';

        card.innerHTML = `
            <div style="width: 50px; height: 50px; border-radius: 50%; background: ${isResolved ? '#e8f5e9' : '#fff3e0'}; display: flex; align-items: center; justify-content: center; color: ${isResolved ? '#2e7d32' : '#ef6c00'}; font-size: 1.2rem;">
                <i class="fas ${report.issue_type.includes('Feedback') ? 'fa-comment-alt' : 'fa-exclamation-triangle'}"></i>
            </div>
            <div class="order-item-details">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h4 style="margin: 0;">${report.subject}</h4>
                    <span style="font-size: 0.7em; padding: 3px 8px; border-radius: 10px; background: ${isResolved ? '#4caf50' : '#ffa000'}; color: white; text-transform: uppercase;">${report.status}</span>
                </div>
                <p style="margin-top: 8px; color: #444; font-style: italic;">"${report.description}"</p>
                <p style="font-size: 0.8em; color: #999; margin-top: 10px;">Type: ${report.issue_type} | Submitted on: ${date}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Show orders history in modal
 */
async function showOrdersHistory() {
    const modal = document.getElementById('orderModal');
    const listContainer = document.getElementById('orderItemsList');

    if (!modal || !listContainer) return;

    modal.style.display = 'flex';
    listContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;"><i class="fas fa-spinner fa-spin"></i> Fetching your items...</p>';

    try {
        // Use cached orders or fetch
        const orders = window.userOrders || await apiGet(API_CONFIG.ORDERS.MY_ORDERS);

        if (!orders || orders.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No orders found yet. <br><a href="products_page.html" style="color: #2e7d32; font-weight: bold;">Start shopping!</a></p>';
            return;
        }

        renderOrderItems(listContainer, orders);
    } catch (error) {
        listContainer.innerHTML = '<p style="text-align: center; color: red; padding: 20px;">Failed to load order history.</p>';
    }
}

/**
 * Render order items from multiple orders
 */
function renderOrderItems(container, orders) {
    container.innerHTML = '';

    // Flatten all items from all orders
    const allItems = [];
    orders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                allItems.push({
                    ...item,
                    order_id: order.order_id || order.id,
                    order_date: order.order_date
                });
            });
        }
    });

    if (allItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">You are tracking orders, but no items were found.</p>';
        return;
    }

    // Sort by date desc
    allItems.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

    allItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'order-item-card';

        const imageUrl = item.image_url || '../assets/images/logoooo.png';
        const formattedPrice = `₹${parseFloat(item.price).toFixed(2)}`;
        const date = new Date(item.order_date).toLocaleDateString();

        card.innerHTML = `
            <img src="${imageUrl}" alt="${item.product_name}" class="order-item-img">
            <div class="order-item-details">
                <h4>${item.product_name}</h4>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                <p><strong>Price:</strong> ${formattedPrice}</p>
                <p><strong>Order ID:</strong> #${item.order_id}</p>
                <p style="font-size: 0.8em; color: #999; margin-top: 5px;">Ordered on: ${date}</p>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; padding-left: 10px;">
                <a href="Track.html?id=${item.order_id}" style="color: #2e7d32; font-size: 1.2rem;" title="Track this order">
                    <i class="fas fa-shipping-fast"></i>
                </a>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Populate edit form
 */
function populateEditForm() {
    if (!currentUserData) return;

    setValue('#editFullName', currentUserData.username);
    setValue('#editEmail', currentUserData.email);
    setValue('#editPhone', currentUserData.phone);
    setValue('#editAddress', currentUserData.address);

    // Hide unsupported inputs
    hideParents(['#editCity', '#editState', '#editPostal', '#editDob', '#editNewsletter', '#editLanguage', '#editCurrency']);
}

/**
 * Save user profile
 */
async function saveUserProfile() {
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        const updatedData = {
            username: document.getElementById('editFullName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            address: document.getElementById('editAddress').value
        };

        // Call API to update (PUT /users/me handles partial updates via UserUpdate schema)
        // UserUpdate schema: username, email, password, phone, address
        await apiPut(API_CONFIG.AUTH.ME, updatedData);

        // Refresh data
        await loadUserProfile();

        // Switch back to view mode
        document.getElementById('editMode').style.display = 'none';
        document.getElementById('viewMode').style.display = 'block';

        showSuccess('Profile updated successfully!');

    } catch (error) {
        console.error('Error saving profile:', error);
        alert(error.message || 'Failed to update profile');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

// Helpers
function setText(selector, text) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
}

function setValue(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.value = value || '';
}

function hideElements(selectors) {
    selectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.style.display = 'none';
    });
}

function hideParents(selectors) {
    selectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el && el.closest('.info-item, .form-group')) {
            el.closest('.info-item, .form-group').style.display = 'none';
        }
    });
}
