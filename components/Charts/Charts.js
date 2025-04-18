/**
 * Charts Component for Claims Hive
 * A reusable charts component that can be used to display various types of charts
 * 
 * @module Charts
 * @author Claims Hive Team
 * @version 1.0.0
 */

export default class Charts {
    /**
     * Create a new Charts instance
     * @param {string|HTMLElement} container - The container element or selector
     * @param {Object} options - Configuration options
     * @param {string} options.type - Chart type: 'bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'
     * @param {Object} options.data - The data to display in the chart
     * @param {Object} options.options - Chart.js options
     * @param {boolean} options.responsive - Whether the chart should be responsive
     * @param {Object} options.colors - Color scheme for the chart
     * @param {Function} options.onClick - Callback function when a chart element is clicked
     * @param {Object} options.websocket - WebSocket configuration for real-time updates
     */
    constructor(container, options = {}) {
        // Store the container
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            throw new Error(`Container not found: ${container}`);
        }
        
        // Default options
        this.options = Object.assign({
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                }
            },
            colors: {
                primary: '#4e73df',
                success: '#1cc88a',
                info: '#36b9cc',
                warning: '#f6c23e',
                danger: '#e74a3b',
                secondary: '#858796',
                light: '#f8f9fc',
                dark: '#5a5c69'
            },
            onClick: null,
            websocket: {
                enabled: false,
                url: null,
                autoReconnect: true,
                reconnectInterval: 5000
            }
        }, options);
        
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        
        // Load Chart.js from CDN if not already loaded
        this.loadChartJs().then(() => {
            this.initChart();
            this.setupEventListeners();
            this.connectWebSocket();
        });
    }
    
    /**
     * Load Chart.js from CDN if not already loaded
     * @returns {Promise} - Resolves when Chart.js is loaded
     */
    loadChartJs() {
        return new Promise((resolve, reject) => {
            if (window.Chart) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Initialize the chart
     */
    initChart() {
        // Apply color scheme to datasets if not specified
        if (this.options.data.datasets) {
            const colorKeys = Object.keys(this.options.colors);
            
            this.options.data.datasets.forEach((dataset, index) => {
                const colorKey = colorKeys[index % colorKeys.length];
                const color = this.options.colors[colorKey];
                
                if (!dataset.backgroundColor) {
                    if (['pie', 'doughnut', 'polarArea'].includes(this.options.type)) {
                        // For pie/doughnut charts, use an array of colors
                        dataset.backgroundColor = colorKeys.map(key => this.options.colors[key]);
                    } else {
                        dataset.backgroundColor = this.hexToRgba(color, 0.2);
                    }
                }
                
                if (!dataset.borderColor && !['pie', 'doughnut', 'polarArea'].includes(this.options.type)) {
                    dataset.borderColor = color;
                }
            });
        }
        
        // Create the chart
        this.chart = new Chart(this.canvas, {
            type: this.options.type,
            data: this.options.data,
            options: this.options.options
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (typeof this.options.onClick === 'function') {
            this.canvas.addEventListener('click', (event) => {
                const activePoints = this.chart.getElementsAtEventForMode(
                    event, 
                    'nearest', 
                    { intersect: true }, 
                    false
                );
                
                if (activePoints.length > 0) {
                    const firstPoint = activePoints[0];
                    const label = this.chart.data.labels[firstPoint.index];
                    const value = this.chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                    
                    this.options.onClick({
                        label,
                        value,
                        datasetIndex: firstPoint.datasetIndex,
                        index: firstPoint.index
                    });
                }
            });
        }
    }
    
    /**
     * Connect to WebSocket for real-time updates
     */
    connectWebSocket() {
        if (!this.options.websocket.enabled || !this.options.websocket.url) {
            return;
        }
        
        this.ws = new WebSocket(this.options.websocket.url);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.updateChart(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            
            if (this.options.websocket.autoReconnect) {
                setTimeout(() => {
                    this.connectWebSocket();
                }, this.options.websocket.reconnectInterval);
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    /**
     * Update the chart with new data
     * @param {Object} data - The new data
     */
    updateChart(data) {
        if (data.labels) {
            this.chart.data.labels = data.labels;
        }
        
        if (data.datasets) {
            this.chart.data.datasets = data.datasets;
        }
        
        this.chart.update();
    }
    
    /**
     * Update a specific dataset
     * @param {number} index - The dataset index
     * @param {Array} data - The new data
     */
    updateDataset(index, data) {
        if (index >= 0 && index < this.chart.data.datasets.length) {
            this.chart.data.datasets[index].data = data;
            this.chart.update();
        }
    }
    
    /**
     * Add a new dataset
     * @param {Object} dataset - The dataset to add
     */
    addDataset(dataset) {
        this.chart.data.datasets.push(dataset);
        this.chart.update();
    }
    
    /**
     * Remove a dataset
     * @param {number} index - The dataset index
     */
    removeDataset(index) {
        if (index >= 0 && index < this.chart.data.datasets.length) {
            this.chart.data.datasets.splice(index, 1);
            this.chart.update();
        }
    }
    
    /**
     * Convert hex color to rgba
     * @param {string} hex - Hex color code
     * @param {number} alpha - Alpha value
     * @returns {string} - RGBA color string
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    /**
     * Destroy the chart and clean up
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
        }
        
        if (this.ws) {
            this.ws.close();
        }
        
        this.container.innerHTML = '';
    }
}
