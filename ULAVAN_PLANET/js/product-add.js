/**
 * Product Add Page JavaScript
 * Handles creation of new products by sellers
 */

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication and role
    if (!requireAuth()) return;
    if (!requireSeller()) return;

    // UI Elements
    const form = document.querySelector('form');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Add missing form fields if they don't exist
    addMissingFields(form, submitBtn);

    // Handle form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('product-name').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const stock = parseInt(document.getElementById('product-stock').value);
        let categoryId = document.getElementById('product-category').value;
        const newCategoryName = document.getElementById('new-category-name')?.value.trim();

        // Get the files
        const fileInput = document.getElementById('product-images');
        const files = fileInput.files;

        // Validation
        if (!name || isNaN(price) || isNaN(stock)) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        if (files.length === 0) {
            alert('Please select at least one image.');
            return;
        }

        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;

        try {
            // 1. Upload Images to Cloudinary via Backend
            submitBtn.textContent = `Uploading ${files.length} Images...`;
            const formData = new FormData();

            // Append all files
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            // Use the new bulk upload endpoint (manually constructed URL if config not updated yet)
            // Assuming API_CONFIG.UPLOAD.IMAGE is /upload/image, we use /upload/images
            const uploadUrl = API_CONFIG.UPLOAD.IMAGE + "s";
            const uploadRes = await apiPostFormData(uploadUrl, formData);

            const imageUrls = uploadRes.urls;
            const primaryImageUrl = imageUrls[0]; // Use first image as primary

            // 2. Create Category (if needed)
            if (categoryId === 'new') {
                if (!newCategoryName) {
                    throw new Error('Please enter a name for the new category');
                }

                submitBtn.textContent = 'Creating Category...';
                const newCat = await apiPost(API_CONFIG.CATEGORIES.BASE, {
                    name: newCategoryName,
                    description: `Category for ${newCategoryName}`
                });
                categoryId = newCat.category_id || newCat.id;
            }

            // 3. Create Product with Image URLs
            submitBtn.textContent = 'Creating Product...';
            const productData = {
                name: name,
                description: description,
                price: price,
                stock_quantity: stock,
                category_id: categoryId ? parseInt(categoryId) : null,
                image_url: primaryImageUrl,
                images: imageUrls
            };

            await apiPost(API_CONFIG.PRODUCTS.BASE, productData);

            submitBtn.textContent = 'Success!';
            submitBtn.style.backgroundColor = '#4caf50';

            setTimeout(() => {
                alert('Product created successfully!');
                window.location.href = 'seller_dashboard.html';
            }, 1000);

        } catch (error) {
            console.error('Error creating product:', error);
            alert(error.message || 'Failed to create product');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});

/**
 * Dynamically add Stock, Category if missing
 */
async function addMissingFields(form, submitBtn) {
    // Stock Field
    if (!document.getElementById('product-stock')) {
        const stockGroup = document.createElement('div');
        stockGroup.className = 'form-group';
        stockGroup.innerHTML = `
            <label for="product-stock">Stock Quantity</label>
            <input type="number" id="product-stock" name="product-stock" required min="1" value="10">
        `;
        form.insertBefore(stockGroup, submitBtn.closest('.form-group') || submitBtn);
    }

    // Category Field (Dropdown + New Category Option)
    if (!document.getElementById('product-category')) {
        const catGroup = document.createElement('div');
        catGroup.className = 'form-group';

        let categories = PRODUCT_CATEGORIES;
        try {
            const apiCategories = await apiGet(API_CONFIG.CATEGORIES.BASE);
            if (apiCategories && apiCategories.length > 0) {
                categories = apiCategories;
            }
        } catch (e) {
            console.warn('Using default categories');
        }

        const options = categories.map(cat =>
            `<option value="${cat.category_id || cat.id}">${cat.name}</option>`
        ).join('');

        catGroup.innerHTML = `
            <label for="product-category">Category</label>
            <select id="product-category" name="product-category" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; background: white; font-size: 1rem; margin-bottom: 10px;">
                <option value="">-- Select a Category --</option>
                ${options}
                <option value="new" style="background: #e8f5e9; font-weight: bold; color: #2e7d32;">+ Create New Category</option>
            </select>
            <div id="new-category-input-container" style="display: none; transition: all 0.3s ease;">
                <label for="new-category-name" style="font-size: 0.85em; color: #2e7d32;">New Category Name</label>
                <input type="text" id="new-category-name" name="new-category-name" placeholder="Enter new category name (e.g. Organic Fertilizers)" style="width: 100%; padding: 10px; border: 2px solid #2e7d32; border-radius: 8px;">
            </div>
        `;
        form.insertBefore(catGroup, submitBtn.closest('.form-group') || submitBtn);

        // Toggle new category input
        const catSelect = document.getElementById('product-category');
        const newCatContainer = document.getElementById('new-category-input-container');
        catSelect.addEventListener('change', function () {
            if (this.value === 'new') {
                newCatContainer.style.display = 'block';
                document.getElementById('new-category-name').focus();
            } else {
                newCatContainer.style.display = 'none';
            }
        });
    }
}
