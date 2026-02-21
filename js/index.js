// ===================================================
// INDEX.JS - Home Page JavaScript
// ===================================================
// index.html page-க்கான functionality
// Categories and Products display பண்ணுறோம்

/* 
    இந்த page-ல:
    1. Categories காட்டுறோம்
    2. Popular/Featured products காட்டுறோம்
    3. Search functionality
*/

// ===========================================
// PAGE INITIALIZATION
// ===========================================

/**
 * initHomePage - Home page initialize பண்ணும் function
 * Page load ஆனதும் இது run ஆகும்
 */
async function initHomePage() {
    console.log('🏠 Initializing home page...');

    try {
        // Categories load பண்ணுறோம்
        await loadCategories();

        // Featured products load பண்ணுறோம்
        await loadFeaturedProducts();

        // Search functionality setup பண்ணுறோம்
        setupSearch();

    } catch (error) {
        console.error('Error initializing home page:', error);
        showModal('Failed to load page content', 'error');
    }
}

// ===========================================
// CATEGORIES SECTION
// ===========================================

/**
 * loadCategories - Categories காட்டும் function
 */
async function loadCategories() {
    try {
        const categoryContainer = document.getElementById('category-box');

        if (!categoryContainer) {
            console.warn('Category container not found');
            return;
        }

        // Loading message clear பண்ணுறோம்
        categoryContainer.innerHTML = '';

        // Categories backend-ல் இருந்து load பண்ணுறோம்
        const categories = await getCategories();

        if (categories && categories.length > 0) {

            // ஒவ்வொரு category-க்கும் card create பண்ணுறோம்
            categories.forEach(category => {
                // Determine image based on name (matching the old static design)
                let image = 'assets/images/ulavan seeds.webp'; // Default icon
                if (category.name.toLowerCase().includes('flower')) {
                    image = 'assets/images/flower seeds.jpg';
                } else if (category.name.toLowerCase().includes('fruit')) {
                    image = 'assets/images/fruits.webp';
                } else if (category.name.toLowerCase().includes('vegetable')) {
                    image = 'assets/images/vege seeds.png';
                } else if (category.name.toLowerCase().includes('grain')) {
                    image = 'assets/images/ulavan seeds.webp';
                } else if (category.name.toLowerCase().includes('herb')) {
                    image = 'assets/images/ulavan seeds.webp';
                }

                category.image = image;
                category.id = category.category_id; // Backend uses category_id

                const categoryCard = createCategoryCard(category);
                categoryContainer.appendChild(categoryCard);
            });

            // "Best Sellers" category-ஐ manually add பண்ணுறோம்
            const bestSellerCategory = {
                id: 'best_sellers',
                name: 'Best Sellers',
                image: 'assets/images/best.jpg'
            };
            categoryContainer.appendChild(createCategoryCard(bestSellerCategory));

            console.log(`✅ Loaded ${categories.length + 1} categories (including Best Sellers)`);

        } else {
            categoryContainer.innerHTML = `
                <p style="grid-column: 1/-1; text-align: center; color: #666;">
                    No categories available
                </p>
            `;
        }

    } catch (error) {
        console.error('Failed to load categories:', error);
        const categoryContainer = document.getElementById('category-box');
        if (categoryContainer) {
            categoryContainer.innerHTML = `
                <p style="grid-column: 1/-1; text-align: center; color: #f44336;">
                    Failed to load categories
                </p>
            `;
        }
    }
}

/**
 * createCategoryCard - Category card element create பண்ணும்
 * @param {object} category - Category data
 * @returns {HTMLElement} - Category card element
 */
function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'round'; // Use the 'round' class from index.css

    // Category page-க்கு link
    // "Best Sellers" category-க்கு மட்டும் link-ஐ மாத்துறோம்
    let categoryUrl = `./pages/products_page.html?category=${encodeURIComponent(category.id)}`;
    if (category.name === 'Best Sellers') {
        categoryUrl = './pages/best_selling_page.html';
    }

    card.innerHTML = `
        <a href="${categoryUrl}" style="text-decoration: none; display: flex; flex-direction: column; align-items: center;">
            <img src="${category.image}" alt="${category.name}" onerror="this.src='assets/images/ulavan seeds.webp'">
            <strong>${category.name}</strong>
        </a>
    `;

    return card;
}

// ===========================================
// FEATURED PRODUCTS SECTION
// ===========================================

/**
 * loadFeaturedProducts - Featured/Popular products load பண்ணும்
 */
async function loadFeaturedProducts() {
    try {
        // Category title update
        const categoryTitle = document.querySelector('.category-title');
        if (categoryTitle) {
            categoryTitle.textContent = '🌟 Featured Products';
        }

        // Products container find பண்ணுறோம்
        const productGrids = document.querySelectorAll('.product-grid');
        const featuredGrid = productGrids[0]; // First grid for featured products

        if (!featuredGrid) {
            console.warn('Featured products grid not found');
            return;
        }

        // Loading indicator காட்டுறோம்
        featuredGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #10b981;"></i>
                <p>Loading products...</p>
            </div>
        `;

        // Backend-ல இருந்து products fetch பண்ணுறோம்
        const products = await getAllProducts({ limit: 8 });

        // Products render பண்ணுறோம்
        if (products && products.length > 0) {
            featuredGrid.innerHTML = '';

            products.slice(0, 8).forEach(product => {
                const productCard = createProductCard(product);
                featuredGrid.appendChild(productCard);
            });

            console.log(`✅ Loaded ${products.length} featured products`);

        } else {
            featuredGrid.innerHTML = `
                <p style="grid-column: 1/-1; text-align: center; color: #666;">
                    No products available
                </p>
            `;
        }

    } catch (error) {
        console.error('Failed to load featured products:', error);
        const productGrids = document.querySelectorAll('.product-grid');
        const featuredGrid = productGrids[0];
        if (featuredGrid) {
            featuredGrid.innerHTML = `
                <p style="grid-column: 1/-1; text-align: center; color: #f44336;">
                    Failed to load products
                </p>
            `;
        }
    }
}

// ===========================================
// BEST SELLING PRODUCTS SECTION
// ===========================================

/**
 * loadBestSellingProducts - Best selling products load பண்ணும்
 */
async function loadBestSellingProducts() {
    try {
        // Popular title update
        const popularTitle = document.querySelector('.popular-title');
        if (popularTitle) {
            popularTitle.textContent = '🔥 Best Selling Products';
        }

        // Products container find பண்ணுறோம்
        const productGrids = document.querySelectorAll('.product-grid');
        const bestSellingGrid = productGrids[1]; // Second grid for best sellers

        if (!bestSellingGrid) {
            console.warn('Best selling products grid not found');
            return;
        }

        // Loading indicator
        bestSellingGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #10b981;"></i>
                <p>Loading best sellers...</p>
            </div>
        `;

        // Backend-ல இருந்து best sellers fetch பண்ணுறோம்
        const bestSellers = await getBestSellingProducts(8);

        // Products render பண்ணுறோம்
        if (bestSellers && bestSellers.length > 0) {
            bestSellingGrid.innerHTML = '';

            bestSellers.forEach(product => {
                const productCard = createProductCard(product);
                bestSellingGrid.appendChild(productCard);
            });

            console.log(`✅ Loaded ${bestSellers.length} best selling products`);

        } else {
            // Featured products-ஐ மறுபடியும் காட்டுறோம் (if no best sellers)
            const fallbackProducts = await getAllProducts({ limit: 8 });

            if (fallbackProducts && fallbackProducts.length > 0) {
                bestSellingGrid.innerHTML = '';
                fallbackProducts.slice(0, 8).forEach(product => {
                    const productCard = createProductCard(product);
                    bestSellingGrid.appendChild(productCard);
                });
            } else {
                bestSellingGrid.innerHTML = `
                    <p style="grid-column: 1/-1; text-align: center; color: #666;">
                        No best sellers available
                    </p>
                `;
            }
        }

    } catch (error) {
        console.error('Failed to load best selling products:', error);
    }
}

// ===========================================
// PRODUCT CARD CREATION
// ===========================================

/**
 * createProductCard - Product card element create பண்ணும்
 * @param {object} product - Product data
 * @returns {HTMLElement} - Product card element
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

    // Product page URL
    const productUrl = `./pages/product.html?id=${product.id}`;

    // Product image - multiple images-ஆ இருந்தா first image எடுக்குறோம்
    let imageUrl = product.image_url;
    if (product.image_urls && product.image_urls.length > 0) {
        imageUrl = product.image_urls[0];
    }

    card.innerHTML = `
        <a href="${productUrl}" style="text-decoration: none; color: inherit;">
            <img src="${imageUrl || './assets/images/placeholder.png'}" 
                 alt="${product.name}" 
                 style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;"
                 onerror="this.src='./assets/images/placeholder.png'">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333; min-height: 40px;">
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
                    font-size: 14px;
                ">Add to Cart</button>
            </div>
        </a>
    `;

    // Hover effect
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
 * handleAddToCart - Add to cart button click handle பண்ணும்
 * @param {number} productId - Product ID
 * @param {Event} event - Click event
 */
async function handleAddToCart(productId, event) {
    // Event propagation stop பண்ணுறோம் (product page-க்கு போகாம இருக்க)
    event.preventDefault();
    event.stopPropagation();

    try {
        // Login check
        if (!isLoggedIn()) {
            showModal('Please login to add items to cart', 'warning');
            setTimeout(() => {
                window.location.href = './pages/login.html';
            }, 1500);
            return;
        }

        // Add to cart API call
        await addToCart(productId, 1);

    } catch (error) {
        console.error('Failed to add to cart:', error);
    }
}

// ===========================================
// SEARCH FUNCTIONALITY
// ===========================================

/**
 * setupSearch - Search functionality setup பண்ணும்
 */
function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    if (!searchInput || !searchButton) {
        console.warn('Search elements not found');
        return;
    }

    // Search button click event
    searchButton.addEventListener('click', performSearch);

    // Enter key press event
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    console.log('✅ Search functionality initialized');
}

/**
 * performSearch - Search execute பண்ணும்
 */
function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const query = searchInput.value.trim();

    if (query.length === 0) {
        showModal('Please enter a search term', 'warning');
        return;
    }

    // Products page-க்கு search query-ஓட redirect
    window.location.href = `./pages/products_page.html?search=${encodeURIComponent(query)}`;
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

// Page load ஆனதும் home page initialize பண்ணுறோம்
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomePage);
} else {
    // Already loaded
    initHomePage();
}

// Console message
console.log('✅ Index.js loaded successfully!');
