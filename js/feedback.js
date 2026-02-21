// ===================================================
// FEEDBACK.JS - Feedback Page JavaScript
// ===================================================
// User feedback submission

/**
 * initFeedbackPage - Page load ஆகும்போது call ஆகும்
 */
function initFeedbackPage() {
    console.log('💬 Initializing feedback page...');
    setupFeedbackForm();
}

/**
 * setupFeedbackForm - Form event listener setup பண்ணும்
 */
function setupFeedbackForm() {
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
        console.log('✅ Feedback form initialized');
    }
}

/**
 * handleFeedbackSubmit - Feedback form submit logic
 */
async function handleFeedbackSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('.submit-button');
    const originalBtnText = submitBtn?.textContent || 'Submit';

    try {
        // Step 1: Input value-ai edukurom
        const name = document.getElementById('feedback-name')?.value.trim();
        const email = document.getElementById('feedback-email')?.value.trim();
        const message = document.getElementById('feedback-message')?.value.trim();
        const rating = document.getElementById('feedback-rating')?.value || '5';

        // Validation
        if (!name || !email || !message) {
            showModal('Please fill all required fields.', 'warning');
            return;
        }

        // Visual feedback
        if (submitBtn) {
            submitBtn.textContent = 'Submitting... ⏳';
            submitBtn.disabled = true;
        }

        const feedbackData = {
            name: name,
            email: email,
            message: message,
            rating: parseInt(rating),
            subject: "General Feedback"
        };

        // Step 2: API call (api.js function)
        await submitFeedback(feedbackData);

        // SUCCESS!
        if (submitBtn) {
            submitBtn.textContent = 'Submitted! ✅';
            submitBtn.style.background = '#2e7d32';
        }

        showModal('Thank you! Your feedback has been sent successfully. ❤️', 'success');

        // Step 3: Form reset and redirect
        e.target.reset();
        if (typeof selectEmojiRating === 'function') selectEmojiRating(5);

        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2500);

    } catch (error) {
        console.error('Submission failed:', error);
        if (submitBtn) {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
        showModal('Failed to submit. Please check your internet and try again.', 'error');
    }
}

/**
 * selectEmojiRating - Emoji click visual update
 */
function selectEmojiRating(ratingValue) {
    const ratingInput = document.getElementById('feedback-rating');
    if (ratingInput) ratingInput.value = ratingValue;

    const emojiOptions = document.querySelectorAll('.emoji-option');
    emojiOptions.forEach((option, index) => {
        if (index + 1 === ratingValue) {
            option.style.opacity = "1";
            option.style.transform = "scale(1.2)";
        } else {
            option.style.opacity = "0.5";
            option.style.transform = "scale(1)";
        }
    });
}

// Global scope expose
window.selectEmojiRating = selectEmojiRating;

// Auto-start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeedbackPage);
} else {
    initFeedbackPage();
}
