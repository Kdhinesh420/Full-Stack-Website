// ===================================================
// CHECKOUT-REVIEW.JS - Order Review Page Logic
// ===================================================

let cartData = null;
let addressData = null;

// ===========================================
// PAGE INITIALIZATION
// ===========================================

async function initCheckoutReview() {
    console.log('📝 Initializing checkout review...');

    // Login check
    if (!requireAuth()) {
        return;
    }

    try {
        showLoading('Preparing order review...');

        // 1. Get Address Data from Session
        const storedAddress = sessionStorage.getItem('checkoutAddress');
        if (!storedAddress) {
            showModal('Please select a shipping address first', 'warning');
            window.location.href = './address.html';
            return;
        }
        addressData = JSON.parse(storedAddress);

        // 2. Get Cart Data
        cartData = await getCart();
        if (!cartData || !cartData.items || cartData.items.length === 0) {
            showModal('Your cart is empty', 'warning');
            window.location.href = './cart.html';
            return;
        }

        // 3. Display Everything
        displayReview();

        // 4. Setup Place Order Button
        setupPlaceOrder();

        hideLoading();

    } catch (error) {
        hideLoading();
        console.error('Error initializing review:', error);
        showModal('Failed to load order details', 'error');
    }
}

// ===========================================
// DATA DISPLAY
// ===========================================

function displayReview() {
    // --- Address Display ---
    const addressEl = document.getElementById('display-address');
    if (addressEl && addressData) {
        addressEl.innerHTML = `
            <strong>${addressData.fullName}</strong><br>
            ${addressData.address}<br>
            Phone: ${addressData.phone}
        `;
    }

    // --- Items Display ---
    const itemsContainer = document.getElementById('order-items-review');
    if (itemsContainer && cartData) {
        itemsContainer.innerHTML = '';

        cartData.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-row';
            itemDiv.innerHTML = `
                <img src="${item.product_image || '../assets/images/placeholder.png'}" class="item-img">
                <div class="item-info">
                    <p class="item-name">${item.product_name}</p>
                    <p class="item-meta">Qty: ${item.quantity} × ${formatPrice(item.product_price)}</p>
                </div>
                <div class="item-price">
                    ${formatPrice(item.subtotal)}
                </div>
            `;
            itemsContainer.appendChild(itemDiv);
        });
    }

    // --- Summary Display ---
    const totalPriceEl = document.getElementById('total-price');
    if (totalPriceEl && cartData) {
        // We use total_amount from backend cart response
        const total = cartData.total_amount || 0;
        totalPriceEl.textContent = formatPrice(total);
    }
}

// ===========================================
// ACTIONS
// ===========================================

function setupPlaceOrder() {
    const btn = document.getElementById('place-order-btn');
    if (!btn) return;

    btn.onclick = async () => {
        try {
            showLoading('Placing your order...');

            // Prepare order data (Backend creation logic takes it from user's current cart)
            // But we need to pass a dummy object to satisfy OrderCreate schema if needed.
            // Based on order_routes.py, OrderCreate is empty.
            const orderData = {};

            const result = await createOrder(orderData);

            if (result && result.id) {
                // Success! Clear session address and redirect
                sessionStorage.removeItem('checkoutAddress');

                // Clear cart (Backend usually does this, but we can call it to be sure if needed)
                // await clearCart(); 

                hideLoading();
                window.location.href = `./conform.html?id=${result.id}&total=${cartData.total_amount}`;
            }

        } catch (error) {
            hideLoading();
            console.error('Failed to place order:', error);
            showModal(error.detail || 'Failed to place order. Please try again.', 'error');
        }
    };
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckoutReview);
} else {
    initCheckoutReview();
}

console.log('✅ Checkout Review Logic Loaded');
