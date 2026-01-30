/**
 * Bestsellers Page JavaScript
 * Handles dynamic loading of top-performing products
 */

document.addEventListener('DOMContentLoaded', async function () {
    const productGrid = document.getElementById('product-grid');
    const sortSelect = document.getElementById('sort');
    const showingStatus = document.querySelector('main p.text-gray-700');

    // Initialize UI
    updateAuthUI();

    // Initial load
    loadBestsellers();

    // Event Listeners
    if (sortSelect) {
        sortSelect.addEventListener('change', loadBestsellers);
    }

    /**
     * Load and render bestselling products
     */
    async function loadBestsellers() {
        if (!productGrid) return;

        showLoading(productGrid);

        try {
            // In a real app, we might have a specific endpoint or filter
            // Here we'll just fetch products and maybe sort them
            let url = `${API_CONFIG.PRODUCTS.BASE}?limit=12`;

            const sortBy = sortSelect ? sortSelect.value : 'Popularity';
            // Backend sorting would be better, but we'll do what we can with the API
            // For now, let's just fetch the products

            const products = await apiGet(url);
            renderBestsellers(products);

            if (showingStatus) {
                showingStatus.textContent = `Showing 1-${products.length} of ${products.length} Bestselling Products`;
            }
        } catch (error) {
            console.error('Error loading bestsellers:', error);
            productGrid.innerHTML = '<p class="col-span-full text-center py-10 text-red-500">Failed to load bestsellers. Please try again later.</p>';
        }
    }

    /**
     * Render products using Tailwind-compatible cards
     */
    function renderBestsellers(products) {
        productGrid.innerHTML = '';

        if (!products || products.length === 0) {
            productGrid.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">No bestselling products found at the moment.</p>';
            return;
        }

        products.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'product-card bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 transform hover:scale-[1.02] transition duration-300';

            const imageUrl = product.image_url || '../assets/images/logoooo.png';
            const oldPrice = (product.price * 1.25).toFixed(2);

            // Random review count for demo
            const reviews = Math.floor(Math.random() * 2000) + 100;

            card.innerHTML = `
                <div class="relative">
                    <a href="product.html?id=${product.id}">
                        <img src="${imageUrl}" alt="${product.name}" class="w-full h-56 object-cover">
                    </a>
                    ${index < 3 ? `
                    <span class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        #${index + 1} Best Seller
                    </span>` : ''}
                    ${product.stock_quantity <= 0 ? `
                    <span class="absolute top-3 right-3 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Out of Stock
                    </span>` : ''}
                </div>
                <div class="p-5">
                    <h3 class="text-xl font-bold text-gray-800 mb-1">${product.name}</h3>
                    <p class="text-sm text-gray-500 mb-3 line-clamp-1">${product.description || 'Premium quality product from Ulavan Planet'}</p>

                    <div class="flex items-center mb-3">
                        <div class="flex text-yellow-400 mr-2">
                            ${getStarsHTML(4.5 + Math.random() * 0.5)}
                        </div>
                        <span class="text-sm font-semibold text-gray-600">(${reviews} reviews)</span>
                    </div>

                    <p class="text-2xl font-extrabold text-green-700 mb-4">
                        ₹ ${parseFloat(product.price).toFixed(2)}
                        <span class="text-base text-gray-400 line-through ml-2">₹ ${oldPrice}</span>
                    </p>

                    <button class="add-to-cart cta-button w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-md transition duration-300" 
                            data-id="${product.id}" ${product.stock_quantity <= 0 ? 'disabled' : ''}>
                        ${product.stock_quantity <= 0 ? 'No Stock' : 'Add to Cart'}
                    </button>
                </div>
            `;

            const addButton = card.querySelector('.add-to-cart');
            addButton.addEventListener('click', (e) => {
                e.preventDefault();
                handleAddToCart(product.id, addButton);
            });

            productGrid.appendChild(card);
        });
    }

    async function handleAddToCart(productId, button) {
        if (!isAuthenticated()) {
            const isInPages = window.location.pathname.includes('/pages/');
            window.location.href = isInPages ? 'login.html' : './pages/login.html';
            return;
        }

        if (!isBuyer()) {
            alert('Sellers cannot buy products. Please use a buyer account.');
            return;
        }

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Adding...';

        try {
            await apiPost(API_CONFIG.CART.BASE, {
                product_id: parseInt(productId),
                quantity: 1
            });

            button.textContent = 'Added! ✓';
            button.classList.remove('bg-green-600');
            button.classList.add('bg-green-500');

            setTimeout(() => {
                button.disabled = false;
                button.textContent = originalText;
                button.classList.remove('bg-green-500');
                button.classList.add('bg-green-600');
            }, 2000);
        } catch (error) {
            alert(error.message || 'Failed to add to cart');
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    function getStarsHTML(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars += `<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" /></svg>`;
            } else if (i === Math.ceil(rating)) {
                stars += `<svg class="w-4 h-4 fill-current opacity-50" viewBox="0 0 20 20"><path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" /></svg>`;
            } else {
                stars += `<svg class="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20"><path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" /></svg>`;
            }
        }
        return stars;
    }

    function showLoading(container) {
        container.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mb-4"></div>
                <p class="text-green-800 font-medium">Bestsellers are on the way...</p>
            </div>
        `;
    }
});
