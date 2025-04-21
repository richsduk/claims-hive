-- Claims Hive Database Schema

-- Enable password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums

-- Company types
CREATE TYPE company_type AS ENUM ('admin','affiliate','buyer');

-- User roles
CREATE TYPE user_role AS ENUM ('admin','affiliate_user','buyer_user');

-- Claim statuses
CREATE TYPE claim_status AS ENUM ('new','assigned','accepted','settled','rejected','paid');

-- Log types
CREATE TYPE log_type AS ENUM ('system','data');

-- Preferred contact channels
CREATE TYPE preferred_channel AS ENUM ('email','phone','sms','portal','other');

-- Permission scopes
CREATE TYPE permission_scope AS ENUM ('global','company','user');

-- Permission operations
CREATE TYPE permission_operation AS ENUM ('C','R','U','D');

-- Resources for permissions
CREATE TYPE resource_table AS ENUM ('claims','clients','logs','companies');

-- Tables

-- Company table
CREATE TABLE company (
  company_id   BIGSERIAL      PRIMARY KEY,
  name         TEXT           NOT NULL,
  type         company_type   NOT NULL,
  created      TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated      TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- User table
CREATE TABLE "user" (
  user_id       BIGSERIAL      PRIMARY KEY,
  company_id    BIGINT         NOT NULL REFERENCES company(company_id),
  email         TEXT           NOT NULL UNIQUE,
  password_hash TEXT           NOT NULL,           -- bcrypt/pgcrypto hash
  first         TEXT           NOT NULL,
  last          TEXT           NOT NULL,
  role          user_role      NOT NULL,
  created       TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated       TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Raw data table
CREATE TABLE raw_data (
  raw_data_id        BIGSERIAL      PRIMARY KEY,
  content            JSONB          NOT NULL,
  first              TEXT,
  last               TEXT,
  email              TEXT,
  phone              TEXT,
  preferred_channel  preferred_channel,
  utm_source         TEXT,
  utm_medium         TEXT,
  utm_campaign       TEXT,
  utm_term           TEXT,
  submitted_at       TIMESTAMPTZ,
  created            TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated            TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Claimant table
CREATE TABLE claimant (
  claimant_id        BIGSERIAL      PRIMARY KEY,
  first              TEXT           NOT NULL,
  last               TEXT           NOT NULL,
  email              TEXT,
  phone              TEXT,
  preferred_channel  preferred_channel,
  first_submitted_at TIMESTAMPTZ,
  created            TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated            TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Claim type table
CREATE TABLE claim_type (
  claim_type_id   BIGSERIAL      PRIMARY KEY,
  name            TEXT           NOT NULL UNIQUE,
  schema_json     JSONB          NOT NULL,
  created         TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated         TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Claim table
CREATE TABLE claim (
  claim_id        BIGSERIAL      PRIMARY KEY,
  raw_data_id     BIGINT         NOT NULL REFERENCES raw_data(raw_data_id),
  claimant_id     BIGINT         NOT NULL REFERENCES claimant(claimant_id),
  claim_type_id   BIGINT         NOT NULL REFERENCES claim_type(claim_type_id),
  affiliate_id    BIGINT         NOT NULL REFERENCES company(company_id),
  buyer_id        BIGINT         REFERENCES company(company_id),
  status          claim_status   NOT NULL DEFAULT 'new',
  claim_data      JSONB          NOT NULL,
  created         TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated         TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Reject table
CREATE TABLE reject (
  reject_id      BIGSERIAL      PRIMARY KEY,
  raw_data_id    BIGINT         NOT NULL REFERENCES raw_data(raw_data_id),
  reason         TEXT           NOT NULL,
  created        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Log table
CREATE TABLE log (
  log_id         BIGSERIAL      PRIMARY KEY,
  log_type       log_type       NOT NULL,
  user_id        BIGINT         REFERENCES "user"(user_id),
  claim_id       BIGINT         REFERENCES claim(claim_id),
  raw_data_id    BIGINT         REFERENCES raw_data(raw_data_id),
  details        JSONB,
  created        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Role table
CREATE TABLE role (
  role_id   BIGSERIAL     PRIMARY KEY,
  name      TEXT          NOT NULL UNIQUE,
  created   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Role permission table
CREATE TABLE role_permission (
  role_permission_id  BIGSERIAL        PRIMARY KEY,
  role_id             BIGINT           NOT NULL REFERENCES role(role_id) ON DELETE CASCADE,
  resource            resource_table   NOT NULL,
  scope               permission_scope NOT NULL,
  can_create          BOOLEAN          NOT NULL DEFAULT FALSE,
  can_read            BOOLEAN          NOT NULL DEFAULT FALSE,
  can_update          BOOLEAN          NOT NULL DEFAULT FALSE,
  can_delete          BOOLEAN          NOT NULL DEFAULT FALSE,
  created             TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated             TIMESTAMPTZ      NOT NULL DEFAULT now(),
  UNIQUE(role_id, resource, scope)
);

-- Indexes for performance
CREATE INDEX idx_raw_data_submitted_at ON raw_data(submitted_at);
CREATE INDEX idx_claim_status ON claim(status);
CREATE INDEX idx_claim_created ON claim(created);
CREATE INDEX idx_claim_updated ON claim(updated);
CREATE INDEX idx_claim_affiliate_id ON claim(affiliate_id);
CREATE INDEX idx_claim_buyer_id ON claim(buyer_id);
CREATE INDEX idx_log_created ON log(created);
CREATE INDEX idx_user_email ON "user"(email);
