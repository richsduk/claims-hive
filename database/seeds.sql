-- Claims Hive Database Seed Script

-- 1. Seed roles
INSERT INTO role (name) VALUES
  ('Admin'),
  ('Manager'),
  ('Editor'),
  ('Reader');

-- 2. Seed initial companies
INSERT INTO company (name, type) VALUES
  ('Legitfiy', 'admin'),
  ('Quotezone', 'affiliate'),
  ('Dynamo Cover', 'affiliate'),
  ('ID Tech', 'buyer'),
  ('Heirloom', 'buyer');

-- 3. Seed first user (belongs to Legitfiy)
INSERT INTO "user" (
  company_id, email, password_hash, first, last, role
) VALUES (
  (SELECT company_id FROM company WHERE name='Legitfiy'),
  'contact@rich-hill.com',
  crypt('12345678', gen_salt('bf')),
  'Rich',
  'Hill',
  'admin'
);

-- 4. Seed permissions for each role and resource/scope

-- Admin: full CRUD on all scopes & resources
INSERT INTO role_permission (role_id, resource, scope, can_create, can_read, can_update, can_delete)
SELECT
  r.role_id,
  res.resource,
  sc.scope,
  TRUE, TRUE, TRUE, TRUE
FROM role r
CROSS JOIN (VALUES ('claims'),('clients'),('logs'),('companies')) AS res(resource)
CROSS JOIN (VALUES ('global'),('company'),('user')) AS sc(scope)
WHERE r.name = 'Admin';

-- Manager
INSERT INTO role_permission (role_id, resource, scope, can_create, can_read, can_update, can_delete)
VALUES
  -- Claims
  ((SELECT role_id FROM role WHERE name='Manager'),'claims','global', FALSE,FALSE,FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Manager'),'claims','company',TRUE, TRUE, TRUE, TRUE),
  ((SELECT role_id FROM role WHERE name='Manager'),'claims','user',   FALSE,TRUE, TRUE, FALSE),
  -- Clients
  ((SELECT role_id FROM role WHERE name='Manager'),'clients','global',FALSE,FALSE,FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Manager'),'clients','company',TRUE, TRUE, TRUE, FALSE),
  ((SELECT role_id FROM role WHERE name='Manager'),'clients','user',   FALSE,TRUE, FALSE,FALSE),
  -- Logs
  ((SELECT role_id FROM role WHERE name='Manager'),'logs','global',   FALSE,FALSE,FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Manager'),'logs','company',  FALSE,TRUE, FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Manager'),'logs','user',     FALSE,FALSE,FALSE,FALSE),
  -- Companies
  ((SELECT role_id FROM role WHERE name='Manager'),'companies','global',FALSE,FALSE,FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Manager'),'companies','company',FALSE,TRUE, FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Manager'),'companies','user',   FALSE,FALSE,FALSE,FALSE)
;

-- Editor
INSERT INTO role_permission (role_id, resource, scope, can_create, can_read, can_update, can_delete)
VALUES
  -- Claims
  ((SELECT role_id FROM role WHERE name='Editor'),'claims','global', FALSE,FALSE,FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Editor'),'claims','company',TRUE, TRUE, TRUE, FALSE),
  ((SELECT role_id FROM role WHERE name='Editor'),'claims','user',   TRUE, TRUE, TRUE, FALSE),
  -- Clients
  ((SELECT role_id FROM role WHERE name='Editor'),'clients','global',FALSE,FALSE,FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Editor'),'clients','company',TRUE, TRUE, TRUE, FALSE),
  ((SELECT role_id FROM role WHERE name='Editor'),'clients','user',   FALSE,TRUE, FALSE,FALSE),
  -- Logs & Companies → no access
  ((SELECT role_id FROM role WHERE name='Editor'),'logs','global',   FALSE,FALSE,FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Editor'),'logs','company',  FALSE,FALSE,FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Editor'),'logs','user',     FALSE,FALSE,FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Editor'),'companies','global',FALSE,FALSE,FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Editor'),'companies','company',FALSE,FALSE,FALSE,FALSE),
  ((SELECT role_id FROM role WHERE name='Editor'),'companies','user',   FALSE,FALSE,FALSE,FALSE)
;

-- Reader
INSERT INTO role_permission (role_id, resource, scope, can_create, can_read, can_update, can_delete)
SELECT
  r.role_id,
  res.resource,
  sc.scope,
  FALSE,
  CASE WHEN sc.scope IN ('company','user') THEN TRUE ELSE FALSE END,
  FALSE,
  FALSE
FROM role r
CROSS JOIN (VALUES ('claims'),('clients'),('logs'),('companies')) AS res(resource)
CROSS JOIN (VALUES ('global'),('company'),('user')) AS sc(scope)
WHERE r.name = 'Reader';

-- 5. Seed sample claim types
INSERT INTO claim_type (name, schema_json) VALUES
(
  'Car Accident Claim',
  '{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Car Accident Claim",
    "description": "Schema for Car Accident Claim",
    "type": "object",
    "properties": {
      "accident_date": {
        "title": "Accident Date",
        "type": "string",
        "format": "date"
      },
      "vehicle_make": {
        "title": "Vehicle Make",
        "type": "string"
      },
      "vehicle_model": {
        "title": "Vehicle Model",
        "type": "string"
      },
      "vehicle_year": {
        "title": "Vehicle Year",
        "type": "integer"
      },
      "damage_description": {
        "title": "Damage Description",
        "type": "string",
        "format": "textarea"
      },
      "injury_sustained": {
        "title": "Injury Sustained",
        "type": "boolean"
      },
      "injury_description": {
        "title": "Injury Description",
        "type": "string",
        "format": "textarea"
      },
      "police_report_filed": {
        "title": "Police Report Filed",
        "type": "boolean"
      },
      "police_report_number": {
        "title": "Police Report Number",
        "type": "string"
      },
      "insurance_company": {
        "title": "Insurance Company",
        "type": "string"
      },
      "policy_number": {
        "title": "Policy Number",
        "type": "string"
      },
      "claim_amount": {
        "title": "Claim Amount",
        "type": "number"
      }
    },
    "required": ["accident_date", "vehicle_make", "vehicle_model", "damage_description"]
  }'
),
(
  'PPI Claim',
  '{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "PPI Claim",
    "description": "Schema for PPI Claim",
    "type": "object",
    "properties": {
      "lender_name": {
        "title": "Lender Name",
        "type": "string"
      },
      "account_number": {
        "title": "Account Number",
        "type": "string"
      },
      "loan_type": {
        "title": "Loan Type",
        "type": "string",
        "enum": ["Mortgage", "Credit Card", "Personal Loan", "Store Card", "Catalog", "Other"]
      },
      "loan_start_date": {
        "title": "Loan Start Date",
        "type": "string",
        "format": "date"
      },
      "loan_end_date": {
        "title": "Loan End Date",
        "type": "string",
        "format": "date"
      },
      "loan_amount": {
        "title": "Loan Amount",
        "type": "number"
      },
      "ppi_sold_with_loan": {
        "title": "PPI Sold With Loan",
        "type": "boolean"
      },
      "ppi_cost": {
        "title": "PPI Cost",
        "type": "number"
      },
      "claim_reason": {
        "title": "Claim Reason",
        "type": "string",
        "enum": ["Not Informed", "Not Suitable", "Not Requested", "Pressure Sold", "Other"]
      },
      "additional_details": {
        "title": "Additional Details",
        "type": "string",
        "format": "textarea"
      }
    },
    "required": ["lender_name", "loan_type", "ppi_sold_with_loan", "claim_reason"]
  }'
),
(
  'Housing Disrepair Claim',
  '{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Housing Disrepair Claim",
    "description": "Schema for Housing Disrepair Claim",
    "type": "object",
    "properties": {
      "landlord_name": {
        "title": "Landlord Name",
        "type": "string"
      },
      "property_address": {
        "title": "Property Address",
        "type": "string",
        "format": "textarea"
      },
      "tenancy_start_date": {
        "title": "Tenancy Start Date",
        "type": "string",
        "format": "date"
      },
      "issue_type": {
        "title": "Issue Type",
        "type": "string",
        "enum": ["Damp/Mold", "Structural Issues", "Heating/Hot Water", "Electrical Issues", "Plumbing Issues", "Pest Infestation", "Other"]
      },
      "issue_description": {
        "title": "Issue Description",
        "type": "string",
        "format": "textarea"
      },
      "issue_start_date": {
        "title": "Issue Start Date",
        "type": "string",
        "format": "date"
      },
      "reported_to_landlord": {
        "title": "Reported to Landlord",
        "type": "boolean"
      },
      "report_date": {
        "title": "Report Date",
        "type": "string",
        "format": "date"
      },
      "landlord_response": {
        "title": "Landlord Response",
        "type": "string",
        "format": "textarea"
      },
      "health_affected": {
        "title": "Health Affected",
        "type": "boolean"
      },
      "health_impact_description": {
        "title": "Health Impact Description",
        "type": "string",
        "format": "textarea"
      },
      "property_damage": {
        "title": "Property Damage",
        "type": "boolean"
      },
      "damage_description": {
        "title": "Damage Description",
        "type": "string",
        "format": "textarea"
      },
      "compensation_amount": {
        "title": "Compensation Amount",
        "type": "number"
      }
    },
    "required": ["landlord_name", "property_address", "issue_type", "issue_description", "reported_to_landlord"]
  }'
);

-- 6. Seed sample raw data and claims (for demonstration purposes)
-- Insert a sample raw data entry
INSERT INTO raw_data (
  content, 
  first, 
  last, 
  email, 
  phone, 
  preferred_channel,
  utm_source,
  utm_medium,
  utm_campaign,
  submitted_at
) VALUES (
  '{
    "accident_date": "2024-03-15",
    "vehicle_make": "Toyota",
    "vehicle_model": "Corolla",
    "vehicle_year": 2020,
    "damage_description": "Front bumper damage and broken headlight",
    "injury_sustained": true,
    "injury_description": "Whiplash and minor cuts",
    "police_report_filed": true,
    "police_report_number": "PR-12345",
    "insurance_company": "ABC Insurance",
    "policy_number": "POL-987654",
    "claim_amount": 5000.00,
    "first_name": "John",
    "last_name": "Smith",
    "email_address": "john.smith@example.com",
    "phone_number": "07700900123",
    "contact_preference": "email"
  }',
  'John',
  'Smith',
  'john.smith@example.com',
  '07700900123',
  'email',
  'google',
  'cpc',
  'car_accident_claims',
  NOW() - INTERVAL '2 days'
);

-- Create a claimant from the raw data
INSERT INTO claimant (
  first,
  last,
  email,
  phone,
  preferred_channel,
  first_submitted_at
) VALUES (
  'John',
  'Smith',
  'john.smith@example.com',
  '07700900123',
  'email',
  NOW() - INTERVAL '2 days'
);

-- Create a claim from the raw data
INSERT INTO claim (
  raw_data_id,
  claimant_id,
  claim_type_id,
  affiliate_id,
  status,
  claim_data
) VALUES (
  1, -- First raw_data entry
  1, -- First claimant
  1, -- Car Accident Claim type
  2, -- Quotezone (affiliate)
  'new',
  '{
    "accident_date": "2024-03-15",
    "vehicle_make": "Toyota",
    "vehicle_model": "Corolla",
    "vehicle_year": 2020,
    "damage_description": "Front bumper damage and broken headlight",
    "injury_sustained": true,
    "injury_description": "Whiplash and minor cuts",
    "police_report_filed": true,
    "police_report_number": "PR-12345",
    "insurance_company": "ABC Insurance",
    "policy_number": "POL-987654",
    "claim_amount": 5000.00
  }'
);

-- Add a log entry for the claim creation
INSERT INTO log (
  log_type,
  user_id,
  claim_id,
  raw_data_id,
  details
) VALUES (
  'system',
  1, -- Admin user
  1, -- First claim
  1, -- First raw_data entry
  '{"action": "claim_created", "message": "Claim created from raw data"}'
);
