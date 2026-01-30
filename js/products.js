/**
 * Products Page JavaScript
 * Handles fetching and displaying all products with filtering options
 */

document.addEventListener('DOMContentLoaded', async function () {
    // UI Elements
    const productGrid = document.querySelector('.product-grid');
    const searchIcon = document.querySelector('.fa-search');

    // Initial State
    if (productGrid) showLoading(productGrid);

    // Parse URL parameters for search/filter
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const categoryId = urlParams.get('category');

    try {
        // Construct API URL
        let apiUrl = `${API_CONFIG.PRODUCTS.BASE}?limit=50`;
        if (searchQuery) apiUrl += `&search=${encodeURIComponent(searchQuery)}`;
        if (categoryId) apiUrl += `&category_id=${categoryId}`;

        // Fetch products
        const products = await apiGet(apiUrl);

        // Clear grid
        if (productGrid) productGrid.innerHTML = '';

        if (!products || products.length === 0) {
            if (productGrid) {
                productGrid.innerHTML = `
                    <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filters.</p>
                        <a href="products_page.html" class="btn" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px;">View All Products</a>
                    </div>
                `;
            }
            return;
        }

        // Render Products
        if (productGrid) {
            renderProductGrid(productGrid, products);
        }

        // Hide the second product grid section if it exists (since we are showing all here)
        const secondGrid = document.querySelectorAll('.product-grid')[1];
        if (secondGrid) {
            // Find the closest section or container to hide
            const parentSection = secondGrid.closest('section');
            const popularTitle = document.querySelector('.popular-title');

            if (popularTitle) popularTitle.style.display = 'none';
            if (secondGrid) secondGrid.style.display = 'none';
        }

    } catch (error) {
        console.error('Error fetching products:', error);
        if (productGrid) productGrid.innerHTML = '<p class="error">Failed to load products. Please try again later.</p>';
    }

    // Search Functionality
    const searchToggle = document.getElementById('searchToggle');
    const searchContainer = document.getElementById('searchContainer');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');

    if (searchToggle && searchContainer) {
        searchToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = searchContainer.style.display === 'block';
            searchContainer.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) searchInput.focus();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target) && e.target !== searchToggle) {
                searchContainer.style.display = 'none';
            }
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                window.location.href = `products_page.html?search=${encodeURIComponent(searchTerm)}`;
            }
        });
    }
});

/**
 * Render a list of products into a grid container
 * (Duplicate of index.js function - ideally should be in a shared utility file,
 * but keeping separate for simplicity as per instructions)
 */
function renderProductGrid(container, products) {
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Default image
        const imageUrl = product.image_url || '../assets/images/logoooo.png';

        // Fake rating
        const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
        const reviews = Math.floor(Math.random() * 100) + 1;

        card.innerHTML = `
            <a href="product.html?id=${product.id}">
                <div class="card-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;">
                    ${product.stock_quantity <= 0 ? '<span class="sale-tag" style="background-color: #f44336;">Out of Stock</span>' : ''}
                </div>
            </a>
            <div class="card-details">
                <h4><a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">${product.name}</a></h4>
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

    // Add event listeners
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
    e.stopPropagation();

    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    if (!isBuyer()) {
        alert('Sellers cannot buy products. Please login as a buyer.');
        return;
    }

    const button = e.target;
    const productId = button.dataset.id;
    const originalText = button.textContent;

    if (button.disabled) return;

    button.disabled = true;
    button.textContent = 'Adding...';

    try {
        await apiPost(API_CONFIG.CART.BASE, {
            product_id: parseInt(productId),
            quantity: 1
        });

        button.textContent = 'Added! ✓';
        button.style.backgroundColor = '#4caf50';

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
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

/**
 * Show loading indicator
 */
function showLoading(container) {
    container.innerHTML = `
        <div style="width: 100%; text-align: center; padding: 40px; grid-column: 1/-1;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2em; color: #4caf50;"></i>
            <p style="margin-top: 10px; color: #666;">Loading catalog...</p>
        </div>
    `;
}
