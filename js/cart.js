// ===================================================
// CART.JS - Shopping Cart Page JavaScript
// ===================================================
// Cart items display, update quantity, remove items, checkout

// ===========================================
// GLOBAL VARIABLES
// ===========================================

let cartData = null;

// ===========================================
// PAGE INITIALIZATION
// ===========================================

async function initCartPage() {
    console.log('🛒 Initializing cart page...');

    // Login check (Cart page-க்கு login required)
    if (!requireAuth()) {
        return;
    }

    try {
        // Cart data load பண்ணுறோம்
        await loadCart();

    } catch (error) {
        console.error('Error initializing cart page:', error);
        showModal('Failed to load cart', 'error');
    }
}

// ===========================================
// CART LOADING
// ===========================================

/**
 * loadCart - Cart data load பண்ணி display பண்ணும்
 */
async function loadCart() {
    try {
        const cartContainer = document.getElementById('cart-items');

        if (!cartContainer) {
            console.warn('Cart container not found');
            return;
        }

        // Loading indicator
        cartContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #10b981;"></i>
                <p>Loading cart...</p>
            </div>
        `;

        // Cart API call
        cartData = await getCart();

        // Cart display பண்ணுறோம்
        displayCart(cartData);

        console.log('✅ Cart loaded:', cartData);

    } catch (error) {
        console.error('Failed to load cart:', error);
        const cartContainer = document.getElementById('cart-items');
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: #f44336;">Failed to load cart</p>
                    <button onclick="loadCart()" style="
                        margin-top: 12px;
                        padding: 10px 24px;
                        background: #10b981;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                    ">Retry</button>
                </div>
            `;
        }
    }
}

/**
 * displayCart - Cart items display பண்ணும்
 * @param {object} cart - Cart data
 */
function displayCart(cart) {
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');

    if (!cartContainer) return;

    // Empty cart check
    if (!cart || !cart.items || cart.items.length === 0) {
        cartContainer.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <div style="font-size: 64px; margin-bottom: 16px;">🛒</div>
                <h3 style="color: #666; margin: 0 0 12px 0;">Your cart is empty</h3>
                <p style="color: #999; margin: 0 0 24px 0;">Add some products to get started!</p>
                <a href="../index.html" style="
                    display: inline-block;
                    padding: 12px 32px;
                    background: #10b981;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                ">Continue Shopping</a>
            </div>
        `;

        // Summary hide பண்ணுறோம்
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }

        return;
    }

    // Cart items display பண்ணுறோம்
    cartContainer.innerHTML = '';

    cart.items.forEach(item => {
        const cartItem = createCartItemCard(item);
        cartContainer.appendChild(cartItem);
    });

    // Cart summary update பண்ணுறோம்
    updateCartSummary(cart);
}

/**
 * createCartItemCard - Cart item card create பண்ணும்
 * @param {object} item - Cart item
 * @returns {HTMLElement} - Cart item card
 */
function createCartItemCard(item) {
    const card = document.createElement('div');
    card.className = 'cart-item';

    // Product image
    const imageUrl = item.product_image || '../assets/images/placeholder.png';

    card.innerHTML = `
        <div class="item-image-area">
            <img src="${imageUrl}" alt="${item.product_name}" onerror="this.src='../assets/images/placeholder.png'">
        </div>
        
        <div class="item-details">
            <h3 class="item-name">${item.product_name}</h3>
            <p class="item-price">Price: ${formatPrice(item.product_price)}</p>
            
            <div style="display: flex; align-items: center; gap: 20px; margin-top: 15px;">
                <div class="quantity-controls" style="display: flex; align-items: center; gap: 10px; background: #f5f5f5; padding: 5px 15px; border-radius: 25px;">
                    <button onclick="updateItemQuantity(${item.cart_id}, ${item.quantity - 1})" style="border: none; background: none; cursor: pointer; font-size: 18px; font-weight: bold; color: #666;">-</button>
                    <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateItemQuantity(${item.cart_id}, ${item.quantity + 1})" style="border: none; background: none; cursor: pointer; font-size: 18px; font-weight: bold; color: #666;">+</button>
                </div>
                
                <span class="remove-btn" onclick="removeCartItem(${item.cart_id})">
                    <i class="fas fa-trash-alt"></i> Remove
                </span>
            </div>
        </div>
        
        <div class="item-subtotal" style="text-align: right; min-width: 120px;">
            <p style="font-size: 0.9em; color: #777; margin-bottom: 5px;">Subtotal</p>
            <strong style="font-size: 1.25em; color: #2e7d32;">
                ${formatPrice(item.subtotal)}
            </strong>
        </div>
    `;

    return card;
}

/**
 * updateCartSummary - Cart summary (total, etc.) update பண்ணும்
 * @param {object} cart - Cart data
 */
function updateCartSummary(cart) {
    const summaryContainer = document.getElementById('cart-summary');

    if (!summaryContainer) return;

    // Total calculation
    const subtotal = cart.total_amount || 0;
    const shipping = 50; // Fixed shipping charge
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + shipping + tax;

    summaryContainer.innerHTML = `
        <h3 style="margin: 0 0 16px 0;">Order Summary</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Subtotal:</span>
            <span>${formatPrice(subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Shipping:</span>
            <span>${formatPrice(shipping)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <span>Tax (5%):</span>
            <span>${formatPrice(tax)}</span>
        </div>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
            <strong style="font-size: 18px;">Total:</strong>
            <strong style="font-size: 18px; color: #10b981;">${formatPrice(total)}</strong>
        </div>
        <button onclick="proceedToCheckout()" style="
            width: 100%;
            padding: 14px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        ">Proceed to Checkout</button>
        <button onclick="continueShopping()" style="
            width: 100%;
            margin-top: 12px;
            padding: 12px;
            background: white;
            color: #10b981;
            border: 1px solid #10b981;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        ">Continue Shopping</button>
    `;

    summaryContainer.style.display = 'block';
}

// ===========================================
// CART ACTIONS
// ===========================================

/**
 * updateItemQuantity - Cart item quantity update பண்ணும்
 * @param {number} cartItemId - Cart item ID
 * @param {number} newQuantity - New quantity
 */
async function updateItemQuantity(cartItemId, newQuantity) {
    try {
        // Minimum quantity check
        if (newQuantity < 1) {
            showConfirmModal(
                'Do you want to remove this item from cart?',
                () => removeCartItem(cartItemId),
                null
            );
            return;
        }

        showLoading('Updating cart...');

        // API call
        await updateCartItem(cartItemId, newQuantity);

        // Cart reload பண்ணுறோம்
        await loadCart();

        hideLoading();
        showModal('Cart updated!', 'success', 2000);

    } catch (error) {
        hideLoading();
        console.error('Failed to update quantity:', error);
    }
}

/**
 * removeCartItem - Cart-ல இருந்து item remove பண்ணும்
 * @param {number} cartItemId - Cart item ID
 */
async function removeCartItem(cartItemId) {
    try {
        showLoading('Removing item...');

        // API call
        await removeFromCart(cartItemId);

        // Cart reload பண்ணுறோம்
        await loadCart();

        hideLoading();

    } catch (error) {
        hideLoading();
        console.error('Failed to remove item:', error);
    }
}

/**
 * proceedToCheckout - Checkout page-க்கு redirect
 */
function proceedToCheckout() {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        showModal('Your cart is empty', 'warning');
        return;
    }

    window.location.href = './address.html';
}

/**
 * continueShopping - Products page-க்கு redirect
 */
function continueShopping() {
    window.location.href = './products_page.html';
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartPage);
} else {
    initCartPage();
}

console.log('✅ Cart.js loaded successfully!');
