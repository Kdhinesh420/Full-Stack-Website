/**
 * Login Page JavaScript
 * Handles user login functionality
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

    const loginForm = document.querySelector('form');
    const usernameInput = document.querySelector('input[type="text"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = document.querySelector('button[type="submit"]');

    // Create error message container if it doesn't exist
    if (!document.getElementById('error-message')) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.display = 'none';
        errorDiv.style.color = 'red';
        errorDiv.style.marginBottom = '15px';
        errorDiv.style.padding = '10px';
        errorDiv.style.backgroundColor = '#ffe6e6';
        errorDiv.style.borderRadius = '5px';
        loginForm.insertBefore(errorDiv, loginForm.firstChild);
    }

    // Create success message container if it doesn't exist
    if (!document.getElementById('success-message')) {
        const successDiv = document.createElement('div');
        successDiv.id = 'success-message';
        successDiv.style.display = 'none';
        successDiv.style.color = 'green';
        successDiv.style.marginBottom = '15px';
        successDiv.style.padding = '10px';
        successDiv.style.backgroundColor = '#e6ffe6';
        successDiv.style.borderRadius = '5px';
        loginForm.insertBefore(successDiv, loginForm.firstChild);
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Validation
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        // Show loading state
        const originalButtonText = submitButton.innerHTML;
        showLoading(submitButton);

        try {
            // Create form data for OAuth2PasswordRequestForm
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            // Make login request
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }

            const data = await response.json();

            // Save token and user data
            saveToken(data.access_token);
            saveUser(data.user);

            // Show success message
            showSuccess('Login successful! Redirecting...');

            // Redirect based on role
            setTimeout(() => {
                if (data.user && data.user.role === 'seller') {
                    window.location.href = './seller_dashboard.html';
                } else {
                    window.location.href = '../index.html';
                }
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            showError(error.message || 'Login failed. Please try again.');
            hideLoading(submitButton, originalButtonText);
        }
    });
});
