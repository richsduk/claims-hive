/**
 * DataTable Component
 * A reusable data table component with responsive design and card view for mobile
 */

import DataFormatter from './dataFormatter.js';

class DataTable {
    /**
     * Create a new DataTable instance
     * @param {string|HTMLElement} container - Container element or selector
     * @param {Object} options - Configuration options
     */
    constructor(container, options = {}) {
        // Store container reference
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            throw new Error('DataTable container not found');
        }
        
        // Default options
        const defaultOptions = {
            columns: [],
            data: [],
            pageSize: 10,
            currentPage: 1,
            sortColumn: null,
            sortDirection: 'asc',
            headerVisible: true,
            selectable: false,
            clickable: true,
            loading: false,
            emptyMessage: 'No data available',
            cardTitleField: null, // Field to use as card title in mobile view
            onRowClick: null,
            onSort: null,
            onPageChange: null,
            onSelectionChange: null,
            formatters: {},
            websocket: {
                enabled: false,
                url: null,
                autoConnect: true,
                reconnectInterval: 5000,
                onConnect: null,
                onDisconnect: null,
                onMessage: null
            }
        };
        
        // Merge options
        this.options = { ...defaultOptions, ...options };
        
        // Initialize state
        this.state = {
            selectedRows: new Set(),
            visibleData: [],
            totalPages: 1,
            connected: false,
            connecting: false,
            lastUpdatedRows: new Set()
        };
        
        // WebSocket connection
        this.ws = null;
        
        // Initialize the component
        this.init();
    }
    
    /**
     * Initialize the component
     */
    init() {
        // Create component structure
        this.createStructure();
        
        // Apply initial data
        this.setData(this.options.data);
        
        // Connect WebSocket if enabled
        if (this.options.websocket.enabled && this.options.websocket.autoConnect) {
            this.connectWebSocket();
        }
    }
    
    /**
     * Create the component structure
     */
    createStructure() {
        // Clear container
        this.container.innerHTML = '';
        this.container.classList.add('data-table-container');
        
        // Create table wrapper (desktop view)
        this.tableWrapper = document.createElement('div');
        this.tableWrapper.className = 'data-table-wrapper';
        
        // Create table
        this.table = document.createElement('table');
        this.table.className = 'data-table';
        
        // Create table header
        if (this.options.headerVisible) {
            this.tableHeader = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            // Add selection column if selectable
            if (this.options.selectable) {
                const selectAllCell = document.createElement('th');
                selectAllCell.className = 'select-all-cell';
                const selectAllCheckbox = document.createElement('input');
                selectAllCheckbox.type = 'checkbox';
                selectAllCheckbox.addEventListener('change', () => this.toggleSelectAll(selectAllCheckbox.checked));
                selectAllCell.appendChild(selectAllCheckbox);
                headerRow.appendChild(selectAllCell);
            }
            
            // Add column headers
            this.options.columns.forEach(column => {
                const headerCell = document.createElement('th');
                headerCell.textContent = column.title || column.field;
                
                // Add sort functionality if sortable
                if (column.sortable) {
                    headerCell.classList.add('sortable');
                    headerCell.addEventListener('click', () => this.handleSort(column.field));
                    
                    // Add sort indicator if this is the current sort column
                    if (this.options.sortColumn === column.field) {
                        headerCell.classList.add('sorted');
                        headerCell.classList.add(this.options.sortDirection === 'asc' ? 'asc' : 'desc');
                    }
                }
                
                headerRow.appendChild(headerCell);
            });
            
            // Add actions column if needed
            if (this.hasActions()) {
                const actionsHeader = document.createElement('th');
                actionsHeader.textContent = 'Actions';
                actionsHeader.classList.add('actions-column');
                headerRow.appendChild(actionsHeader);
            }
            
            this.tableHeader.appendChild(headerRow);
            this.table.appendChild(this.tableHeader);
        }
        
        // Create table body
        this.tableBody = document.createElement('tbody');
        this.table.appendChild(this.tableBody);
        
        // Add table to wrapper
        this.tableWrapper.appendChild(this.table);
        this.container.appendChild(this.tableWrapper);
        
        // Create cards container (mobile view)
        this.cardsContainer = document.createElement('div');
        this.cardsContainer.className = 'data-cards';
        this.container.appendChild(this.cardsContainer);
        
        // Create pagination container
        this.paginationContainer = document.createElement('div');
        this.paginationContainer.className = 'pagination-container';
        this.container.appendChild(this.paginationContainer);
        
        // Add connection status indicator if WebSocket is enabled
        if (this.options.websocket.enabled) {
            this.connectionStatus = document.createElement('div');
            this.connectionStatus.className = 'connection-status';
            
            const indicator = document.createElement('span');
            indicator.className = 'indicator disconnected';
            this.connectionStatus.appendChild(indicator);
            
            const statusText = document.createElement('span');
            statusText.className = 'status-text';
            statusText.textContent = 'Disconnected';
            this.connectionStatus.appendChild(statusText);
            
            this.container.appendChild(this.connectionStatus);
            this.updateConnectionStatus();
        }
    }
    
    /**
     * Check if any column has actions
     * @returns {boolean} True if any column has actions
     */
    hasActions() {
        return this.options.columns.some(column => 
            column.actions && Array.isArray(column.actions) && column.actions.length > 0);
    }
    
    /**
     * Set the data for the table
     * @param {Array} data - Array of data objects
     */
    setData(data) {
        this.options.data = Array.isArray(data) ? data : [];
        this.options.currentPage = 1;
        this.updateVisibleData();
        this.render();
    }
    
    /**
     * Update the data and maintain current page
     * @param {Array} data - Array of data objects
     */
    updateData(data) {
        this.options.data = Array.isArray(data) ? data : [];
        this.updateVisibleData();
        this.render();
    }
    
    /**
     * Update a single row of data
     * @param {string|number} id - ID of the row to update
     * @param {Object} newData - New data for the row
     * @param {string} idField - Field to use as ID (default: 'id')
     */
    updateRow(id, newData, idField = 'id') {
        const index = this.options.data.findIndex(item => item[idField] === id);
        if (index !== -1) {
            this.options.data[index] = { ...this.options.data[index], ...newData };
            this.state.lastUpdatedRows.add(id);
            this.updateVisibleData();
            this.render();
            
            // Clear the updated row highlight after animation
            setTimeout(() => {
                this.state.lastUpdatedRows.delete(id);
                this.render();
            }, 2000);
        }
    }
    
    /**
     * Add a new row of data
     * @param {Object} newRow - New row data
     */
    addRow(newRow) {
        this.options.data.push(newRow);
        if (newRow.id) {
            this.state.lastUpdatedRows.add(newRow.id);
        }
        this.updateVisibleData();
        this.render();
        
        // Clear the updated row highlight after animation
        if (newRow.id) {
            setTimeout(() => {
                this.state.lastUpdatedRows.delete(newRow.id);
                this.render();
            }, 2000);
        }
    }
    
    /**
     * Remove a row of data
     * @param {string|number} id - ID of the row to remove
     * @param {string} idField - Field to use as ID (default: 'id')
     */
    removeRow(id, idField = 'id') {
        const index = this.options.data.findIndex(item => item[idField] === id);
        if (index !== -1) {
            this.options.data.splice(index, 1);
            this.state.selectedRows.delete(id);
            this.updateVisibleData();
            this.render();
        }
    }
    
    /**
     * Update the visible data based on pagination and sorting
     */
    updateVisibleData() {
        // Apply sorting if needed
        let sortedData = [...this.options.data];
        if (this.options.sortColumn) {
            sortedData.sort((a, b) => {
                const aValue = a[this.options.sortColumn];
                const bValue = b[this.options.sortColumn];
                
                // Handle null/undefined values
                if (aValue === null || aValue === undefined) return this.options.sortDirection === 'asc' ? -1 : 1;
                if (bValue === null || bValue === undefined) return this.options.sortDirection === 'asc' ? 1 : -1;
                
                // Compare based on type
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return this.options.sortDirection === 'asc' 
                        ? aValue.localeCompare(bValue) 
                        : bValue.localeCompare(aValue);
                } else {
                    return this.options.sortDirection === 'asc' 
                        ? aValue - bValue 
                        : bValue - aValue;
                }
            });
        }
        
        // Apply pagination
        const startIndex = (this.options.currentPage - 1) * this.options.pageSize;
        const endIndex = startIndex + this.options.pageSize;
        this.state.visibleData = sortedData.slice(startIndex, endIndex);
        
        // Calculate total pages
        this.state.totalPages = Math.max(1, Math.ceil(sortedData.length / this.options.pageSize));
        
        // Adjust current page if out of bounds
        if (this.options.currentPage > this.state.totalPages) {
            this.options.currentPage = this.state.totalPages;
            this.updateVisibleData();
        }
    }
    
    /**
     * Render the table and cards
     */
    render() {
        this.renderTable();
        this.renderCards();
        this.renderPagination();
    }
    
    /**
     * Render the table view (desktop)
     */
    renderTable() {
        // Clear table body
        this.tableBody.innerHTML = '';
        
        // Show loading state if needed
        if (this.options.loading) {
            const loadingRow = document.createElement('tr');
            const loadingCell = document.createElement('td');
            loadingCell.colSpan = this.options.columns.length + (this.options.selectable ? 1 : 0) + (this.hasActions() ? 1 : 0);
            loadingCell.className = 'data-loading';
            
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            loadingCell.appendChild(spinner);
            
            const loadingText = document.createElement('div');
            loadingText.textContent = 'Loading...';
            loadingCell.appendChild(loadingText);
            
            loadingRow.appendChild(loadingCell);
            this.tableBody.appendChild(loadingRow);
            return;
        }
        
        // Show empty state if needed
        if (this.state.visibleData.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = this.options.columns.length + (this.options.selectable ? 1 : 0) + (this.hasActions() ? 1 : 0);
            emptyCell.className = 'data-empty';
            emptyCell.textContent = this.options.emptyMessage;
            emptyRow.appendChild(emptyCell);
            this.tableBody.appendChild(emptyRow);
            return;
        }
        
        // Render data rows
        this.state.visibleData.forEach((rowData, rowIndex) => {
            const row = document.createElement('tr');
            
            // Add row ID if available
            if (rowData.id) {
                row.dataset.id = rowData.id;
                
                // Highlight recently updated rows
                if (this.state.lastUpdatedRows.has(rowData.id)) {
                    row.classList.add('highlight-update');
                }
            }
            
            // Add selection column if selectable
            if (this.options.selectable) {
                const selectCell = document.createElement('td');
                selectCell.className = 'select-cell';
                const selectCheckbox = document.createElement('input');
                selectCheckbox.type = 'checkbox';
                selectCheckbox.checked = this.state.selectedRows.has(rowData.id);
                selectCheckbox.addEventListener('change', () => this.toggleRowSelection(rowData.id));
                selectCell.appendChild(selectCheckbox);
                row.appendChild(selectCell);
            }
            
            // Add data cells
            this.options.columns.forEach(column => {
                const cell = document.createElement('td');
                
                // Get cell value
                const value = rowData[column.field];
                
                // Format the value based on column type
                if (column.type === 'status') {
                    const status = this.formatValue(value, column);
                    const statusBadge = document.createElement('span');
                    statusBadge.className = `status-badge ${status.class}`;
                    statusBadge.textContent = status.text;
                    cell.appendChild(statusBadge);
                } else if (column.type === 'html') {
                    cell.innerHTML = value || '';
                } else {
                    cell.textContent = this.formatValue(value, column);
                }
                
                // Add custom CSS class if specified
                if (column.cellClass) {
                    cell.classList.add(column.cellClass);
                }
                
                row.appendChild(cell);
            });
            
            // Add actions column if needed
            if (this.hasActions()) {
                const actionsCell = document.createElement('td');
                actionsCell.className = 'action-buttons';
                
                // Find column with actions
                const actionsColumn = this.options.columns.find(col => col.actions && col.actions.length > 0);
                if (actionsColumn) {
                    actionsColumn.actions.forEach(action => {
                        const button = document.createElement('button');
                        button.type = 'button';
                        button.className = `action-btn ${action.class || ''}`;
                        button.title = action.title || '';
                        
                        // Add icon if specified
                        if (action.icon) {
                            const icon = document.createElement('i');
                            icon.className = action.icon;
                            button.appendChild(icon);
                        } else {
                            button.textContent = action.text || '';
                        }
                        
                        // Add click handler
                        button.addEventListener('click', (event) => {
                            event.stopPropagation();
                            if (typeof action.onClick === 'function') {
                                action.onClick(rowData, rowIndex);
                            }
                        });
                        
                        actionsCell.appendChild(button);
                    });
                }
                
                row.appendChild(actionsCell);
            }
            
            // Add row click handler
            if (this.options.clickable) {
                row.addEventListener('click', () => this.handleRowClick(rowData, rowIndex));
            }
            
            this.tableBody.appendChild(row);
        });
    }
    
    /**
     * Render the card view (mobile)
     */
    renderCards() {
        // Clear cards container
        this.cardsContainer.innerHTML = '';
        
        // Show loading state if needed
        if (this.options.loading) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'data-loading';
            
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            loadingDiv.appendChild(spinner);
            
            const loadingText = document.createElement('div');
            loadingText.textContent = 'Loading...';
            loadingDiv.appendChild(loadingText);
            
            this.cardsContainer.appendChild(loadingDiv);
            return;
        }
        
        // Show empty state if needed
        if (this.state.visibleData.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'data-empty';
            emptyDiv.textContent = this.options.emptyMessage;
            this.cardsContainer.appendChild(emptyDiv);
            return;
        }
        
        // Render data cards
        this.state.visibleData.forEach((rowData, rowIndex) => {
            const card = document.createElement('div');
            card.className = 'data-card';
            
            // Add card ID if available
            if (rowData.id) {
                card.dataset.id = rowData.id;
                
                // Highlight recently updated cards
                if (this.state.lastUpdatedRows.has(rowData.id)) {
                    card.classList.add('highlight-update');
                }
            }
            
            // Add card header (title)
            const cardHeader = document.createElement('div');
            cardHeader.className = 'data-card-header';
            
            // Use specified title field or first column
            const titleField = this.options.cardTitleField || this.options.columns[0]?.field;
            if (titleField && rowData[titleField] !== undefined) {
                const titleColumn = this.options.columns.find(col => col.field === titleField);
                if (titleColumn && titleColumn.type === 'status') {
                    const status = this.formatValue(rowData[titleField], titleColumn);
                    const statusBadge = document.createElement('span');
                    statusBadge.className = `status-badge ${status.class}`;
                    statusBadge.textContent = status.text;
                    cardHeader.appendChild(statusBadge);
                } else {
                    cardHeader.textContent = this.formatValue(rowData[titleField], 
                        this.options.columns.find(col => col.field === titleField));
                }
            } else {
                cardHeader.textContent = `Item ${rowIndex + 1}`;
            }
            
            card.appendChild(cardHeader);
            
            // Add card body with fields
            const cardBody = document.createElement('div');
            cardBody.className = 'data-card-body';
            
            // Add all fields except the title field
            this.options.columns.forEach(column => {
                // Skip the title field
                if (column.field === titleField) {
                    return;
                }
                
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'data-card-field';
                
                const labelDiv = document.createElement('div');
                labelDiv.className = 'data-card-label';
                labelDiv.textContent = column.title || column.field;
                fieldDiv.appendChild(labelDiv);
                
                const valueDiv = document.createElement('div');
                valueDiv.className = 'data-card-value';
                
                // Format the value based on column type
                const value = rowData[column.field];
                if (column.type === 'status') {
                    const status = this.formatValue(value, column);
                    const statusBadge = document.createElement('span');
                    statusBadge.className = `status-badge ${status.class}`;
                    statusBadge.textContent = status.text;
                    valueDiv.appendChild(statusBadge);
                } else if (column.type === 'html') {
                    valueDiv.innerHTML = value || '';
                } else {
                    valueDiv.textContent = this.formatValue(value, column);
                }
                
                fieldDiv.appendChild(valueDiv);
                cardBody.appendChild(fieldDiv);
            });
            
            card.appendChild(cardBody);
            
            // Add actions if needed
            const actionsColumn = this.options.columns.find(col => col.actions && col.actions.length > 0);
            if (actionsColumn) {
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'action-buttons';
                
                actionsColumn.actions.forEach(action => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = `action-btn ${action.class || ''}`;
                    button.title = action.title || '';
                    
                    // Add icon if specified
                    if (action.icon) {
                        const icon = document.createElement('i');
                        icon.className = action.icon;
                        button.appendChild(icon);
                    } else {
                        button.textContent = action.text || '';
                    }
                    
                    // Add click handler
                    button.addEventListener('click', (event) => {
                        event.stopPropagation();
                        if (typeof action.onClick === 'function') {
                            action.onClick(rowData, rowIndex);
                        }
                    });
                    
                    actionsDiv.appendChild(button);
                });
                
                card.appendChild(actionsDiv);
            }
            
            // Add card click handler
            if (this.options.clickable) {
                card.addEventListener('click', () => this.handleRowClick(rowData, rowIndex));
            }
            
            this.cardsContainer.appendChild(card);
        });
    }
    
    /**
     * Render the pagination controls
     */
    renderPagination() {
        // Clear pagination container
        this.paginationContainer.innerHTML = '';
        
        // Don't show pagination if there's only one page
        if (this.state.totalPages <= 1) {
            return;
        }
        
        // Create pagination info
        const paginationInfo = document.createElement('div');
        paginationInfo.className = 'pagination-info';
        paginationInfo.textContent = `Page ${this.options.currentPage} of ${this.state.totalPages}`;
        this.paginationContainer.appendChild(paginationInfo);
        
        // Create pagination buttons
        const paginationButtons = document.createElement('div');
        paginationButtons.className = 'pagination-buttons';
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'btn btn-secondary';
        prevButton.textContent = 'Previous';
        prevButton.disabled = this.options.currentPage <= 1;
        prevButton.addEventListener('click', () => this.goToPage(this.options.currentPage - 1));
        paginationButtons.appendChild(prevButton);
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'btn btn-secondary';
        nextButton.textContent = 'Next';
        nextButton.disabled = this.options.currentPage >= this.state.totalPages;
        nextButton.addEventListener('click', () => this.goToPage(this.options.currentPage + 1));
        paginationButtons.appendChild(nextButton);
        
        this.paginationContainer.appendChild(paginationButtons);
    }
    
    /**
     * Format a value based on column configuration
     * @param {*} value - The value to format
     * @param {Object} column - Column configuration
     * @returns {*} Formatted value
     */
    formatValue(value, column) {
        // Use column formatter if available
        if (column && column.formatter && typeof column.formatter === 'function') {
            return column.formatter(value, column);
        }
        
        // Use type-specific formatter
        if (column && column.type) {
            // Use custom formatter if available
            const customFormatter = this.options.formatters[column.type];
            if (customFormatter && typeof customFormatter === 'function') {
                return customFormatter(value, column.formatOptions || {});
            }
            
            // Use DataFormatter utility
            return DataFormatter.format(value, column.type, column.formatOptions || {});
        }
        
        // Default formatting
        if (value === null || value === undefined) {
            return '';
        }
        
        return String(value);
    }
    
    /**
     * Handle row click event
     * @param {Object} rowData - Data for the clicked row
     * @param {number} rowIndex - Index of the clicked row
     */
    handleRowClick(rowData, rowIndex) {
        if (typeof this.options.onRowClick === 'function') {
            this.options.onRowClick(rowData, rowIndex);
        }
    }
    
    /**
     * Handle sort event
     * @param {string} columnField - Field to sort by
     */
    handleSort(columnField) {
        if (this.options.sortColumn === columnField) {
            // Toggle sort direction if already sorting by this column
            this.options.sortDirection = this.options.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // Set new sort column and default to ascending
            this.options.sortColumn = columnField;
            this.options.sortDirection = 'asc';
        }
        
        // Update data and render
        this.updateVisibleData();
        this.render();
        
        // Call sort callback if provided
        if (typeof this.options.onSort === 'function') {
            this.options.onSort(columnField, this.options.sortDirection);
        }
    }
    
    /**
     * Go to a specific page
     * @param {number} page - Page number to go to
     */
    goToPage(page) {
        if (page < 1 || page > this.state.totalPages) {
            return;
        }
        
        this.options.currentPage = page;
        this.updateVisibleData();
        this.render();
        
        // Call page change callback if provided
        if (typeof this.options.onPageChange === 'function') {
            this.options.onPageChange(page);
        }
    }
    
    /**
     * Toggle selection of a specific row
     * @param {string|number} rowId - ID of the row to toggle
     */
    toggleRowSelection(rowId) {
        if (this.state.selectedRows.has(rowId)) {
            this.state.selectedRows.delete(rowId);
        } else {
            this.state.selectedRows.add(rowId);
        }
        
        this.render();
        
        // Call selection change callback if provided
        if (typeof this.options.onSelectionChange === 'function') {
            this.options.onSelectionChange(Array.from(this.state.selectedRows));
        }
    }
    
    /**
     * Toggle selection of all rows
     * @param {boolean} selected - Whether to select or deselect all rows
     */
    toggleSelectAll(selected) {
        if (selected) {
            // Select all visible rows
            this.state.visibleData.forEach(rowData => {
                if (rowData.id) {
                    this.state.selectedRows.add(rowData.id);
                }
            });
        } else {
            // Deselect all visible rows
            this.state.visibleData.forEach(rowData => {
                if (rowData.id) {
                    this.state.selectedRows.delete(rowData.id);
                }
            });
        }
        
        this.render();
        
        // Call selection change callback if provided
        if (typeof this.options.onSelectionChange === 'function') {
            this.options.onSelectionChange(Array.from(this.state.selectedRows));
        }
    }
    
    /**
     * Get the currently selected row IDs
     * @returns {Array} Array of selected row IDs
     */
    getSelectedRows() {
        return Array.from(this.state.selectedRows);
    }
    
    /**
     * Connect to WebSocket
     */
    connectWebSocket() {
        if (!this.options.websocket.enabled || !this.options.websocket.url) {
            return;
        }
        
        // Don't reconnect if already connected or connecting
        if (this.ws && (this.state.connected || this.state.connecting)) {
            return;
        }
        
        this.state.connecting = true;
        this.updateConnectionStatus();
        
        try {
            this.ws = new WebSocket(this.options.websocket.url);
            
            this.ws.onopen = () => {
                this.state.connected = true;
                this.state.connecting = false;
                this.updateConnectionStatus();
                
                // Call connect callback if provided
                if (typeof this.options.websocket.onConnect === 'function') {
                    this.options.websocket.onConnect();
                }
            };
            
            this.ws.onclose = () => {
                this.state.connected = false;
                this.state.connecting = false;
                this.updateConnectionStatus();
                
                // Call disconnect callback if provided
                if (typeof this.options.websocket.onDisconnect === 'function') {
                    this.options.websocket.onDisconnect();
                }
                
                // Attempt to reconnect after delay
                setTimeout(() => {
                    this.connectWebSocket();
                }, this.options.websocket.reconnectInterval);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.state.connected = false;
                this.state.connecting = false;
                this.updateConnectionStatus();
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    
                    // Call message callback if provided
                    if (typeof this.options.websocket.onMessage === 'function') {
                        this.options.websocket.onMessage(message);
                    }
                    
                    // Handle different message types
                    if (message.type === 'update' && message.data) {
                        this.handleWebSocketUpdate(message.data);
                    } else if (message.type === 'delete' && message.id) {
                        this.removeRow(message.id);
                    } else if (message.type === 'add' && message.data) {
                        this.addRow(message.data);
                    } else if (message.type === 'refresh') {
                        this.updateData(message.data || []);
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            };
        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            this.state.connected = false;
            this.state.connecting = false;
            this.updateConnectionStatus();
            
            // Attempt to reconnect after delay
            setTimeout(() => {
                this.connectWebSocket();
            }, this.options.websocket.reconnectInterval);
        }
    }
    
    /**
     * Disconnect from WebSocket
     */
    disconnectWebSocket() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        this.state.connected = false;
        this.state.connecting = false;
        this.updateConnectionStatus();
    }
    
    /**
     * Handle WebSocket update message
     * @param {Object|Array} data - Updated data
     */
    handleWebSocketUpdate(data) {
        if (Array.isArray(data)) {
            // Handle bulk update
            this.updateData(data);
        } else if (data.id) {
            // Handle single row update
            this.updateRow(data.id, data);
        }
    }
    
    /**
     * Update the connection status indicator
     */
    updateConnectionStatus() {
        if (!this.connectionStatus) {
            return;
        }
        
        const indicator = this.connectionStatus.querySelector('.indicator');
        const statusText = this.connectionStatus.querySelector('.status-text');
        
        if (this.state.connected) {
            indicator.className = 'indicator connected';
            statusText.textContent = 'Connected';
        } else if (this.state.connecting) {
            indicator.className = 'indicator connecting';
            statusText.textContent = 'Connecting...';
        } else {
            indicator.className = 'indicator disconnected';
            statusText.textContent = 'Disconnected';
        }
    }
    
    /**
     * Send a message through the WebSocket
     * @param {Object} message - Message to send
     */
    sendMessage(message) {
        if (!this.ws || !this.state.connected) {
            console.error('Cannot send message: WebSocket not connected');
            return false;
        }
        
        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            return false;
        }
    }
    
    /**
     * Destroy the component and clean up
     */
    destroy() {
        // Disconnect WebSocket
        this.disconnectWebSocket();
        
        // Remove event listeners
        // (Most event listeners are automatically cleaned up when elements are removed)
        
        // Clear container
        this.container.innerHTML = '';
        
        // Clear references
        this.tableWrapper = null;
        this.table = null;
        this.tableHeader = null;
        this.tableBody = null;
        this.cardsContainer = null;
        this.paginationContainer = null;
        this.connectionStatus = null;
    }
}

// Export the DataTable class
export default DataTable;
