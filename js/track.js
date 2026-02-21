// ===========================================
// TRACK.JS - Order Tracking Page Logic
// ===========================================

async function initTrackPage() {
    console.log('📦 Initializing track page...');

    // Extract Order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        const summaryContainer = document.querySelector('.order-summary');
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; width: 100%;">
                    <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                    <p style="color: #666; font-size: 1.1rem;">No order ID provided.</p>
                    <p style="color: #999; margin-bottom: 20px;">Please select an order from your profile to track.</p>
                    <a href="user_details.html" style="display: inline-block; padding: 10px 25px; background: #1b5e20; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">Go to Profile</a>
                </div>
            `;
        }
        return;
    }

    try {
        if (typeof showLoading === 'function') showLoading('Fetching tracking details...');

        // Fetch order details
        const order = await getOrderById(orderId);

        if (!order) {
            if (typeof showModal === 'function') showModal('Order not found', 'error');
            return;
        }

        // Special handling for cancelled status
        if (order.status && order.status.toLowerCase() === 'cancelled') {
            const timeline = document.querySelector('.tracking-timeline');
            if (timeline) {
                timeline.innerHTML = `
                    <div style="background: #fff5f5; border: 2px solid #feb2b2; padding: 30px; border-radius: 15px; text-align: center; margin-top: 20px;">
                        <i class="fas fa-times-circle" style="font-size: 4rem; color: #f56565; margin-bottom: 20px;"></i>
                        <h3 style="color: #c53030; margin-bottom: 10px;">ORDER CANCELLED</h3>
                        <p style="color: #742a2a;">This order has been cancelled. For any refund related queries, please contact our support team.</p>
                    </div>
                `;
            }
        }

        // Display Order Summary
        displayOrderSummary(order);

        // Update Timeline (Only if not cancelled)
        if (order.status && order.status.toLowerCase() !== 'cancelled') {
            updateTimeline(order.status);
        }

        if (typeof hideLoading === 'function') hideLoading();

    } catch (error) {
        if (typeof hideLoading === 'function') hideLoading();
        console.error('Error loading tracking page:', error);
        const summaryContainer = document.querySelector('.order-summary');
        if (summaryContainer) {
            summaryContainer.innerHTML = '<p style="color: red; text-align: center; width: 100%;">Failed to load order tracking info. Please try again later.</p>';
        }
    }
}

function displayOrderSummary(order) {
    const summaryContainer = document.querySelector('.order-summary');
    if (!summaryContainer) return;

    // Get product info
    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
    const imageUrl = firstItem && firstItem.image_url ? firstItem.image_url : '../assets/images/placeholder.png';
    const productName = firstItem ? firstItem.product_name : `Order #${order.order_id || order.id}`;
    const totalAmount = order.total_amount || order.total || 0;

    summaryContainer.innerHTML = `
        <div style="display: flex; align-items: center; width: 100%;">
            <img src="${imageUrl}" class="item-image" alt="Product" onerror="this.src='../assets/images/placeholder.png'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; margin-right: 20px; border: 1px solid #eee;">
            <div class="item-info">
                <h3 style="margin: 0 0 8px 0; color: #1b5e20;">${productName}</h3>
                <p style="margin: 0 0 5px 0; color: #666;">Order ID: <strong>#${order.order_id || order.id}</strong></p>
                <p style="margin: 0 0 8px 0; color: #666;">Placed on: ${new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
                <div class="price" style="font-size: 1.4rem; color: #2e7d32; font-weight: 800;">${formatPrice(totalAmount)}</div>
            </div>
        </div>
    `;
}

function updateTimeline(status) {
    const steps = document.querySelectorAll('.step');
    if (!steps.length) return;

    const statusStr = status ? status.toLowerCase() : 'pending';

    // Status mapping to step index (1-based)
    let currentStep = 1;
    if (statusStr === 'confirmed') currentStep = 1;
    else if (statusStr === 'processing') currentStep = 2;
    else if (statusStr === 'shipped') currentStep = 3;
    else if (statusStr === 'near by') currentStep = 4;
    else if (statusStr === 'delivery zone') currentStep = 5;
    else if (statusStr === 'completed' || statusStr === 'delivered') currentStep = 6;
    else if (statusStr === 'pending') currentStep = 0; // Show none active yet

    steps.forEach((step, index) => {
        const stepNum = index + 1;

        // Clear classes
        step.classList.remove('step-active', 'step-current');

        if (stepNum < currentStep) {
            step.classList.add('step-active');
        } else if (stepNum === currentStep) {
            step.classList.add('step-current');
        }
    });
}

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrackPage);
} else {
    initTrackPage();
}
