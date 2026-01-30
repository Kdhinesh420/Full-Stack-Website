/**
 * Product Detail Page JavaScript
 * Handles fetching single product details and adding to cart
 */

document.addEventListener('DOMContentLoaded', async function () {
    // Get Product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        showError('No product specified. Redirecting to shop...', 'main');
        setTimeout(() => window.location.href = 'products_page.html', 2000);
        return;
    }

    try {
        await loadProductDetails(productId);
    } catch (error) {
        console.error('Error loading product:', error);
        document.querySelector('main').innerHTML = '<div class="error-container" style="text-align: center; padding: 50px;"><h2>Product not found</h2><p>The product you are looking for might have been removed.</p><a href="products_page.html" class="btn">Back to Shop</a></div>';
    }
});

/**
 * Load product details from API
 */
async function loadProductDetails(id) {
    // Fetch product
    const product = await apiGet(`${API_CONFIG.PRODUCTS.BASE}/${id}`);

    // Update Page Title
    document.title = `${product.name} - ULAVAN PLANET`;

    // Update Image
    const mainImage = document.querySelector('.main-image-placeholder img');
    const imageUrl = product.image_url || '../assets/images/logoooo.png';
    if (mainImage) mainImage.src = imageUrl;

    // Update Thumbnails
    const thumbnailsContainer = document.querySelector('.thumbnails');
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = ''; // Clear existing

        // Use provided images list or fallback to single image
        let imagesList = product.images && product.images.length > 0 ? product.images : [imageUrl];

        imagesList.forEach((img, index) => {
            const thumbDiv = document.createElement('div');
            thumbDiv.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            const thumbImg = document.createElement('img');
            thumbImg.src = img;
            thumbImg.alt = `${product.name} view ${index + 1}`;

            thumbDiv.appendChild(thumbImg);
            thumbnailsContainer.appendChild(thumbDiv);

            // Thumbnail Click Event (Swipe/Switch effect)
            thumbDiv.addEventListener('click', () => {
                // Update Main Image
                if (mainImage) {
                    mainImage.style.opacity = '0';
                    setTimeout(() => {
                        mainImage.src = img;
                        mainImage.style.opacity = '1';
                    }, 200);
                }

                // Update Active State
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumbDiv.classList.add('active');
            });
        });
    }

    // Update Text Details
    setText('.product-title', product.name);
    setText('.product-category', product.category_name || 'General');
    setText('.description-text', product.description || 'No description available.');

    // Update Price
    const currentPrice = document.querySelector('.current-price');
    if (currentPrice) currentPrice.textContent = formatPrice(product.price);

    // Hide original price and discount if not applicable (logic can be enhanced later)
    const originalPrice = document.querySelector('.original-price');
    const discountTag = document.querySelector('.discount-tag');
    const saveDetail = document.querySelector('.save-detail');

    if (originalPrice) originalPrice.style.display = 'none'; // Basic backend doesn't store MSRP
    if (discountTag) discountTag.style.display = 'none';
    if (saveDetail) saveDetail.style.display = 'none';

    // Update Metadata
    setText('.value:nth-of-type(1)', product.name); // P. Name
    // Brand is usually seller or fixed, we'll leave as is or update if we had brand field

    // Stock Handling
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const buyNowBtn = document.querySelector('.buy-now-btn');

    if (product.stock_quantity <= 0) {
        if (addToCartBtn) {
            addToCartBtn.textContent = 'Out of Stock';
            addToCartBtn.disabled = true;
            addToCartBtn.style.backgroundColor = '#ccc';
            addToCartBtn.style.cursor = 'not-allowed';
        }
        if (buyNowBtn) {
            buyNowBtn.style.display = 'none';
        }
    } else {
        // Add Event Listeners
        if (addToCartBtn) {
            addToCartBtn.onclick = (e) => {
                e.preventDefault();
                handleAddToCart(product.id, addToCartBtn);
            };
        }

        if (buyNowBtn) {
            buyNowBtn.onclick = (e) => {
                e.preventDefault();
                handleBuyNow(product.id);
            };
        }
    }

    // Hide Variants Section as backend doesn't support them yet
    const variantsSection = document.querySelector('.variants-section');
    if (variantsSection) {
        variantsSection.innerHTML = `
            <div style="padding: 15px; background: #f9f9f9; border-radius: 5px; margin-bottom: 20px;">
                <p><strong>Stock Status:</strong> ${product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'} (${product.stock_quantity} available)</p>
                <p><strong>Seller:</strong> ${product.seller_username || 'Ulavan Verified Seller'}</p>
            </div>
        `;
    }
}

/**
 * Helper to set text content safely
 */
function setText(selector, text) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
}

/**
 * Handle Add to Cart
 */
async function handleAddToCart(productId, btn) {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    if (!isBuyer()) {
        alert('Sellers cannot buy products.');
        return;
    }

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Adding...';

    try {
        await apiPost(API_CONFIG.CART.BASE, {
            product_id: parseInt(productId),
            quantity: 1
        });

        btn.textContent = 'Added to Cart ✓';
        btn.style.backgroundColor = '#4caf50';

        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 2000);

    } catch (error) {
        console.error('Error adding to cart:', error);
        alert(error.message || 'Failed to add to cart');
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/**
 * Handle Buy Now (Add to cart and redirect)
 */
async function handleBuyNow(productId) {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Add to cart first
        await apiPost(API_CONFIG.CART.BASE, {
            product_id: parseInt(productId),
            quantity: 1
        });

        // Redirect to cart for checkout
        window.location.href = 'cart.html';

    } catch (error) {
        console.error('Error buying now:', error);
        alert(error.message || 'Failed to process request');
    }
}
