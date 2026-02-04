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
    // We wrap this in an async function to avoid blocking the main flow but still ensure fields exist
    const initializeForm = async () => {
        await addMissingFields(form, submitBtn);
    };
    initializeForm();

    // Handle form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('product-name').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);

        // Use optional chaining in case they are not added yet (though initializeForm should handle it)
        const stockInput = document.getElementById('product-stock');
        const stock = stockInput ? parseInt(stockInput.value) : 10;

        const categorySelect = document.getElementById('product-category');
        let categoryId = categorySelect ? categorySelect.value : null;

        const newCategoryInput = document.getElementById('new-category-name');
        const newCategoryName = newCategoryInput ? newCategoryInput.value.trim() : '';

        // Get the files
        const fileInput = document.getElementById('product-images');
        const files = fileInput.files;

        // Validation
        if (!name || isNaN(price)) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        if (files.length === 0) {
            alert('Please select at least one image.');
            return;
        }

        // Additional Frontend Validation for Image Types
        for (let i = 0; i < files.length; i++) {
            if (!files[i].type.startsWith('image/')) {
                alert(`File "${files[i].name}" is not a valid image.`);
                return;
            }
        }

        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;

        try {
            // 1. Upload Images to Cloudinary one by one (since bulk is missing on Render)
            const imageUrls = [];
            for (let i = 0; i < Math.min(files.length, 3); i++) { // Limit to 3 images as per deployed schema
                submitBtn.textContent = `Uploading Image ${i + 1}/${Math.min(files.length, 3)}...`;

                const formData = new FormData();
                formData.append('file', files[i]); // Render expects 'file' for single upload

                console.log('Uploading image to:', API_CONFIG.UPLOAD.IMAGE);
                const uploadRes = await apiPostFormData(API_CONFIG.UPLOAD.IMAGE, formData);

                if (uploadRes && uploadRes.url) {
                    imageUrls.push(uploadRes.url);
                }
            }

            if (imageUrls.length === 0) {
                throw new Error('No images were successfully uploaded.');
            }

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

            // 3. Create Product with Image URLs mapping to Render schema
            submitBtn.textContent = 'Creating Product...';
            const productData = {
                name: name,
                description: description,
                price: price,
                stock_quantity: stock,
                category_id: categoryId ? parseInt(categoryId) : null,
                image_url: imageUrls[0] || null,
                image_url_2: imageUrls[1] || null,
                image_url_3: imageUrls[2] || null
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
