/* =========================================
   SERVICES MODAL & REPEATING GALLERY ENGINE
   ========================================= */

window.openModal = function(serviceType) {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'flex';
        const select = document.getElementById('serviceSelect');
        if (select && serviceType) select.value = serviceType;
    }
};

window.closeModal = function() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.add('closing'); // Trigger smooth fade out
        
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('closing');
        }, 400);
    }
};

window.changeStep = function(n) {
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const indicators = Array.from(document.querySelectorAll('.step'));
    let currentStep = steps.findIndex(step => step.classList.contains('active'));
    
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

    const nextStepIndex = currentStep + n;
    if (nextStepIndex >= steps.length) {
        alert("Booking Request Sent!");
        window.closeModal();
        return;
    }

    steps.forEach(s => s.classList.remove('active'));
    steps[nextStepIndex].classList.add('active');
    indicators.forEach((ind, i) => {
        i <= nextStepIndex ? ind.classList.add('active') : ind.classList.remove('active');
    });
};

document.addEventListener('DOMContentLoaded', function() {
    // REPEATING GALLERY REVEAL
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, { threshold: 0.1 });

    galleryItems.forEach(item => galleryObserver.observe(item));

    window.addEventListener('click', function(event) {
        const modal = document.getElementById('bookingModal');
        if (event.target == modal) window.closeModal();
    });
});