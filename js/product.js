// ===================================================
// PRODUCT.JS - Product Detail Page JavaScript
// ===================================================
// Single product details, reviews, add to cart

// ===========================================
// GLOBAL VARIABLES
// ===========================================

let currentProduct = null;
let currentImageIndex = 0;

// ===========================================
// PAGE INITIALIZATION
// ===========================================

async function initProductPage() {
    console.log('🛍️ Initializing product page...');

    try {
        // URL-ல இருந்து product ID எடுக்குறோம்
        const productId = getQueryParam('id');

        if (!productId) {
            showModal('Product not found', 'error');
            redirectTo('./products_page.html', 2000);
            return;
        }

        // Product details load பண்ணுறோம்
        await loadProductDetails(productId);

        // Add to cart button setup
        setupAddToCartButton();

    } catch (error) {
        console.error('Error initializing product page:', error);
        showModal('Failed to load product details', 'error');
    }
}

// ===========================================
// PRODUCT DETAILS
// ===========================================

/**
 * loadProductDetails - Product details load பண்ணும்
 * @param {number} productId - Product ID
 */
async function loadProductDetails(productId) {
    try {
        showLoading('Loading product details...');

        // API call
        currentProduct = await getProductById(productId);

        hideLoading();

        // Product details display பண்ணுறோம்
        displayProductDetails(currentProduct);

        console.log('✅ Product details loaded:', currentProduct);

    } catch (error) {
        hideLoading();
        console.error('Failed to load product:', error);
        showModal('Product not found or failed to load', 'error');
        setTimeout(() => {
            window.location.href = './products_page.html';
        }, 2000);
    }
}

/**
 * displayProductDetails - Product details display பண்ணும்
 * @param {object} product - Product data
 */
function displayProductDetails(product) {
    // Product name
    const nameEl = document.getElementById('product-name');
    if (nameEl) nameEl.textContent = product.name;

    // Product description
    const descEl = document.getElementById('product-description');
    if (descEl) descEl.textContent = product.description;

    // Product price
    const priceEl = document.getElementById('product-price');
    if (priceEl) priceEl.textContent = formatPrice(product.price);

    // Product category
    const categoryEl = document.getElementById('product-category');
    if (categoryEl) {
        const category = PRODUCT_CATEGORIES.find(c => c.id === product.category);
        categoryEl.textContent = category ? category.name : product.category;
    }

    // Stock status
    const stockEl = document.getElementById('product-stock');
    if (stockEl) {
        const stockStatus = product.stock_quantity || product.stock || 0;
        if (stockStatus > 0) {
            stockEl.textContent = `In Stock (${stockStatus} available)`;
            stockEl.style.color = '#10b981';
        } else {
            stockEl.textContent = 'Out of Stock';
            stockEl.style.color = '#f44336';
        }
    }

    // Seller info
    const sellerEl = document.getElementById('product-seller');
    if (sellerEl && product.seller_name) {
        sellerEl.textContent = `Sold by: ${product.seller_name}`;
    }

    // Product images
    displayProductImages(product);
}

/**
 * displayProductImages - Product images display பண்ணும் (swiper/carousel)
 * @param {object} product - Product data
 */
function displayProductImages(product) {
    const mainImageEl = document.getElementById('main-product-image');
    const thumbnailsEl = document.getElementById('image-thumbnails');

    if (!mainImageEl) return;

    // Images array prepare பண்ணுறோம்
    let images = [];

    // image_url, image_url_2, image_url_3-ன்னு backend கொடுக்கும்
    if (product.image_url) images.push(product.image_url);
    if (product.image_url_2) images.push(product.image_url_2);
    if (product.image_url_3) images.push(product.image_url_3);

    // image_urls array-ஆ இருந்தா (Old logic support)
    if (images.length === 0 && product.image_urls && product.image_urls.length > 0) {
        images = product.image_urls;
    }

    // Fallback placeholder
    if (images.length === 0) {
        images = ['../assets/images/placeholder.png'];
    }

    // Main image காட்டுறோம்
    mainImageEl.src = images[0];
    mainImageEl.alt = product.name;
    mainImageEl.onerror = () => {
        mainImageEl.src = '../assets/images/placeholder.png';
    };

    // Thumbnails காட்டுறோம் (multiple images-ஆ இருந்தா)
    if (thumbnailsEl && images.length > 1) {
        thumbnailsEl.innerHTML = '';

        images.forEach((img, index) => {
            const thumb = document.createElement('img');
            thumb.src = img;
            thumb.alt = `${product.name} - Image ${index + 1}`;
            thumb.style.cssText = `
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 6px;
                cursor: pointer;
                border: 2px solid ${index === 0 ? '#10b981' : '#ddd'};
                transition: all 0.3s ease;
            `;
            thumb.onclick = () => changeMainImage(img, index);
            thumbnailsEl.appendChild(thumb);
        });
    }
}

/**
 * changeMainImage - Main image change பண்ணும்
 * @param {string} imageUrl - Image URL
 * @param {number} index - Image index
 */
function changeMainImage(imageUrl, index) {
    const mainImageEl = document.getElementById('main-product-image');
    if (mainImageEl) {
        mainImageEl.src = imageUrl;
        currentImageIndex = index;
    }

    // Thumbnail borders update பண்ணுறோம்
    const thumbnails = document.querySelectorAll('#image-thumbnails img');
    thumbnails.forEach((thumb, i) => {
        thumb.style.borderColor = i === index ? '#10b981' : '#ddd';
    });
}

// ===========================================
// ADD TO CART
// ===========================================

/**
 * setupAddToCartButton - Add to cart button setup பண்ணும்
 */
function setupAddToCartButton() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    if (!addToCartBtn) return;

    addToCartBtn.addEventListener('click', handleProductAddToCart);
}

/**
 * handleProductAddToCart - Add to cart handle பண்ணும்
 */
async function handleProductAddToCart() {
    try {
        // Login check
        if (!isLoggedIn()) {
            showModal('Please login to add items to cart', 'warning');
            setTimeout(() => {
                window.location.href = './login.html';
            }, 1500);
            return;
        }

        // Stock check
        const availableStock = currentProduct.stock_quantity || currentProduct.stock || 0;
        if (availableStock <= 0) {
            showModal('This product is out of stock', 'error');
            return;
        }

        // Quantity get பண்ணுறோம்
        const quantityInput = document.getElementById('quantity-input');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

        // Quantity validation
        if (quantity > availableStock) {
            showModal(`Only ${availableStock} items available`, 'warning');
            return;
        }

        // Add to cart API call
        await addToCart(currentProduct.id, quantity);

    } catch (error) {
        console.error('Failed to add to cart:', error);
    }
}

/**
 * buyNow - Buy now button-க்கு (Direct checkout)
 */
async function buyNow() {
    try {
        // First add to cart
        await handleProductAddToCart();

        // Then redirect to cart/checkout
        setTimeout(() => {
            window.location.href = './cart.html';
        }, 1000);

    } catch (error) {
        console.error('Buy now failed:', error);
    }
}

/**
 * changeQuantity - Quantity-ஐ increment/decrement பண்ணும்
 * @param {number} delta - 1 or -1
 */
function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity-input');
    if (!quantityInput) return;

    let currentVal = parseInt(quantityInput.value) || 1;
    let newVal = currentVal + delta;

    // Minimum limit
    if (newVal < 1) newVal = 1;

    // Maximum limit (Stock check)
    const availableStock = currentProduct?.stock_quantity || currentProduct?.stock || 99;
    if (newVal > availableStock) {
        showModal(`Only ${availableStock} items available in stock`, 'warning');
        newVal = availableStock;
    }

    quantityInput.value = newVal;
}

// Global scope-க்கு export பண்ணுறோம் (HTML-ல இருந்து call பண்ண)
window.changeQuantity = changeQuantity;

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductPage);
} else {
    initProductPage();
}

console.log('✅ Product.js loaded successfully!');
