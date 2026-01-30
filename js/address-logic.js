/**
 * Address Page Logic
 * Handles capturing shipping details and saving them before checkout review
 */

document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication
    if (!requireAuth()) return;

    const addressForm = document.getElementById('address-form');
    const savedAddressContainer = document.getElementById('saved-address-container');
    const savedAddressDisplay = document.getElementById('saved-address-display');
    const useSavedBtn = document.getElementById('use-saved-btn');

    // Get the most up-to-date user data from API
    let user = getUser();
    try {
        const freshUser = await apiGet(API_CONFIG.AUTH.ME);
        if (freshUser) {
            user = freshUser;
            saveUser(user); // Update local storage
        }
    } catch (err) {
        console.warn('Could not fetch fresh user data, using cached.', err);
    }

    // Handle Saved Address Display
    if (user && user.address && user.address.trim() !== '') {
        if (savedAddressContainer && savedAddressDisplay) {
            savedAddressContainer.style.display = 'block';
            savedAddressDisplay.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <i class="fas fa-map-marker-alt" style="color: #2e7d32; margin-top: 5px;"></i>
                    <div>
                        <strong>${user.username}</strong><br>
                        ${user.address}<br>
                        <strong>Phone:</strong> ${user.phone || 'Not provided'}
                    </div>
                </div>
            `;
        }
    }

    // Pre-fill form (partial attempt)
    if (user) {
        // Splitting by space for name if possible
        const nameParts = user.username ? user.username.split(' ') : ['', ''];
        if (document.getElementById('first_name')) document.getElementById('first_name').value = nameParts[0] || '';
        if (document.getElementById('last_name')) document.getElementById('last_name').value = nameParts.slice(1).join(' ') || '';

        if (document.getElementById('phone_number')) document.getElementById('phone_number').value = user.phone || '';

        // Try to parse address fields if it follows the format: "Street, City, State, Country - Zip"
        if (user.address) {
            const parts = user.address.split(',').map(p => p.trim());
            if (parts.length >= 2) {
                if (document.getElementById('street_address')) document.getElementById('street_address').value = parts[0];
                if (document.getElementById('city')) document.getElementById('city').value = parts[1];

                // If there are more parts, try to fill state
                if (parts.length >= 3) {
                    const statePart = parts[2];
                    if (document.getElementById('state')) document.getElementById('state').value = statePart;
                }

                // Handle Zip Code if it's in the last part with a hyphen
                const lastPart = parts[parts.length - 1];
                if (lastPart.includes('-')) {
                    const zipParts = lastPart.split('-').map(p => p.trim());
                    if (zipParts.length > 1 && document.getElementById('zip_code')) {
                        document.getElementById('zip_code').value = zipParts[zipParts.length - 1];
                    }
                }
            } else {
                // fallback to just putting it in street if it's not comma separated
                if (document.getElementById('street_address')) document.getElementById('street_address').value = user.address;
            }
        }
    }

    // Use Saved Address Button
    if (useSavedBtn) {
        useSavedBtn.addEventListener('click', function () {
            const nameParts = user.username ? user.username.split(' ') : ['User', ''];

            const addressData = {
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' ') || 'User',
                street: user.address,
                phone: user.phone || ''
            };

            sessionStorage.setItem('temp_shipping_address', JSON.stringify(addressData));
            sessionStorage.setItem('temp_full_address_string', user.address);

            // Redirect directly to review
            window.location.href = 'checkout_review.html';
        });
    }

    if (addressForm) {
        addressForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = addressForm.querySelector('.continue-button');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            // Gather data
            const addressData = {
                firstName: document.getElementById('first_name').value,
                lastName: document.getElementById('last_name').value,
                street: document.getElementById('street_address').value,
                apartment: document.getElementById('apartment').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                country: document.getElementById('country').value,
                zip: document.getElementById('zip_code').value,
                phone: document.getElementById('phone_number').value
            };

            // Format full address string
            const fullAddressString = `${addressData.street}${addressData.apartment ? ', ' + addressData.apartment : ''}, ${addressData.city}, ${addressData.state}, ${addressData.country} - ${addressData.zip}`;

            // Save for the review page
            sessionStorage.setItem('temp_shipping_address', JSON.stringify(addressData));
            sessionStorage.setItem('temp_full_address_string', fullAddressString);

            // Optionally save to profile
            if (document.getElementById('save_address').checked) {
                // Only update if something changed
                if (fullAddressString !== user.address || addressData.phone !== user.phone) {
                    try {
                        await apiPut(API_CONFIG.AUTH.ME, {
                            address: fullAddressString,
                            phone: addressData.phone
                        });

                        // Update local user object
                        const updatedUser = { ...user, address: fullAddressString, phone: addressData.phone };
                        saveUser(updatedUser);
                    } catch (err) {
                        console.error('Failed to save address to profile:', err);
                    }
                }
            }

            // Redirect to review page
            window.location.href = 'checkout_review.html';
        });
    }
});
