# Claims Hive Coding Standards

This document outlines the coding standards and conventions for the Claims Hive project. Following these guidelines ensures consistency across the codebase and makes maintenance easier.

## Naming Conventions

### Database

- Table names: lowercase, singular form (e.g., `user`, not `Users`)
- Column names: lowercase with underscores for spaces (snake_case)
- Primary keys: table name + `_id` (e.g., `user_id`)
- Foreign keys: referenced table name + `_id` (e.g., `company_id`)
- Junction tables: combine both table names in singular form (e.g., `user_role`)
- Enum types: lowercase with descriptive names (e.g., `claim_status`)

### JavaScript

- Variables: camelCase (e.g., `userData`, `companyList`)
- Constants: camelCase (e.g., `apiEndpoint`, `maxRetries`)
- Functions: camelCase, verb-first for actions (e.g., `fetchUser()`, `saveCompany()`)
- Classes: PascalCase (e.g., `DataTable`, `Modal`)
- Component instances: camelCase (e.g., `userTable`, `companyModal`)
- Configuration objects: descriptive camelCase (e.g., `userTableConfig`)
- Event handlers: on + noun + verb (e.g., `onUserSave`, `onCompanySelect`)

### Files and Directories

- JavaScript files: camelCase (e.g., `dataFormatter.js`, `userService.js`)
- CSS files: lowercase with hyphens (e.g., `data-table.css`, `modal-styles.css`)
- Component directories: PascalCase matching component name (e.g., `DataTable/`, `Modal/`)
- Utility directories: lowercase (e.g., `utils/`, `services/`)
- Configuration files: lowercase with hyphens (e.g., `docker-compose.yml`)
- Documentation files: uppercase with hyphens (e.g., `README.md`, `CONTRIBUTING.md`)

### API Endpoints

- RESTful endpoints: lowercase, singular resource name (e.g., `/api/user`, `/api/claim`)
- Actions: use HTTP methods appropriately (GET, POST, PUT, DELETE)
- Parameters: camelCase for query parameters (e.g., `?sortBy=createdAt`)
- IDs in paths: use descriptive names (e.g., `/api/user/:userId`, not `/api/user/:id`)

## Code Structure

### Components

- One component per file
- Component file name should match component name
- Include CSS in a separate file with the same base name
- Document component API with JSDoc comments

### JavaScript

- Use ES6+ features (arrow functions, destructuring, etc.)
- Prefer `const` over `let`, avoid `var`
- Use async/await for asynchronous operations
- Document functions with JSDoc comments
- Keep functions small and focused on a single responsibility

### CSS

- Use component-specific CSS classes to avoid conflicts
- Follow BEM naming convention for complex components
- Use CSS variables for colors, spacing, and other repeated values
- Implement responsive design using media queries

## UI Components

### DataTable

- Reuse the DataTable component for all tabular data
- Configure columns with consistent field names
- Use the appropriate formatter for each data type
- Implement WebSocket updates where real-time data is needed

### Modal

- Use the Modal component for all dialogs and forms
- Follow consistent patterns for form layouts
- Implement proper validation for all form inputs
- Use appropriate modal sizes based on content

### Charts

- Use the Charts component for all data visualization
- Select appropriate chart types for the data being displayed
- Maintain consistent color schemes across charts
- Ensure all charts are responsive

## Best Practices

- Write automated tests for critical functionality
- Document complex logic and business rules
- Optimize database queries for performance
- Implement proper error handling and logging
- Follow security best practices for authentication and data protection
- Ensure all UI is accessible and responsive
