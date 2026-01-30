/**
 * Home Page JavaScript
 * Handles fetching and displaying products on the landing page
 */

document.addEventListener('DOMContentLoaded', async function () {
    // UI Elements
    const firstProductGrid = document.querySelector('.product-grid'); // First grid (Best Sellers)
    const secondProductGrid = document.querySelectorAll('.product-grid')[1]; // Second grid (Popular)

    // Initial State
    if (firstProductGrid) showLoading(firstProductGrid);
    if (secondProductGrid) showLoading(secondProductGrid);

    // Render Categories from Config
    renderCategories();

    try {
        // Fetch products from API
        // In a real app, we might have specific endpoints for "best sellers" or "featured"
        // Here we'll just fetch all products and split them
        const products = await apiGet(`${API_CONFIG.PRODUCTS.BASE}?limit=8`);

        // Hide loading
        if (firstProductGrid) firstProductGrid.innerHTML = '';
        if (secondProductGrid) secondProductGrid.innerHTML = '';

        if (!products || products.length === 0) {
            if (firstProductGrid) firstProductGrid.innerHTML = '<p>No products available at the moment.</p>';
            return;
        }

        // Split products for the two sections (just for demo purposes)
        const bestSellers = products.slice(0, 4);
        const popularItems = products.slice(4, 8);

        // Render Best Sellers
        if (firstProductGrid) {
            renderProductGrid(firstProductGrid, bestSellers);
        }

        // Render Popular Items
        if (secondProductGrid) {
            renderProductGrid(secondProductGrid, popularItems);
        }

    } catch (error) {
        console.error('Error fetching home page products:', error);
        if (firstProductGrid) firstProductGrid.innerHTML = '<p class="error">Failed to load products. Please try again later.</p>';
        if (secondProductGrid) secondProductGrid.innerHTML = '';
    }
});

/**
 * Render Categories in the cat-grid
 */
async function renderCategories() {
    const catGrid = document.querySelector('.cat-grid');
    if (!catGrid) return;

    let categories = [];
    try {
        // Try to fetch from API
        const apiCategories = await apiGet(API_CONFIG.CATEGORIES.BASE);
        if (apiCategories && apiCategories.length > 0) {
            categories = apiCategories;
        } else {
            // Fallback to config if API is empty
            categories = PRODUCT_CATEGORIES;
        }
    } catch (err) {
        console.warn('Could not fetch categories from API, using fallback.', err);
        categories = PRODUCT_CATEGORIES;
    }

    catGrid.innerHTML = ''; // Clear loading

    categories.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.className = 'round';

        // Find if this category has a predefined image in PRODUCT_CATEGORIES
        const configCat = PRODUCT_CATEGORIES.find(c => c.name === cat.name || c.id === cat.category_id);
        const imgName = configCat ? configCat.image : 'logoooo.png';
        const imgPath = `./assets/images/${imgName}`;

        catDiv.innerHTML = `
            <a href="./pages/products_page.html?category=${cat.category_id || cat.id}" style="text-decoration: none; color: inherit;">
                <img class="round" src="${imgPath}" alt="${cat.name}" height="100px" width="100px" onerror="this.src='./assets/images/logoooo.png'">
                <strong>${cat.name.toUpperCase()}</strong>
            </a>
        `;
        catGrid.appendChild(catDiv);
    });

    // Add "All Products" link at the end
    const allProductsDiv = document.createElement('div');
    allProductsDiv.className = 'round';
    allProductsDiv.innerHTML = `
        <a href="./pages/products_page.html" style="text-decoration: none; color: inherit;">
            <img class="round" src="./assets/images/logoooo.png" alt="All Products" height="100px" width="100px">
            <strong>ALL PRODUCTS</strong>
        </a>
    `;
    catGrid.appendChild(allProductsDiv);
}

/**
 * Render a list of products into a grid container
 */
function renderProductGrid(container, products) {
    if (!products || products.length === 0) {
        container.innerHTML = '<p>Coming soon!</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Default image if none provided
        const imageUrl = product.image_url || './assets/images/logoooo.png'; // Fallback image

        // Calculate random rating for demo (since we don't have reviews connected yet)
        const rating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5 to 5.0
        const reviews = Math.floor(Math.random() * 100) + 1;

        card.innerHTML = `
            <a href="./pages/product.html?id=${product.id}">
                <div class="card-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;">
                    ${product.stock_quantity <= 0 ? '<span class="sale-tag" style="background-color: #f44336;">Out of Stock</span>' : ''}
                </div>
            </a>
            <div class="card-details">
                <h4><a href="./pages/product.html?id=${product.id}" style="text-decoration: none; color: inherit;">${product.name}</a></h4>
                <div class="rating">
                    ${getStarRating(rating)} (${reviews})
                </div>
                <div class="price-action">
                    <span class="price">${formatPrice(product.price)}</span>
                    <button class="add-to-cart" data-id="${product.id}" ${product.stock_quantity <= 0 ? 'disabled' : ''}>
                        ${product.stock_quantity <= 0 ? 'No Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Add event listeners to "Add to Cart" buttons
    const addButtons = container.querySelectorAll('.add-to-cart');
    addButtons.forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });
}

/**
 * Handle Add to Cart click
 */
async function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigation if inside an anchor

    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = './pages/login.html';
        return;
    }

    // Check role
    if (!isBuyer()) {
        alert('Sellers cannot buy products. Please login as a buyer.');
        return;
    }

    const button = e.target;
    const productId = button.dataset.id;
    const originalText = button.textContent;

    if (button.disabled) return;

    // Show loading logic on button
    button.disabled = true;
    button.textContent = 'Adding...';

    try {
        await apiPost(API_CONFIG.CART.BASE, {
            product_id: parseInt(productId),
            quantity: 1
        });

        button.textContent = 'Added! ✓';
        button.style.backgroundColor = '#4caf50'; // Green

        // Update cart count (if we had a counter)
        // updateCartCount();

        setTimeout(() => {
            button.disabled = false;
            button.textContent = originalText;
            button.style.backgroundColor = '';
        }, 2000);

    } catch (error) {
        console.error('Error adding to cart:', error);
        alert(error.message || 'Failed to add to cart');
        button.disabled = false;
        button.textContent = originalText;
    }
}

/**
 * Generate star rating HTML
 */
function getStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>'; // Empty star using far (regular)
        }
    }
    return stars;
}

/**
 * Show loading indicator
 */
function showLoading(container) {
    container.innerHTML = `
        <div style="width: 100%; text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2em; color: #4caf50;"></i>
            <p style="margin-top: 10px; color: #666;">Loading fresh products...</p>
        </div>
    `;
}
