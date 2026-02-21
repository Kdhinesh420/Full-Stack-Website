// ===================================================
// PRODUCT-ADD.JS - Add Product Page JavaScript
// ===================================================
// For sellers to add new products

// ===========================================
// PAGE INITIALIZATION
// ===========================================

function initAddProductPage() {
    console.log('📦 Initializing add product page...');

    // 1. Seller authentication check
    if (!requireRole('seller')) return;

    // 2. Load categories dynamically from backend
    loadCategories();

    // 3. Setup form
    setupAddProductForm();
}

// ===========================================
// LOAD CATEGORIES
// ===========================================

/**
 * loadCategories - Category dropdown load பண்ணும் (Backend API-ல இருந்து)
 */
async function loadCategories() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return;

    // Clear existing options except default and 'new'
    categorySelect.innerHTML = `
        <option value="">Select Category</option>
        <option value="new">+ Create New Category</option>
    `;

    try {
        // Fetch categories from backend
        // Note: Make sure api.js has getCategories() function
        const categories = await getCategories();

        // Add options
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.category_id; // Use primary key from DB
            option.textContent = cat.name;

            // Insert before the 'Create New' option
            categorySelect.insertBefore(option, categorySelect.lastElementChild);
        });

    } catch (error) {
        console.error("Error loading categories:", error);
        // Fallback or show error
    }
}

/**
 * toggleNewCategoryInput - "New Category" input field-ஐ காட்ட/மறைக்க
 */
function toggleNewCategoryInput() {
    const categorySelect = document.getElementById('category');
    const newCategoryContainer = document.getElementById('new-category-container');

    if (categorySelect.value === 'new') {
        newCategoryContainer.style.display = 'block';
        document.getElementById('new-category-name').focus();
    } else {
        newCategoryContainer.style.display = 'none';
    }
}
// Exporting to global scope for HTML inline call
window.toggleNewCategoryInput = toggleNewCategoryInput;

// ===========================================
// FORM HANDLING
// ===========================================

/**
 * setupAddProductForm - Form validation and submission setup
 */
function setupAddProductForm() {
    const form = document.getElementById('add-product-form');
    if (!form) return;

    // Image preview
    const imageInput = document.getElementById('product-images');
    imageInput.addEventListener('change', handleImagePreview);

    // Form submit
    form.addEventListener('submit', handleAddProductSubmit);
}

/**
 * handleImagePreview - Image select பண்ணும்போது preview காட்டும்
 */
function handleImagePreview(e) {
    const previewContainer = document.getElementById('image-preview');
    previewContainer.innerHTML = ''; // Clear existing

    const files = e.target.files;

    if (files.length > 3) {
        showModal('Maximum 3 images allowed', 'warning');
        e.target.value = ''; // Clear selection
        return;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate type
        if (!file.type.startsWith('image/')) {
            showModal('Please select valid image files', 'warning');
            continue;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '80px';
            img.style.height = '80px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '5px';
            img.style.border = '1px solid #ddd';
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

/**
 * handleAddProductSubmit - Form submission handle பண்ணும்
 */
async function handleAddProductSubmit(e) {
    e.preventDefault();

    try {
        showLoading('Uploading product...');

        // 1. Get Form Data
        const name = document.getElementById('name').value.trim();
        let categoryId = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();
        const price = parseFloat(document.getElementById('price').value);
        const stock = parseInt(document.getElementById('stock').value);
        const imageFiles = document.getElementById('product-images').files;

        // 2. Handle New Category Creation
        if (categoryId === 'new') {
            const newCategoryName = document.getElementById('new-category-name').value.trim();
            if (!newCategoryName) {
                hideLoading();
                showModal('Please enter a name for the new category', 'warning');
                return;
            }

            try {
                // Create new category via API
                // Assuming createCategory returns object with category_id
                const newCat = await createCategory(newCategoryName, "User created category");
                categoryId = newCat.category_id; // Use the new ID
            } catch (catError) {
                hideLoading();
                showModal('Failed to create new category. Please try again.', 'error');
                return;
            }
        }

        // Convert to integer (backend expects integer)
        categoryId = parseInt(categoryId);

        // 3. Validate
        if (imageFiles.length === 0) {
            hideLoading();
            showModal('Please select at least one image', 'warning');
            return;
        }

        // 4. Upload Images first
        const uploadedImageUrls = await uploadImages(imageFiles);

        if (!uploadedImageUrls || uploadedImageUrls.length === 0) {
            hideLoading();
            showModal('Image upload failed. Please try again.', 'error');
            return;
        }

        // 5. Create Product Data
        const productData = {
            name: name,
            category_id: categoryId, // Backend expects category_id (snake_case)
            description: description, // Matches backend Pydantic model
            price: price,
            stock_quantity: stock, // Matches backend Pydantic model
            image_url: uploadedImageUrls[0], // Main image
            // Handles multiple images
            image_url_2: uploadedImageUrls[1] || null,
            image_url_3: uploadedImageUrls[2] || null
        };

        // 6. Send to Backend
        const result = await createProduct(productData);

        hideLoading();

        if (result) {
            showModal('Product added successfully! 🎉', 'success');

            // Wait and redirect to dashboard
            setTimeout(() => {
                window.location.href = 'seller_dashboard.html';
            }, 2000);
        }

    } catch (error) {
        hideLoading();
        console.error('Add product error:', error);
        showModal(error.detail || error.message || 'Failed to add product', 'error');
    }
}

/**
 * uploadImages - Helper to upload multiple images
 * @param {FileList} files 
 * @returns {Promise<Array>} Array of image URLs
 */
async function uploadImages(files) {
    const urls = [];

    // Upload files one by one using api.js uploadImage function
    for (let i = 0; i < files.length; i++) {
        try {
            // uploadImage expects a File object
            const response = await uploadImage(files[i]);

            if (response && response.url) {
                urls.push(response.url);
            } else if (typeof response === 'string') {
                urls.push(response);
            }
        } catch (error) {
            console.error(`Failed to upload image ${i + 1}:`, error);
        }
    }

    return urls;
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAddProductPage);
} else {
    initAddProductPage();
}
