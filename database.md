# Solvify - Database Specification

## 1. Database
PostgreSQL.

Use UUID primary keys where practical and UTC timestamps.

## 2. Tables

### users
- id UUID PK
- name
- email UNIQUE
- password_hash
- created_at
- updated_at

### companies
- id UUID PK
- owner_id FK users.id
- name
- industry
- created_at
- updated_at

### analyses
- id UUID PK
- user_id FK users.id
- company_id FK companies.id
- financial_year
- status
- risk_probability
- risk_band
- model_name
- model_version
- input_snapshot JSONB
- ratios JSONB
- explanation JSONB
- recommendations JSONB
- created_at
- updated_at

### scenarios
- id UUID PK
- analysis_id FK analyses.id
- name
- input_changes JSONB
- risk_probability
- risk_band
- result_snapshot JSONB
- created_at

### reports
- id UUID PK
- analysis_id FK analyses.id
- file_path/storage_key
- report_type
- created_at

### model_versions
- id UUID PK
- model_name
- version
- artifact_uri
- feature_schema JSONB
- metrics JSONB
- is_active
- created_at

### assistant_conversations
- id UUID PK
- user_id FK users.id
- analysis_id nullable FK analyses.id
- created_at
- updated_at

### assistant_messages
- id UUID PK
- conversation_id FK assistant_conversations.id
- role
- content
- created_at

## 3. Relationships
users 1→N companies
users 1→N analyses
companies 1→N analyses
analyses 1→N scenarios
analyses 1→N reports
users 1→N assistant_conversations
assistant_conversations 1→N assistant_messages

## 4. Indexes
Create indexes on:
- users.email
- companies.owner_id
- analyses.user_id
- analyses.company_id
- analyses.created_at
- analyses.risk_band
- scenarios.analysis_id
- assistant_conversations.user_id

## 5. Data Rules
- Foreign keys must enforce ownership relationships.
- Email must be unique.
- Risk probability must be between 0 and 1.
- Risk band must use a controlled enum.
- Model version is mandatory for stored predictions.
- Financial snapshots should preserve the exact input used for the analysis.
- Scenario records must reference an existing analysis.

## 6. Privacy
Financial inputs should be treated as sensitive business data.
- Restrict records by authenticated user.
- Never expose another user's analyses through an ID alone.
- Avoid unnecessary logging of raw financial inputs.
- Provide deletion functionality for user-owned analyses.

## 7. Migrations
Use Alembic for schema migrations. Never manually edit production schema without a migration.

## 8. Seed Data
Provide a clearly labeled demo dataset for development/demo purposes. Demo data must never be mixed with real user data.

## 9. Backup & Recovery
Production deployments should use automated PostgreSQL backups and documented restore procedures.
