document.addEventListener('DOMContentLoaded', () => {

    // --- Global DOM Element References ---
    const toggle = document.getElementById('viewModeToggle');
    const claimsMenu = document.getElementById('claims-menu');
    const adminMenu = document.getElementById('admin-menu');
    const contentArea = document.querySelector('.content-area');
    const modalOverlay = document.getElementById('claim-details-modal');
    const modalClaimIdDisplay = document.getElementById('modal-claim-id-display');
    const modalCloseButtons = document.querySelectorAll('.modal-close-button');
    const modalBody = modalOverlay?.querySelector('.modal-body'); // Use optional chaining

    let activeCharts = {}; // Object to hold active chart instances

    // --- Function to destroy existing charts ---
    function destroyActiveCharts() {
        Object.values(activeCharts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        activeCharts = {}; // Clear the references
    }

    // --- Sidebar Toggle Logic ---
    function updateMenus() {
        const currentActiveLink = document.querySelector('.sidebar-nav li.active a');
        if (toggle.checked) { // Admin Mode
            claimsMenu.style.display = 'none';
            adminMenu.style.display = 'block';
            // If current active was in claims menu, activate first admin item
            if (claimsMenu.contains(currentActiveLink?.parentElement)) {
                 adminMenu.querySelector('li a')?.click();
            } else if (!currentActiveLink && adminMenu.querySelector('li a')) {
                 adminMenu.querySelector('li a').click(); // Activate first if none active
            }
        } else { // Claims Mode
            claimsMenu.style.display = 'block';
            adminMenu.style.display = 'none';
            // If current active was in admin menu, activate first claims item
            if (adminMenu.contains(currentActiveLink?.parentElement)) {
                 claimsMenu.querySelector('li a')?.click();
            } else if (!currentActiveLink && claimsMenu.querySelector('li a')) {
                 claimsMenu.querySelector('li a').click(); // Activate first if none active
            }
        }
    }

    // --- HTML Content Templates ---

    // Default template for simple pages
    const defaultPageHTML = (title) => `
        <div class="content-header">
            <h1 id="page-title">${title}</h1>
        </div>
        <p>Content for ${title} goes here.</p>
    `;

    // Template for the Claims Table page
    const claimsTableHTML = `
        <div class="content-header">
             <h1 id="page-title">Claims</h1>
             <div class="actions">
                <button class="btn btn-secondary btn-filter">
                    <i class="fa-solid fa-filter"></i> Filter
                </button>
                <button class="btn btn-primary btn-add">
                    <i class="fa-solid fa-plus"></i> Add New Claim
                </button>
             </div>
        </div>

        <div class="tabs-container">
            <button class="tab-button active" data-status="all">All</button>
            <button class="tab-button" data-status="new">New</button>
            <button class="tab-button" data-status="assigned">Assigned</button>
            <button class="tab-button" data-status="accepted">Accepted</button>
            <button class="tab-button" data-status="rejected">Rejected</button>
            <button class="tab-button" data-status="settled">Settled</button>
        </div>

        <div class="table-wrapper">
            <table class="data-table claims-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Claim Type</th>
                        <th>Status</th>
                        <th>Affiliate</th>
                        <th>Buyer</th>
                        <th>Date Added</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Sample Data Rows (add more as needed) -->
                    <tr data-claim-id="CH1001">
                        <td>Windscreen Chip Repair</td>
                        <td>Motor</td>
                        <td><span class="status-badge status-new">New</span></td>
                        <td>Affiliate Partners Inc.</td>
                        <td>Major Buyer Co.</td>
                        <td>2024-07-28 10:15</td>
                    </tr>
                     <tr data-claim-id="CH1002">
                        <td>Basement Flood Damage</td>
                        <td>Home</td>
                        <td><span class="status-badge status-assigned">Assigned</span></td>
                        <td>Regional Affiliates</td>
                        <td>Insurance Giant Ltd</td>
                        <td>2024-07-27 14:30</td>
                    </tr>
                     <tr data-claim-id="CH1003">
                        <td>Accidental Laptop Damage</td>
                        <td>Gadget</td>
                         <td><span class="status-badge status-accepted">Accepted</span></td>
                        <td>Tech Affiliates</td>
                        <td>Gadget Protect</td>
                        <td>2024-07-27 09:00</td>
                    </tr>
                     <tr data-claim-id="CH1004">
                        <td>Delayed Flight Compensation</td>
                        <td>Travel</td>
                        <td><span class="status-badge status-rejected">Rejected</span></td>
                        <td>Travel Agents United</td>
                        <td>Air Insure</td>
                        <td>2024-07-26 11:55</td>
                    </tr>
                     <tr data-claim-id="CH1005">
                        <td>Minor Fender Bender</td>
                        <td>Motor</td>
                        <td><span class="status-badge status-settled">Settled</span></td>
                         <td>Affiliate Partners Inc.</td>
                         <td>Major Buyer Co.</td>
                        <td>2024-07-25 16:20</td>
                    </tr>
                      <tr data-claim-id="CH1006">
                        <td>Lost Luggage Claim</td>
                        <td>Travel</td>
                        <td><span class="status-badge status-accepted">Accepted</span></td>
                         <td>Travel Agents United</td>
                         <td>Air Insure</td>
                        <td>2024-07-28 12:00</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-container">
            <span>Page 1 of 1</span> <!-- Placeholder -->
            <div class="pagination-buttons">
                 <button class="btn btn-secondary" disabled>Previous</button>
                 <button class="btn btn-secondary">Next</button>
            </div>
        </div>
    `;

    // Template for the Stats page
    const statsPageHTML = `
        <div class="content-header">
             <h1 id="page-title">Stats</h1>
             <div class="actions">
                <!-- Add any stats-specific actions here if needed -->
             </div>
        </div>

        <!-- Bar Chart Section -->
        <div class="chart-container">
            <div class="chart-header">
                 <h2>New Claims Over Time</h2>
                 <select id="claims-time-period">
                    <option value="daily" selected>Last 7 Days</option>
                    <option value="weekly">Last 4 Weeks</option>
                    <option value="monthly">Last 6 Months</option>
                </select>
            </div>
             <canvas id="newClaimsChart"></canvas>
        </div>

        <!-- Pie Charts Section -->
        <div class="pie-charts-row">
             <div class="pie-chart-wrapper chart-container">
                 <div class="chart-header">
                     <h2>Claims by Affiliate</h2>
                 </div>
                  <canvas id="affiliatePieChart"></canvas>
             </div>
             <div class="pie-chart-wrapper chart-container">
                 <div class="chart-header">
                    <h2>Claims by Buyer</h2>
                 </div>
                 <canvas id="buyerPieChart"></canvas>
            </div>
        </div>
    `;


    // --- Chart Initialization Functions ---

    const generateTimeData = (period) => {
        let labels = [];
        let data = [];
        // Simple dummy data generation
        switch(period) {
            case 'weekly':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                data = [65, 59, 80, 71];
                break;
            case 'monthly':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                data = [300, 250, 400, 320, 450, 380];
                break;
            case 'daily':
            default:
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                data = [12, 19, 8, 15, 10, 22, 17];
                break;
        }
        return { labels, data };
    };

    function initNewClaimsChart(period = 'daily') {
        // Destroy previous instance if exists
        if (activeCharts.newClaims) {
            activeCharts.newClaims.destroy();
        }

        const ctx = document.getElementById('newClaimsChart')?.getContext('2d');
        if (!ctx) return;

        const { labels, data } = generateTimeData(period);

        activeCharts.newClaims = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'New Claims',
                    data: data,
                    backgroundColor: 'rgba(255, 193, 7, 0.6)', // Semi-transparent yellow
                    borderColor: 'rgba(255, 193, 7, 1)', // Solid yellow
                    borderWidth: 1
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                responsive: true,
                maintainAspectRatio: true // Adjust as needed
            }
        });
    }

    function initAffiliatePieChart() {
         if (activeCharts.affiliatePie) activeCharts.affiliatePie.destroy();
         const ctx = document.getElementById('affiliatePieChart')?.getContext('2d');
         if (!ctx) return;

         activeCharts.affiliatePie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['QuoteZone', 'PCP Claims', 'Dynamo', 'Other'],
                datasets: [{
                    label: 'Claims by Affiliate',
                    data: [300, 150, 100, 50],
                    backgroundColor: ['rgba(255, 193, 7, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(201, 203, 207, 0.8)'],
                    hoverOffset: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }

     function initBuyerPieChart() {
         if (activeCharts.buyerPie) activeCharts.buyerPie.destroy();
         const ctx = document.getElementById('buyerPieChart')?.getContext('2d');
         if (!ctx) return;

         activeCharts.buyerPie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Heirloom', 'ID Tech', 'Connected', 'Money & ME'],
                datasets: [{
                    label: 'Claims by Buyer',
                    data: [250, 180, 90, 80],
                     backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)', 'rgba(231, 233, 237, 0.8)'],
                    hoverOffset: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }

    // --- Claims Table Specific Interactivity ---
    function setupClaimsTableInteractivity() {
        const tabs = contentArea.querySelectorAll('.tab-button');
        const tableRows = contentArea.querySelectorAll('.claims-table tbody tr');

        // Tab Switching Logic
        if (tabs.length > 0) {
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const selectedStatus = tab.getAttribute('data-status');

                    tableRows.forEach(row => {
                        const rowStatusSpan = row.querySelector('.status-badge');
                        let rowStatus = 'all';
                        if (rowStatusSpan) {
                           const statusClass = Array.from(rowStatusSpan.classList).find(cls => cls.startsWith('status-') && cls !== 'status-badge');
                           if (statusClass) rowStatus = statusClass.replace('status-', '');
                        }
                        row.style.display = (selectedStatus === 'all' || rowStatus === selectedStatus) ? '' : 'none';
                    });
                });
            });
            // Trigger initial filter
             tabs[0]?.click();
        }

        // Row Click Logic (Show Modal)
        if (tableRows.length > 0 && modalOverlay && modalClaimIdDisplay && modalBody) {
            tableRows.forEach(row => {
                row.addEventListener('click', () => {
                    const claimId = row.getAttribute('data-claim-id');
                    modalClaimIdDisplay.textContent = claimId ?? 'N/A';

                    // Basic content display (replace with actual data fetching)
                    modalBody.innerHTML = `
                        <h4>${row.cells[0].textContent}</h4>
                        <p><strong>Claim Type:</strong> ${row.cells[1].textContent}</p>
                        <p><strong>Status:</strong> ${row.cells[2].innerHTML}</p> <!-- Keep badge -->
                        <p><strong>Affiliate:</strong> ${row.cells[3].textContent}</p>
                        <p><strong>Buyer:</strong> ${row.cells[4].textContent}</p>
                        <p><strong>Date Added:</strong> ${row.cells[5].textContent}</p>
                        <hr>
                        <p>Further details and actions would appear here.</p>
                    `;
                    modalOverlay.style.display = 'flex';
                });
            });
        } else {
            console.error("Modal elements not found for table row clicks.");
        }
    }

    // --- Stats Page Specific Interactivity ---
    function setupStatsPageInteractivity() {
        const timePeriodSelect = document.getElementById('claims-time-period');
        if (timePeriodSelect) {
            // Initial chart load
            initNewClaimsChart(timePeriodSelect.value);
            initAffiliatePieChart();
            initBuyerPieChart();

            // Add listener for changes
            timePeriodSelect.addEventListener('change', (e) => {
                initNewClaimsChart(e.target.value);
                 // Pie charts usually don't depend on the time period selector here
            });
        } else {
             console.error("Time period selector not found.");
        }
    }


    // --- Modal Closing Logic ---
    function closeModal() {
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    }

    if (modalOverlay) {
        modalCloseButtons.forEach(button => button.addEventListener('click', closeModal));
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) closeModal();
        });
    }

    // --- Main Navigation Logic ---
    function handleNavigation(event) {
        event.preventDefault(); // Prevent page reload

        const link = event.currentTarget;
        const linkText = link.textContent.trim();
        const menu = link.closest('ul'); // Find parent ul

        // Update active state within the correct menu
        menu.querySelectorAll('li').forEach(item => item.classList.remove('active'));
        link.parentElement.classList.add('active');

        // --- Content Loading ---
        destroyActiveCharts(); // Destroy charts before loading new content
        contentArea.innerHTML = ''; // Clear previous content
        contentArea.scrollTop = 0; // Scroll to top of content area

        // Determine which content to load
        if (linkText.toLowerCase().includes('claims')) {
            contentArea.innerHTML = claimsTableHTML;
            setupClaimsTableInteractivity(); // Setup listeners for the new table
        } else if (linkText.toLowerCase().includes('stats')) {
            contentArea.innerHTML = statsPageHTML;
            setupStatsPageInteractivity(); // Setup charts and listeners
        } else {
            // Load default content for other pages
             contentArea.innerHTML = defaultPageHTML(linkText);
        }
    }

    // --- Initial Setup ---

    // Add navigation listeners to all menu links
    document.querySelectorAll('.sidebar-nav ul li a').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Sidebar toggle listener
    if (toggle) {
        toggle.addEventListener('change', updateMenus);
    }

    // Initial menu state
    updateMenus();

    // Simulate initial click on the default active menu item
    // Find the currently visible menu's active link or first link
    const visibleMenu = toggle.checked ? adminMenu : claimsMenu;
    const initialActiveLink = visibleMenu.querySelector('li.active a') || visibleMenu.querySelector('li a');
    if (initialActiveLink) {
        initialActiveLink.click(); // Trigger content load for the default view
    } else {
        contentArea.innerHTML = defaultPageHTML("Welcome"); // Fallback
    }

}); // End DOMContentLoaded