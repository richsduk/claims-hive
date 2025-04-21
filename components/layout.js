/**
 * Layout Component for Claims Hive
 * Provides a consistent layout across all pages
 * 
 * @module Layout
 * @author Claims Hive Team
 * @version 1.0.0
 */

import Modal from './Modal/Modal.js';

/**
 * Add both click and touch event listeners to an element
 * @param {HTMLElement} element - The element to add event listeners to
 * @param {string} eventType - The event type (e.g., 'click', 'change')
 * @param {Function} handler - The event handler function
 */
function addEventListeners(element, eventType, handler) {
    if (!element) return;
    
    if (eventType === 'click') {
        // Add both click and touch events for click handlers
        element.addEventListener('click', handler);
        element.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behavior
            handler(e);
        });
    } else {
        // For other event types, just add the specified event
        element.addEventListener(eventType, handler);
    }
}

export default class Layout {
    /**
     * Create a new Layout instance
     * @param {Object} options - Configuration options
     * @param {string} options.title - The page title
     * @param {string} options.activeMenuItem - The active menu item ID
     * @param {boolean} options.isAdminMode - Whether to show admin mode (default: false)
     */
    constructor(options = {}) {
        this.options = Object.assign({
            title: 'Claims Hive',
            activeMenuItem: null,
            isAdminMode: false
        }, options);
        
        this.init();
    }
    
    /**
     * Initialize the layout
     */
    init() {
        // Create layout elements
        this.createHeader();
        this.createSidebar();
        this.createMainContent();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set active menu item
        if (this.options.activeMenuItem) {
            this.setActiveMenuItem(this.options.activeMenuItem);
        }
        
        // Set admin mode
        if (this.options.isAdminMode) {
            this.toggleAdminMode(true);
        }
    }
    
    /**
     * Create the header
     */
    createHeader() {
        const header = document.createElement('header');
        header.className = 'app-header';
        
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('claims_hive_user') || '{}');
        const firstName = userData.first || 'Guest';
        const lastName = userData.last || '';
        const initials = firstName.charAt(0) + (lastName ? lastName.charAt(0) : '');
        const fullName = firstName + (lastName ? ' ' + lastName : '');
        
        header.innerHTML = `
            <div class="header-logo">
                <a href="#">
                    <img src="/claims_hive_logo.png" alt="Claims Hive Logo">
                </a>
            </div>
            <button class="menu-toggle" id="menuToggle">
                <i class="fa-solid fa-bars"></i>
            </button>
            <div class="user-profile" id="userProfileDropdown">
                <span class="avatar">${initials}</span>
                <span>${fullName}</span>
                <i class="fa-solid fa-caret-down"></i>
                <div class="user-dropdown">
                    <ul>
                        <li><a href="#" id="profileLink"><i class="fa-solid fa-user"></i> Profile</a></li>
                        <li><a href="#" id="settingsLink"><i class="fa-solid fa-gear"></i> Settings</a></li>
                        <li class="divider"></li>
                        <li><a href="#" id="logoutLink"><i class="fa-solid fa-sign-out-alt"></i> Logout</a></li>
                    </ul>
                </div>
            </div>
        `;
        
        document.body.prepend(header);
        
        // Add event listener for logout
        const logoutLink = header.querySelector('#logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Clear localStorage
                localStorage.removeItem('claims_hive_token');
                localStorage.removeItem('claims_hive_user');
                // Redirect to login page
                window.location.href = 'login.html';
            });
        }
        
        // Toggle dropdown on click
        const userProfile = header.querySelector('#userProfileDropdown');
        if (userProfile) {
            userProfile.addEventListener('click', (e) => {
                userProfile.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userProfile.contains(e.target)) {
                    userProfile.classList.remove('active');
                }
            });
        }
    }
    
    /**
     * Create the sidebar
     */
    createSidebar() {
        const mainLayout = document.createElement('div');
        mainLayout.className = 'main-layout';
        
        const sidebar = document.createElement('aside');
        sidebar.className = 'sidebar';
        
        sidebar.innerHTML = `
            <div class="sidebar-toggle-section">
                <label class="toggle-switch" for="viewModeToggle">
                    <span class="label claims-label">Claims</span>
                    <input type="checkbox" id="viewModeToggle">
                    <span class="slider"></span>
                    <span class="label admin-label">Admin</span>
                </label>
                <button id="sidebarCollapseToggle" class="sidebar-collapse-toggle" title="Toggle Sidebar">
                    <i class="fa-solid fa-angles-left"></i>
                </button>
            </div>
            
            <nav class="sidebar-nav">
                <!-- Claims Menu (Initially Visible) -->
                <ul id="claims-menu">
                    <li id="menu-claims"><a href="#"><i class="fa-solid fa-ticket"></i><span> Claims</span></a></li>
                    <li id="menu-clients"><a href="#"><i class="fa-solid fa-users"></i><span> Clients</span></a></li>
                    <li id="menu-stats"><a href="#"><i class="fa-solid fa-chart-line"></i><span> Stats</span></a></li>
                    <li class="menu-divider"><span>Demo Components</span></li>
                    <li id="menu-datatable-demo"><a href="#"><i class="fa-solid fa-table"></i><span> DataTable Demo</span></a></li>
                    <li id="menu-charts-demo"><a href="#"><i class="fa-solid fa-chart-pie"></i><span> Charts Demo</span></a></li>
                    <li id="menu-modal-demo"><a href="#"><i class="fa-solid fa-window-maximize"></i><span> Modal Demo</span></a></li>
                </ul>
                
                <!-- Admin Menu (Initially Hidden) -->
                <ul id="admin-menu">
                    <li id="menu-companies"><a href="#" data-table="company"><i class="fa-solid fa-briefcase"></i><span> Companies</span></a></li>
                    <li id="menu-users"><a href="#" data-table="user"><i class="fa-solid fa-user-shield"></i><span> Users</span></a></li>
                    <li id="menu-roles"><a href="#" data-table="role"><i class="fa-solid fa-user-tag"></i><span> Roles</span></a></li>
                    <li id="menu-claim-types"><a href="#" data-table="claim_type"><i class="fa-solid fa-puzzle-piece"></i><span> Claim Types</span></a></li>
                    <li id="menu-stats-admin"><a href="#"><i class="fa-solid fa-chart-pie"></i><span> Stats (Admin)</span></a></li>
                    <li id="menu-logs"><a href="#" data-table="log"><i class="fa-solid fa-clipboard-list"></i><span> Logs</span></a></li>
                    <li id="menu-message-queue"><a href="#"><i class="fa-solid fa-envelopes-bulk"></i><span> Message Queue</span></a></li>
                    <li id="menu-claim-flows"><a href="#"><i class="fa-regular fa-paper-plane"></i><span> Claim Flows</span></a></li>
                    <li id="menu-settings"><a href="#"><i class="fa-solid fa-gear"></i><span> Settings</span></a></li>
                    <li class="menu-divider"><span>Demo Components</span></li>
                    <li id="menu-datatable-demo-admin"><a href="#"><i class="fa-solid fa-table"></i><span> DataTable Demo</span></a></li>
                    <li id="menu-charts-demo-admin"><a href="#"><i class="fa-solid fa-chart-pie"></i><span> Charts Demo</span></a></li>
                    <li id="menu-modal-demo-admin"><a href="#"><i class="fa-solid fa-window-maximize"></i><span> Modal Demo</span></a></li>
                </ul>
            </nav>
        `;
        
        mainLayout.appendChild(sidebar);
        document.body.appendChild(mainLayout);
        
        // Store references
        this.mainLayout = mainLayout;
        this.sidebar = sidebar;
    }
    
    /**
     * Create the main content container
     */
    createMainContent() {
        const contentArea = document.createElement('main');
        contentArea.className = 'content-area';
        
        // Move existing body content to the content area
        const bodyContent = Array.from(document.body.childNodes).filter(node => {
            return node !== this.mainLayout && 
                   node !== document.querySelector('.app-header') &&
                   !(node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '');
        });
        
        bodyContent.forEach(node => {
            contentArea.appendChild(node);
        });
        
        this.mainLayout.appendChild(contentArea);
        this.contentArea = contentArea;
    }
    
    /**
     * Create mobile menu modal
     */
    createMobileMenuModal() {
        // Create a container for the menu content
        const menuContent = document.createElement('div');
        menuContent.className = 'mobile-menu-content';
        
        // Add styles to make it look like the sidebar
        menuContent.style.backgroundColor = '#343a40';
        menuContent.style.color = '#fff';
        menuContent.style.padding = '15px';
        menuContent.style.minHeight = '300px';
        
        // Clone the toggle switch section
        const toggleSection = this.sidebar.querySelector('.sidebar-toggle-section').cloneNode(true);
        menuContent.appendChild(toggleSection);
        
        // Clone the navigation
        const navigation = this.sidebar.querySelector('.sidebar-nav').cloneNode(true);
        menuContent.appendChild(navigation);
        
        // Create modal
        this.mobileMenuModal = new Modal({
            title: 'Menu',
            content: menuContent,
            size: 'large',
            position: 'left',
            animationType: 'slide',
            showFooter: false
        });
        
        // Set up event listeners for the cloned sidebar content
        const toggle = menuContent.querySelector('#viewModeToggle');
        const claimsMenu = menuContent.querySelector('#claims-menu');
        const adminMenu = menuContent.querySelector('#admin-menu');
        
        if (toggle) {
            toggle.addEventListener('change', () => {
                // Update the cloned menus
                if (toggle.checked) { // Admin Mode
                    claimsMenu.style.display = 'none';
                    adminMenu.style.display = 'block';
                } else { // Claims Mode
                    claimsMenu.style.display = 'block';
                    adminMenu.style.display = 'none';
                }
                
                // Also update the main sidebar toggle
                const mainToggle = document.getElementById('viewModeToggle');
                if (mainToggle) {
                    mainToggle.checked = toggle.checked;
                    this.toggleAdminMode(toggle.checked);
                }
            });
        }
        
        // Add click event to all links to close the modal when clicked
        const links = menuContent.querySelectorAll('a');
        links.forEach(link => {
            addEventListeners(link, 'click', () => {
                this.mobileMenuModal.close();
            });
        });
        
        return this.mobileMenuModal;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Toggle between Claims and Admin views
        const toggle = document.getElementById('viewModeToggle');
        const claimsMenu = document.getElementById('claims-menu');
        const adminMenu = document.getElementById('admin-menu');
        
        toggle.addEventListener('change', () => {
            this.toggleAdminMode(toggle.checked);
        });
        
        // Menu toggle button for mobile
        const menuToggle = document.getElementById('menuToggle');
        menuToggle.addEventListener('click', () => {
            console.log('Menu toggle clicked - standard click');
            
            // For mobile devices, simply show/hide the sidebar
            if (window.innerWidth <= 768) {
                // Toggle sidebar visibility
                if (this.sidebar.style.display === 'block') {
                    this.sidebar.style.display = 'none';
                } else {
                    this.sidebar.style.display = 'block';
                    this.sidebar.style.position = 'fixed';
                    this.sidebar.style.top = '60px'; // Header height
                    this.sidebar.style.left = '0';
                    this.sidebar.style.width = '100%';
                    this.sidebar.style.height = 'calc(100vh - 60px)';
                    this.sidebar.style.zIndex = '9999';
                    this.sidebar.style.backgroundColor = '#343a40';
                    
                    // Add click event to close the sidebar when clicking the X button
                    this.sidebar.addEventListener('click', (event) => {
                        // Check if the click was on the close button (::before pseudo-element)
                        const rect = this.sidebar.getBoundingClientRect();
                        const closeButtonArea = {
                            top: rect.top + 10,
                            right: rect.right - 10,
                            bottom: rect.top + 34, // 10 + 24 (font size)
                            left: rect.right - 34  // right - 10 - 24 (font size)
                        };
                        
                        if (event.clientX >= closeButtonArea.left && 
                            event.clientX <= closeButtonArea.right && 
                            event.clientY >= closeButtonArea.top && 
                            event.clientY <= closeButtonArea.bottom) {
                            this.sidebar.style.display = 'none';
                        }
                    }, { once: true }); // Remove the event listener after it's triggered once
                    
                    // Also close the sidebar when clicking a link
                    const links = this.sidebar.querySelectorAll('a');
                    links.forEach(link => {
                        link.addEventListener('click', () => {
                            this.sidebar.style.display = 'none';
                        });
                    });
                }
            } else {
                // For desktop, toggle sidebar as before
                this.sidebar.classList.toggle('sidebar-open');
            }
        });
        
        // Add touch event for mobile
        menuToggle.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behavior
            console.log('Menu toggle touched');
            
            // For mobile devices, simply show/hide the sidebar
            if (window.innerWidth <= 768) {
                // Toggle sidebar visibility
                if (this.sidebar.style.display === 'block') {
                    this.sidebar.style.display = 'none';
                } else {
                    this.sidebar.style.display = 'block';
                    this.sidebar.style.position = 'fixed';
                    this.sidebar.style.top = '60px'; // Header height
                    this.sidebar.style.left = '0';
                    this.sidebar.style.width = '100%';
                    this.sidebar.style.height = 'calc(100vh - 60px)';
                    this.sidebar.style.zIndex = '9999';
                    this.sidebar.style.backgroundColor = '#343a40';
                    
                    // Add click event to close the sidebar when clicking the X button
                    this.sidebar.addEventListener('click', (event) => {
                        // Check if the click was on the close button (::before pseudo-element)
                        const rect = this.sidebar.getBoundingClientRect();
                        const closeButtonArea = {
                            top: rect.top + 10,
                            right: rect.right - 10,
                            bottom: rect.top + 34, // 10 + 24 (font size)
                            left: rect.right - 34  // right - 10 - 24 (font size)
                        };
                        
                        if (event.clientX >= closeButtonArea.left && 
                            event.clientX <= closeButtonArea.right && 
                            event.clientY >= closeButtonArea.top && 
                            event.clientY <= closeButtonArea.bottom) {
                            this.sidebar.style.display = 'none';
                        }
                    }, { once: true }); // Remove the event listener after it's triggered once
                    
                    // Also close the sidebar when clicking a link
                    const links = this.sidebar.querySelectorAll('a');
                    links.forEach(link => {
                        link.addEventListener('click', () => {
                            this.sidebar.style.display = 'none';
                        });
                    });
                }
            }
        });
        
        // Double-click on sidebar to toggle collapsed state (desktop only)
        this.sidebar.addEventListener('dblclick', (event) => {
            if (window.innerWidth > 768) {
                this.toggleSidebarCollapsed();
            }
        });
        
        // Sidebar collapse toggle button (desktop only)
        const sidebarCollapseToggle = document.getElementById('sidebarCollapseToggle');
        if (sidebarCollapseToggle) {
            // Set initial icon based on collapsed state
            const icon = sidebarCollapseToggle.querySelector('i');
            if (document.body.classList.contains('sidebar-collapsed')) {
                icon.className = 'fa-solid fa-angles-right';
            }
            
            addEventListeners(sidebarCollapseToggle, 'click', () => {
                if (window.innerWidth > 768) {
                    this.toggleSidebarCollapsed();
                    
                    // Update the icon
                    if (document.body.classList.contains('sidebar-collapsed')) {
                        icon.className = 'fa-solid fa-angles-right';
                    } else {
                        icon.className = 'fa-solid fa-angles-left';
                    }
                }
            });
        }
        
        // Initial menu state
        this.toggleAdminMode(this.options.isAdminMode);
    }
    
    /**
     * Toggle sidebar collapsed state (desktop only)
     */
    toggleSidebarCollapsed() {
        const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
        
        // Update the icon direction
        const sidebarCollapseToggle = document.getElementById('sidebarCollapseToggle');
        if (sidebarCollapseToggle) {
            const icon = sidebarCollapseToggle.querySelector('i');
            if (isCollapsed) {
                icon.className = 'fa-solid fa-angles-right';
            } else {
                icon.className = 'fa-solid fa-angles-left';
            }
        }
    }
    
    /**
     * Toggle admin mode
     * @param {boolean} isAdminMode - Whether to show admin mode
     */
    toggleAdminMode(isAdminMode) {
        const toggle = document.getElementById('viewModeToggle');
        const claimsMenu = document.getElementById('claims-menu');
        const adminMenu = document.getElementById('admin-menu');
        
        toggle.checked = isAdminMode;
        
        if (isAdminMode) { // Admin Mode
            claimsMenu.style.display = 'none';
            adminMenu.style.display = 'block';
        } else { // Claims Mode
            claimsMenu.style.display = 'block';
            adminMenu.style.display = 'none';
        }
    }
    
    /**
     * Set the active menu item
     * @param {string} menuItemId - The ID of the menu item to set as active
     */
    setActiveMenuItem(menuItemId) {
        // Remove active class from all menu items
        document.querySelectorAll('.sidebar-nav li').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to the specified menu item
        const menuItem = document.getElementById(menuItemId);
        if (menuItem) {
            menuItem.classList.add('active');
        }
    }
    
    /**
     * Set the page title
     * @param {string} title - The page title
     */
    setTitle(title) {
        document.title = title;
    }
    
    /**
     * Add content to the main content area
     * @param {HTMLElement} content - The content to add
     */
    addContent(content) {
        this.contentArea.appendChild(content);
    }
    
    /**
     * Clear the main content area
     */
    clearContent() {
        this.contentArea.innerHTML = '';
    }
    
    /**
     * Add a header to the content area
     * @param {string} title - The header title
     * @param {Array} actions - Array of action objects with targetMenuId, icon, and text properties
     */
    addContentHeader(title, actions = []) {
        // Remove existing header if one exists
        const existingHeader = this.contentArea.querySelector('.content-header');
        if (existingHeader) {
            existingHeader.remove();
        }

        const contentHeader = document.createElement('div');
        contentHeader.className = 'content-header';
        
        // Create title element
        const titleElement = document.createElement('h1');
        titleElement.textContent = title;
        contentHeader.appendChild(titleElement);
        
        // Create actions container if there are actions
        if (actions && actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'actions';
            
            // Add each action button
            actions.forEach(action => {
                const actionLink = document.createElement('a');
                actionLink.href = '#';
                actionLink.className = 'btn btn-primary header-nav-link';
                actionLink.dataset.targetMenuId = action.targetMenuId;
                
                const icon = document.createElement('i');
                icon.className = action.icon;
                actionLink.appendChild(icon);
                
                const textSpan = document.createElement('span');
                textSpan.textContent = ' ' + action.text;
                actionLink.appendChild(textSpan);
                
                actionsContainer.appendChild(actionLink);
            });
            
            contentHeader.appendChild(actionsContainer);
        }
        
        // Prepend the header to the content area
        this.contentArea.prepend(contentHeader);

        // Note: Event listeners for '.header-nav-link' are added in index.html's handleNavigation
    }
}
