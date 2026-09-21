/* =========================================
   HARDCODED DUMMY DATA 
   BACKEND: Replace this entire DATA object with real API/Database fetches.
   ========================================= */
const DATA = { // Create a master data object to hold all dummy arrays for the frontend prototype
    bookings: [ // Array representing scheduled events and sessions
        { id: 1, name: "Sarah & John Wedding", date: "2025-10-15", type: "Weddings and Events", status: "confirmed" }, // Dummy booking 1
        { id: 2, name: "Emily Portrait", date: "2025-10-18", type: "Photoshoots", status: "pending" } // Dummy booking 2
    ], // End of bookings array
    clients: [ // Array holding customer directory information (CRM database)
        { id: 101, name: "Sarah Jenkins", email: "sarah@example.com", phone: "+1 234 567 890", type: "Weddings and Events", date: "Oct 15, 2025", status: "paid" }, // Client profile 1
        { id: 102, name: "Michael Chang", email: "mike@example.com", phone: "+1 987 654 321", type: "Photoshoots", date: "Nov 02, 2025", status: "pending" } // Client profile 2
    ], // End of clients array
    galleries: [ // Array holding data for uploaded photo albums
        { id: 1, name: "Jenkins Wedding", status: "Uploaded", date: "Sept 20, 2025", downloads: 42, image: "../Assets/wedding card.jpg" }, // Gallery item 1
        { id: 2, name: "Autumn Minis", status: "Edited", date: "Oct 01, 2025", downloads: 0, image: "../Assets/photoshoot card.jpg" } // Gallery item 2
    ], // End of galleries array
    notifications: [ // Array holding system alerts and incoming user requests
        { id: 1, text: "New booking request from Elena R.", time: "10 mins ago", type: "request", read: false }, // Unread notification alert
        { id: 2, text: "Invoice #1042 paid successfully.", time: "2 hours ago", type: "system", read: true } // Read notification alert
    ] // End of notifications array
}; // End of DATA object

/* =========================================
   SECURITY UTILITIES
   ========================================= */
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* =========================================
   INITIALIZATION & EVENT LISTENERS
   ========================================= */
document.addEventListener('DOMContentLoaded', () => { // Wait for the HTML document to fully load before executing any code
    lucide.createIcons(); // Initialize the Lucide icon library to render SVGs
    
    // Set Date & Greeting
    const now = new Date(); // Fetch the current local date and time from the user's browser
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); // Format the date and inject it into the dashboard header
    
    const hour = now.getHours(); // Extract just the current hour (0-23)
    let greeting = "Good evening"; // Default the greeting to evening
    if (hour < 12) greeting = "Good morning"; // Change greeting to morning if before 12 PM
    else if (hour < 18) greeting = "Good afternoon"; // Change greeting to afternoon if before 6 PM
    document.getElementById('greeting').textContent = `${greeting}, Admin`; // Inject the calculated greeting into the DOM

    // Calendar State
    let currentMonth = now.getMonth(); // Track the month currently being viewed on the calendar
    let currentYear = now.getFullYear(); // Track the year currently being viewed on the calendar

    // Init renders
    renderCalendar(currentMonth, currentYear); // Generate the initial calendar grid
    renderClients(); // Generate the initial client database table
    renderGalleries(); // Generate the initial album view
    renderNotifications(); // Populate the notification list
    initCharts(); // Render the dashboard analytics graphs using Chart.js

    // Smooth Page Leaving Transition (Logout / External links)
    document.querySelectorAll('.logout-btn').forEach(btn => { // Target the logout button
        btn.addEventListener('click', (e) => { // Listen for clicks
            e.preventDefault(); // Stop immediate standard navigation
            document.body.classList.add('fade-out'); // Add the fade-out CSS class to the body
            setTimeout(() => { window.location.href = '../index.html'; }, 400); // Wait 400ms for animation to finish, then redirect to main site
        }); // End listener
    }); // End loop

    // Sidebar Toggle
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar); // Listen for clicks on the hamburger menu to collapse/expand the sidebar

    // Sidebar Tooltips (Premium Global Implementation)
    const tooltip = document.createElement('div'); // Create a floating div for the tooltip
    tooltip.className = 'sidebar-tooltip'; // Assign CSS class
    document.body.appendChild(tooltip); // Inject it into the body to bypass overflow restrictions

    document.querySelectorAll('.sidebar .nav-item, .sidebar .logout-btn').forEach(item => { // Target nav links and logout button
        item.addEventListener('mouseenter', (e) => { // When mouse enters the icon
            if (document.getElementById('sidebar').classList.contains('collapsed')) { // Only show tooltips if sidebar is collapsed
                const label = item.querySelector('.nav-label') ? item.querySelector('.nav-label').textContent : 'Logout'; // Grab the text label
                tooltip.textContent = label; // Inject text into tooltip
                const rect = item.getBoundingClientRect(); // Get exact position of the hovered icon
                tooltip.style.top = `${rect.top + (rect.height / 2)}px`; // Center vertically with the icon
                tooltip.style.left = `90px`; // Place it just to the right of the collapsed 80px sidebar
                tooltip.classList.add('show'); // Fade it in
            }
        });
        item.addEventListener('mouseleave', () => tooltip.classList.remove('show')); // Fade out when mouse leaves
        item.addEventListener('click', () => tooltip.classList.remove('show')); // Hide tooltip immediately when item is clicked
    });

    // Global Click Delegation
    document.addEventListener('click', (e) => { // Attach a single click listener to the entire document (Event Delegation)
        // Navigation Handling
        const navItem = e.target.closest('.nav-item, .tab-item, .widget-link'); // Check if the clicked element was a navigation link
        if (navItem && navItem.dataset.target) { // If it was, and it has a 'data-target' attribute...
            e.preventDefault(); // Stop standard link behavior
            showSection(navItem.dataset.target); // Route to the matching section ID
        } // End if
        
        // Tab Buttons
        const tabBtn = e.target.closest('.tab-btn'); // Check if the clicked element was a local tab button
        if (tabBtn) { // If so...
            const parent = tabBtn.closest('.tabs'); // Find the specific tab container it belongs to
            parent.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active')); // Remove active state from all sibling tabs
            tabBtn.classList.add('active'); // Add active state to just the clicked tab
            // BACKEND: Add specific filtering logic here if needed
        } // End if

        // Mark Notifications Read
        if (e.target.closest('#mark-read-btn')) { // Check if the user clicked the "Mark All Read" button
            document.querySelectorAll('.notification-item, .bell-icon').forEach(el => el.classList.remove('unread')); // Remove the red unread dot/styling from all notifications
            showToast('All notifications marked as read', 'success'); // Trigger a success toast
        } // End if

        // Toggles
        const toggle = e.target.closest('.toggle-switch'); // Check if the user clicked an iOS-style toggle switch (like in Settings)
        if (toggle) toggle.classList.toggle('active'); // Turn the switch on or off visually

        // Generic Action Buttons triggers toasts
        if (e.target.closest('.btn') && !e.target.closest('#mark-read-btn') && !e.target.closest('#toggle-upload-btn') && !e.target.closest('#new-booking-btn') && !e.target.closest('button[type="submit"]')) { // If a standard utility button is clicked...
            showToast('Action executed successfully', 'success'); // Show a placeholder success toast
        } // End if
    }); // End global click listener

    // Gallery Upload Toggle
    document.getElementById('toggle-upload-btn').addEventListener('click', () => document.getElementById('upload-container').classList.toggle('hidden')); // Toggle the visibility of the drag-and-drop upload zone

    // Client Search Filter
    document.getElementById('client-search').addEventListener('input', (e) => filterClients(e.target.value)); // Listen for typing in the client search bar and run the filter function

    // Upload Zone Logic
    const dropZone = document.getElementById('upload-zone'); // Target the visual drag-and-drop box
    const fileInput = document.getElementById('file-input'); // Target the hidden HTML file input
    
    dropZone.addEventListener('click', () => fileInput.click()); // If the box is clicked, trigger the file browser window
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); }); // Add CSS highlight when a file is dragged over the box
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover')); // Remove highlight if dragged file leaves the box
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); }); // Handle the actual dropping of files
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files)); // Also handle files selected normally via the browser window

    // Calendar Navigation
    document.getElementById('prev-month').addEventListener('click', () => { // Listen for "previous month" arrow click
        currentMonth--; // Subtract 1 from current month
        if (currentMonth < 0) { currentMonth = 11; currentYear--; } // If going backward from Jan, wrap to Dec and subtract a year
        renderCalendar(currentMonth, currentYear); // Re-draw the calendar UI with the new date
    }); // End listener
    document.getElementById('next-month').addEventListener('click', () => { // Listen for "next month" arrow click
        currentMonth++; // Add 1 to current month
        if (currentMonth > 11) { currentMonth = 0; currentYear++; } // If going forward from Dec, wrap to Jan and add a year
        renderCalendar(currentMonth, currentYear); // Re-draw the calendar UI
    }); // End listener

    // Calendar Day Click Event
    document.getElementById('calendar-grid').addEventListener('click', (e) => { // Delegate clicks inside the entire calendar grid
        const dayEl = e.target.closest('.cal-day'); // Find the specific day square clicked
        if (!dayEl || !dayEl.dataset.date) return; // Ignore clicks on empty buffer spaces or header row
        
        // Remove 'selected' class from all days and add to clicked day
        document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('selected')); // Deselect all visually
        dayEl.classList.add('selected'); // Highlight the clicked day
        
        const selectedDate = dayEl.dataset.date; // Retrieve the full date string from the HTML attribute
        const dateObj = new Date(selectedDate + 'T00:00:00'); // Convert it to a JS Date object, forcing local timezone zero hour
        document.getElementById('schedule-title').textContent = 'Schedule for ' + dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); // Update the sidebar header title
        
        const dayBookings = DATA.bookings.filter(b => b.date === selectedDate); // Query the DATA object to find any bookings matching this exact day
        
        const scheduleList = document.getElementById('schedule-list'); // Target the sidebar list container
        scheduleList.style.animation = 'none'; // Temporarily disable CSS animation
        void scheduleList.offsetWidth; // Force the browser to recalculate layout (this resets the animation state)
        scheduleList.style.animation = 'childFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'; // Re-apply the animation so it plays again smoothly
        
        scheduleList.innerHTML = dayBookings.length ? dayBookings.map(b => // If bookings exist, map over them and generate HTML
            `<div style="margin-bottom: 15px; border-left: 2px solid var(--primary); padding-left: 10px;">
                <strong>${escapeHTML(b.name)}</strong><br><span style="color:var(--muted); font-size:0.85rem">${escapeHTML(b.date)} - ${escapeHTML(b.type)}</span>
            </div>`
        ).join('') : '<p style="color:var(--muted); font-size:0.9rem;">No bookings for this date.</p>'; // Otherwise, show empty state message
    }); // End listener

    // New Booking Modal Logic
    document.getElementById('new-booking-btn').addEventListener('click', () => { // Listen for "New Booking" button click
        document.getElementById('booking-modal').classList.add('active'); // Fade in the modal overlay
    }); // End listener
    
    document.querySelectorAll('.close-modal').forEach(btn => { // Loop through all generic close buttons inside the modal
        btn.addEventListener('click', () => document.getElementById('booking-modal').classList.remove('active')); // Listen for clicks to close the modal
    }); // End loop
    
    document.getElementById('booking-modal').addEventListener('click', (e) => { // Add listener to the dark background overlay itself
        if (e.target.id === 'booking-modal') e.target.classList.remove('active'); // If user clicked outside the modal box, close the modal
    }); // End listener

    const bTypeSelect = document.getElementById('b-type'); // Target the booking "Service Type" dropdown
    const bTypeOther = document.getElementById('b-type-other'); // Target the hidden "Other" text input
    
    bTypeSelect.addEventListener('change', (e) => { // Listen for changes to the dropdown selection
        if (e.target.value === 'Other') { // If the user selected "Other"
            bTypeOther.style.display = 'block'; // Show the custom text field
            bTypeOther.required = true; // Make the custom field mandatory
        } else { // If standard option is selected
            bTypeOther.style.display = 'none'; // Hide custom text field
            bTypeOther.required = false; // Remove required restriction
            bTypeOther.value = ''; // Erase any typed data inside it
        } // End if/else
    }); // End listener
    
    document.getElementById('new-booking-form').addEventListener('submit', (e) => { // Listen for the modal form submission
        e.preventDefault(); // Stop the browser from actually refreshing the page
        
        let selectedType = bTypeSelect.value; // Get the chosen service type
        if (selectedType === 'Other') selectedType = bTypeOther.value; // Override it with custom text if "Other" was used

        const clientName = document.getElementById('b-name').value; // Get user typed name
        const bookingDate = document.getElementById('b-date').value; // Get date input
        const clientEmail = document.getElementById('b-email').value; // Get email input
        const clientPhone = document.getElementById('b-phone').value; // Get phone input

        // Format the date to match the client table layout (e.g. "Oct 15, 2025")
        const dateObj = new Date(bookingDate + 'T00:00:00'); // Convert raw HTML date string safely
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); // Convert into aesthetic format

        // BACKEND: Replace this dummy data push with an actual API POST request
        DATA.bookings.push({ // Artificially inject the new booking into our dummy DATA array
            id: Date.now(), // Generate a fake unique ID based on timestamp
            name: clientName, // Map name
            date: bookingDate, // Map raw date for calendar functionality
            type: selectedType, // Map type
            status: "confirmed" // Default to confirmed
        }); // End array push
        
        DATA.clients.push({ // Also inject a profile for them into the Client database tab
            id: Date.now() + 1, // Another fake ID
            name: clientName, // Map name
            email: clientEmail, // Map email
            phone: clientPhone, // Map phone
            type: selectedType, // Map type
            date: formattedDate, // Use the aesthetic date here
            status: "pending" // Default to pending billing
        }); // End array push
        
        e.target.reset(); // Erase the HTML form entirely
        bTypeOther.style.display = 'none'; // Re-hide the "Other" field
        bTypeOther.required = false; // Un-require it
        document.getElementById('booking-modal').classList.remove('active'); // Visually close the modal overlay
        showToast('New booking added successfully!', 'success'); // Trigger a success toast
        
        renderCalendar(currentMonth, currentYear); // Re-calculate the calendar to show the newly added dot immediately
        renderClients(); // Re-render the client table to show their profile immediately
    }); // End form submit listener
}); // End DOMContentLoaded listener

/* =========================================
   NAVIGATION LOGIC
   ========================================= */
function showSection(id) { // Function to swap between Dashboard/Calendar/Clients/etc pages without reloading
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active')); // Hide all sections
    document.getElementById(id).classList.add('active'); // Fade in the specifically requested section
    
    // Update Sidebar & Bottom Nav active states
    document.querySelectorAll('.nav-item, .tab-item').forEach(nav => { // Loop through all sidebar and mobile navigation links
        nav.classList.remove('active'); // Remove their red highlighting
        if (nav.dataset.target === id) nav.classList.add('active'); // If the link maps to the current active section, highlight it
    }); // End loop
} // End function

function toggleSidebar() { // Function to handle sidebar expanding/collapsing logic
    document.getElementById('sidebar').classList.toggle('collapsed'); // Toggle the 'collapsed' class, activating CSS transitions
} // End function

/* =========================================
   RENDER FUNCTIONS
   ========================================= */
function renderCalendar(month, year) { // Function to mathematically generate the calendar UI
    const grid = document.getElementById('calendar-grid'); // Find the physical calendar grid
    const monthLabel = document.getElementById('calendar-month'); // Find the text label at the top
    
    // Update header
    const date = new Date(year, month); // Create a reference JS date for the requested timeframe
    monthLabel.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); // Update the label (e.g. "October 2025")
    
    // Calculate days
    const firstDayIndex = new Date(year, month, 1).getDay(); // Determine what day of the week the 1st falls on (0-6)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Determine how many total days exist in this month
    
    // Find bookings that match the currently viewed month
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`; // Create a "YYYY-MM" string prefix for comparison
    const bookedDays = DATA.bookings.filter(b => b.date.startsWith(monthPrefix)).map(b => parseInt(b.date.split('-')[2], 10)); // Extract just the physical day numbers of any bookings that happen this month

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']; // Define table headers
    let html = daysOfWeek.map(d => `<div style="text-align:center;font-weight:bold;color:var(--text-muted);font-size:0.8rem;padding-bottom:10px;">${d}</div>`).join(''); // Map headers to HTML
    
    for (let i = 0; i < firstDayIndex; i++) { // Loop to create empty offsets...
        html += `<div style="visibility: hidden;"></div>`; // Insert invisible grid blocks so the 1st day starts in the correct column
    } // End loop
    for (let i = 1; i <= daysInMonth; i++) { // Loop through all actual days of the month
        let dayClass = bookedDays.includes(i) ? 'cal-day booked' : 'cal-day'; // Append the 'booked' class (red dot) if this specific day was found in the data array earlier
        const fullDateStr = `${monthPrefix}-${String(i).padStart(2, '0')}`; // Generate exact "YYYY-MM-DD" string
        html += `<div class="${dayClass}" data-date="${fullDateStr}">${i}</div>`; // Inject the HTML grid square with the date attached as data attribute
    } // End loop
    grid.innerHTML = html; // Physically update the DOM with the generated calendar HTML string
    
    document.getElementById('schedule-title').textContent = 'Schedule for ' + date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); // Update sidebar heading
    
    const monthBookings = DATA.bookings.filter(b => b.date.startsWith(monthPrefix)); // Get an array of all full booking objects for this month
    
    const scheduleList = document.getElementById('schedule-list'); // Target sidebar list
    scheduleList.style.animation = 'none'; // Disable animations momentarily
    void scheduleList.offsetWidth; // Force reflow (clears browser cache of animation state)
    scheduleList.style.animation = 'childFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'; // Restart animation
    
    scheduleList.innerHTML = monthBookings.length ? monthBookings.map(b => // Check if bookings exist...
        `<div style="margin-bottom: 15px; border-left: 2px solid var(--primary); padding-left: 10px;">
            <strong>${escapeHTML(b.name)}</strong><br><span style="color:var(--muted); font-size:0.85rem">${escapeHTML(b.date)} - ${escapeHTML(b.type)}</span>
        </div>`
    ).join('') : '<p style="color:var(--text-muted); font-size:0.9rem;">No bookings this month.</p>'; // Compile HTML feed, else show "empty" message
} // End function

function renderClients() { // Function to generate the CRM table logic
    const html = `<tr><th>Client</th><th>Contact</th><th>Type</th><th>Event Date</th><th>Status</th></tr>` + // Start string with table headers
    DATA.clients.map(c => { // Loop through clients array
        const initials = c.name.split(' ').map(n=>n[0]).join(''); // Generate avatar initials (e.g. "John Doe" -> "JD")
        return `<tr> 
            <td style="display:flex; align-items:center; gap:10px;"><div class="avatar">${escapeHTML(initials)}</div><strong>${escapeHTML(c.name)}</strong></td>
            <td><span style="color:var(--text-muted)">${escapeHTML(c.email)}</span><br>${escapeHTML(c.phone)}</td>
            <td>${escapeHTML(c.type)}</td><td>${escapeHTML(c.date)}</td>
            <td><span class="badge ${c.status}">${c.status}</span></td>
        </tr>`; // Return template-literaled row data
    }).join(''); // Collapse array into massive string
    document.getElementById('clients-table').innerHTML = html; // Inject generated table code into the DOM
} // End function

function filterClients(query) { // Function stub for client search bar
    // BACKEND: Hook up the database search API call here to filter the client table dynamically
    if(query.length > 2) showToast('Filtering clients...', 'success'); // Show fake feedback for prototype
} // End function

function renderGalleries() { // Function to generate albums
    document.getElementById('gallery-grid').innerHTML = DATA.galleries.map(g => // Map over gallery data
        `<div class="card">
            <div class="placeholder-img" style="background: url('${g.image}') no-repeat center/cover;"></div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                <h3 style="margin:0;">${escapeHTML(g.name)}</h3><span class="badge ${g.status === 'Uploaded' ? 'paid' : 'draft'}">${g.status}</span>
            </div>
            <p style="color:var(--text-muted); margin-bottom:15px; font-size:0.9rem;">Date: ${escapeHTML(g.date)} • ${g.downloads} Downloads</p>
            <button class="btn btn-outline" style="width:100%">Manage Album</button>
        </div>`
    ).join(''); // Create card strings and inject into grid container
} // End function

function renderNotifications() { // Function to populate notifications
    document.getElementById('notification-list').innerHTML = DATA.notifications.map(n => // Map over notifications data
        `<div class="notification-item ${n.read ? '' : 'unread'}">
            <div class="avatar" style="background:var(--surface); border:1px solid var(--border); color:var(--gold)"><i data-lucide="${n.type === 'request' ? 'mail' : 'info'}"></i></div>
            <div><p>${escapeHTML(n.text)}</p><span style="color:var(--text-muted); font-size:0.8rem">${escapeHTML(n.time)}</span></div>
        </div>`
    ).join(''); // Convert into list and inject
    
    // Populate the Dashboard mini-feed with the 3 most recent messages
    document.getElementById('recent-messages-list').innerHTML = DATA.notifications.slice(0, 3).map(n => // Take only first 3 items
        `<div class="widget-link" data-target="bell" style="margin-bottom: 15px; border-left: 2px solid ${n.read ? 'var(--border)' : 'var(--primary)'}; padding-left: 10px;">
            <span style="font-size:0.95rem; display:block; margin-bottom:3px;">${escapeHTML(n.text)}</span>
            <span style="color:var(--text-muted); font-size:0.8rem">${escapeHTML(n.time)}</span>
        </div>`
    ).join(''); // Inject into the main dashboard panel widget

    lucide.createIcons(); // Force lucide to render the new dynamically added icons
} // End function

/* =========================================
   FILE UPLOAD LOGIC
   ========================================= */
function handleFiles(files) { // Function to handle file uploading
    // BACKEND: Implement actual file upload to server/S3/cloud hosting here
    const preview = document.getElementById('upload-preview'); // Target the preview container
    const MAX_SIZE_MB = 10; // Set max filesize config
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024; // Math configuration bytes
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']; // Config acceptable MIME types

    Array.from(files).forEach(file => { // Loop through all dropped or selected files
        // Front-end Security & Validation Checks
        if (!ALLOWED_TYPES.includes(file.type)) { // Enforce MIME restriction
            showToast(`Invalid file type: ${escapeHTML(file.name)}`, 'error'); // Trigger error
            return; // Reject processing this file
        } // End if
        if (file.size > MAX_SIZE_BYTES) { // Enforce FileSize restriction
            showToast(`File too large (Max ${MAX_SIZE_MB}MB): ${escapeHTML(file.name)}`, 'error'); // Trigger error
            return; // Reject file
        } // End if

        const item = document.createElement('div'); // Create physical wrapper div
        item.className = 'file-item'; // Add class
        item.innerHTML = `<span style="font-size:0.8rem; overflow:hidden; text-overflow:ellipsis; display:block; white-space:nowrap">${escapeHTML(file.name)}</span>
                          <div class="progress-track"><div class="progress-bar"></div></div>`;
        preview.appendChild(item); // Append the wrapper onto the screen
        setTimeout(() => item.querySelector('.progress-bar').style.width = '100%', 100); // Create an artificial delay to simulate uploading progress animation
    }); // End file loop
} // End function

/* =========================================
   CHART.JS INIT
   ========================================= */
function initCharts() { // Config for dashboard charts
    // BACKEND: Inject dynamic chart metrics into the data arrays below instead of these hardcoded values
    const chartColors = ['#8a0a1b', '#c92a2a', '#ffc9c9', '#f5a801']; // Config standard branding colors
    Chart.defaults.color = '#7a7885'; Chart.defaults.borderColor = '#2a2a35'; // Adjust base Chart JS grid styling 
    new Chart(document.getElementById('donutChart'), { type: 'doughnut', data: { labels: ['Kidz Photoshoot', 'Photoshoots', 'Weddings and Events'], datasets: [{ data: [25, 45, 30], backgroundColor: chartColors, borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'right' } } } }); // Render Donut Chart configuration object
    new Chart(document.getElementById('barChart'), { type: 'bar', data: { labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'], datasets: [{ label: 'Inquiries', data: [12, 18, 25, 14, 22], backgroundColor: chartColors[0], borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#2a2a35' } }, x: { grid: { display: false } } } } }); // Render Bar Chart configuration object
} // End function

/* =========================================
   MODALS & TOASTS
   ========================================= */
function showToast(msg, type = 'success') { // Function to display global visual feedback popups
    const toast = document.createElement('div'); // Generate DOM element
    toast.className = `toast ${type}`; // Assign string interpolation CSS classes
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i> <span>${msg}</span>`; // Determine icon style
    document.getElementById('toast-container').appendChild(toast); // Append HTML to DOM anchor
    lucide.createIcons(); // Force icon load
    setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 3000); // 3-second wait delay, then fade out, then 300ms wait delay, then absolute DOM removal
} // End function