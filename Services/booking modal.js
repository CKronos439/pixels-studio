/* =========================================
   SERVICES MODAL & REPEATING GALLERY ENGINE
   ========================================= */

window.openModal = function(serviceType) { // Define a globally accessible function to open the booking modal, accepting an optional service type string
    const modal = document.getElementById('bookingModal'); // Find the modal overlay element in the HTML by its ID
    if (modal) { // Check if the modal element actually exists on the current page before proceeding
        modal.style.display = 'flex'; // Change the CSS display property to 'flex' to make the modal visible on screen
        const select = document.getElementById('serviceSelect'); // Find the dropdown menu for selecting a service
        if (select && serviceType) select.value = serviceType; // If the dropdown exists and a service was passed in, auto-select that service
    } // End of modal existence check
}; // End of openModal function

window.closeModal = function() { // Define a globally accessible function to close the booking modal
    const modal = document.getElementById('bookingModal'); // Find the modal overlay element
    if (modal) { // Check if the modal exists
        modal.classList.add('closing'); // Add the 'closing' class to trigger the CSS fade-out animation
        
        setTimeout(() => { // Set a timer to wait for the animation to finish before hiding the element
            modal.style.display = 'none'; // Completely remove the modal from the visual flow of the document
            modal.classList.remove('closing'); // Remove the 'closing' class so it's ready to open cleanly next time
        }, 400); // Wait exactly 400 milliseconds, matching the duration of the CSS animation
    } // End of modal existence check
}; // End of closeModal function

window.changeStep = function(n) { // Define a globally accessible function to navigate forward or backward in the multi-step form
    const steps = Array.from(document.querySelectorAll('.form-step')); // Find all form step containers and convert the NodeList to a standard JavaScript Array
    const indicators = Array.from(document.querySelectorAll('.step')); // Find all progress indicators at the top and convert them to an Array
    let currentStep = steps.findIndex(step => step.classList.contains('active')); // Find the index number of the currently visible step by checking for the 'active' class
    
    if (n === 1) { // Check if the user is trying to move forward to the next step
        const inputs = steps[currentStep].querySelectorAll("input, select"); // Find all input fields and dropdowns inside the current step ONLY
        let valid = true; // Create a flag to track if all inputs pass validation, assuming true to start
        inputs.forEach(input => { // Loop through each input field in the current step
            if (!input.checkValidity()) { // Ask the browser if this specific input violates any HTML validation rules (like required or email format)
                input.reportValidity(); // Tell the browser to show its native tooltip error message for this specific input
                valid = false; // Mark the overall form step as invalid so we don't proceed
            } // End of validity check
        }); // End of inputs loop
        if (!valid) return; // If any field was invalid, stop executing the rest of the function completely
    } // End of forward navigation check

    const nextStepIndex = currentStep + n; // Calculate the index of the next step we want to show
    if (nextStepIndex >= steps.length) { // Check if we have moved past the final step (meaning the user clicked Submit)
        alert("Booking Request Sent!"); // Show a basic browser alert to confirm submission
        window.closeModal(); // Close the modal overlay automatically
        return; // Stop executing the rest of the function
    } // End of submission check

    steps.forEach(s => s.classList.remove('active')); // Loop through all form steps and hide them by removing the 'active' class
    steps[nextStepIndex].classList.add('active'); // Show only the calculated next step by adding the 'active' class
    indicators.forEach((ind, i) => { // Loop through all progress indicators
        i <= nextStepIndex ? ind.classList.add('active') : ind.classList.remove('active'); // Light up the indicator if its index is less than or equal to the new step index
    }); // End of indicators loop
}; // End of changeStep function

document.addEventListener('DOMContentLoaded', function() { // Wait for the HTML document to fully load before running the code inside
    // REPEATING GALLERY REVEAL
    const galleryItems = document.querySelectorAll('.gallery-item'); // Find all gallery image containers on the page
    const galleryObserver = new IntersectionObserver((entries) => { // Create a new IntersectionObserver to detect when elements scroll into view
        entries.forEach(entry => { // Loop through all the elements the observer is watching
            if (entry.isIntersecting) { // Check if the element has entered the browser viewport
                entry.target.classList.add('active'); // Add the 'active' class to trigger the CSS fade-in animation
            } else { // If the element has left the viewport
                entry.target.classList.remove('active'); // Remove the class so it can animate again when scrolled back into view
            } // End of intersection check
        }); // End of entries loop
    }, { threshold: 0.1 }); // Configure the observer to trigger when at least 10% of the element is visible

    galleryItems.forEach(item => galleryObserver.observe(item)); // Instruct the observer to start watching every gallery item found

    window.addEventListener('click', function(event) { // Listen for clicks anywhere on the browser window
        const modal = document.getElementById('bookingModal'); // Find the modal overlay element
        if (event.target == modal) window.closeModal(); // Check if the exact element clicked was the dark background overlay, and if so, close the modal
    }); // End of click listener
}); // End of DOMContentLoaded listener