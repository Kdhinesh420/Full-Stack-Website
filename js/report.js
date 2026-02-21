// ===================================================
// REPORT.JS - Report Issue Page JavaScript
// ===================================================
// User complaints and issues submission

/**
 * initReportPage - Page open aagumpothu start aagum
 */
async function initReportPage() {
    console.log('🚨 Initializing report page...');

    // Login check (Complaints panna login kandaipa venum)
    if (!requireAuth()) return;

    // User details auto-fill (Optional but good for beginners to see)
    fillUserDetails();

    // Form setup
    setupReportForm();
}

/**
 * fillUserDetails - Login panna user details-ai form-la auto-a podum
 */
function fillUserDetails() {
    // Local storage-la irunthu user info edukkurom (auth.js function)
    const user = getUser();

    if (user) {
        if (document.getElementById('c_name')) document.getElementById('c_name').value = user.username || '';
        if (document.getElementById('c_email')) document.getElementById('c_email').value = user.email || '';
        if (document.getElementById('c_phone')) document.getElementById('c_phone').value = user.phone || '';
    }
}

/**
 * setupReportForm - Form-ukku event listener add pannum
 */
function setupReportForm() {
    const reportForm = document.getElementById('report-form');

    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmit);
        console.log('✅ Report form initialized');
    }
}

/**
 * handleReportSubmit - Submit button click panna nadakurathu
 */
async function handleReportSubmit(e) {
    e.preventDefault(); // Page reload aagatha maari stop pannurom

    const submitBtn = e.target.querySelector('.submit-report-button');
    const originalText = submitBtn.textContent;

    try {
        // Step 1: Input values-ai edukurom
        const orderId = document.getElementById('order_id').value;
        const issueType = document.getElementById('issue_type').value;
        const subject = document.getElementById('issue_subject').value;
        const description = document.getElementById('issue_desc').value;

        // Visual feedback (Button state change)
        submitBtn.textContent = 'Submitting Report... ⏳';
        submitBtn.disabled = true;

        // Step 2: Data structure ready pannurom (Backend expectations)
        const reportData = {
            order_id: orderId || null,
            issue_type: issueType,
            subject: subject,
            description: description
        };

        console.log('Sending Report:', reportData);

        // Step 3: API call (api.js function use pannurom)
        await submitReport(reportData);

        // Success! (Visual look mathurom)
        submitBtn.textContent = 'Report Submitted Successfully! ✅';
        submitBtn.style.background = '#2e7d32';
        submitBtn.style.color = 'white';

        // Modal notification (api.js-layum irukum, but redundancy for safety)
        if (typeof showModal === 'function') {
            showModal('We received your report. Our team will contact you soon! ❤️', 'success');
        }

        // Home page-க்கு poga 3 seconds wait pannurom (so buyer can see success)
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 3500);

    } catch (error) {
        console.error('Report submission failed:', error);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        showModal('Failed to submit report. Please try again.', 'error');
    }
}

// ===========================================
// AUTO-START
// ===========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReportPage);
} else {
    initReportPage();
}
