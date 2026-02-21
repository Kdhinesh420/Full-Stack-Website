// ===================================================
// ADDRESS-LOGIC.JS - Shipping Address Page Logic
// ===================================================

// ===========================================
// PAGE INITIALIZATION
// ===========================================

async function initAddressPage() {
    console.log('🚚 Initializing address page...');

    // Login check
    if (!requireAuth()) {
        return;
    }

    try {
        showLoading('Loading shipping details...');

        // 1. Check if user already has an address
        const profile = await getUserProfile();

        if (profile && profile.address && profile.address.trim() !== "") {
            // Display saved address container
            const savedContainer = document.getElementById('saved-address-container');
            const savedDisplay = document.getElementById('saved-address-display');

            if (savedContainer && savedDisplay) {
                savedContainer.style.display = 'block';
                savedDisplay.innerHTML = `
                    <strong>${profile.username}</strong><br>
                    ${profile.address}<br>
                    Phone: ${profile.phone || 'Not provided'}
                `;

                // Setup use saved button
                document.getElementById('use-saved-btn').onclick = () => {
                    useSavedAddress(profile);
                };
            }

            // Pre-fill form just in case they want to edit it
            fillAddressForm(profile);
        }

        // 2. Setup form submission
        setupAddressForm();

        hideLoading();

    } catch (error) {
        hideLoading();
        console.error('Error loading address page:', error);
    }
}

// ===========================================
// ACTIONS
// ===========================================

/**
 * useSavedAddress - User-ோட profile-ல இருக்குற address-ஐ use பண்ணும்
 */
function useSavedAddress(profile) {
    const addressData = {
        fullName: profile.username,
        address: profile.address,
        phone: profile.phone
    };

    // Session storage-ல save பண்ணி checkout-க்கு அனுப்புறோம்
    sessionStorage.setItem('checkoutAddress', JSON.stringify(addressData));

    window.location.href = './checkout_review.html';
}

/**
 * fillAddressForm - Form-ஐ pre-fill பண்ணும்
 */
function fillAddressForm(profile) {
    // Basic fill logic - since backend address is one string, we might need to split it 
    // or just put it in street_address
    document.getElementById('first_name').value = profile.username.split(' ')[0] || '';
    document.getElementById('last_name').value = profile.username.split(' ').slice(1).join(' ') || '';
    document.getElementById('street_address').value = profile.address || '';
    document.getElementById('phone_number').value = profile.phone || '';
}

/**
 * setupAddressForm - Form submission setup
 */
function setupAddressForm() {
    const form = document.getElementById('address-form');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('first_name').value.trim();
        const lastName = document.getElementById('last_name').value.trim();
        const street = document.getElementById('street_address').value.trim();
        const apartment = document.getElementById('apartment').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const zip = document.getElementById('zip_code').value.trim();
        const phone = document.getElementById('phone_number').value.trim();
        const saveToProfile = document.getElementById('save_address').checked;

        const fullAddress = `${street}${apartment ? ', ' + apartment : ''}, ${city}, ${state} - ${zip}`;
        const fullName = `${firstName} ${lastName}`;

        const addressData = {
            fullName: fullName,
            address: fullAddress,
            phone: phone
        };

        try {
            if (saveToProfile) {
                showLoading('Updating profile address...');
                // Username-a mathama, address and phone-a mattum update panrom
                // username: fullName - ithai remove panniten to avoid 'Username already taken' error
                await updateUserProfile({
                    address: fullAddress,
                    phone: phone
                });
                hideLoading();
            }

            // Session storage-ல save பண்ணுறோம் (Checkout review page-ku thevai)
            sessionStorage.setItem('checkoutAddress', JSON.stringify(addressData));

            window.location.href = './checkout_review.html';

        } catch (error) {
            hideLoading();
            console.error('Failed to save address:', error);
            showModal('Failed to save address details', 'error');
        }
    };
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAddressPage);
} else {
    initAddressPage();
}

console.log('✅ Address Logic Loaded');
