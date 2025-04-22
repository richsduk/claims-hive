# Soft Delete Functionality

This document explains the soft delete functionality implemented in the Claims Hive database.

## Overview

Soft deletion is a pattern where records are marked as "deleted" in the database but are not actually removed. This is useful for:

- Maintaining referential integrity
- Allowing for data recovery
- Preserving historical data
- Supporting audit trails

## Implementation

The following tables now support soft deletion:

- `company`
- `user`
- `claim_type`
- `role`
- `claimant`
- `raw_data`
- `claim`

Each of these tables has a `deleted_at` column that is:
- `NULL` for active records
- Contains a timestamp for deleted records

## Database Schema Changes

The schema has been updated to include:

1. A `deleted_at TIMESTAMPTZ DEFAULT NULL` column on each table
2. An index on the `deleted_at` column for query performance
3. A helper function `is_not_deleted(deleted_at)` for use in queries

## API Changes

The API has been updated to support soft deletion:

### Company API

- `DELETE /api/company/:companyId` - Soft deletes a company
- `POST /api/company/:companyId/restore` - Restores a soft-deleted company
- `DELETE /api/company/:companyId/permanent` - Permanently deletes a company
- `GET /api/company/all` - Gets all companies including deleted ones
- `GET /api/company/deleted` - Gets only deleted companies

## Model Changes

The model layer has been updated to:

1. Filter out soft-deleted records by default
2. Provide methods to access deleted records when needed
3. Support restoration of deleted records

### Example: Company Model

```javascript
// Get active companies only (default)
const activeCompanies = await Company.getAll();

// Get all companies including deleted ones
const allCompanies = await Company.getAllWithDeleted();

// Get only deleted companies
const deletedCompanies = await Company.getDeleted();

// Soft delete a company
await Company.remove(companyId);

// Restore a deleted company
await Company.restore(companyId);

// Permanently delete a company
await Company.hardDelete(companyId);
```

## How to Apply the Changes

### For New Installations

The main schema file (`schema.sql`) already includes the soft delete columns, so new installations will automatically have soft delete functionality.

### For Existing Installations

To add soft delete functionality to an existing database:

1. Run the migration script:

```bash
node database/run_migration.js
```

This will add the necessary columns and indexes to your existing database.

## Best Practices

1. **Always use the model methods** rather than direct SQL queries to ensure soft-deleted records are properly handled.

2. **Consider cascading soft deletes** for related records. For example, when a company is soft-deleted, you might want to soft-delete all its users.

3. **Be careful with unique constraints** - if you're using a unique constraint on a column (like email), soft-deleted records will still count toward that constraint. You may need to use partial indexes or add additional logic.

4. **Regularly clean up old soft-deleted records** if they're no longer needed for compliance or historical purposes.

## Troubleshooting

If you encounter issues with soft delete:

1. Check that the `deleted_at` column exists on the table
2. Verify that queries are including the `WHERE deleted_at IS NULL` condition
3. Ensure that the model methods are being used correctly
