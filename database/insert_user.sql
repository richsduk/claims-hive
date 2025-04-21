-- Insert the admin user with a bcrypt hash for '12345678'
INSERT INTO "user" (
  company_id, email, password_hash, first, last, role
) VALUES (
  1, -- Assuming company_id 1 exists
  'contact@rich-hill.com',
  -- Using a pre-generated bcrypt hash for '12345678' that's compatible with Node.js bcrypt
  '$2b$10$3euPcmQFCiblsZeEu5s7p.9MUZWRzHYTGQ1pkHWzp8z3Qqmf2sswW',
  'Rich',
  'Hill',
  'admin'
);
