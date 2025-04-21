/**
 * Modal Component for Claims Hive
 * A reusable modal dialog component
 * 
 * @module Modal
 * @author Claims Hive Team
 * @version 1.0.0
 */

export default class Modal {
    /**
     * Create a new Modal instance
     * @param {Object} options - Configuration options
     * @param {string} options.id - The ID for the modal (optional, will be auto-generated if not provided)
     * @param {string} options.title - The title for the modal
     * @param {string|HTMLElement} options.content - The content for the modal (HTML string or DOM element)
     * @param {boolean} options.closable - Whether the modal can be closed by the user (default: true)
     * @param {boolean} options.backdrop - Whether to show a backdrop behind the modal (default: true)
     * @param {boolean} options.backdropClosable - Whether clicking the backdrop closes the modal (default: true)
     * @param {boolean} options.escClosable - Whether pressing the ESC key closes the modal (default: true)
     * @param {string} options.size - The size of the modal: 'small', 'medium', 'large', 'fullscreen' (default: 'medium')
     * @param {string} options.position - The position of the modal: 'center', 'top', 'right', 'bottom', 'left' (default: 'center')
     * @param {boolean} options.animate - Whether to animate the modal (default: true)
     * @param {string} options.animationType - The type of animation: 'fade', 'slide', 'zoom' (default: 'fade')
     * @param {Function} options.onOpen - Callback function when the modal is opened
     * @param {Function} options.onClose - Callback function when the modal is closed
     * @param {Function} options.onConfirm - Callback function when the confirm button is clicked
     * @param {Function} options.onCancel - Callback function when the cancel button is clicked
     * @param {boolean} options.showFooter - Whether to show the footer with buttons (default: true)
     * @param {string} options.confirmText - The text for the confirm button (default: 'Confirm')
     * @param {string} options.cancelText - The text for the cancel button (default: 'Cancel')
     * @param {boolean} options.showConfirmButton - Whether to show the confirm button (default: true)
     * @param {boolean} options.showCancelButton - Whether to show the cancel button (default: true)
     * @param {string} options.confirmButtonClass - Additional CSS class for the confirm button
     * @param {string} options.cancelButtonClass - Additional CSS class for the cancel button
     * @param {boolean} options.draggable - Whether the modal can be dragged (default: false)
     * @param {boolean} options.resizable - Whether the modal can be resized (default: false)
     */
    constructor(options = {}) {
        // Default options
        this.options = Object.assign({
            id: `modal-${Date.now()}`,
            title: 'Modal Title',
            content: '',
            closable: true,
            backdrop: true,
            backdropClosable: true,
            escClosable: true,
            size: 'medium',
            position: 'center',
            animate: true,
            animationType: 'fade',
            onOpen: null,
            onClose: null,
            onConfirm: null,
            onCancel: null,
            showFooter: true,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonClass: 'btn-primary',
            cancelButtonClass: 'btn-secondary',
            draggable: false,
            resizable: false
        }, options);
        
        // Create modal elements
        this.createModalElements();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Add to document body
        document.body.appendChild(this.modalElement);
    }
    
    /**
     * Create the modal elements
     */
    createModalElements() {
        // Create modal container
        this.modalElement = document.createElement('div');
        this.modalElement.id = this.options.id;
        this.modalElement.className = `modal ${this.options.animate ? `modal-animate modal-${this.options.animationType}` : ''}`;
        this.modalElement.setAttribute('role', 'dialog');
        this.modalElement.setAttribute('aria-modal', 'true');
        this.modalElement.setAttribute('aria-labelledby', `${this.options.id}-title`);
        this.modalElement.setAttribute('inert', '');
        
        // Create backdrop
        if (this.options.backdrop) {
            this.backdropElement = document.createElement('div');
            this.backdropElement.className = 'modal-backdrop';
            this.modalElement.appendChild(this.backdropElement);
        }
        
        // Create modal dialog
        this.dialogElement = document.createElement('div');
        this.dialogElement.className = `modal-dialog modal-${this.options.size} modal-position-${this.options.position}`;
        if (this.options.draggable) this.dialogElement.classList.add('modal-draggable');
        if (this.options.resizable) this.dialogElement.classList.add('modal-resizable');
        this.modalElement.appendChild(this.dialogElement);
        
        // Create modal content
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'modal-content';
        this.dialogElement.appendChild(this.contentContainer);
        
        // Create modal header
        this.headerElement = document.createElement('div');
        this.headerElement.className = 'modal-header';
        this.contentContainer.appendChild(this.headerElement);
        
        // Create modal title
        this.titleElement = document.createElement('h2');
        this.titleElement.id = `${this.options.id}-title`;
        this.titleElement.className = 'modal-title';
        this.titleElement.textContent = this.options.title;
        this.headerElement.appendChild(this.titleElement);
        
        // Create close button
        if (this.options.closable) {
            this.closeButton = document.createElement('button');
            this.closeButton.type = 'button';
            this.closeButton.className = 'modal-close';
            this.closeButton.setAttribute('aria-label', 'Close');
            this.closeButton.innerHTML = '&times;';
            this.headerElement.appendChild(this.closeButton);
        }
        
        // Create modal body
        this.bodyElement = document.createElement('div');
        this.bodyElement.className = 'modal-body';
        this.contentContainer.appendChild(this.bodyElement);
        
        // Set content
        if (typeof this.options.content === 'string') {
            this.bodyElement.innerHTML = this.options.content;
        } else if (this.options.content instanceof HTMLElement) {
            this.bodyElement.appendChild(this.options.content);
        }
        
        // Create modal footer
        if (this.options.showFooter) {
            this.footerElement = document.createElement('div');
            this.footerElement.className = 'modal-footer';
            this.contentContainer.appendChild(this.footerElement);
            
            // Create buttons
            if (this.options.showCancelButton) {
                this.cancelButton = document.createElement('button');
                this.cancelButton.type = 'button';
                this.cancelButton.className = `btn ${this.options.cancelButtonClass}`;
                this.cancelButton.textContent = this.options.cancelText;
                this.footerElement.appendChild(this.cancelButton);
            }
            
            if (this.options.showConfirmButton) {
                this.confirmButton = document.createElement('button');
                this.confirmButton.type = 'button';
                this.confirmButton.className = `btn ${this.options.confirmButtonClass}`;
                this.confirmButton.textContent = this.options.confirmText;
                this.footerElement.appendChild(this.confirmButton);
            }
        }
        
        // Add resize handles if resizable
        if (this.options.resizable) {
            const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'right', 'bottom', 'left'];
            handles.forEach(position => {
                const handle = document.createElement('div');
                handle.className = `modal-resize-handle modal-resize-${position}`;
                this.dialogElement.appendChild(handle);
            });
        }
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Close button click
        if (this.options.closable && this.closeButton) {
            this.closeButton.addEventListener('click', () => this.close());
        }
        
        // Backdrop click
        if (this.options.backdrop && this.options.backdropClosable) {
            this.backdropElement.addEventListener('click', () => this.close());
        }
        
        // ESC key press
        if (this.options.escClosable) {
            this.escHandler = (event) => {
                if (event.key === 'Escape') this.close();
            };
        }
        
        // Confirm button click
        if (this.options.showFooter && this.options.showConfirmButton) {
            this.confirmButton.addEventListener('click', () => {
                if (typeof this.options.onConfirm === 'function') {
                    this.options.onConfirm();
                }
                this.close();
            });
        }
        
        // Cancel button click
        if (this.options.showFooter && this.options.showCancelButton) {
            this.cancelButton.addEventListener('click', () => {
                if (typeof this.options.onCancel === 'function') {
                    this.options.onCancel();
                }
                this.close();
            });
        }
        
        // Draggable functionality
        if (this.options.draggable) {
            this.initDraggable();
        }
        
        // Resizable functionality
        if (this.options.resizable) {
            this.initResizable();
        }
    }
    
    /**
     * Initialize draggable functionality
     */
    initDraggable() {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        this.headerElement.style.cursor = 'move';
        
        this.headerElement.addEventListener('mousedown', (event) => {
            // Only handle left mouse button
            if (event.button !== 0) return;
            
            isDragging = true;
            startX = event.clientX;
            startY = event.clientY;
            
            const rect = this.dialogElement.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            
            // Prevent text selection during drag
            event.preventDefault();
        });
        
        document.addEventListener('mousemove', (event) => {
            if (!isDragging) return;
            
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;
            
            this.dialogElement.style.left = `${startLeft + deltaX}px`;
            this.dialogElement.style.top = `${startTop + deltaY}px`;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    
    /**
     * Initialize resizable functionality
     */
    initResizable() {
        const handles = this.dialogElement.querySelectorAll('.modal-resize-handle');
        
        handles.forEach(handle => {
            let isResizing = false;
            let startX, startY, startWidth, startHeight, startLeft, startTop;
            const position = handle.className.replace('modal-resize-handle modal-resize-', '');
            
            handle.addEventListener('mousedown', (event) => {
                // Only handle left mouse button
                if (event.button !== 0) return;
                
                isResizing = true;
                startX = event.clientX;
                startY = event.clientY;
                
                const rect = this.dialogElement.getBoundingClientRect();
                startWidth = rect.width;
                startHeight = rect.height;
                startLeft = rect.left;
                startTop = rect.top;
                
                // Prevent text selection during resize
                event.preventDefault();
            });
            
            document.addEventListener('mousemove', (event) => {
                if (!isResizing) return;
                
                const deltaX = event.clientX - startX;
                const deltaY = event.clientY - startY;
                
                // Resize based on handle position
                switch (position) {
                    case 'top-left':
                        this.dialogElement.style.width = `${startWidth - deltaX}px`;
                        this.dialogElement.style.height = `${startHeight - deltaY}px`;
                        this.dialogElement.style.left = `${startLeft + deltaX}px`;
                        this.dialogElement.style.top = `${startTop + deltaY}px`;
                        break;
                    case 'top-right':
                        this.dialogElement.style.width = `${startWidth + deltaX}px`;
                        this.dialogElement.style.height = `${startHeight - deltaY}px`;
                        this.dialogElement.style.top = `${startTop + deltaY}px`;
                        break;
                    case 'bottom-left':
                        this.dialogElement.style.width = `${startWidth - deltaX}px`;
                        this.dialogElement.style.height = `${startHeight + deltaY}px`;
                        this.dialogElement.style.left = `${startLeft + deltaX}px`;
                        break;
                    case 'bottom-right':
                        this.dialogElement.style.width = `${startWidth + deltaX}px`;
                        this.dialogElement.style.height = `${startHeight + deltaY}px`;
                        break;
                    case 'top':
                        this.dialogElement.style.height = `${startHeight - deltaY}px`;
                        this.dialogElement.style.top = `${startTop + deltaY}px`;
                        break;
                    case 'right':
                        this.dialogElement.style.width = `${startWidth + deltaX}px`;
                        break;
                    case 'bottom':
                        this.dialogElement.style.height = `${startHeight + deltaY}px`;
                        break;
                    case 'left':
                        this.dialogElement.style.width = `${startWidth - deltaX}px`;
                        this.dialogElement.style.left = `${startLeft + deltaX}px`;
                        break;
                }
            });
            
            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
        });
    }
    
    /**
     * Open the modal
     */
    open() {
        // Add modal-open class to body to prevent scrolling
        document.body.classList.add('modal-open');
        
        // Show modal
        this.modalElement.classList.add('modal-show');
        this.modalElement.removeAttribute('inert');
        
        // Add ESC key event listener
        if (this.options.escClosable) {
            document.addEventListener('keydown', this.escHandler);
        }
        
        // Focus the modal for accessibility
        this.dialogElement.focus();
        
        // Call onOpen callback
        if (typeof this.options.onOpen === 'function') {
            this.options.onOpen();
        }
        
        return this;
    }
    
    /**
     * Close the modal
     */
    close() {
        // Remove modal-open class from body
        document.body.classList.remove('modal-open');
        
        // Hide modal
        this.modalElement.classList.remove('modal-show');
        this.modalElement.setAttribute('inert', '');
        
        // Remove ESC key event listener
        if (this.options.escClosable) {
            document.removeEventListener('keydown', this.escHandler);
        }
        
        // Call onClose callback
        if (typeof this.options.onClose === 'function') {
            this.options.onClose();
        }
        
        return this;
    }
    
    /**
     * Update the modal title
     * @param {string} title - The new title
     */
    setTitle(title) {
        this.options.title = title;
        this.titleElement.textContent = title;
        return this;
    }
    
    /**
     * Update the modal content
     * @param {string|HTMLElement} content - The new content
     */
    setContent(content) {
        this.options.content = content;
        
        // Clear existing content
        this.bodyElement.innerHTML = '';
        
        // Set new content
        if (typeof content === 'string') {
            this.bodyElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.bodyElement.appendChild(content);
        }
        
        return this;
    }
    
    /**
     * Update the confirm button text
     * @param {string} text - The new text
     */
    setConfirmText(text) {
        if (this.options.showFooter && this.options.showConfirmButton) {
            this.options.confirmText = text;
            this.confirmButton.textContent = text;
        }
        return this;
    }
    
    /**
     * Update the cancel button text
     * @param {string} text - The new text
     */
    setCancelText(text) {
        if (this.options.showFooter && this.options.showCancelButton) {
            this.options.cancelText = text;
            this.cancelButton.textContent = text;
        }
        return this;
    }
    
    /**
     * Update the modal size
     * @param {string} size - The new size: 'small', 'medium', 'large', 'fullscreen'
     */
    setSize(size) {
        // Remove existing size class
        this.dialogElement.classList.remove(`modal-${this.options.size}`);
        
        // Update size
        this.options.size = size;
        this.dialogElement.classList.add(`modal-${size}`);
        
        return this;
    }
    
    /**
     * Update the modal position
     * @param {string} position - The new position: 'center', 'top', 'right', 'bottom', 'left'
     */
    setPosition(position) {
        // Remove existing position class
        this.dialogElement.classList.remove(`modal-position-${this.options.position}`);
        
        // Update position
        this.options.position = position;
        this.dialogElement.classList.add(`modal-position-${position}`);
        
        return this;
    }
    
    /**
     * Destroy the modal and remove it from the DOM
     */
    destroy() {
        // Remove event listeners
        if (this.options.escClosable) {
            document.removeEventListener('keydown', this.escHandler);
        }
        
        // Remove modal from DOM
        if (this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
        }
    }
    
    /**
     * Create a static alert modal
     * @param {string} message - The message to display
     * @param {string} title - The title for the modal (optional)
     * @param {Function} callback - Callback function when the modal is closed (optional)
     * @returns {Modal} - The modal instance
     */
    static alert(message, title = 'Alert', callback = null) {
        const modal = new Modal({
            title: title,
            content: `<p>${message}</p>`,
            showCancelButton: false,
            confirmText: 'OK',
            onClose: callback
        });
        
        modal.open();
        return modal;
    }
    
    /**
     * Create a static confirm modal
     * @param {string} message - The message to display
     * @param {string} title - The title for the modal (optional)
     * @param {Function} onConfirm - Callback function when confirmed (optional)
     * @param {Function} onCancel - Callback function when canceled (optional)
     * @returns {Modal} - The modal instance
     */
    static confirm(message, title = 'Confirm', onConfirm = null, onCancel = null) {
        const modal = new Modal({
            title: title,
            content: `<p>${message}</p>`,
            confirmText: 'Yes',
            cancelText: 'No',
            onConfirm: onConfirm,
            onCancel: onCancel
        });
        
        modal.open();
        return modal;
    }
    
    /**
     * Create a static prompt modal
     * @param {string} message - The message to display
     * @param {string} defaultValue - The default value for the input (optional)
     * @param {string} title - The title for the modal (optional)
     * @param {Function} onConfirm - Callback function when confirmed (optional)
     * @param {Function} onCancel - Callback function when canceled (optional)
     * @returns {Modal} - The modal instance
     */
    static prompt(message, defaultValue = '', title = 'Prompt', onConfirm = null, onCancel = null) {
        const content = document.createElement('div');
        content.innerHTML = `
            <p>${message}</p>
            <input type="text" class="modal-prompt-input" value="${defaultValue}" autocomplete="off">
        `;
        
        const modal = new Modal({
            title: title,
            content: content,
            confirmText: 'OK',
            cancelText: 'Cancel',
            onConfirm: () => {
                const input = content.querySelector('.modal-prompt-input');
                if (typeof onConfirm === 'function') {
                    onConfirm(input.value);
                }
            },
            onCancel: onCancel
        });
        
        modal.open();
        
        // Focus the input
        setTimeout(() => {
            const input = content.querySelector('.modal-prompt-input');
            input.focus();
            input.select();
        }, 100);
        
        return modal;
    }
}
