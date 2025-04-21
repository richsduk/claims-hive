# System Overview

This system ingests, processes, and routes claims from various sources (websites, email campaigns) through a flexible, JSON‑driven database schema. It cleanly separates **personal data** from **claim data**, supports multiple claim types without altering the schema, and provides full role‑based access control.

## Core Concepts

1. **raw_data**  
   - Landing pad for all inbound payloads (CSV rows, form submissions, email parsing, etc.)  
   - Extracts only claimants’ personal info (first, last, email, phone, preferred_channel) and UTM tracking metadata.  
   - Stores everything else (type‑specific details) in `content JSONB`.

2. **claimant**  
   - One row per unique person making a claim.  
   - Populated by extracting personal fields from `raw_data`.  
   - Tracks earliest `first_submitted_at` for reporting historical submissions.

3. **claim_type**  
   - Defines each category of claim (e.g. “miss-sold finance,” “housing disrepair”).  
   - Stores a JSON schema (`schema_json`) that tells the processing code how to extract & validate `claim_data`.

4. **claim**  
   - Represents a validated, post‑processed lead.  
   - Links to its source row (`raw_data_id`), claimant, affiliate, buyer, and `claim_type`.  
   - Stores only the type‑specific details in `claim_data JSONB`.  
   - Tracks lifecycle with `status` (new → assigned → accepted → settled → rejected → paid).

5. **reject**  
   - Captures any inbound rows that fail validation (duplicates, schema mismatches).  
   - Keeps the original `raw_data_id` and a `reason`.

6. **log**  
   - Activity audit for both system events (logins, background jobs) and data actions (notes on claims).  
   - References `user`, `claim`, or `raw_data` as needed.

7. **Companies & users**  
   - `company` table holds admin, affiliate, and buyer organizations.  
   - `user` table holds login credentials (`email` + `password_hash`), profile, and `role`.  
   - Affiliates and buyers will log in to manage their claims; internal admins route & sell.

8. **Role‑based access control**  
   - `role` + `role_permission` tables model CRUD‑by‑scope (global, company, user) permissions per resource.  
   - Enables fine‑grained UI & API enforcement.

## Data Flow

1. **Ingestion**: CSV / form / email → parse to JSON → insert into `raw_data`.  
2. **Claimant extract**: Lookup or create `claimant` based on personal fields.  
3. **Validation**: Match `raw_data` against the JSON schema in `claim_type`; insert into `claim` or `reject`.  
4. **Routing**: Admin UI or automated logic assigns claims to `buyer_id`.  
5. **Lifecycle**: Buyers accept, settle, and mark `paid`; all actions logged in `log`.  
6. **Reporting**: Use `utm_*` fields + timestamps to measure affiliate & campaign ROI; track statuses over time.
