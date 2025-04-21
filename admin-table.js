/**
 * Admin Table Module
 * Provides functionality for admin tables using the DataTable component
 */

import DataTable from './components/DataTable/DataTable.js';
import DataFormatter from './components/DataTable/dataFormatter.js';
import Modal from './components/Modal/Modal.js';

export default class AdminTable {
    /**
     * Create a new AdminTable instance
     * @param {Object} options - Configuration options
     * @param {string} options.tableName - The database table name
     * @param {string} options.title - The table title
     * @param {Array} options.columns - The table columns
     * @param {string} options.containerId - The container ID (default: 'data-table-container')
     * @param {string} options.apiEndpoint - The API endpoint (default: `/api/${tableName}`)
     */
    constructor(options = {}) {
        this.options = Object.assign({
            tableName: '',
            title: '',
            columns: [],
            containerId: 'data-table-container',
            apiEndpoint: ''
        }, options);
        
        // Set default API endpoint if not provided
        if (!this.options.apiEndpoint && this.options.tableName) {
            this.options.apiEndpoint = `/api/${this.options.tableName.replace('_', '-')}`;
        }
        
        this.container = document.getElementById(this.options.containerId);
        this.dataTable = null;
        this.data = [];
        this.token = localStorage.getItem('claims_hive_token');
        
        if (!this.token) {
            console.error('No authentication token found');
            window.location.href = 'login.html';
            return;
        }
        
        this.init();
    }
    
    /**
     * Initialize the admin table
     */
    async init() {
        try {
            // Create container if it doesn't exist
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = this.options.containerId;
                document.querySelector('.content-area').appendChild(this.container);
            }
            
            // Add content header
            this.addContentHeader();
            
            // Fetch data
            await this.fetchData();
            
            // Initialize DataTable
            this.initDataTable();
            
            // Add event listeners
            this.setupEventListeners();
            
            // Send a test ping message to the WebSocket server after a short delay
            setTimeout(() => {
                if (this.dataTable && this.dataTable.options.websocket && this.dataTable.options.websocket.enabled) {
                    console.log('Sending test ping message to WebSocket server');
                    this.dataTable.sendMessage({ type: 'ping', timestamp: Date.now() });
                }
            }, 2000);
        } catch (error) {
            console.error('Error initializing admin table:', error);
            this.showError('Failed to initialize table. Please try again later.');
        }
    }
    
    /**
     * Add content header
     */
    addContentHeader() {
        // Remove any existing admin-table-header to prevent duplicates
        const existingHeader = document.querySelector('.admin-table-header');
        if (existingHeader) {
            existingHeader.remove();
        }
        
        const contentHeader = document.createElement('div');
        contentHeader.className = 'admin-table-header';
        contentHeader.innerHTML = `
            <div class="admin-table-actions">
                <button id="add-new-btn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> <span>Add New</span>
                </button>
                <button id="refresh-btn" class="btn btn-secondary">
                    <i class="fas fa-sync"></i> <span>Refresh</span>
                </button>
            </div>
        `;
        
        // Insert before the container
        this.container.parentNode.insertBefore(contentHeader, this.container);
        
        // Add event listeners
        contentHeader.querySelector('#add-new-btn').addEventListener('click', () => this.showAddEditModal());
        contentHeader.querySelector('#refresh-btn').addEventListener('click', () => this.refreshData());
    }
    
    /**
     * Fetch data from the API
     */
    async fetchData() {
        try {
            const response = await fetch(this.options.apiEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            this.data = Array.isArray(data) ? data : [];
            
            return this.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            this.showError('Failed to fetch data. Please try again later.');
            return [];
        }
    }
    
    /**
     * Initialize the DataTable component
     */
    initDataTable() {
        // Add action column if not already present
        const columns = [...this.options.columns];
        
        // Check if the last column is an actions column
        const hasActionsColumn = columns.length > 0 && 
                                columns[columns.length - 1].actions !== undefined;
        
        if (!hasActionsColumn) {
            columns.push({
                actions: [
                    {
                        icon: 'fas fa-edit',
                        title: 'Edit',
                        class: 'edit',
                        onClick: (rowData) => this.showAddEditModal(rowData)
                    },
                    {
                        icon: 'fas fa-trash',
                        title: 'Delete',
                        class: 'delete',
                        onClick: (rowData) => this.confirmDelete(rowData)
                    }
                ]
            });
        }
        
        // Initialize DataTable
        this.dataTable = new DataTable(`#${this.options.containerId}`, {
            columns: columns,
            data: this.data,
            pageSize: 10,
            sortColumn: columns[0].field,
            sortDirection: 'asc',
            onRowClick: (rowData) => this.showAddEditModal(rowData),
            websocket: {
                enabled: true,
                url: `ws://${window.location.host}/ws`,
                autoConnect: true
            }
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Event listeners are set up in addContentHeader()
    }
    
    /**
     * Show add/edit modal
     * @param {Object} rowData - The row data to edit (null for add)
     */
    showAddEditModal(rowData = null) {
        const isEdit = rowData !== null;
        const title = isEdit ? `Edit ${this.options.title}` : `Add New ${this.options.title}`;
        
        // Create form content
        const formContent = document.createElement('div');
        formContent.className = 'admin-form';
        
        let formHtml = '';
        
        // Add form fields based on columns
        this.options.columns.forEach(column => {
            // Skip action columns and non-editable fields
            if (column.actions || column.editable === false) {
                return;
            }
            
            const fieldName = column.field;
            const fieldValue = isEdit && rowData[fieldName] !== undefined ? rowData[fieldName] : '';
            const fieldType = this.getInputTypeForColumn(column);
            
            // Generate a unique ID for the field
            const uniqueId = `${fieldName}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            formHtml += `
                <div class="form-group">
                    <label for="${uniqueId}">${column.title}:</label>
                    ${this.getInputHtml(fieldName, fieldValue, fieldType, column, uniqueId)}
                </div>
            `;
        });
        
        formContent.innerHTML = formHtml;
        
        // Create modal
        const modal = new Modal({
            title: title,
            content: formContent,
            size: 'medium',
            confirmText: 'Save',
            cancelText: 'Cancel',
            onConfirm: () => this.saveData(isEdit, rowData)
        });
        
        modal.open();
    }
    
    /**
     * Get input type for column
     * @param {Object} column - The column definition
     * @returns {string} - The input type
     */
    getInputTypeForColumn(column) {
        switch (column.type) {
            case 'number':
                return 'number';
            case 'date':
                return 'date';
            case 'boolean':
                return 'checkbox';
            case 'select':
                return 'select';
            case 'textarea':
                return 'textarea';
            case 'password':
                return 'password';
            case 'email':
                return 'email';
            case 'tel':
                return 'tel';
            case 'url':
                return 'url';
            case 'color':
                return 'color';
            case 'file':
                return 'file';
            case 'hidden':
                return 'hidden';
            case 'json':
                return 'textarea';
            default:
                return 'text';
        }
    }
    
    /**
     * Get input HTML for field
     * @param {string} fieldName - The field name
     * @param {*} fieldValue - The field value
     * @param {string} fieldType - The field type
     * @param {Object} column - The column definition
     * @param {string} uniqueId - The unique ID for the field
     * @returns {string} - The input HTML
     */
    getInputHtml(fieldName, fieldValue, fieldType, column, uniqueId) {
        
        switch (fieldType) {
            case 'textarea':
                return `<textarea id="${uniqueId}" name="${fieldName}" class="form-control" rows="5" autocomplete="off">${fieldValue}</textarea>`;
            case 'select':
                if (!column.options || !Array.isArray(column.options)) {
                    return `<input type="text" id="${uniqueId}" name="${fieldName}" value="${fieldValue}" class="form-control" autocomplete="off">`;
                }
                
                let optionsHtml = '';
                column.options.forEach(option => {
                    const value = typeof option === 'object' ? option.value : option;
                    const text = typeof option === 'object' ? option.text : option;
                    const selected = value == fieldValue ? 'selected' : '';
                    optionsHtml += `<option value="${value}" ${selected}>${text}</option>`;
                });
                
                return `<select id="${uniqueId}" name="${fieldName}" class="form-control" autocomplete="off">${optionsHtml}</select>`;
            case 'checkbox':
                const checked = fieldValue ? 'checked' : '';
                return `<input type="checkbox" id="${uniqueId}" name="${fieldName}" ${checked} autocomplete="off">`;
            default:
                return `<input type="${fieldType}" id="${uniqueId}" name="${fieldName}" value="${fieldValue}" class="form-control" autocomplete="off">`;
        }
    }
    
    /**
     * Save data to the API
     * @param {boolean} isEdit - Whether this is an edit operation
     * @param {Object} originalData - The original row data (for edit)
     * @returns {boolean} - Whether the save was successful
     */
    async saveData(isEdit, originalData) {
        try {
            // Collect form data
            const formData = {};
            
            // Get all form fields by name attribute
            const formElements = document.querySelectorAll('.admin-form [name]');
            
            formElements.forEach(element => {
                const fieldName = element.getAttribute('name');
                
                // Find the column definition for this field
                const column = this.options.columns.find(col => col.field === fieldName);
                
                if (!column || column.editable === false) {
                    return;
                }
                
                // Get value based on input type
                let value;
                
                if (element.type === 'checkbox') {
                    value = element.checked;
                } else if (column.type === 'number') {
                    value = parseFloat(element.value);
                } else if (column.type === 'json') {
                    try {
                        value = JSON.parse(element.value);
                    } catch (e) {
                        this.showError(`Invalid JSON in field ${column.title}`);
                        return false;
                    }
                } else {
                    value = element.value;
                }
                
                formData[fieldName] = value;
            });
            
            // Add ID for edit operations
            if (isEdit && originalData.id) {
                formData.id = originalData.id;
            }
            
            // Determine API endpoint and method
            let url = this.options.apiEndpoint;
            let method = 'POST';
            
            if (isEdit) {
                // Get the ID field name (usually 'id' or '{tableName}_id')
                const idField = this.getIdFieldName();
                const id = originalData[idField];
                
                if (id) {
                    url = `${url}/${id}`;
                    method = 'PUT';
                }
            }
            
            // Send request
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to save data: ${response.status} ${response.statusText}`);
            }
            
            // Get the response data
            const responseData = await response.json();
            
            // Refresh data
            await this.refreshData();
            
            // If the dataTable has a WebSocket connection, send a message to update other clients
            if (this.dataTable && this.dataTable.options.websocket && this.dataTable.options.websocket.enabled) {
                try {
                    const updateMessage = {
                        type: isEdit ? 'update' : 'add',
                        data: responseData
                    };
                    
                    // Also update the local data table directly
                    console.log('Applying update locally:', updateMessage);
                    if (isEdit) {
                        const idField = this.getIdFieldName();
                        const id = responseData[idField];
                        this.dataTable.updateRow(id, responseData, idField);
                    } else {
                        this.dataTable.addRow(responseData);
                    }
                    
                    // Send the message to other clients
                    this.dataTable.sendMessage(updateMessage);
                } catch (wsError) {
                    console.warn('WebSocket message not sent:', wsError);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            this.showError('Failed to save data. Please try again later.');
            return false;
        }
    }
    
    /**
     * Get ID field name
     * @returns {string} - The ID field name
     */
    getIdFieldName() {
        // Check if there's a column with field 'id'
        const idColumn = this.options.columns.find(column => column.field === 'id');
        
        if (idColumn) {
            return 'id';
        }
        
        // Check if there's a column with field '{tableName}_id'
        const tableIdField = `${this.options.tableName}_id`;
        const tableIdColumn = this.options.columns.find(column => column.field === tableIdField);
        
        if (tableIdColumn) {
            return tableIdField;
        }
        
        // Default to 'id'
        return 'id';
    }
    
    /**
     * Confirm delete
     * @param {Object} rowData - The row data to delete
     */
    confirmDelete(rowData) {
        Modal.confirm(
            `Are you sure you want to delete this ${this.options.title.toLowerCase()}?`,
            'Confirm Delete',
            () => this.deleteData(rowData),
            () => {}
        );
    }
    
    /**
     * Delete data from the API
     * @param {Object} rowData - The row data to delete
     * @returns {boolean} - Whether the delete was successful
     */
    async deleteData(rowData) {
        try {
            // Get the ID field name
            const idField = this.getIdFieldName();
            const id = rowData[idField];
            
            if (!id) {
                throw new Error('No ID found for delete operation');
            }
            
            // Send request
            const response = await fetch(`${this.options.apiEndpoint}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to delete data: ${response.status} ${response.statusText}`);
            }
            
            // Refresh data
            await this.refreshData();
            
            // If the dataTable has a WebSocket connection, send a message to update other clients
            if (this.dataTable && this.dataTable.options.websocket && this.dataTable.options.websocket.enabled) {
                try {
                    const deleteMessage = {
                        type: 'delete',
                        id: id
                    };
                    this.dataTable.sendMessage(deleteMessage);
                } catch (wsError) {
                    console.warn('WebSocket message not sent:', wsError);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting data:', error);
            this.showError('Failed to delete data. Please try again later.');
            return false;
        }
    }
    
    /**
     * Refresh data
     */
    async refreshData() {
        try {
            // Show loading state
            if (this.dataTable) {
                this.dataTable.options.loading = true;
                this.dataTable.render();
            }
            
            // Fetch data
            await this.fetchData();
            
            // Update DataTable
            if (this.dataTable) {
                this.dataTable.options.data = this.data;
                this.dataTable.options.loading = false;
                this.dataTable.render();
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showError('Failed to refresh data. Please try again later.');
        }
    }
    
    /**
     * Show error message
     * @param {string} message - The error message
     */
    showError(message) {
        Modal.alert(message, 'Error');
    }
}
