-- Update the admin user's password hash
UPDATE "user"
SET password_hash = '$2b$10$3euPcmQFCiblsZeEu5s7p.9MUZWRzHYTGQ1pkHWzp8z3Qqmf2sswW'
WHERE email = 'contact@rich-hill.com';
