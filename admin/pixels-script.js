/* =========================================
   HARDCODED DUMMY DATA 
   BACKEND: Replace this entire DATA object with real API/Database fetches.
   ========================================= */
const DATA = {
    bookings: [
        { id: 1, name: "Sarah & John Wedding", date: "2025-10-15", type: "Weddings and Events", status: "confirmed" },
        { id: 2, name: "Emily Portrait", date: "2025-10-18", type: "Photoshoots", status: "pending" }
    ],
    clients: [
        { id: 101, name: "Sarah Jenkins", email: "sarah@example.com", phone: "+1 234 567 890", type: "Weddings and Events", date: "Oct 15, 2025", status: "paid" },
        { id: 102, name: "Michael Chang", email: "mike@example.com", phone: "+1 987 654 321", type: "Photoshoots", date: "Nov 02, 2025", status: "pending" }
    ],
    galleries: [
        { id: 1, name: "Jenkins Wedding", status: "Uploaded", date: "Sept 20, 2025", downloads: 42, image: "../Assets/wedding card.jpg" },
        { id: 2, name: "Autumn Minis", status: "Edited", date: "Oct 01, 2025", downloads: 0, image: "../Assets/photoshoot card.jpg" }
    ],
    notifications: [
        { id: 1, text: "New booking request from Elena R.", time: "10 mins ago", type: "request", read: false },
        { id: 2, text: "Invoice #1042 paid successfully.", time: "2 hours ago", type: "system", read: true }
    ]
};

/* =========================================
   SECURITY UTILITIES
   ========================================= */
function escapeHTML(str) { // Prevent Cross-Site Scripting (XSS) by sanitizing user data
    if (!str) return ''; // If empty, return an empty string
    return String(str).replace(/[&<>'"]/g, match => { // Use RegEx to find dangerous HTML characters
        const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }; // Map characters to safe HTML entities
        return escapeMap[match]; // Replace matched character
    });
}

/* =========================================
   INITIALIZATION & EVENT LISTENERS
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // Set Date & Greeting
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const hour = now.getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    document.getElementById('greeting').textContent = `${greeting}, Admin`;

    // Calendar State
    let currentMonth = now.getMonth();
    let currentYear = now.getFullYear();

    // Init renders
    renderCalendar(currentMonth, currentYear);
    renderClients();
    renderGalleries();
    renderNotifications();
    initCharts();

    // Smooth Page Leaving Transition (Logout / External links)
    document.querySelectorAll('.logout-btn').forEach(btn => { // Target the logout button
        btn.addEventListener('click', (e) => { // Listen for clicks
            e.preventDefault(); // Stop immediate standard navigation
            document.body.classList.add('fade-out'); // Add the fade-out CSS class to the body
            setTimeout(() => { window.location.href = '../index.html'; }, 400); // Wait 400ms for animation to finish, then redirect to main site
        }); // End listener
    }); // End loop

    // Sidebar Toggle
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);

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
    document.addEventListener('click', (e) => {
        // Navigation Handling
        const navItem = e.target.closest('.nav-item, .tab-item, .widget-link');
        if (navItem && navItem.dataset.target) {
            e.preventDefault();
            showSection(navItem.dataset.target);
        }
        
        // Tab Buttons
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn) {
            const parent = tabBtn.closest('.tabs');
            parent.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            tabBtn.classList.add('active');
            // Add specific filtering logic here if needed
        }

        // Mark Notifications Read
        if (e.target.closest('#mark-read-btn')) {
            document.querySelectorAll('.notification-item, .bell-icon').forEach(el => el.classList.remove('unread'));
            showToast('All notifications marked as read', 'success');
        }

        // Toggles
        const toggle = e.target.closest('.toggle-switch');
        if (toggle) toggle.classList.toggle('active');

        // Generic Action Buttons triggers toasts
        if (e.target.closest('.btn') && !e.target.closest('#mark-read-btn') && !e.target.closest('#toggle-upload-btn') && !e.target.closest('#new-booking-btn') && !e.target.closest('button[type="submit"]')) {
            showToast('Action executed successfully', 'success');
        }
    });

    // Gallery Upload Toggle
    document.getElementById('toggle-upload-btn').addEventListener('click', () => document.getElementById('upload-container').classList.toggle('hidden'));

    // Client Search Filter
    document.getElementById('client-search').addEventListener('input', (e) => filterClients(e.target.value));

    // Upload Zone Logic
    const dropZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    // Calendar Navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar(currentMonth, currentYear);
    });
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar(currentMonth, currentYear);
    });

    // Calendar Day Click Event
    document.getElementById('calendar-grid').addEventListener('click', (e) => {
        const dayEl = e.target.closest('.cal-day');
        if (!dayEl || !dayEl.dataset.date) return; // Ignore clicks on empty spaces or headers
        
        // Remove 'selected' class from all days and add to clicked day
        document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('selected'));
        dayEl.classList.add('selected');
        
        const selectedDate = dayEl.dataset.date;
        const dateObj = new Date(selectedDate + 'T00:00:00'); // Force correct local time zone
        document.getElementById('schedule-title').textContent = 'Schedule for ' + dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const dayBookings = DATA.bookings.filter(b => b.date === selectedDate);
        
        const scheduleList = document.getElementById('schedule-list');
        scheduleList.style.animation = 'none';
        void scheduleList.offsetWidth; // Trigger reflow to restart animation
        scheduleList.style.animation = 'childFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        
        scheduleList.innerHTML = dayBookings.length ? dayBookings.map(b => 
            `<div style="margin-bottom: 15px; border-left: 2px solid var(--primary); padding-left: 10px;">
                <strong>${escapeHTML(b.name)}</strong><br><span style="color:var(--muted); font-size:0.85rem">${escapeHTML(b.date)} - ${escapeHTML(b.type)}</span>
            </div>`
        ).join('') : '<p style="color:var(--muted); font-size:0.9rem;">No bookings for this date.</p>';
    });

    // New Booking Modal Logic
    document.getElementById('new-booking-btn').addEventListener('click', () => {
        document.getElementById('booking-modal').classList.add('active');
    });
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => document.getElementById('booking-modal').classList.remove('active'));
    });
    
    document.getElementById('booking-modal').addEventListener('click', (e) => {
        if (e.target.id === 'booking-modal') e.target.classList.remove('active');
    });

    const bTypeSelect = document.getElementById('b-type');
    const bTypeOther = document.getElementById('b-type-other');
    
    bTypeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Other') {
            bTypeOther.style.display = 'block';
            bTypeOther.required = true;
        } else {
            bTypeOther.style.display = 'none';
            bTypeOther.required = false;
            bTypeOther.value = '';
        }
    });
    
    document.getElementById('new-booking-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        let selectedType = bTypeSelect.value;
        if (selectedType === 'Other') selectedType = bTypeOther.value;

        const clientName = document.getElementById('b-name').value;
        const bookingDate = document.getElementById('b-date').value;
        const clientEmail = document.getElementById('b-email').value;
        const clientPhone = document.getElementById('b-phone').value;

        // Format the date to match the client table layout (e.g. "Oct 15, 2025")
        const dateObj = new Date(bookingDate + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

        // BACKEND: Replace this dummy data push with an actual API POST request
        DATA.bookings.push({
            id: Date.now(),
            name: clientName,
            date: bookingDate,
            type: selectedType,
            status: "confirmed"
        });
        
        DATA.clients.push({
            id: Date.now() + 1,
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            type: selectedType,
            date: formattedDate,
            status: "pending"
        });
        
        e.target.reset();
        bTypeOther.style.display = 'none';
        bTypeOther.required = false;
        document.getElementById('booking-modal').classList.remove('active');
        showToast('New booking added successfully!', 'success');
        
        renderCalendar(currentMonth, currentYear);
        renderClients();
    });
});

/* =========================================
   NAVIGATION LOGIC
   ========================================= */
function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Update Sidebar & Bottom Nav active states
    document.querySelectorAll('.nav-item, .tab-item').forEach(nav => {
        nav.classList.remove('active');
        if (nav.dataset.target === id) nav.classList.add('active');
    });
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

/* =========================================
   RENDER FUNCTIONS
   ========================================= */
function renderCalendar(month, year) {
    const grid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('calendar-month');
    
    // Update header
    const date = new Date(year, month);
    monthLabel.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Calculate days
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0-6 (Sun-Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Find bookings that match the currently viewed month
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const bookedDays = DATA.bookings.filter(b => b.date.startsWith(monthPrefix)).map(b => parseInt(b.date.split('-')[2], 10));

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    let html = daysOfWeek.map(d => `<div style="text-align:center;font-weight:bold;color:var(--muted);font-size:0.8rem;padding-bottom:10px;">${d}</div>`).join('');
    
    for (let i = 0; i < firstDayIndex; i++) {
        html += `<div style="visibility: hidden;"></div>`; // Empty blocks for days before the 1st
    }
    for (let i = 1; i <= daysInMonth; i++) {
        let dayClass = bookedDays.includes(i) ? 'cal-day booked' : 'cal-day';
        const fullDateStr = `${monthPrefix}-${String(i).padStart(2, '0')}`;
        html += `<div class="${dayClass}" data-date="${fullDateStr}">${i}</div>`;
    }
    grid.innerHTML = html;
    
    document.getElementById('schedule-title').textContent = 'Schedule for ' + date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const monthBookings = DATA.bookings.filter(b => b.date.startsWith(monthPrefix));
    
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.style.animation = 'none';
    void scheduleList.offsetWidth; // Trigger reflow to restart animation
    scheduleList.style.animation = 'childFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    
    scheduleList.innerHTML = monthBookings.length ? monthBookings.map(b => 
        `<div style="margin-bottom: 15px; border-left: 2px solid var(--primary); padding-left: 10px;">
            <strong>${escapeHTML(b.name)}</strong><br><span style="color:var(--muted); font-size:0.85rem">${escapeHTML(b.date)} - ${escapeHTML(b.type)}</span>
        </div>`
    ).join('') : '<p style="color:var(--muted); font-size:0.9rem;">No bookings this month.</p>';
}

function renderClients() {
    const html = `<tr><th>Client</th><th>Contact</th><th>Type</th><th>Event Date</th><th>Status</th></tr>` + 
    DATA.clients.map(c => {
        const initials = c.name.split(' ').map(n=>n[0]).join('');
        return `<tr>
            <td style="display:flex; align-items:center; gap:10px;"><div class="avatar">${escapeHTML(initials)}</div><strong>${escapeHTML(c.name)}</strong></td>
            <td><span style="color:var(--muted)">${escapeHTML(c.email)}</span><br>${escapeHTML(c.phone)}</td>
            <td>${escapeHTML(c.type)}</td><td>${escapeHTML(c.date)}</td>
            <td><span class="badge ${c.status}">${c.status}</span></td>
        </tr>`;
    }).join('');
    document.getElementById('clients-table').innerHTML = html;
}

function filterClients(query) {
    // BACKEND: Hook up the database search API call here to filter the client table dynamically
    if(query.length > 2) showToast('Filtering clients...', 'success');
}

function renderGalleries() {
    document.getElementById('gallery-grid').innerHTML = DATA.galleries.map(g => 
        `<div class="card">
            <div class="placeholder-img" style="background: url('${g.image}') no-repeat center/cover;"></div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                <h3 style="margin:0;">${escapeHTML(g.name)}</h3><span class="badge ${g.status === 'Uploaded' ? 'paid' : 'draft'}">${g.status}</span>
            </div>
            <p style="color:var(--muted); margin-bottom:15px; font-size:0.9rem;">Date: ${escapeHTML(g.date)} • ${g.downloads} Downloads</p>
            <button class="btn btn-outline" style="width:100%">Manage Album</button>
        </div>`
    ).join('');
}

function renderNotifications() {
    document.getElementById('notification-list').innerHTML = DATA.notifications.map(n => 
        `<div class="notification-item ${n.read ? '' : 'unread'}">
            <div class="avatar" style="background:var(--surface); border:1px solid var(--border); color:var(--gold)"><i data-lucide="${n.type === 'request' ? 'mail' : 'info'}"></i></div>
            <div><p>${escapeHTML(n.text)}</p><span style="color:var(--muted); font-size:0.8rem">${escapeHTML(n.time)}</span></div>
        </div>`
    ).join('');
    
    // Populate the Dashboard mini-feed with the 3 most recent messages
    document.getElementById('recent-messages-list').innerHTML = DATA.notifications.slice(0, 3).map(n => 
        `<div class="widget-link" data-target="bell" style="margin-bottom: 15px; border-left: 2px solid ${n.read ? 'var(--border)' : 'var(--primary)'}; padding-left: 10px;">
            <span style="font-size:0.95rem; display:block; margin-bottom:3px;">${escapeHTML(n.text)}</span>
            <span style="color:var(--muted); font-size:0.8rem">${escapeHTML(n.time)}</span>
        </div>`
    ).join('');

    lucide.createIcons();
}

/* =========================================
   FILE UPLOAD LOGIC
   ========================================= */
function handleFiles(files) {
    // BACKEND: Implement actual file upload to server/S3/cloud hosting here
    const preview = document.getElementById('upload-preview');
    Array.from(files).forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `<span style="font-size:0.8rem; overflow:hidden; text-overflow:ellipsis; display:block; white-space:nowrap">${file.name}</span>
                          <div class="progress-track"><div class="progress-bar"></div></div>`;
        preview.appendChild(item);
        setTimeout(() => item.querySelector('.progress-bar').style.width = '100%', 100);
    });
}

/* =========================================
   CHART.JS INIT
   ========================================= */
function initCharts() {
    // BACKEND: Inject dynamic chart metrics into the data arrays below instead of these hardcoded values
    const chartColors = ['#8a0a1b', '#c92a2a', '#ffc9c9', '#f5a801'];
    Chart.defaults.color = '#7a7885'; Chart.defaults.borderColor = '#2a2a35';
    new Chart(document.getElementById('donutChart'), { type: 'doughnut', data: { labels: ['Kidz Photoshoot', 'Photoshoots', 'Weddings and Events'], datasets: [{ data: [25, 45, 30], backgroundColor: chartColors, borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'right' } } } });
    new Chart(document.getElementById('barChart'), { type: 'bar', data: { labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'], datasets: [{ label: 'Inquiries', data: [12, 18, 25, 14, 22], backgroundColor: chartColors[0], borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#2a2a35' } }, x: { grid: { display: false } } } } });
}

/* =========================================
   MODALS & TOASTS
   ========================================= */
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i> <span>${msg}</span>`;
    document.getElementById('toast-container').appendChild(toast);
    lucide.createIcons();
    setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 3000);
}