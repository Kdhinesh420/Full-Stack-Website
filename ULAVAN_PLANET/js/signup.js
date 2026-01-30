/**
 * Signup Page JavaScript
 * Handles user registration functionality
 */

document.addEventListener('DOMContentLoaded', function () {
    // Check if already logged in
    if (isAuthenticated()) {
        const user = getUser();
        if (user) {
            if (user.role === 'seller') {
                window.location.href = './seller_dashboard.html';
            } else {
                window.location.href = '../index.html';
            }
            return;
        }
    }

    const signupForm = document.querySelector('form');
    const submitButton = document.querySelector('button[type="submit"]');

    // Create error/success message containers
    if (!document.getElementById('error-message')) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.display = 'none';
        errorDiv.style.color = 'red';
        errorDiv.style.marginBottom = '15px';
        errorDiv.style.padding = '10px';
        errorDiv.style.backgroundColor = '#ffe6e6';
        errorDiv.style.borderRadius = '5px';
        signupForm.insertBefore(errorDiv, signupForm.firstChild);
    }

    if (!document.getElementById('success-message')) {
        const successDiv = document.createElement('div');
        successDiv.id = 'success-message';
        successDiv.style.display = 'none';
        successDiv.style.color = 'green';
        successDiv.style.marginBottom = '15px';
        successDiv.style.padding = '10px';
        successDiv.style.backgroundColor = '#e6ffe6';
        successDiv.style.borderRadius = '5px';
        signupForm.insertBefore(successDiv, signupForm.firstChild);
    }

    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form values
        const username = document.getElementById('username')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;
        const phone = document.getElementById('phone')?.value.trim();
        const location = document.getElementById('location')?.value.trim() || '';
        const farmName = document.getElementById('farm-name')?.value.trim() || '';
        const address = location || farmName || 'Not provided';
        const role = document.getElementById('role')?.value;

        // Validation
        if (!username || !email || !password || !phone || !role) {
            showError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        // Show loading state
        const originalButtonText = submitButton.innerHTML;
        showLoading(submitButton);

        try {
            // Prepare signup data
            const signupData = {
                username: username,
                email: email,
                password: password,
                phone: phone,
                address: address,
                role: role
            };

            // Make signup request
            const response = await apiPost(API_CONFIG.AUTH.SIGNUP, signupData);

            // Save token and user data
            saveToken(response.access_token);
            saveUser(response.user);

            // Show success message
            showSuccess('Account created successfully! Redirecting...');

            // Redirect based on role
            setTimeout(() => {
                if (response.user && response.user.role === 'seller') {
                    window.location.href = './seller_dashboard.html';
                } else {
                    window.location.href = '../index.html';
                }
            }, 1500);

        } catch (error) {
            console.error('Signup error:', error);
            showError(error.message || 'Signup failed. Please try again.');
            hideLoading(submitButton, originalButtonText);
        }
    });
});
