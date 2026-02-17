/* =========================================
   SERVICES.JS (Global Scope Version)
   Use this on your Service Pages
   ========================================= */

console.log("Services.js has loaded! (Global Version)");

// --- 1. DEFINE FUNCTIONS GLOBALLY (So HTML can see them) ---

// OPEN MODAL
window.openModal = function(serviceType) {
    console.log("openModal called with type:", serviceType); // Debug check

    const modal = document.getElementById('bookingModal');
    if (!modal) {
        alert("CRITICAL ERROR: The <div id='bookingModal'> was not found on this page.");
        return;
    }

    modal.style.display = 'flex';

    // Auto-select service
    const select = document.getElementById('serviceSelect');
    if (select && serviceType) {
        select.value = serviceType;
    }
};

// CLOSE MODAL
window.closeModal = function() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.style.display = 'none';
};

// CHANGE STEPS
window.changeStep = function(n) {
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const indicators = Array.from(document.querySelectorAll('.step'));
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    // Find current active step index
    let currentStep = steps.findIndex(step => step.classList.contains('active'));
    if (currentStep === -1) currentStep = 0; // Fallback

    // Validate if going next
    if (n === 1) {
        const inputs = steps[currentStep].querySelectorAll("input, select");
        let valid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                valid = false;
            }
        });
        if (!valid) return;
    }

    // Calculate new step
    const nextStepIndex = currentStep + n;

    // Check if finished
    if (nextStepIndex >= steps.length) {
        alert("Booking Request Sent!");
        window.closeModal();
        return;
    }

    // Update UI
    steps.forEach(s => s.classList.remove('active'));
    steps[nextStepIndex].classList.add('active');

    indicators.forEach((ind, i) => {
        if (i <= nextStepIndex) ind.classList.add('active');
        else ind.classList.remove('active');
    });

    if (prevBtn) prevBtn.style.visibility = (nextStepIndex === 0) ? "hidden" : "visible";
    
    if (nextBtn) {
        nextBtn.innerHTML = (nextStepIndex === steps.length - 1) ? 'Confirm' : 'Next';
    }
};


// --- 2. SETUP EVENT LISTENERS (Wait for load) ---
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navbar Logic
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('nav-active');
        });
    }

    // Close Modal on Background Click
    window.onclick = function(event) {
        const modal = document.getElementById('bookingModal');
        if (event.target == modal) window.closeModal();
    };
});