# Seed Script

```sql
-- Enable password hashing (PostgreSQL pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
```