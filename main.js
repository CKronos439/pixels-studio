/* =========================================
   1. THEME TOGGLE LOGIC
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const themeBtns = document.querySelectorAll('#theme-toggle, .floating-theme-btn');
    
    // Update Icon
    function updateThemeIcon() {
        themeBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = document.body.classList.contains('light-theme') 
                    ? 'fa-solid fa-sun' 
                    : 'fa-solid fa-moon';
            }
        });
    }
    updateThemeIcon(); // Run on load

    // Click logic
    themeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
            updateThemeIcon();
        });
    });

    /* =========================================
       2. HEADER & SCROLL LOGIC
       ========================================= */
    const header = document.getElementById('main-header');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const floatingThemeBtns = document.querySelectorAll('.floating-theme-btn');

    window.addEventListener('scroll', () => {
        if (header) window.scrollY > 50 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
        
        const isScrolled = window.scrollY > 300;
        if (scrollTopBtn) isScrolled ? scrollTopBtn.classList.add('show') : scrollTopBtn.classList.remove('show');
        floatingThemeBtns.forEach(btn => isScrolled ? btn.classList.add('show') : btn.classList.remove('show'));
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* =========================================
       3. NAVIGATION SLIDER (TEXT COLOR FIX)
       ========================================= */
    const navItems = document.querySelectorAll('.nav-item');
    const navSlider = document.getElementById('nav-slider');
    const navContainer = document.getElementById('nav-links');

    if (navSlider && navContainer) {
        // Function to move slider and update text color
        function setSliderPosition(targetItem) {
            if (!targetItem) return;
            
            // Move the red background
            navSlider.style.width = `${targetItem.offsetWidth}px`;
            navSlider.style.transform = `translateX(${targetItem.offsetLeft}px)`;
            navSlider.style.opacity = '1';

            // Remove white text from all, add to target
            navItems.forEach(item => item.classList.remove('has-slider'));
            targetItem.classList.add('has-slider');
        }

        // 1. Initial Load: Set to active item
        const activeItem = document.querySelector('.nav-item.active');
        setSliderPosition(activeItem);
        window.addEventListener('load', () => setSliderPosition(document.querySelector('.nav-item.active')));
        window.addEventListener('resize', () => setSliderPosition(document.querySelector('.nav-item.active')));

        // 2. Hover logic: Follow the mouse
        navItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                setSliderPosition(this);
            });
        });

        // 3. Mouse leave logic: Snap back to active page
        navContainer.addEventListener('mouseleave', () => {
            const currentActive = document.querySelector('.nav-item.active');
            setSliderPosition(currentActive);
        });
    }

    /* =========================================
       4. SCROLL REVEAL ENGINE
       ========================================= */
    const revealElements = document.querySelectorAll('.scroll-reveal, .gallery-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    revealElements.forEach(el => observer.observe(el));

    /* =========================================
       5. MOBILE TOUCH SUPPORT FOR SERVICE CARDS
       ========================================= */
    document.addEventListener('click', (e) => {
        const clickedCard = e.target.closest('.service-3d-card');
        const serviceCards = document.querySelectorAll('.service-3d-card');
        
        // If clicking outside any card, close all and remove focus
        if (!clickedCard) {
            serviceCards.forEach(card => {
                card.classList.remove('active-touch');
                card.blur(); 
            });
            return;
        }

        // Close other cards
        serviceCards.forEach(card => {
            if (card !== clickedCard) {
                card.classList.remove('active-touch');
                card.blur();
            }
        });

        // If clicking the button inside the active card, let it navigate normally
        if (e.target.closest('.view-port-btn')) return;

        // Toggle the tapped card
        if (clickedCard.classList.contains('active-touch')) {
            clickedCard.classList.remove('active-touch');
            clickedCard.blur(); // Remove focus to ensure CSS :focus state hides
        } else {
            clickedCard.classList.add('active-touch');
        }
    });

    /* =========================================
       6. MOBILE NAVIGATION TOGGLE
       ========================================= */
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinksContainer = document.getElementById('nav-links');

    if (mobileToggle && navLinksContainer) {
        const icon = mobileToggle.querySelector('i');
        
        mobileToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('menu-open');
            icon.className = navLinksContainer.classList.contains('menu-open') ? 'fas fa-times' : 'fas fa-bars';
        });

        // Auto-close menu when a link is clicked
        const navItemsList = navLinksContainer.querySelectorAll('.nav-item');
        navItemsList.forEach(item => {
            item.addEventListener('click', () => {
                navLinksContainer.classList.remove('menu-open');
                icon.className = 'fas fa-bars';
            });
        });
    }
});

/* =========================================
   7. BOOKING MODAL LOGIC
   ========================================= */
window.BookingApp = {
    currentStep: 0,
    
    openModal: function(serviceType) {
        const modal = document.getElementById('bookingModal');
        if (modal) {
            modal.style.display = 'flex';
            this.showStep(0);
            
            // Auto-select the service dropdown if a parameter was passed
            if (serviceType) {
                const select = document.getElementById('serviceSelect');
                if (select) select.value = serviceType;
            }
        }
    },

    closeModal: function() {
        const modal = document.getElementById('bookingModal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('closing');
            }, 400); 
        }
    },

    changeStep: async function(n) {
        const steps = document.querySelectorAll('.form-step');
        if (n === 1 && !this.validateForm()) return;
        
        this.currentStep += n;
        if (this.currentStep >= steps.length) {
            await this.submitForm();
            return;
        }
        this.showStep(this.currentStep);
    },

    submitForm: async function() {
        const form = document.getElementById('bookingForm');
        const nextBtn = document.querySelector('.nav-btn.next');
        const originalText = nextBtn ? nextBtn.innerHTML : 'Submit';
        
        if (nextBtn) nextBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            const formData = form ? new FormData(form) : new FormData();
            const data = Object.fromEntries(formData.entries());

            // Replace YOUR_FORM_ID with your actual Formspree ID or backend endpoint
            const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Submission failed');

            this.showNotification("Booking Request Sent Successfully!", 'success');
            if (form) form.reset();
            this.closeModal();
            this.currentStep = 0; // Reset
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showNotification("Something went wrong. Please try again.", 'error');
            this.currentStep -= 1; // Step back so the user doesn't lose their place
            this.showStep(this.currentStep);
        } finally {
            if (nextBtn) nextBtn.innerHTML = originalText;
        }
    },

    showStep: function(n) {
        const steps = document.querySelectorAll('.form-step');
        const indicators = document.querySelectorAll('.step');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (!steps.length) return;

        steps.forEach(s => s.classList.remove('active'));
        steps[n].classList.add('active');
        indicators.forEach((ind, i) => {
            i <= n ? ind.classList.add('active') : ind.classList.remove('active');
        });

        // Dynamically Update Buttons
        if (prevBtn) {
            if (n === 0) {
                prevBtn.style.visibility = 'hidden';
            } else {
                prevBtn.style.visibility = 'visible';
            }
        }

        if (nextBtn) {
            if (n === steps.length - 1) {
                nextBtn.innerHTML = 'Submit <i class="fas fa-check"></i>';
            } else {
                nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
            }
        }
    },

    validateForm: function() {
        const steps = document.querySelectorAll('.form-step');
        const inputs = steps[this.currentStep].querySelectorAll("input, select, textarea");
        let valid = true;
        let firstInvalid = null;
        let invalidCount = 0;

        // Clear any existing inline error messages before re-checking
        steps[this.currentStep].querySelectorAll('.error-message').forEach(el => el.remove());

        inputs.forEach(input => {
            if (!input.checkValidity()) {
                invalidCount++;
                input.classList.add('input-error');
                
                // Create the inline tooltip with the browser's native helpful hint
                const errorMsg = document.createElement('span');
                errorMsg.className = 'error-message';
                errorMsg.innerText = input.validationMessage; 
                
                if (input.parentElement.classList.contains('checkbox-group')) {
                    input.parentElement.appendChild(errorMsg);
                } else {
                    input.parentNode.insertBefore(errorMsg, input.nextSibling);
                }
                
                input.addEventListener('input', () => {
                    input.classList.remove('input-error');
                    if (errorMsg.parentNode) errorMsg.remove();
                }, { once: true });
                
                valid = false;
                if (!firstInvalid) firstInvalid = input;
            }
        });

        if (!valid) {
            // Only trigger the alert if ALL fields in the current step are invalid
            if (invalidCount === inputs.length && inputs.length > 0) {
                this.showNotification("Please fill out all required fields correctly.", 'error');
            }
            if (firstInvalid) firstInvalid.focus();
        }

        return valid;
    },

    showNotification: function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `custom-toast ${type}`;
        
        const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
        toast.innerHTML = `${icon} <span>${message}</span>`;
        
        document.body.appendChild(toast);
        
        // Trigger entrance animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove gracefully after 3.5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }
};

// Expose functions globally so existing HTML onclick attributes still work
window.openModal = (serviceType) => window.BookingApp.openModal(serviceType);
window.closeModal = () => window.BookingApp.closeModal();
window.changeStep = (n) => window.BookingApp.changeStep(n);

// Background Click Close
window.addEventListener('click', function(event) {
    const modal = document.getElementById('bookingModal');
    if (event.target === modal) window.BookingApp.closeModal();
});