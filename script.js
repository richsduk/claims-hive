/**
 * Claims Hive - Utility Functions
 * 
 * This file contains utility functions for the Claims Hive application.
 * The main navigation logic has been moved to index.html to support SPA functionality.
 */

// --- Chart Utility Functions ---

// Object to hold active chart instances
let activeCharts = {};

/**
 * Destroy all active chart instances
 */
function destroyActiveCharts() {
    Object.values(activeCharts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    activeCharts = {}; // Clear the references
}

/**
 * Generate time-based data for charts
 * @param {string} period - The time period ('daily', 'weekly', 'monthly')
 * @returns {Object} Object containing labels and data arrays
 */
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

/**
 * Initialize a new claims bar chart
 * @param {string} period - The time period to display
 */
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

/**
 * Initialize a pie chart showing claims by affiliate
 */
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

/**
 * Initialize a pie chart showing claims by buyer
 */
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

/**
 * Set up interactivity for the claims table
 * @param {HTMLElement} contentArea - The content area containing the table
 */
function setupClaimsTableInteractivity(contentArea) {
    const tabs = contentArea.querySelectorAll('.tab-button');
    const tableRows = contentArea.querySelectorAll('.claims-table tbody tr');
    const modalOverlay = document.getElementById('claim-details-modal');
    const modalClaimIdDisplay = document.getElementById('modal-claim-id-display');
    const modalCloseButtons = document.querySelectorAll('.modal-close-button');
    const modalBody = modalOverlay?.querySelector('.modal-body');

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
    }

    // Modal Closing Logic
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
}

/**
 * Set up interactivity for the stats page
 */
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
    }
}

// Export functions for use in other modules
export {
    destroyActiveCharts,
    generateTimeData,
    initNewClaimsChart,
    initAffiliatePieChart,
    initBuyerPieChart,
    setupClaimsTableInteractivity,
    setupStatsPageInteractivity
};
