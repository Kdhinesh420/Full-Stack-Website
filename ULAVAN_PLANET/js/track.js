/**
 * Track Order JavaScript
 * Handles fetching and displaying order tracking information
 */

document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication
    if (!requireAuth()) return;

    // UI Elements
    const orderSummary = document.querySelector('.order-summary');
    const timeline = document.querySelector('.tracking-timeline');
    const mainContent = document.querySelector('.main-content');

    // Update Auth UI
    updateAuthUI();

    // Get order ID from URL or fetch latest
    const urlParams = new URLSearchParams(window.location.search);
    let orderId = urlParams.get('id');

    try {
        // Always fetch all orders to provide the selector
        const orders = await apiGet(API_CONFIG.ORDERS.MY_ORDERS);

        if (!orders || orders.length === 0) {
            renderNoOrders();
            return;
        }

        let currentOrder;
        if (orderId) {
            // Find the specific order requested
            currentOrder = orders.find(o => (o.order_id || o.id) == orderId);

            // If not found in the list (unlikely but possible), fetch it separately
            if (!currentOrder) {
                currentOrder = await apiGet(`${API_CONFIG.ORDERS.BASE}/${orderId}`);
            }
        } else {
            // Default to the latest order
            currentOrder = orders[0];
            orderId = currentOrder.order_id || currentOrder.id;
        }

        if (currentOrder) {
            renderOrderTracking(currentOrder);
        }

        // If multiple orders, add a selector so user can switch
        if (orders.length > 1) {
            renderOrderSelector(orders);
        }
    } catch (error) {
        console.error('Error tracking order:', error);
        if (mainContent) {
            mainContent.innerHTML += `<p class="error-msg" style="color: red; margin-top: 20px;">Failed to load tracking info: ${error.message}</p>`;
        }
    }

    /**
     * Render Order Tracking UI
     */
    function renderOrderTracking(order) {
        if (!orderSummary || !timeline) return;

        // Clear previous
        orderSummary.innerHTML = '';

        // Show first item or plural if many
        const items = order.items || [];
        if (items.length > 0) {
            const item = items[0];
            const imageUrl = item.image_url || '../assets/images/logoooo.png';

            orderSummary.innerHTML = `
                <div class="item-image">
                    <img src="${imageUrl}" alt="${item.product_name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
                </div>
                <div class="item-info">
                    <h3>${item.product_name} ${items.length > 1 ? `(+${items.length - 1} more items)` : ''}</h3>
                    <p>Order ID: #${order.order_id || order.id} | Quantity: ${item.quantity}</p>
                    <p class="price">₹ ${parseFloat(order.total_amount).toFixed(2)}</p>
                    <p style="font-size: 0.8em; color: #888; margin-top: 5px;">Ordered on: ${new Date(order.order_date).toLocaleDateString()}</p>
                </div>
            `;
        } else {
            orderSummary.innerHTML = `<p>Order info found, but no items listed.</p>`;
        }

        // Update Timeline
        updateTimelineProgress(order.status);
    }

    /**
     * Set active/current states on timeline based on status
     */
    function updateTimelineProgress(status) {
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            step.classList.remove('step-active', 'step-current');
        });

        const statusMap = {
            'pending': 1,
            'processing': 2,
            'shipped': 3,
            'nearby': 4,
            'out_for_delivery': 5,
            'delivered': 6,
            'completed': 6,
            'cancelled': 0
        };

        const currentStepIndex = statusMap[status.toLowerCase()] || 1;

        if (currentStepIndex === 0) {
            // Handle cancelled
            const firstStep = steps[0];
            if (firstStep) {
                firstStep.querySelector('p').textContent = 'CANCELLED';
                firstStep.querySelector('p').style.color = 'red';
            }
            return;
        }

        steps.forEach((step, index) => {
            if (index + 1 < currentStepIndex) {
                step.classList.add('step-active');
            } else if (index + 1 === currentStepIndex) {
                step.classList.add('step-current');
            }
        });
    }

    /**
     * Render message when no orders exist
     */
    function renderNoOrders() {
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 50px 20px;">
                    <i class="fas fa-box-open" style="font-size: 4em; color: #ccc; margin-bottom: 20px; display: block;"></i>
                    <h2>No orders found</h2>
                    <p>It looks like you haven't placed any orders yet.</p>
                    <a href="products_page.html" style="display: inline-block; margin-top: 20px; padding: 10px 25px; background: #2e7d32; color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Start Shopping</a>
                </div>
            `;
        }
    }

    /**
     * Add a dropdown to select between multiple orders
     */
    function renderOrderSelector(orders) {
        // Remove existing selector if any
        const existing = document.getElementById('order-selector-container');
        if (existing) existing.remove();

        const selectorContainer = document.createElement('div');
        selectorContainer.id = 'order-selector-container';
        selectorContainer.style.margin = '30px 0';

        selectorContainer.innerHTML = `
            <h3 style="font-size: 1.1em; color: #1b5e20; margin-bottom: 15px; font-weight: 600;">
                <i class="fas fa-history"></i> Your Recent Orders
            </h3>
            <div class="order-nav-list" style="display: flex; gap: 15px; overflow-x: auto; padding: 10px 5px; scrollbar-width: thin;">
                ${orders.map(o => {
            const id = o.order_id || o.id;
            const isActive = orderId == id;
            const firstItem = (o.items && o.items.length > 0) ? o.items[0] : null;
            const imageUrl = (firstItem && firstItem.image_url) ? firstItem.image_url : '../assets/images/logoooo.png';
            const itemName = firstItem ? firstItem.product_name : 'Order #' + id;
            const date = new Date(o.order_date).toLocaleDateString();

            return `
                        <div class="mini-order-card" data-id="${id}" style="
                            flex: 0 0 160px;
                            background: white;
                            border: 2px solid ${isActive ? '#4caf50' : '#eee'};
                            border-radius: 12px;
                            padding: 10px;
                            cursor: pointer;
                            transition: all 0.3s;
                            box-shadow: ${isActive ? '0 4px 12px rgba(76, 175, 80, 0.2)' : 'none'};
                            position: relative;
                        ">
                            <div style="width: 100%; height: 80px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px; overflow: hidden;">
                                <img src="${imageUrl}" alt="${itemName}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <h4 style="font-size: 0.85em; margin: 0; color: #333; height: 2.4em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${itemName}</h4>
                            <p style="font-size: 0.75em; color: #777; margin: 4px 0 0;">ID: #${id}</p>
                            <p style="font-size: 0.7em; color: #999; margin: 2px 0 0;">${date}</p>
                            ${isActive ? '<span style="position: absolute; top: 5px; right: 5px; color: #4caf50;"><i class="fas fa-check-circle"></i></span>' : ''}
                        </div>
                    `;
        }).join('')}
            </div>
        `;

        const title = document.querySelector('h2');
        if (title) {
            title.insertAdjacentElement('afterend', selectorContainer);
        }

        // Add click listeners to cards
        document.querySelectorAll('.mini-order-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                window.location.href = `Track.html?id=${id}`;
            });

            // Hover effects
            card.addEventListener('mouseenter', () => {
                if (card.style.borderColor !== 'rgb(76, 175, 80)') {
                    card.style.borderColor = '#c5e1a5';
                    card.style.transform = 'translateY(-3px)';
                }
            });
            card.addEventListener('mouseleave', () => {
                if (card.style.borderColor !== 'rgb(76, 175, 80)') {
                    card.style.borderColor = '#eee';
                    card.style.transform = 'translateY(0)';
                }
            });
        });
    }
});
