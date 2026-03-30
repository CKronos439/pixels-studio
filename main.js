/* =========================================
   1. THEME TOGGLE LOGIC
   ========================================= */
document.addEventListener('DOMContentLoaded', () => { // Listen for the entire HTML document to finish loading before running any code
    const themeBtns = document.querySelectorAll('#theme-toggle, .floating-theme-btn'); // Find all buttons that can toggle the theme (both navbar and floating)
    
    function updateThemeIcon() { // Define a function to visually update the sun or moon icons
        themeBtns.forEach(btn => { // Loop through each theme button found on the page
            const icon = btn.querySelector('i'); // Find the <i> tag (FontAwesome icon) inside the current button
            if (icon) { // Check to make sure an icon tag actually exists before trying to change it
                icon.className = document.body.classList.contains('light-theme') // Ask if the <body> tag currently has the 'light-theme' class attached
                    ? 'fa-solid fa-sun' // If true (light theme is active), set the icon to a sun
                    : 'fa-solid fa-moon'; // If false (dark theme is active), set the icon to a moon
            } // End of the if statement block
        }); // End of the forEach loop
    } // End of the updateThemeIcon function definition
    
    updateThemeIcon(); // Execute the icon update function immediately so it matches the current theme on page load

    themeBtns.forEach(btn => { // Loop through the theme buttons again to attach click listeners
        btn.addEventListener('click', (e) => { // Listen for a mouse click or tap on the button
            e.preventDefault(); // Stop the button from acting like a normal link (prevents jumping to top of page)
            document.body.classList.toggle('light-theme'); // Add the 'light-theme' class if it's missing, or remove it if it's there
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark'); // Save the user's theme choice to their browser memory
            updateThemeIcon(); // Run the icon update function again to swap the sun/moon based on the new state
        }); // End of the click event listener
    }); // End of the forEach loop

    /* =========================================
       2. HEADER & SCROLL LOGIC
       ========================================= */
    const header = document.getElementById('main-header'); // Find the main navigation header by its ID
    const scrollTopBtn = document.getElementById('scrollTopBtn'); // Find the floating 'scroll to top' button
    const floatingThemeBtns = document.querySelectorAll('.floating-theme-btn'); // Find all floating theme toggle buttons

    window.addEventListener('scroll', () => { // Listen for any scrolling movement on the entire browser window
        if (header) window.scrollY > 50 ? header.classList.add('scrolled') : header.classList.remove('scrolled'); // If scrolled down more than 50 pixels, add the 'scrolled' class to shrink the header
        
        const isScrolled = window.scrollY > 300; // Create a variable that is true if the user has scrolled down more than 300 pixels
        if (scrollTopBtn) isScrolled ? scrollTopBtn.classList.add('show') : scrollTopBtn.classList.remove('show'); // Show the 'scroll to top' button if scrolled far down, otherwise hide it
        floatingThemeBtns.forEach(btn => isScrolled ? btn.classList.add('show') : btn.classList.remove('show')); // Loop through floating theme buttons and show/hide them based on the same scroll depth
    }); // End of the scroll event listener

    if (scrollTopBtn) { // Check if the scroll top button exists on this specific HTML page
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })); // When clicked, animate the browser scroll position back to 0 (the very top)
    } // End of the if statement

    /* =========================================
       3. NAVIGATION SLIDER
       ========================================= */
    const navItems = document.querySelectorAll('.nav-item'); // Find all the clickable links inside the navigation bar
    const navSlider = document.getElementById('nav-slider'); // Find the sliding colored pill background
    const navContainer = document.getElementById('nav-links'); // Find the container that holds all the navigation links

    if (navSlider && navContainer) { // Ensure both the slider and container exist before running this logic
        function setSliderPosition(targetItem) { // Define a function that moves the slider to sit behind a specific link
            if (!targetItem) return; // If no target link is provided, stop the function immediately
            
            navSlider.style.width = `${targetItem.offsetWidth}px`; // Change the width of the slider to perfectly match the width of the target link
            navSlider.style.transform = `translateX(${targetItem.offsetLeft}px)`; // Move the slider horizontally to match the X position of the target link
            navSlider.style.opacity = '1'; // Make the slider visible

            navItems.forEach(item => item.classList.remove('has-slider')); // Loop through all links and remove the 'has-slider' class (which changes text color to white)
            targetItem.classList.add('has-slider'); // Add the 'has-slider' class ONLY to the link the slider is currently sitting behind
        } // End of the setSliderPosition function

        const activeItem = document.querySelector('.nav-item.active'); // Find the link that represents the current page the user is on
        setSliderPosition(activeItem); // Immediately snap the slider to the active link
        window.addEventListener('load', () => setSliderPosition(document.querySelector('.nav-item.active'))); // Recalculate slider position when all images/fonts finish loading
        window.addEventListener('resize', () => setSliderPosition(document.querySelector('.nav-item.active'))); // Recalculate slider position if the user resizes their browser window

        navItems.forEach(item => { // Loop through all navigation links
            item.addEventListener('mouseenter', function() { // Listen for when the user's mouse pointer enters the link area
                setSliderPosition(this); // Move the slider to sit behind this hovered link
            }); // End of mouseenter listener
        }); // End of forEach loop

        navContainer.addEventListener('mouseleave', () => { // Listen for when the user's mouse pointer entirely leaves the navigation bar area
            const currentActive = document.querySelector('.nav-item.active'); // Find the active page link again
            setSliderPosition(currentActive); // Snap the slider back to the active page link
        }); // End of mouseleave listener
    } // End of if statement

    /* =========================================
       4. SCROLL REVEAL ENGINE
       ========================================= */
    const revealElements = document.querySelectorAll('.scroll-reveal, .reveal-up, .gallery-item'); // Find all elements on the page that we want to animate in when scrolled into view
    
    const observer = new IntersectionObserver((entries) => { // Create a new IntersectionObserver, a built-in browser tool that watches when elements enter the screen
        entries.forEach(entry => { // Loop through all the elements the observer is currently watching
            if (entry.isIntersecting) { // Check if the specific element has entered the viewable screen area
                entry.target.classList.add('active'); // Add the 'active' class to trigger the CSS fade-in animation
            } else { // If the element has left the viewable screen area
                entry.target.classList.remove('active'); // Remove the 'active' class so it can animate in again if the user scrolls back up
            } // End of if/else statement
        }); // End of forEach loop
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }); // Configure observer settings: trigger when 15% visible, but artificially shrink the bottom boundary by 50px

    revealElements.forEach(el => observer.observe(el)); // Loop through all found elements and tell the observer to start watching them

    /* =========================================
       5. MOBILE TOUCH SUPPORT FOR SERVICE CARDS
       ========================================= */
    document.addEventListener('click', (e) => { // Listen for clicks or taps anywhere on the entire page
        const clickedCard = e.target.closest('.service-3d-card'); // Check if the clicked element is inside a 3D service card, and grab that card
        const serviceCards = document.querySelectorAll('.service-3d-card'); // Find all 3D service cards on the page
        
        if (!clickedCard) { // If the user clicked outside of ANY service card
            serviceCards.forEach(card => { // Loop through all cards
                card.classList.remove('active-touch'); // Remove the mobile hover state class
                card.blur(); // Remove browser focus to reset any CSS hover states
            }); // End of forEach loop
            return; // Stop running the rest of the click listener code
        } // End of if statement

        serviceCards.forEach(card => { // Loop through all cards
            if (card !== clickedCard) { // Check if the current card is NOT the one the user just tapped
                card.classList.remove('active-touch'); // Close this card
                card.blur(); // Remove focus
            } // End of if statement
        }); // End of forEach loop

        if (e.target.closest('.view-port-btn')) return; // If the user clicked the actual button inside the card, do nothing and let the link navigate them

        if (clickedCard.classList.contains('active-touch')) { // If the tapped card is ALREADY open
            clickedCard.classList.remove('active-touch'); // Close it
            clickedCard.blur(); // Remove browser focus
        } else { // If the tapped card is currently closed
            clickedCard.classList.add('active-touch'); // Open it by adding the active touch class
        } // End of if/else statement
    }); // End of click listener

    /* =========================================
       6. MOBILE NAVIGATION TOGGLE
       ========================================= */
    const mobileToggle = document.querySelector('.mobile-toggle'); // Find the hamburger menu button
    const navLinksContainer = document.getElementById('nav-links'); // Find the container holding the mobile links

    if (mobileToggle && navLinksContainer) { // Ensure both the button and container exist
        const icon = mobileToggle.querySelector('i'); // Find the FontAwesome icon inside the hamburger button
        
        mobileToggle.addEventListener('click', () => { // Listen for clicks on the hamburger button
            navLinksContainer.classList.toggle('menu-open'); // Toggle the 'menu-open' class to slide the links down or up
            icon.className = navLinksContainer.classList.contains('menu-open') ? 'fas fa-times' : 'fas fa-bars'; // Change icon to an 'X' if open, or a hamburger if closed
        }); // End of click listener

        const navItemsList = navLinksContainer.querySelectorAll('.nav-item'); // Find all the links inside the mobile menu
        navItemsList.forEach(item => { // Loop through each mobile link
            item.addEventListener('click', () => { // Listen for clicks on the individual links
                navLinksContainer.classList.remove('menu-open'); // Close the mobile menu automatically
                icon.className = 'fas fa-bars'; // Reset the icon back to the hamburger shape
            }); // End of click listener
        }); // End of forEach loop
    } // End of if statement
}); // End of DOMContentLoaded listener

/* =========================================
   7. BOOKING MODAL LOGIC
   ========================================= */
window.BookingApp = { // Create a globally accessible object to store all functions related to the booking form
    currentStep: 0, // A variable to track which page of the multi-step form is currently visible (starts at 0)
    
    /**
     * Opens the booking modal overlay on the screen.
     * @param {string} [serviceType] - Optional string to automatically pre-select a service in the dropdown.
     */
    openModal: function(serviceType) { // Define the function to open the modal
        const modal = document.getElementById('bookingModal'); // Find the hidden modal container
        if (modal) { // If the modal exists in the HTML
            modal.style.display = 'flex'; // Change CSS display to 'flex' to make it visible
            this.showStep(0); // Reset the form back to the very first step
            
            if (serviceType) { // Check if a specific service was passed into the function (like "Weddings")
                const select = document.getElementById('serviceSelect'); // Find the <select> dropdown element
                if (select) select.value = serviceType; // Set the dropdown value to match the requested service
            } // End of if statement
        } // End of if statement
    }, // End of openModal function

    /**
     * Triggers the closing animation and hides the modal.
     */
    closeModal: function() { // Define the function to close the modal
        const modal = document.getElementById('bookingModal'); // Find the modal container
        if (modal) { // If it exists
            modal.classList.add('closing'); // Add the 'closing' class to trigger the CSS fade-out animation
            setTimeout(() => { // Set a timer to wait for the animation to finish
                modal.style.display = 'none'; // Completely hide the modal from the screen
                modal.classList.remove('closing'); // Clean up by removing the closing class for next time
            }, 400); // Wait exactly 400 milliseconds (matches the CSS animation duration)
        } // End of if statement
    }, // End of closeModal function

    /**
     * Advances or goes back one step in the multi-step form.
     * @param {number} n - The number to move by (1 to go forward, -1 to go backward).
     */
    changeStep: async function(n) { // Define an asynchronous function to change steps
        const steps = document.querySelectorAll('.form-step'); // Find all the step containers in the form
        if (n === 1 && !this.validateForm()) return; // If trying to go forward AND the form has errors, stop the function completely
        
        this.currentStep += n; // Add or subtract from the current step tracker
        if (this.currentStep >= steps.length) { // If the user has advanced past the final step
            await this.submitForm(); // Try to submit the data to the server
            return; // Stop executing further step logic
        } // End of if statement
        this.showStep(this.currentStep); // Update the user interface to show the newly calculated step
    }, // End of changeStep function

    /**
     * Collects form data and submits it via a fetch request.
     */
    submitForm: async function() { // Define asynchronous function for form submission
        const form = document.getElementById('bookingForm'); // Find the HTML form element
        const nextBtn = document.querySelector('.nav-btn.next'); // Find the "Next/Submit" button
        const originalText = nextBtn ? nextBtn.innerHTML : 'Submit'; // Save the original text of the button in case we need to restore it
        
        if (nextBtn) nextBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>'; // Change the button text to show a spinning loading icon

        try { // Start a block of code that might fail (error handling)
            const formData = form ? new FormData(form) : new FormData(); // Extract all user inputs from the form into a FormData object
            const data = Object.fromEntries(formData.entries()); // Convert the FormData object into a standard JSON object

            const response = await fetch('https://formspree.io/f/xpqopjrw', { // Pause execution to send the data to Formspree
                method: 'POST', // Declare this as a POST request (sending data)
                headers: { 
                    'Content-Type': 'application/json', // Tell the server we are sending JSON data
                    'Accept': 'application/json' // Ask the server to respond with JSON instead of an HTML redirect
                },
                body: JSON.stringify(data) // Convert our JSON object into a raw text string for transmission
            }); // End of fetch request

            if (!response.ok) throw new Error('Submission failed'); // If the server replies with an error status, intentionally trigger the 'catch' block below

            this.showNotification("Booking Request Sent Successfully!", 'success'); // Trigger a success toast popup
            if (form) form.reset(); // Erase all data typed into the form
            this.closeModal(); // Close the modal
            this.currentStep = 0; // Reset the form step tracker back to the beginning
            
        } catch (error) { // If anything goes wrong in the 'try' block above
            console.error('Submission error:', error); // Log the exact error to the browser console for debugging
            this.showNotification("Something went wrong. Please try again.", 'error'); // Trigger an error toast popup
            this.currentStep -= 1; // Subtract 1 from currentStep so the user doesn't jump past the final screen
            this.showStep(this.currentStep); // Re-render the final screen so they can try clicking submit again
        } finally { // Code that always runs at the end, whether it succeeded or failed
            if (nextBtn) nextBtn.innerHTML = originalText; // Restore the button text to its original state, removing the loading spinner
        } // End of try/catch/finally block
    }, // End of submitForm function

    /**
     * Updates the UI to display a specific step and adjust progress indicators.
     * @param {number} n - The index of the step to display.
     */
    showStep: function(n) { // Define function to visually render a form step
        const steps = document.querySelectorAll('.form-step'); // Find all step containers
        const indicators = document.querySelectorAll('.step'); // Find all progress bar indicators at the top
        const prevBtn = document.getElementById('prevBtn'); // Find the "Back" button
        const nextBtn = document.getElementById('nextBtn'); // Find the "Next" button
        if (!steps.length) return; // If no steps exist in HTML, stop execution

        steps.forEach(s => s.classList.remove('active')); // Hide all form steps
        steps[n].classList.add('active'); // Show only the specific requested step
        indicators.forEach((ind, i) => { // Loop through the progress indicators
            i <= n ? ind.classList.add('active') : ind.classList.remove('active'); // Light up the indicator if its index is less than or equal to current step
        }); // End of forEach loop

        if (prevBtn) { // If the back button exists
            if (n === 0) { // Check if we are on the very first step
                prevBtn.style.visibility = 'hidden'; // Hide the back button since we can't go further back
            } else { // If we are on step 2 or later
                prevBtn.style.visibility = 'visible'; // Show the back button
            } // End of if/else statement
        } // End of if statement

        if (nextBtn) { // If the next button exists
            if (n === steps.length - 1) { // Check if we are on the very last step
                nextBtn.innerHTML = 'Submit <i class="fas fa-check"></i>'; // Change the text to "Submit"
            } else { // If we are not on the last step
                nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>'; // Make sure the text says "Next"
            } // End of if/else statement
        } // End of if statement
    }, // End of showStep function

    /**
     * Checks native HTML validation rules for all inputs in the current step.
     * @returns {boolean} True if all fields are valid, false otherwise.
     */
    validateForm: function() { // Define function to check user input rules
        const steps = document.querySelectorAll('.form-step'); // Find all form steps
        const inputs = steps[this.currentStep].querySelectorAll("input, select, textarea"); // Find all input fields inside ONLY the currently visible step
        let valid = true; // Assume the form is completely valid to start
        let firstInvalid = null; // Create an empty variable to store the first broken input we find
        let invalidCount = 0; // Keep track of exactly how many fields are broken

        steps[this.currentStep].querySelectorAll('.error-message').forEach(el => el.remove()); // Delete any old red error messages from a previous failed attempt

        inputs.forEach(input => { // Loop through every input field
            if (!input.checkValidity()) { // Ask the browser if this input breaks any HTML rules (like required, minlength, type="email")
                invalidCount++; // Increment our broken field counter
                input.classList.add('input-error'); // Add the red error CSS class to the field
                
                const errorMsg = document.createElement('span'); // Create a brand new <span> element in memory
                errorMsg.className = 'error-message'; // Give it the error text CSS class
                errorMsg.innerText = input.validationMessage; // Fill it with the browser's default helpful error text
                
                if (input.parentElement.classList.contains('checkbox-group')) { // Check if this field is a checkbox grouped inside a flex container
                    input.parentElement.appendChild(errorMsg); // Append the error at the end of the container so it doesn't break alignment
                } else { // For standard inputs
                    input.parentNode.insertBefore(errorMsg, input.nextSibling); // Inject the error text immediately after the broken input field
                } // End of if/else statement
                
                input.addEventListener('input', () => { // Listen for the user typing into this specific broken field
                    input.classList.remove('input-error'); // Immediately remove the red border when they start typing
                    if (errorMsg.parentNode) errorMsg.remove(); // Delete the red error text
                }, { once: true }); // Ensure this listener only triggers once and then destroys itself
                
                valid = false; // Flag the entire form step as completely invalid
                if (!firstInvalid) firstInvalid = input; // Save this input as the first invalid one if we haven't found one yet
            } // End of checkValidity if statement
        }); // End of forEach loop

        if (!valid) { // If the form had at least one error
            if (invalidCount === inputs.length && inputs.length > 0) { // Check if the user tried to submit without filling out ANYTHING at all
                this.showNotification("Please fill out all required fields correctly.", 'error'); // Show a big error toast notification
            } // End of if statement
            if (firstInvalid) firstInvalid.focus(); // Force the browser cursor to jump directly into the first broken field
        } // End of if statement

        return valid; // Return true or false back to the function that asked
    }, // End of validateForm function

    /**
     * Displays a temporary toast notification on the screen.
     * @param {string} message - The text to display to the user.
     * @param {string} [type='success'] - The styling type ('success' or 'error').
     */
    showNotification: function(message, type = 'success') { // Define function to create popup alerts
        const toast = document.createElement('div'); // Create a brand new <div> element in memory
        toast.className = `custom-toast ${type}`; // Add CSS classes, interpolating the success/error type
        
        const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>'; // Pick the right FontAwesome icon string
        toast.innerHTML = `${icon} <span>${message}</span>`; // Inject the icon and the custom message text into the div
        
        document.body.appendChild(toast); // Insert the div into the actual HTML document so the user can see it
        
        setTimeout(() => toast.classList.add('show'), 10); // Wait 10 milliseconds, then add the 'show' class to trigger CSS slide-down animation
        
        setTimeout(() => { // Create a timer to delete the toast later
            toast.classList.remove('show'); // Trigger the CSS slide-up animation
            setTimeout(() => toast.remove(), 400); // Wait for the animation to finish, then completely delete the HTML element
        }, 3500); // Start this deletion process after 3.5 seconds
    } // End of showNotification function
}; // End of window.BookingApp object definition

window.openModal = (serviceType) => window.BookingApp.openModal(serviceType); // Create a global shortcut to openModal so HTML onclick="" buttons still work
window.closeModal = () => window.BookingApp.closeModal(); // Create a global shortcut to closeModal
window.changeStep = (n) => window.BookingApp.changeStep(n); // Create a global shortcut to changeStep

window.addEventListener('click', function(event) { // Listen for any click on the window
    const modal = document.getElementById('bookingModal'); // Find the modal container
    if (event.target === modal) window.BookingApp.closeModal(); // Check if the user clicked directly on the dark overlay background, and if so, close the modal
}); // End of window click listener