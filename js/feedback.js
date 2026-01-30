/**
 * Feedback Page JavaScript
 * Handles user feedback submission functionality
 */

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    if (!requireAuth()) return;
    updateAuthUI();

    const user = getUser();
    const feedbackForm = document.querySelector('form');
    const nameInput = document.querySelector('input[type="text"]');
    const emailInput = document.querySelector('input[type="email"]');
    const commentBox = document.querySelector('.comment-box');
    const submitBtn = document.querySelector('.submit-button');
    const emojiOptions = document.querySelectorAll('.emoji-option');

    let selectedRating = 'Great'; // Default as per HTML active state

    // Pre-fill user data
    if (user) {
        if (nameInput) nameInput.value = user.username;
        if (emailInput) emailInput.value = user.email;
    }

    // Handle emoji selection
    emojiOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Remove active state from all
            emojiOptions.forEach(opt => opt.style.opacity = '0.5');

            // Set active state to clicked
            this.style.opacity = '1';
            selectedRating = this.querySelector('.emoji-label').textContent;
        });
    });

    // Handle form submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (!commentBox.value.trim()) {
                alert('Please provide some comments.');
                return;
            }

            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            const feedbackData = {
                issue_type: 'Feedback: ' + selectedRating,
                subject: 'User Feedback from ' + (nameInput.value || 'Anonymous'),
                description: commentBox.value,
                order_id: null
            };

            try {
                await apiPost(API_CONFIG.REPORTS.BASE, feedbackData);
                alert('Thank you for your feedback!');
                window.location.href = '../index.html';
            } catch (err) {
                console.error('Feedback submission error:', err);
                alert('Failed to submit feedback. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });

        // Ensure the submit button (which is an <a> tag currently) triggers the form
        if (submitBtn && submitBtn.tagName === 'A') {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                feedbackForm.dispatchEvent(new Event('submit'));
            });
        }
    }
});
