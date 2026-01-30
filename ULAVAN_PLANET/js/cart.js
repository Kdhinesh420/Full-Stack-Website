/**
 * Cart Page JavaScript
 * Handles shopping cart functionality: listing items, updating quantities, removing items
 */

document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication
    if (!requireAuth()) return;
    if (!requireBuyer()) return;

    // UI Elements
    const cartWrapper = document.querySelector('.cart-items-wrapper');
    const badge = document.querySelector('.badge');

    if (cartWrapper) showLoading(cartWrapper);

    try {
        await loadCart();
    } catch (error) {
        console.error('Error loading cart:', error);
        cartWrapper.innerHTML = '<p class="error">Failed to load cart. Please try again later.</p>';
    }
});

/**
 * Load and display cart items
 */
async function loadCart() {
    const cartWrapper = document.querySelector('.cart-items-wrapper');
    const badge = document.querySelector('.badge');

    // Fetch cart data
    const response = await apiGet(API_CONFIG.CART.BASE);
    const apiItems = response.items || [];
    const totalAmount = response.total_amount || 0;

    // Update Badge
    if (badge) badge.textContent = response.total_items || 0;

    // Clear wrapper
    cartWrapper.innerHTML = '';

    if (apiItems.length === 0) {
        cartWrapper.innerHTML = `
            <div class="empty-cart" style="text-align: center; padding: 40px;">
                <i class="fas fa-shopping-cart" style="font-size: 3em; color: #ddd; margin-bottom: 20px;"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any products yet.</p>
                <a href="products_page.html" class="buy-now-btn" style="display: inline-block; margin-top: 20px; text-decoration: none;">Start Shopping</a>
            </div>
        `;
        return;
    }

    // Render Items
    apiItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.dataset.id = item.cart_id;

        // Default image
        const imageUrl = item.product_image || '../assets/images/logoooo.png';

        itemDiv.innerHTML = `
            <div class="item-image-area">
                <img src="${imageUrl}" alt="${item.product_name}">
            </div>
            <div class="item-details">
                <h2 class="item-name"><a href="product.html?id=${item.product_id}" style="text-decoration: none; color: inherit;">${item.product_name}</a></h2>
                <p>Price: ${formatPrice(item.product_price)}</p>
                <div class="quantity-controls" style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                    <label>Quantity:</label>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" max="${item.product_stock}" style="width: 50px; padding: 5px;">
                </div>
                <p class="item-subtotal" style="font-weight: bold; margin-top: 10px;">Subtotal: ${formatPrice(item.subtotal)}</p>
            </div>
            <div class="item-actions">
                <button class="remove-btn" onclick="removeItem(${item.cart_id})">Remove</button>
            </div>
        `;

        // Add event listener for quantity change
        const qtyInput = itemDiv.querySelector('.qty-input');
        qtyInput.addEventListener('change', (e) => updateQuantity(item.cart_id, e.target.value));

        cartWrapper.appendChild(itemDiv);
    });

    // Render Total and Checkout Button
    const checkoutDiv = document.createElement('div');
    checkoutDiv.className = 'cart-summary';
    checkoutDiv.style.marginTop = '30px';
    checkoutDiv.style.padding = '20px';
    checkoutDiv.style.borderTop = '2px solid #eee';
    checkoutDiv.style.textAlign = 'right';

    checkoutDiv.innerHTML = `
        <div class="cart-total" style="font-size: 1.5em; font-weight: bold; margin-bottom: 20px;">
            Total: <span id="cart-total-amount">${formatPrice(totalAmount)}</span>
        </div>
        <button class="buy-now-btn" id="checkout-btn">Proceed to Checkout</button>
    `;

    cartWrapper.appendChild(checkoutDiv);

    // Add event listener for checkout
    document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
}

/**
 * Update cart item quantity
 */
async function updateQuantity(cartId, newQuantity) {
    if (newQuantity < 1) return;

    try {
        await apiPut(`${API_CONFIG.CART.BASE}/${cartId}`, {
            quantity: parseInt(newQuantity)
        });

        // Reload cart to update totals
        await loadCart();
        showSuccess('Cart updated');

    } catch (error) {
        console.error('Error updating cart:', error);
        alert(error.message || 'Failed to update quantity');
        await loadCart(); // Revert changes
    }
}

/**
 * Remove item from cart
 */
async function removeItem(cartId) {
    if (!confirm('Are you sure you want to remove this item?')) return;

    try {
        await apiDelete(`${API_CONFIG.CART.BASE}/${cartId}`);
        await loadCart();
        showSuccess('Item removed');

    } catch (error) {
        console.error('Error removing item:', error);
        alert(error.message || 'Failed to remove item');
    }
}

/**
 * Handle Checkout
 */
async function handleCheckout() {
    const btn = document.getElementById('checkout-btn');
    if (!btn) return;

    btn.disabled = true;
    btn.textContent = 'Processing...';

    // Instead of placing order here, we redirect to address page
    window.location.href = 'address.html';
}

// Make removeItem global so onclick works
window.removeItem = removeItem;
