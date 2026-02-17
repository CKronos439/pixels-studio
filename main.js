/* =========================================
   CONTACT.JS
   Use this ONLY on your Contact Page (contact.html)
   ========================================= */

document.addEventListener('DOMContentLoaded', function() {

    // --- 1. MOBILE NAVBAR LOGIC ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('nav-active');
        });
    }

    // --- 2. MODAL LOGIC (Contact Page Version) ---
    const modal = document.getElementById('bookingModal');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const indicators = Array.from(document.querySelectorAll('.step'));
    let currentStep = 0;

    // Open Modal Function
    window.openModal = function() {
        if (!modal) return;
        modal.style.display = 'flex';
    };

    // Close Modal Function
    window.closeModal = function() {
        if (!modal) return;
        modal.style.display = 'none';
        currentStep = 0;
        showStep(0);
    };

    // Change Step Function
    window.changeStep = function(n) {
        // Validate before moving next
        if (n === 1 && !validateForm()) return;

        currentStep += n;

        // Check if finished
        if (currentStep >= steps.length) {
            alert("Message Sent! We will be in touch.");
            window.closeModal();
            return;
        }
        showStep(currentStep);
    };

    // Helper: Show the correct step
    function showStep(n) {
        if (!steps[n]) return;
        
        // Hide all, show current
        steps.forEach(s => s.classList.remove('active'));
        steps[n].classList.add('active');

        // Update circles
        indicators.forEach((ind, i) => {
            if (i <= n) ind.classList.add('active');
            else ind.classList.remove('active');
        });

        // Update Buttons
        if (n === 0) prevBtn.style.visibility = "hidden";
        else prevBtn.style.visibility = "visible";

        if (n === steps.length - 1) nextBtn.textContent = "Send Message";
        else nextBtn.textContent = "Next";
    }

    // Helper: Validation
    function validateForm() {
        const inputs = steps[currentStep].querySelectorAll("input, select, textarea");
        let valid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                valid = false;
            }
        });
        return valid;
    }

    // Close on background click
    window.onclick = function(event) {
        if (event.target == modal) window.closeModal();
    };
});