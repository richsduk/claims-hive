/**
 * Data Formatter Utility for DataTable Component
 * Provides formatting functions for different data types
 */

const DataFormatter = {
    /**
     * Format a text value
     * @param {string} value - The text to format
     * @param {Object} options - Formatting options
     * @param {number} options.maxLength - Maximum length before truncating
     * @param {boolean} options.lowercase - Convert to lowercase
     * @param {boolean} options.uppercase - Convert to uppercase
     * @param {boolean} options.capitalize - Capitalize first letter
     * @returns {string} Formatted text
     */
    formatText: function(value, options = {}) {
        if (value === null || value === undefined) {
            return '';
        }
        
        let text = String(value);
        
        if (options.maxLength && text.length > options.maxLength) {
            text = text.substring(0, options.maxLength) + '...';
        }
        
        if (options.lowercase) {
            text = text.toLowerCase();
        } else if (options.uppercase) {
            text = text.toUpperCase();
        } else if (options.capitalize) {
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }
        
        return text;
    },
    
    /**
     * Format a number value
     * @param {number} value - The number to format
     * @param {Object} options - Formatting options
     * @param {string} options.style - Formatting style ('decimal', 'currency', 'percent')
     * @param {string} options.currency - Currency code (e.g., 'USD', 'EUR')
     * @param {number} options.minimumFractionDigits - Minimum fraction digits
     * @param {number} options.maximumFractionDigits - Maximum fraction digits
     * @returns {string} Formatted number
     */
    formatNumber: function(value, options = {}) {
        if (value === null || value === undefined) {
            return '';
        }
        
        const defaultOptions = {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            return new Intl.NumberFormat('en-US', formatOptions).format(value);
        } catch (error) {
            console.error('Error formatting number:', error);
            return String(value);
        }
    },
    
    /**
     * Format a date value
     * @param {string|Date} value - The date to format
     * @param {Object} options - Formatting options
     * @param {string} options.format - Date format ('short', 'medium', 'long', 'full', 'custom')
     * @param {string} options.customFormat - Custom date format pattern
     * @returns {string} Formatted date
     */
    formatDate: function(value, options = {}) {
        if (!value) {
            return '';
        }
        
        let date;
        try {
            date = value instanceof Date ? value : new Date(value);
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
        } catch (error) {
            console.error('Error parsing date:', error);
            return 'Invalid Date';
        }
        
        const defaultOptions = {
            format: 'medium'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        if (formatOptions.format === 'custom' && formatOptions.customFormat) {
            // Simple custom date formatting implementation
            return this.formatDateCustom(date, formatOptions.customFormat);
        }
        
        // Use Intl.DateTimeFormat for standard formats
        const dateTimeFormatOptions = {};
        
        switch (formatOptions.format) {
            case 'short':
                dateTimeFormatOptions.dateStyle = 'short';
                break;
            case 'medium':
                dateTimeFormatOptions.dateStyle = 'medium';
                break;
            case 'long':
                dateTimeFormatOptions.dateStyle = 'long';
                break;
            case 'full':
                dateTimeFormatOptions.dateStyle = 'full';
                break;
            default:
                dateTimeFormatOptions.dateStyle = 'medium';
        }
        
        try {
            return new Intl.DateTimeFormat('en-US', dateTimeFormatOptions).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return date.toDateString();
        }
    },
    
    /**
     * Format a date with a custom format string
     * @param {Date} date - The date to format
     * @param {string} format - Format string (e.g., 'YYYY-MM-DD')
     * @returns {string} Formatted date
     */
    formatDateCustom: function(date, format) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        
        // Add leading zeros
        const pad = (num) => String(num).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('YY', String(year).slice(-2))
            .replace('MM', pad(month))
            .replace('M', month)
            .replace('DD', pad(day))
            .replace('D', day)
            .replace('HH', pad(hours))
            .replace('H', hours)
            .replace('hh', pad(hours > 12 ? hours - 12 : hours === 0 ? 12 : hours))
            .replace('h', hours > 12 ? hours - 12 : hours === 0 ? 12 : hours)
            .replace('mm', pad(minutes))
            .replace('m', minutes)
            .replace('ss', pad(seconds))
            .replace('s', seconds)
            .replace('a', hours >= 12 ? 'pm' : 'am')
            .replace('A', hours >= 12 ? 'PM' : 'AM');
    },
    
    /**
     * Format a status value
     * @param {string} value - The status value
     * @param {Object} options - Formatting options
     * @param {Object} options.statusMap - Map of status values to display text
     * @param {Object} options.classMap - Map of status values to CSS classes
     * @returns {Object} Formatted status with text and class
     */
    formatStatus: function(value, options = {}) {
        if (value === null || value === undefined) {
            return { text: '', class: '' };
        }
        
        const statusValue = String(value).toLowerCase();
        
        const defaultStatusMap = {
            'new': 'New',
            'assigned': 'Assigned',
            'accepted': 'Accepted',
            'rejected': 'Rejected',
            'settled': 'Settled',
            'pending': 'Pending',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        
        const defaultClassMap = {
            'new': 'status-new',
            'assigned': 'status-assigned',
            'accepted': 'status-accepted',
            'rejected': 'status-rejected',
            'settled': 'status-settled',
            'pending': 'status-new',
            'completed': 'status-accepted',
            'cancelled': 'status-rejected'
        };
        
        const statusMap = options.statusMap || defaultStatusMap;
        const classMap = options.classMap || defaultClassMap;
        
        return {
            text: statusMap[statusValue] || value,
            class: classMap[statusValue] || ''
        };
    },
    
    /**
     * Format a boolean value
     * @param {boolean} value - The boolean value
     * @param {Object} options - Formatting options
     * @param {string} options.trueText - Text to display for true values
     * @param {string} options.falseText - Text to display for false values
     * @returns {string} Formatted boolean
     */
    formatBoolean: function(value, options = {}) {
        const defaultOptions = {
            trueText: 'Yes',
            falseText: 'No'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        if (value === null || value === undefined) {
            return '';
        }
        
        return value ? formatOptions.trueText : formatOptions.falseText;
    },
    
    /**
     * Format a value based on its type
     * @param {*} value - The value to format
     * @param {string} type - The data type ('text', 'number', 'date', 'status', 'boolean')
     * @param {Object} options - Formatting options specific to the type
     * @returns {*} Formatted value
     */
    format: function(value, type, options = {}) {
        switch (type) {
            case 'number':
            case 'currency':
            case 'percent':
                const numberOptions = type === 'text' ? options : { ...options, style: type };
                return this.formatNumber(value, numberOptions);
            case 'date':
            case 'datetime':
            case 'time':
                return this.formatDate(value, options);
            case 'status':
                return this.formatStatus(value, options);
            case 'boolean':
                return this.formatBoolean(value, options);
            case 'text':
            default:
                return this.formatText(value, options);
        }
    }
};

// Export the DataFormatter object
export default DataFormatter;
