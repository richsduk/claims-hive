# DataTable Component

A reusable, responsive data table component with card view for mobile devices. This component provides a flexible way to display tabular data with support for various data types, sorting, pagination, and real-time updates via WebSockets.

## Features

- Responsive design with table view on desktop and card view on mobile
- Support for various data types (text, numbers, dates, status indicators)
- Sorting and pagination
- Row selection
- Action buttons
- Row highlighting on mouseover and click
- WebSocket integration for real-time updates
- Customizable formatting for different data types
- Loading and empty states

## Installation

1. Copy the following files to your project:
   - `dataTable.css` - Styles for the component
   - `dataFormatter.js` - Utility for formatting different data types
   - `DataTable.js` - Main component class

2. Import the component in your JavaScript file:

```javascript
import DataTable from './path/to/DataTable.js';
```

3. Include the CSS in your HTML:

```html
<link rel="stylesheet" href="path/to/dataTable.css">
```

## Basic Usage

```javascript
// Define columns
const columns = [
    {
        field: 'name',
        title: 'Name',
        type: 'text',
        sortable: true
    },
    {
        field: 'age',
        title: 'Age',
        type: 'number',
        sortable: true
    },
    {
        field: 'status',
        title: 'Status',
        type: 'status',
        sortable: true
    }
];

// Sample data
const data = [
    { id: 1, name: 'John Doe', age: 30, status: 'active' },
    { id: 2, name: 'Jane Smith', age: 25, status: 'inactive' },
    { id: 3, name: 'Bob Johnson', age: 40, status: 'pending' }
];

// Initialize the DataTable
const dataTable = new DataTable('#container-element', {
    columns: columns,
    data: data,
    pageSize: 10,
    onRowClick: (rowData) => {
        console.log('Row clicked:', rowData);
    }
});
```

## Configuration Options

The DataTable constructor accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `columns` | Array | `[]` | Array of column definitions |
| `data` | Array | `[]` | Array of data objects |
| `pageSize` | Number | `10` | Number of rows per page |
| `currentPage` | Number | `1` | Initial page to display |
| `sortColumn` | String | `null` | Initial column to sort by |
| `sortDirection` | String | `'asc'` | Initial sort direction ('asc' or 'desc') |
| `headerVisible` | Boolean | `true` | Whether to show the table header |
| `selectable` | Boolean | `false` | Whether rows can be selected with checkboxes |
| `clickable` | Boolean | `true` | Whether rows can be clicked |
| `loading` | Boolean | `false` | Whether to show loading state |
| `emptyMessage` | String | `'No data available'` | Message to show when there's no data |
| `cardTitleField` | String | `null` | Field to use as card title in mobile view |
| `onRowClick` | Function | `null` | Callback when a row is clicked |
| `onSort` | Function | `null` | Callback when sorting changes |
| `onPageChange` | Function | `null` | Callback when page changes |
| `onSelectionChange` | Function | `null` | Callback when row selection changes |
| `formatters` | Object | `{}` | Custom formatters for data types |
| `websocket` | Object | See below | WebSocket configuration |

### WebSocket Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | Boolean | `false` | Whether to enable WebSocket |
| `url` | String | `null` | WebSocket URL |
| `autoConnect` | Boolean | `true` | Whether to connect automatically |
| `reconnectInterval` | Number | `5000` | Reconnection interval in milliseconds |
| `onConnect` | Function | `null` | Callback when connected |
| `onDisconnect` | Function | `null` | Callback when disconnected |
| `onMessage` | Function | `null` | Callback when message received |

## Column Configuration

Each column object can have the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `field` | String | The field name in the data object |
| `title` | String | The column header text |
| `type` | String | Data type ('text', 'number', 'currency', 'date', 'status', 'boolean', 'html') |
| `sortable` | Boolean | Whether the column is sortable |
| `formatOptions` | Object | Options for formatting the value |
| `cellClass` | String | CSS class to add to the cell |
| `formatter` | Function | Custom formatter function |
| `actions` | Array | Array of action button definitions |

### Action Button Configuration

| Property | Type | Description |
|----------|------|-------------|
| `icon` | String | CSS class for the icon |
| `text` | String | Button text (if no icon) |
| `title` | String | Button tooltip |
| `class` | String | CSS class for the button |
| `onClick` | Function | Click handler function |

## API Methods

### Data Methods

- `setData(data)` - Set new data and reset to first page
- `updateData(data)` - Update data while maintaining current page
- `updateRow(id, newData, idField = 'id')` - Update a specific row
- `addRow(newRow)` - Add a new row
- `removeRow(id, idField = 'id')` - Remove a row

### Selection Methods

- `getSelectedRows()` - Get array of selected row IDs
- `toggleRowSelection(rowId)` - Toggle selection of a specific row
- `toggleSelectAll(selected)` - Select or deselect all rows

### WebSocket Methods

- `connectWebSocket()` - Connect to WebSocket
- `disconnectWebSocket()` - Disconnect from WebSocket
- `sendMessage(message)` - Send a message through WebSocket

### Other Methods

- `goToPage(page)` - Go to a specific page
- `destroy()` - Clean up and remove the component

## Examples

### Status Indicators

```javascript
const columns = [
    // ... other columns
    {
        field: 'status',
        title: 'Status',
        type: 'status',
        sortable: true
    }
];

// Custom status classes can be defined in CSS:
// .status-active { background-color: green; color: white; }
// .status-inactive { background-color: red; color: white; }
```

### Currency Formatting

```javascript
const columns = [
    // ... other columns
    {
        field: 'price',
        title: 'Price',
        type: 'currency',
        sortable: true,
        formatOptions: {
            style: 'currency',
            currency: 'USD'
        }
    }
];
```

### Date Formatting

```javascript
const columns = [
    // ... other columns
    {
        field: 'createdAt',
        title: 'Created At',
        type: 'date',
        sortable: true,
        formatOptions: {
            format: 'medium' // 'short', 'medium', 'long', 'full', or 'custom'
        }
    }
];
```

### Action Buttons

```javascript
const columns = [
    // ... other columns
    {
        actions: [
            {
                icon: 'fas fa-edit',
                title: 'Edit',
                class: 'edit',
                onClick: (rowData) => {
                    console.log('Edit clicked for:', rowData);
                    // Open edit modal or form
                }
            },
            {
                icon: 'fas fa-trash',
                title: 'Delete',
                class: 'delete',
                onClick: (rowData) => {
                    console.log('Delete clicked for:', rowData);
                    // Confirm and delete
                }
            }
        ]
    }
];
```

### WebSocket Integration

```javascript
const dataTable = new DataTable('#container', {
    // ... other options
    websocket: {
        enabled: true,
        url: 'wss://your-websocket-server.com',
        onConnect: () => {
            console.log('Connected to WebSocket');
        },
        onMessage: (message) => {
            console.log('Received message:', message);
            // Handle message if not handled automatically
        }
    }
});

// Send a message through WebSocket
dataTable.sendMessage({
    type: 'subscribe',
    channel: 'data-updates'
});
```

## Mobile Card View

On mobile devices (screen width <= 768px), the table automatically switches to a card view. Each card displays:

1. A header with the value from the field specified in `cardTitleField` (or the first column if not specified)
2. Key-value pairs for all other fields
3. Action buttons if defined

The card view is fully responsive and provides a better user experience on small screens.

## Demo

See `demo.html` for a complete working example of the DataTable component.
