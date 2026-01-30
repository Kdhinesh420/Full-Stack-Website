/**
 * Checkout Review Logic
 * Shows summary and finalizes the order
 */

document.addEventListener('DOMContentLoaded', async function () {
    if (!requireAuth()) return;

    const addressBox = document.getElementById('display-address');
    const itemsList = document.getElementById('order-items-review');
    const totalPriceEl = document.getElementById('total-price');
    const placeOrderBtn = document.getElementById('place-order-btn');

    // 1. Get address from session storage
    const addressStr = sessionStorage.getItem('temp_full_address_string');
    const addressData = JSON.parse(sessionStorage.getItem('temp_shipping_address') || '{}');
    const user = getUser();

    if (addressStr) {
        let displayHtml = '';
        if (addressData.firstName) {
            displayHtml += `<strong>${addressData.firstName} ${addressData.lastName || ''}</strong><br>`;
        } else if (user) {
            displayHtml += `<strong>${user.username}</strong><br>`;
        }

        displayHtml += `${addressStr}<br>`;

        if (addressData.phone) {
            displayHtml += `<strong>Phone:</strong> ${addressData.phone}`;
        } else if (user && user.phone) {
            displayHtml += `<strong>Phone:</strong> ${user.phone}`;
        }

        addressBox.innerHTML = displayHtml;
    } else if (user && user.address) {
        addressBox.innerHTML = `
            <strong>${user.username}</strong><br>
            ${user.address}<br>
            <strong>Phone:</strong> ${user.phone || 'Not provided'}
        `;
    } else {
        window.location.href = 'address.html';
        return;
    }

    // 2. Load Cart items for review
    try {
        const response = await apiGet(API_CONFIG.CART.BASE);
        const items = response.items || [];
        const total = response.total_amount || 0;

        if (items.length === 0) {
            itemsList.innerHTML = '<p>Your cart is empty.</p>';
            placeOrderBtn.disabled = true;
        } else {
            itemsList.innerHTML = '';
            items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'mini-item';
                itemEl.innerHTML = `
                    <span>${item.product_name} <strong>x${item.quantity}</strong></span>
                    <span>${formatPrice(item.subtotal)}</span>
                `;
                itemsList.appendChild(itemEl);
            });
            totalPriceEl.textContent = formatPrice(total);
        }
    } catch (err) {
        console.error('Failed to load review items:', err);
        itemsList.innerHTML = '<p class="error">Failed to load order summary.</p>';
    }

    // 3. Handle Final Placement
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', async function () {
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = 'PLACING ORDER...';

            try {
                // Call API to create order
                const response = await apiPost(API_CONFIG.ORDERS.BASE, {});

                // Clear session storage temp address
                sessionStorage.removeItem('temp_shipping_address');
                sessionStorage.removeItem('temp_full_address_string');

                // Success!
                window.location.href = `conform.html?id=${response.id}`;
            } catch (err) {
                console.error('Final order placement failed:', err);
                alert(err.message || 'Failed to place order. Please try again.');
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'PLACE ORDER';
            }
        });
    }
});
