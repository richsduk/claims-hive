# Charts Component

A reusable charts component for data visualization in the Claims Hive project.

## Features

- Support for multiple chart types: bar, line, pie, doughnut, radar, polarArea
- Responsive design that adapts to different screen sizes
- Real-time updates via WebSocket
- Customizable colors and styling
- Interactive elements with click events
- Loading state indicator
- Automatic Chart.js loading from CDN

## Usage

### Basic Usage

```html
<!-- Include the CSS -->
<link rel="stylesheet" href="path/to/charts.css">

<!-- Create a container for the chart -->
<div id="my-chart"></div>

<!-- Import and initialize the chart -->
<script type="module">
    import Charts from './path/to/Charts.js';
    
    // Create a new chart
    const chart = new Charts('#my-chart', {
        type: 'bar',
        data: {
            labels: ['Label 1', 'Label 2', 'Label 3'],
            datasets: [{
                label: 'Dataset 1',
                data: [10, 20, 30]
            }]
        }
    });
</script>
```

### Configuration Options

The Charts component accepts the following options:

```javascript
{
    // Chart type: 'bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'
    type: 'bar',
    
    // Chart data
    data: {
        labels: [], // Array of labels
        datasets: [] // Array of datasets
    },
    
    // Chart.js options
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
    
    // Color scheme
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
    
    // Click event handler
    onClick: function(data) {
        console.log('Chart clicked:', data);
    },
    
    // WebSocket configuration for real-time updates
    websocket: {
        enabled: false,
        url: null,
        autoReconnect: true,
        reconnectInterval: 5000
    }
}
```

### Methods

The Charts component provides the following methods:

#### updateChart(data)

Updates the chart with new data.

```javascript
chart.updateChart({
    labels: ['New Label 1', 'New Label 2', 'New Label 3'],
    datasets: [{
        label: 'New Dataset',
        data: [15, 25, 35]
    }]
});
```

#### updateDataset(index, data)

Updates a specific dataset.

```javascript
chart.updateDataset(0, [15, 25, 35]);
```

#### addDataset(dataset)

Adds a new dataset to the chart.

```javascript
chart.addDataset({
    label: 'New Dataset',
    data: [15, 25, 35]
});
```

#### removeDataset(index)

Removes a dataset from the chart.

```javascript
chart.removeDataset(0);
```

#### destroy()

Destroys the chart and cleans up.

```javascript
chart.destroy();
```

### WebSocket Integration

The Charts component can be connected to a WebSocket server for real-time updates:

```javascript
const chart = new Charts('#my-chart', {
    type: 'bar',
    data: {
        labels: ['Label 1', 'Label 2', 'Label 3'],
        datasets: [{
            label: 'Dataset 1',
            data: [10, 20, 30]
        }]
    },
    websocket: {
        enabled: true,
        url: 'wss://example.com/ws',
        autoReconnect: true,
        reconnectInterval: 5000
    }
});
```

The WebSocket server should send messages in the following format:

```json
{
    "labels": ["Label 1", "Label 2", "Label 3"],
    "datasets": [
        {
            "label": "Dataset 1",
            "data": [10, 20, 30]
        }
    ]
}
```

## Examples

### Bar Chart

```javascript
const barChart = new Charts('#bar-chart', {
    type: 'bar',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
            label: 'Sales',
            data: [12, 19, 3, 5, 2, 3]
        }]
    }
});
```

### Line Chart

```javascript
const lineChart = new Charts('#line-chart', {
    type: 'line',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
            label: 'Sales',
            data: [12, 19, 3, 5, 2, 3],
            fill: false,
            tension: 0.1
        }]
    }
});
```

### Pie Chart

```javascript
const pieChart = new Charts('#pie-chart', {
    type: 'pie',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            data: [12, 19, 3, 5, 2, 3]
        }]
    }
});
```

### Multiple Datasets

```javascript
const multiChart = new Charts('#multi-chart', {
    type: 'bar',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Sales 2023',
                data: [12, 19, 3, 5, 2, 3]
            },
            {
                label: 'Sales 2024',
                data: [15, 12, 8, 9, 7, 10]
            }
        ]
    }
});
```

## Browser Support

The Charts component works in all modern browsers that support ES6 modules and the Canvas API:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- [Chart.js](https://www.chartjs.org/) (loaded automatically from CDN)

## License

This component is part of the Claims Hive project and is covered by its license.
