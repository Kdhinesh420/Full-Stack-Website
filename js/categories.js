/**
 * Categories Page JavaScript
 * Handles dynamic category loading and product filtering
 */

document.addEventListener('DOMContentLoaded', async function () {
    const categoryFilterContainer = document.querySelector('.category-filter');
    const productGrid = document.querySelector('.product-grid');
    const searchInput = document.querySelector('.search-box input');
    const minPriceInput = document.querySelectorAll('.price-input')[0];
    const maxPriceInput = document.querySelectorAll('.price-input')[1];

    let currentCategoryId = null;
    let searchQuery = '';
    let minPrice = 0;
    let maxPrice = 2000;

    // Initialize UI
    updateAuthUI();

    // Fetch and display categories
    try {
        const categories = await apiGet(API_CONFIG.CATEGORIES.BASE);
        renderCategories(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }

    // Initial product load
    loadProducts();

    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            searchQuery = searchInput.value.trim();
            loadProducts();
        }, 500));
    }

    if (minPriceInput) {
        minPriceInput.addEventListener('change', () => {
            minPrice = parseFloat(minPriceInput.value) || 0;
            loadProducts();
        });
    }

    if (maxPriceInput) {
        maxPriceInput.addEventListener('change', () => {
            maxPrice = parseFloat(maxPriceInput.value) || 2000;
            loadProducts();
        });
    }

    /**
     * Render category list in sidebar
     */
    function renderCategories(categories) {
        if (!categoryFilterContainer) return;

        // Clear existing (except heading)
        const heading = categoryFilterContainer.querySelector('.filter-title');
        categoryFilterContainer.innerHTML = '';
        if (heading) categoryFilterContainer.appendChild(heading);

        // Add "All" option
        const allOption = document.createElement('div');
        allOption.className = 'category-item active';
        allOption.textContent = 'All products';
        allOption.style.cursor = 'pointer';
        allOption.style.padding = '5px 0';
        allOption.style.color = '#4caf50';
        allOption.addEventListener('click', () => {
            setActiveCategory(allOption, null);
        });
        categoryFilterContainer.appendChild(allOption);

        categories.forEach(cat => {
            const catEl = document.createElement('div');
            catEl.className = 'category-item';
            catEl.textContent = cat.name;
            catEl.style.cursor = 'pointer';
            catEl.style.padding = '5px 0';
            catEl.addEventListener('click', () => {
                setActiveCategory(catEl, cat.category_id);
            });
            categoryFilterContainer.appendChild(catEl);
        });
    }

    function setActiveCategory(element, id) {
        document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
        currentCategoryId = id;
        loadProducts();
    }

    /**
     * Load and render products based on filters
     */
    async function loadProducts() {
        if (!productGrid) return;

        showLoading(productGrid);

        try {
            let url = `${API_CONFIG.PRODUCTS.BASE}?limit=50`;
            if (currentCategoryId) url += `&category_id=${currentCategoryId}`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
            if (minPrice > 0) url += `&min_price=${minPrice}`;
            if (maxPrice < 2000) url += `&max_price=${maxPrice}`;

            const products = await apiGet(url);
            renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            productGrid.innerHTML = '<p class="error">Failed to load products.</p>';
        }
    }

    function renderProducts(products) {
        productGrid.innerHTML = '';

        if (!products || products.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No products found matching your criteria.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const imageUrl = product.image_url || '../assets/images/logoooo.png';
            const oldPrice = (product.price * 1.2).toFixed(2); // Mock discount

            card.innerHTML = `
                <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                    <div class="card-image-box">
                        <img src="${imageUrl}" alt="${product.name}" class="product-image">
                        <i class="far fa-heart heart-icon"></i>
                        ${product.stock_quantity > 0 ? '<span class="sale-tag">SALE</span>' : '<span class="sale-tag" style="background:#666">OUT OF STOCK</span>'}
                    </div>
                    <div class="card-details">
                        <img src="../assets/images/logoooo.png" alt="Ulavan Logo" class="brand-logo-mini">
                        <div class="rating-stars">
                            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i>
                        </div>
                        <p class="product-name">${product.name}</p>
                        <div class="price-box">
                            <span class="current-price">₹${parseFloat(product.price).toFixed(2)}</span>
                            <span class="old-price">₹${oldPrice}</span>
                            <i class="fas fa-plus-circle add-icon" data-id="${product.id}"></i>
                        </div>
                    </div>
                </a>
            `;

            const addIcon = card.querySelector('.add-icon');
            addIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart(product.id, addIcon);
            });

            productGrid.appendChild(card);
        });
    }

    async function handleAddToCart(productId, element) {
        if (!isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        if (!isBuyer()) {
            alert('Sellers cannot buy products.');
            return;
        }

        try {
            await apiPost(API_CONFIG.CART.BASE, {
                product_id: parseInt(productId),
                quantity: 1
            });

            const originalColor = element.style.color;
            element.style.color = '#4caf50';
            element.classList.replace('fa-plus-circle', 'fa-check-circle');

            setTimeout(() => {
                element.style.color = originalColor;
                element.classList.replace('fa-check-circle', 'fa-plus-circle');
            }, 2000);
        } catch (error) {
            alert(error.message || 'Failed to add to cart');
        }
    }

    // Helper: Debounce for search
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Helper: Show loading
    function showLoading(container) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2em; color: #4caf50;"></i>
                <p>Loading products...</p>
            </div>
        `;
    }
});
