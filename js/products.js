// ===================================================
// PRODUCTS.JS - Products Page JavaScript
// ===================================================
// Products listing, filtering, and search

// ===========================================
// GLOBAL VARIABLES
// ===========================================

let allProducts = []; // எல்லா products-ம் store பண்ணுறோம்
let currentFilters = {
    category: null,
    search: null,
    minPrice: null,
    maxPrice: null
};

// ===========================================
// PAGE INITIALIZATION
// ===========================================

async function initProductsPage() {
    console.log('📦 Initializing products page...');

    try {
        // Step 1: URL parameters எடுக்குறோம் (eg: ?category=3)
        const urlParams = new URLSearchParams(window.location.search);
        currentFilters.category = urlParams.get('category'); // category_id number as string
        currentFilters.search = urlParams.get('search');

        // Step 2: Backend-இல் இருந்து categories fetch பண்ணி dropdown populate பண்ணுறோம்
        await loadCategoryDropdown();

        // Step 3: Page title update பண்ணுறோம்
        updatePageTitle();

        // Step 4: Products load பண்ணுறோம்
        await loadProducts();

        // Step 5: Filter/Search event listeners setup பண்ணுறோம்
        setupFilters();

    } catch (error) {
        console.error('Error initializing products page:', error);
        showModal('Failed to load products', 'error');
    }
}

// ===========================================
// CATEGORY DROPDOWN LOADER
// ===========================================

/**
 * loadCategoryDropdown:
 *   - Backend-இல் இருந்து real categories fetch பண்ணும்
 *   - Dropdown-ல add பண்ணும்
 *   - URL-ல category_id இருந்தா auto-select பண்ணும்
 *   - "Best Sellers" option add பண்ணும் (special redirect)
 */
async function loadCategoryDropdown() {
    const categorySelect = document.getElementById('category-filter');
    if (!categorySelect) return;

    // Dropdown clear பண்ணி loading text காட்டுறோம்
    categorySelect.innerHTML = '<option value="">All Categories</option>';

    try {
        // Backend API-இல் இருந்து categories get பண்ணுறோம்
        // getCategories() → api.js-ல define ஆயிருக்கும்
        const categories = await getCategories();

        // Each category-க்கு ஒரு <option> add பண்ணுறோம்
        categories.forEach(function (cat) {
            const option = document.createElement('option');

            // Value = category_id (number) — backend இதனால filter பண்ணும்
            option.value = cat.category_id;

            // Text = category name, emoji icon சேர்த்து
            const icon = getCategoryIcon(cat.name);
            option.textContent = icon + ' ' + cat.name;

            categorySelect.appendChild(option);
        });

        // Special option: "Best Sellers" — click பண்ணும்போது best_selling_page-க்கு போகும்
        const bestOption = document.createElement('option');
        bestOption.value = 'best-sellers'; // special value
        bestOption.textContent = '⭐ Best Sellers';
        categorySelect.appendChild(bestOption);

        // URL-ல category_id இருந்தா automatically select பண்ணுறோம்
        if (currentFilters.category) {
            categorySelect.value = currentFilters.category;
        }

        console.log('✅ Category dropdown loaded from backend:', categories.length, 'categories');

    } catch (error) {
        console.error('Failed to load categories:', error);
        // Error ஆனாலும் dropdown empty-ஆ இருக்கும் — "All Categories" மட்டும் இருக்கும்
    }
}

/**
 * getCategoryIcon:
 *   - Category name பாத்து suitable emoji return பண்ணும் (simple name matching)
 */
function getCategoryIcon(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('vegetable')) return '🥕';
    if (lowerName.includes('flower')) return '🌸';
    if (lowerName.includes('fruit')) return '🍎';
    if (lowerName.includes('herb')) return '🌿';
    if (lowerName.includes('grain')) return '🌾';
    if (lowerName.includes('seed')) return '🌱';
    return '📦'; // default icon
}

// ===========================================
// PRODUCTS LOADING
// ===========================================

/**
 * loadProducts - Products load பண்ணி display பண்ணும்
 */
async function loadProducts() {
    try {
        const productsContainer = document.querySelector('.product-grid');

        if (!productsContainer) {
            console.warn('Products container not found');
            return;
        }

        // Loading indicator
        productsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #10b981;"></i>
                <p style="margin-top: 20px; color: #666;">Loading products...</p>
            </div>
        `;

        // Backend API call
        allProducts = await getAllProducts(currentFilters);

        // Products display பண்ணுறோம்
        displayProducts(allProducts);

        console.log(`✅ Loaded ${allProducts.length} products`);

    } catch (error) {
        console.error('Failed to load products:', error);
        const productsContainer = document.querySelector('.product-grid');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="color: #f44336;">Failed to load products. Please try again.</p>
                    <button onclick="loadProducts()" style="
                        margin-top: 16px;
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
 * displayProducts - Products-ஐ screen-ல காட்டும்
 * @param {Array} products - Products array
 */
function displayProducts(products) {
    const productsContainer = document.querySelector('.product-grid');

    if (!productsContainer) return;

    // No products found
    if (!products || products.length === 0) {
        productsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <div style="font-size: 64px; margin-bottom: 16px;">📦</div>
                <h3 style="color: #666; margin: 0 0 8px 0;">No Products Found</h3>
                <p style="color: #999; margin: 0;">Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }

    // Clear container
    productsContainer.innerHTML = '';

    // Product cards create பண்ணுறோம்
    products.forEach(product => {
        const card = createProductCard(product);
        productsContainer.appendChild(card);
    });
}

/**
 * createProductCard - Product card create பண்ணும் (index.js-ல same logic)
 * @param {object} product - Product data
 * @returns {HTMLElement} - Product card
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cssText = `
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px;
        background: white;
        transition: all 0.3s ease;
        cursor: pointer;
    `;

    const productUrl = `./product.html?id=${product.id}`;

    let imageUrl = product.image_url;
    if (product.image_urls && product.image_urls.length > 0) {
        imageUrl = product.image_urls[0];
    }

    card.innerHTML = `
        <a href="${productUrl}" style="text-decoration: none; color: inherit;">
            <img src="${imageUrl || '../assets/images/placeholder.png'}" 
                 alt="${product.name}" 
                 style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;"
                 onerror="this.src='../assets/images/placeholder.png'">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">
                ${truncateText(product.name, 50)}
            </h3>
            <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; min-height: 40px;">
                ${truncateText(product.description, 80)}
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 20px; font-weight: bold; color: #10b981;">
                    ${formatPrice(product.price)}
                </span>
                <button onclick="handleAddToCart(${product.id}, event)" style="
                    padding: 8px 16px;
                    background: #10b981;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                ">Add to Cart</button>
            </div>
        </a>
    `;

    // Hover effects
    card.addEventListener('mouseenter', () => {
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        card.style.transform = 'translateY(-4px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.boxShadow = 'none';
        card.style.transform = 'translateY(0)';
    });

    return card;
}

/**
 * handleAddToCart - Add to cart (same as index.js)
 */
async function handleAddToCart(productId, event) {
    event.preventDefault();
    event.stopPropagation();

    try {
        if (!isLoggedIn()) {
            showModal('Please login to add items to cart', 'warning');
            setTimeout(() => {
                window.location.href = './login.html';
            }, 1500);
            return;
        }

        await addToCart(productId, 1);

    } catch (error) {
        console.error('Failed to add to cart:', error);
    }
}

// ===========================================
// FILTERS AND SEARCH
// ===========================================

/**
 * setupFilters - Filter controls setup பண்ணும்
 */
function setupFilters() {
    // Search box
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearchChange, 500));

        // Pre-fill search value
        if (currentFilters.search) {
            searchInput.value = currentFilters.search;
        }
    }

    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryChange);

        // Pre-select category
        if (currentFilters.category) {
            categoryFilter.value = currentFilters.category;
        }
    }

    // Price range filter
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');

    if (minPriceInput) {
        minPriceInput.addEventListener('change', handlePriceChange);
    }

    if (maxPriceInput) {
        maxPriceInput.addEventListener('change', handlePriceChange);
    }

    console.log('✅ Filters initialized');
}

/**
 * handleSearchChange - Search input change handle பண்ணும்
 */
function handleSearchChange(e) {
    currentFilters.search = e.target.value.trim() || null;
    loadProducts();
}

/**
 * handleCategoryChange:
 *   - User category select பண்ணும்போது call ஆகும்
 *   - "Best Sellers" select பண்ணா best_selling_page-க்கு redirect பண்ணும்
 *   - மத்த categories-க்கு products filter பண்ணும்
 */
function handleCategoryChange(e) {
    const selectedValue = e.target.value;

    // Special case: "Best Sellers" select பண்ணா redirect பண்ணுறோம்
    if (selectedValue === 'best-sellers') {
        window.location.href = './best_selling_page.html';
        return;
    }

    // மத்த categories: filter update பண்ணி products reload பண்ணுறோம்
    currentFilters.category = selectedValue || null;
    loadProducts();

    // Page title update பண்ணுறோம்
    updatePageTitle();
}

/**
 * handlePriceChange - Price range change handle பண்ணும்
 */
function handlePriceChange() {
    const minPrice = document.getElementById('min-price')?.value;
    const maxPrice = document.getElementById('max-price')?.value;

    currentFilters.minPrice = minPrice ? parseFloat(minPrice) : null;
    currentFilters.maxPrice = maxPrice ? parseFloat(maxPrice) : null;

    loadProducts();
}

/**
 * clearFilters - எல்லா filters-ம் clear பண்ணும்
 */
function clearFilters() {
    currentFilters = {
        category: null,
        search: null,
        minPrice: null,
        maxPrice: null
    };

    // Input fields clear பண்ணுறோம்
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';

    // Products reload பண்ணுறோம்
    loadProducts();
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function updatePageTitle() {
    const pageTitle = document.querySelector('h1');
    if (!pageTitle) return;

    if (currentFilters.category) {
        // Category filter-ல currently selected option-ஓட text எடுக்குறோம்
        // Extra API call தேவையில்லை — dropdown-லயே text இருக்கு!
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect && categorySelect.selectedOptions[0]) {
            const selectedText = categorySelect.selectedOptions[0].textContent;
            pageTitle.textContent = '| ' + selectedText;
        } else {
            pageTitle.textContent = '| Products';
        }
    } else if (currentFilters.search) {
        pageTitle.textContent = '🔍 Search: "' + currentFilters.search + '"';
    } else {
        pageTitle.textContent = '| All Products';
    }
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductsPage);
} else {
    initProductsPage();
}

console.log('✅ Products.js loaded successfully!');
