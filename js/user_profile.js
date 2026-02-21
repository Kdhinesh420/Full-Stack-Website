// ===================================================
// USER_PROFILE.JS - User Profile Page JavaScript
// ===================================================
// User profile display, edit, and history management

// ===========================================
// PAGE INITIALIZATION
// ===========================================

async function initUserProfilePage() {
    console.log('👤 Initializing user profile page...');

    // Login check
    if (!requireAuth()) {
        return;
    }

    try {
        showLoading('Loading profile data...');

        // 1. User profile load பண்ணுறோம்
        const profile = await getUserProfile();
        displayUserProfile(profile);

        // 2. Stats update பண்ணுறோம்
        await updateProfileStats();

        // 3. Recent orders update பண்ணுறோம்
        await updateRecentOrdersSection();

        // 4. Event listeners setup பண்ணுறோம்
        setupEventListeners();

        hideLoading();
        console.log('✅ User profile initialized');

    } catch (error) {
        hideLoading();
        console.error('Error initializing user profile:', error);
        showModal('Failed to load profile details', 'error');
    }
}

// ===========================================
// DATA DISPLAY
// ===========================================

/**
 * displayUserProfile - Profile data-வை screen-ல காட்டும்
 */
function displayUserProfile(profile) {
    if (!profile) return;

    // --- Header Section ---
    setTextContent('displayName', profile.username);
    setTextContent('displayEmail', profile.email);

    // --- View Mode ---
    setTextContent('viewFullName', profile.username);
    setTextContent('viewEmail', profile.email);
    setTextContent('viewPhone', profile.phone || 'Not provided');
    setTextContent('viewAddress', profile.address || 'Not provided');

    // --- Edit Mode (Form Pre-fill) ---
    setInputValue('editFullName', profile.username);
    setInputValue('editEmail', profile.email);
    setInputValue('editPhone', profile.phone || '');
    setInputValue('editAddress', profile.address || '');

    // Profile role-க்கு ஏத்த மாதிரி badges/UI காட்டலாம்
    const badgesContainer = document.querySelector('.profile-badges');
    if (badgesContainer) {
        const roleIcon = profile.role === 'seller' ? 'fas fa-store' : 'fas fa-user-tag';
        const roleName = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
        badgesContainer.innerHTML = `
            <span class="badge"><i class="${roleIcon}"></i> ${roleName}</span>
            <span class="badge"><i class="fas fa-calendar-alt"></i> Joined ${formatDate(profile.created_at).split(',')[0]}</span>
        `;
    }
}

/**
 * updateProfileStats - Dashboard stats update பண்ணும்
 */
async function updateProfileStats() {
    try {
        // Order count
        const orders = await getUserOrders();
        setTextContent('orderCountText', orders.length);

        // Reports/Feedback count
        const reports = await getUserReports();
        setTextContent('reportsCountText', reports.length);

    } catch (error) {
        console.warn('Failed to load stats:', error);
    }
}

// ===========================================
// EVENT LISTENERS & ACTIONS
// ===========================================

function setupEventListeners() {
    // Edit & Cancel Buttons
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');

    if (editBtn) editBtn.onclick = toggleEditMode;
    if (cancelBtn) cancelBtn.onclick = toggleEditMode;
    if (saveBtn) saveBtn.onclick = handleProfileUpdate;

    // Stat Clicks (Modals)
    const totalOrdersStat = document.getElementById('totalOrdersStat');
    const reviewsGivenStat = document.getElementById('reviewsGivenStat');
    const closeOrderModal = document.getElementById('closeOrderModal');
    const closeReportsModal = document.getElementById('closeReportsModal');

    if (totalOrdersStat) totalOrdersStat.onclick = openOrdersModal;
    if (reviewsGivenStat) reviewsGivenStat.onclick = openReportsModal;

    if (closeOrderModal) closeOrderModal.onclick = () => closeModal('orderModal');
    if (closeReportsModal) closeReportsModal.onclick = () => closeModal('reportsModal');

    // Form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.onsubmit = (e) => {
            e.preventDefault();
            handleProfileUpdate();
        };
    }
}

/**
 * toggleEditMode - View and Edit modes toggle பண்ணும்
 */
function toggleEditMode() {
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');

    if (viewMode.style.display === 'none') {
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
    } else {
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
    }
}

/**
 * handleProfileUpdate - Profile changes save பண்ணும்
 */
async function handleProfileUpdate() {
    try {
        const updatedData = {
            username: document.getElementById('editFullName').value.trim(),
            email: document.getElementById('editEmail').value.trim(),
            phone: document.getElementById('editPhone').value.trim(),
            address: document.getElementById('editAddress').value.trim()
        };

        // Simple Validation
        if (!updatedData.username || !updatedData.email) {
            showModal('Username and Email are required', 'warning');
            return;
        }

        showLoading('Updating profile...');

        // API call
        await updateUserProfile(updatedData);

        // Data refresh பண்ணுறோம்
        const profile = await getUserProfile();
        displayUserProfile(profile);

        hideLoading();
        toggleEditMode(); // Back to view mode
        showModal('Profile updated successfully!', 'success');

    } catch (error) {
        hideLoading();
        console.error('Update failed:', error);
    }
}

// ===========================================
// MODAL FUNCTIONS
// ===========================================

async function openOrdersModal() {
    const modal = document.getElementById('orderModal');
    const container = document.getElementById('orderItemsList');

    if (!modal || !container) return;

    modal.style.display = 'flex';
    container.innerHTML = '<p style="text-align:center; padding:20px;">Loading order history...</p>';

    try {
        const orders = await getUserOrders();

        if (!orders || orders.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px;">No orders found.</p>';
            return;
        }

        container.innerHTML = '';
        orders.forEach(order => {
            const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
            const imageUrl = firstItem && firstItem.image_url ? firstItem.image_url : '../assets/images/placeholder.png';
            const productName = firstItem ? firstItem.product_name : `Order #${order.order_id || order.id}`;

            const card = document.createElement('div');
            card.className = 'order-item-card';
            card.innerHTML = `
                <img src="${imageUrl}" class="order-item-img" alt="Product Photo">
                <div class="order-item-details">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0; color:#1b5e20;">${productName}</h4>
                        <span style="color:#2e7d32; font-weight:bold;">${formatPrice(order.total_amount || order.total)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                        <p style="margin:0; font-size:0.85rem; color:#666;">ID: #${order.order_id || order.id}</p>
                        <span style="padding:2px 10px; background:${order.status === 'cancelled' ? '#fff5f5' : '#e8f5e9'}; color:${order.status === 'cancelled' ? '#c53030' : '#1b5e20'}; border-radius:12px; font-size:0.75rem; font-weight:bold; border:1px solid ${order.status === 'cancelled' ? '#feb2b2' : '#c8e6c9'};">
                            ${(order.status || 'pending').toUpperCase()}
                        </span>
                    </div>
                    
                    <a href="Track.html?id=${order.order_id || order.id}" style="text-decoration:none; display:block; margin-top:10px;">
                        <button style="width:100%; padding:8px; background:#1b5e20; color:white; border:none; border-radius:20px; cursor:pointer; font-weight:600; font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:8px;">
                            <i class="fas fa-truck"></i> TRACK ORDER
                        </button>
                    </a>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = '<p style="text-align:center; color:red; padding:20px;">Error loading orders.</p>';
    }
}

// ===========================================
// RECENT ORDERS SECTION
// ===========================================

async function updateRecentOrdersSection() {
    const container = document.getElementById('recentOrdersList');
    if (!container) return;

    try {
        const orders = await getUserOrders();

        if (!orders || orders.length === 0) {
            container.innerHTML = '<p style="color:#666; padding:20px; text-align:center;">No recent orders yet.</p>';
            return;
        }

        // Show only last 3 orders
        const recentOrders = orders.slice(0, 3);
        container.innerHTML = '';

        recentOrders.forEach(order => {
            const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
            const productName = firstItem ? firstItem.product_name : `Order #${order.order_id || order.id}`;
            const imageUrl = firstItem && firstItem.image_url ? firstItem.image_url : '../assets/images/placeholder.png';

            const orderCard = document.createElement('div');
            orderCard.className = 'mini-order-card';
            orderCard.innerHTML = `
                <img src="${imageUrl}" alt="Product">
                <div class="mini-order-info">
                    <h4>${productName}</h4>
                    <p>Amount: <strong>${formatPrice(order.total_amount || order.total)}</strong></p>
                </div>
                <a href="Track.html?id=${order.order_id || order.id}" class="mini-track-btn">Track</a>
            `;
            container.appendChild(orderCard);
        });

    } catch (error) {
        console.warn('Failed to load recent orders for page:', error);
    }
}

async function openReportsModal() {
    const modal = document.getElementById('reportsModal');
    const container = document.getElementById('reportsListContainer');

    if (!modal || !container) return;

    modal.style.display = 'flex';
    container.innerHTML = '<p style="text-align:center; padding:20px;">Loading reports...</p>';

    try {
        const reports = await getUserReports();

        if (!reports || reports.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px;">No reports or feedback found.</p>';
            return;
        }

        container.innerHTML = '';
        reports.forEach(report => {
            const card = document.createElement('div');
            card.className = 'order-item-card'; // Reuse same styling
            card.innerHTML = `
                <div class="order-item-details">
                    <div style="display:flex; justify-content:space-between;">
                        <h4>${report.subject}</h4>
                        <span style="color:#666; font-size:0.8rem;">${formatDate(report.created_at).split(',')[0]}</span>
                    </div>
                    <p>Type: <strong>${report.issue_type}</strong></p>
                    <p style="margin-top:8px; background:#f9f9f9; padding:8px; border-radius:4px;">${report.description}</p>
                    <p style="margin-top:5px; font-size:0.85rem;">Status: <span style="color:${report.status === 'resolved' ? 'green' : 'orange'}; font-weight:bold;">${report.status.toUpperCase()}</span></p>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = '<p style="text-align:center; color:red; padding:20px;">Error loading reports.</p>';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function setTextContent(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setInputValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserProfilePage);
} else {
    initUserProfilePage();
}

console.log('✅ User Profile Logic Loaded');
