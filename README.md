At th# Claims Hive

A reusable component library for the Claims Hive project.

## Components

- **DataTable**: A responsive data table component with card view for mobile devices
- **Charts**: A reusable charts component for data visualization
- **Modal**: A reusable modal dialog component

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Running the Project

#### Option 1: Using npm scripts

1. Clone the repository
2. Navigate to the project directory
3. Run the start script:
   ```bash
   npm start
   ```
4. Open your browser and navigate to [http://localhost:5000](http://localhost:5000)

To stop the server, run:
```bash
npm run stop
```

#### Option 2: Using the convenience scripts directly

1. Clone the repository
2. Navigate to the project directory
3. Make the scripts executable (if not already):
   ```bash
   chmod +x start.sh stop.sh
   ```
4. Run the start script:
   ```bash
   ./start.sh
   ```
5. Open your browser and navigate to [http://localhost:5000](http://localhost:5000)

To stop the server, run:
```bash
./stop.sh
```

#### Option 3: Using Docker Compose directly

1. Clone the repository
2. Navigate to the project directory
3. Run the following command to start the Docker container:
   ```bash
   docker-compose up -d
   ```
4. Open your browser and navigate to [http://localhost:5000](http://localhost:5000)

To stop the Docker container, run:
```bash
docker-compose down
```

You can also use the npm scripts for Docker operations:
```bash
npm run docker:build  # Build the Docker image
npm run docker:up     # Start the Docker container
npm run docker:down   # Stop the Docker container
```

## Component Documentation

### DataTable Component

The DataTable component provides a flexible way to display tabular data with support for various data types, sorting, pagination, and real-time updates via WebSockets.

[View DataTable Demo](http://localhost:5000/components/DataTable/demo.html)

[View DataTable Documentation](http://localhost:5000/components/DataTable/README.md)

### Charts Component

The Charts component provides a flexible way to create various types of charts for data visualization, including bar, line, pie, doughnut, radar, and polar area charts.

[View Charts Demo](http://localhost:5000/components/Charts/demo.html)

[View Charts Documentation](http://localhost:5000/components/Charts/README.md)

### Modal Component

The Modal component provides a flexible way to create modal dialogs with customizable size, position, animations, and content. It includes support for forms, draggable and resizable options, and static methods for common use cases.

[View Modal Demo](http://localhost:5000/components/Modal/demo.html)

[View Modal Documentation](http://localhost:5000/components/Modal/README.md)

## Project Structure

```
claims-hive/
├── components/
│   ├── DataTable/
│   │   ├── DataTable.js
│   │   ├── dataFormatter.js
│   │   ├── dataTable.css
│   │   ├── demo.css
│   │   ├── demo.html
│   │   └── README.md
│   ├── Charts/
│   │   ├── Charts.js
│   │   ├── charts.css
│   │   ├── demo.css
│   │   ├── demo.html
│   │   └── README.md
│   └── Modal/
│       ├── Modal.js
│       ├── modal.css
│       ├── demo.html
│       └── README.md
├── styles.css
├── index.html
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── package.json
├── LICENSE
├── .gitignore
├── .dockerignore
├── README.md
├── start.sh
└── stop.sh
```

## Development

To add a new component:

1. Create a new directory under `components/`
2. Create the component files (JS, CSS, demo, README)
3. Add the component to the index.html page

## License

This project is proprietary software owned by Claims Hive. See the [LICENSE](LICENSE) file for details.

### Third-Party Acknowledgments

This software uses several third-party libraries, which are acknowledged in the LICENSE file.
