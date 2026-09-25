-- ==============================================================================
-- AfiyaSauti Database Schema (PostgreSQL 16 + TimescaleDB + pgvector)
-- Compliant with Kenya Data Protection Act 2019 and Digital Health Act 2023
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;
CREATE EXTENSION IF NOT EXISTS "vector";

-- -----------------------------------------------------------------------------
-- 1. Households (Ambient In-Home Monitoring)
-- -----------------------------------------------------------------------------
CREATE TABLE households (
    household_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    county_code VARCHAR(10) NOT NULL,
    sub_county VARCHAR(50) NOT NULL,
    community_unit_id VARCHAR(50) NOT NULL,
    anonymized_hash VARCHAR(64) UNIQUE NOT NULL, -- HMAC-SHA-256 salted hash
    edge_device_id VARCHAR(50) UNIQUE,
    radar_active BOOLEAN DEFAULT TRUE,
    mic_array_active BOOLEAN DEFAULT TRUE,
    local_language VARCHAR(10) DEFAULT 'sw',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_households_geo ON households(county_code, sub_county, community_unit_id);
CREATE INDEX idx_households_hash ON households(anonymized_hash);

-- -----------------------------------------------------------------------------
-- 2. Vital Telemetry (TimescaleDB Hypertable for Edge mmWave + Mic Array)
-- -----------------------------------------------------------------------------
CREATE TABLE vital_telemetry (
    time TIMESTAMPTZ NOT NULL,
    household_id UUID NOT NULL REFERENCES households(household_id) ON DELETE CASCADE,
    device_id VARCHAR(50) NOT NULL,
    respiratory_rate NUMERIC(5,2),
    heart_rate NUMERIC(5,2),
    cough_count_1min INT DEFAULT 0,
    ambient_temp_c NUMERIC(4,2),
    confidence_score NUMERIC(3,2),
    input_entropy NUMERIC(4,3) DEFAULT 0.12,
    flagged_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_category VARCHAR(40),
    uncertain_edge_escalated BOOLEAN DEFAULT FALSE
);

-- Convert to TimescaleDB hypertable partitioned by time
SELECT create_hypertable('vital_telemetry', 'time', if_not_exists => TRUE);
CREATE INDEX idx_vital_telemetry_household_time ON vital_telemetry(household_id, time DESC);
CREATE INDEX idx_vital_telemetry_anomalies ON vital_telemetry(flagged_anomaly, confidence_score) WHERE flagged_anomaly = TRUE;

-- -----------------------------------------------------------------------------
-- 3. Patient Consents (Granular, Purpose-Based Consent under Kenya DPA 2019)
-- -----------------------------------------------------------------------------
CREATE TABLE patient_consents (
    consent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(household_id) ON DELETE SET NULL,
    patient_hash VARCHAR(64) NOT NULL,
    consent_state VARCHAR(20) NOT NULL CHECK (consent_state IN ('ACTIVE', 'REVOKED', 'PENDING')),
    purpose_code VARCHAR(50) NOT NULL CHECK (purpose_code IN ('TRIAGE', 'AMBIENT_MONITORING', 'RESEARCH_ANONYMIZED', 'CHP_DISPATCH', 'THIRD_PARTY_PAYER')),
    granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    revocation_hash VARCHAR(64)
);

CREATE INDEX idx_consents_patient_purpose ON patient_consents(patient_hash, purpose_code);

-- -----------------------------------------------------------------------------
-- 4. Cryptographically Chained Audit Logs (Tamper-evident Audit Trail)
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    audit_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actor_id VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    previous_signature_hash VARCHAR(64) NOT NULL,
    signature_hash VARCHAR(64) NOT NULL,
    payload_snapshot JSONB NOT NULL
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- -----------------------------------------------------------------------------
-- 5. AI Inference Metrics & Observability
-- -----------------------------------------------------------------------------
CREATE TABLE ai_inference_metrics (
    inference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(household_id) ON DELETE SET NULL,
    model_version VARCHAR(50) NOT NULL,
    input_entropy NUMERIC(4,3),
    confidence_score NUMERIC(4,3),
    triage_assigned VARCHAR(20) CHECK (triage_assigned IN ('GREEN', 'YELLOW', 'RED')),
    feature_weights JSONB,
    human_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_metrics_confidence ON ai_inference_metrics(confidence_score, input_entropy);
CREATE INDEX idx_ai_metrics_override ON ai_inference_metrics(human_override) WHERE human_override = TRUE;

-- -----------------------------------------------------------------------------
-- 6. Triage Sessions (Multi-channel: WhatsApp, IVR, USSD, Web)
-- -----------------------------------------------------------------------------
CREATE TABLE triage_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anonymized_hash VARCHAR(64) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('WHATSAPP', 'USSD', 'IVR', 'WEB', 'EDGE_NODE')),
    language VARCHAR(10) NOT NULL,
    clinical_domain VARCHAR(40) NOT NULL,
    symptoms_reported JSONB NOT NULL,
    vital_signs JSONB,
    urgency_level VARCHAR(10) NOT NULL CHECK (urgency_level IN ('GREEN', 'YELLOW', 'RED')),
    is_red_flag BOOLEAN DEFAULT FALSE,
    red_flag_details JSONB,
    icd11_codes JSONB NOT NULL,
    grounded_guidance TEXT NOT NULL,
    citations JSONB NOT NULL,
    feature_weights JSONB,
    confidence_score NUMERIC(4,3),
    entropy_score NUMERIC(4,3),
    status VARCHAR(30) DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_triage_hash ON triage_sessions(anonymized_hash);
CREATE INDEX idx_triage_urgency ON triage_sessions(urgency_level, is_red_flag);
CREATE INDEX idx_triage_domain ON triage_sessions(clinical_domain);

-- -----------------------------------------------------------------------------
-- 7. Clinical SOAP Notes (Drafted by AI, human review & signature required)
-- -----------------------------------------------------------------------------
CREATE TABLE clinical_soap_notes (
    note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES triage_sessions(session_id) ON DELETE SET NULL,
    patient_hash VARCHAR(64) NOT NULL,
    subjective TEXT NOT NULL,
    objective TEXT NOT NULL,
    assessment TEXT NOT NULL,
    plan TEXT NOT NULL,
    icd11_codes JSONB NOT NULL,
    feature_attribution JSONB,
    citations JSONB NOT NULL,
    clinician_reviewed BOOLEAN DEFAULT FALSE,
    signed_by_clinician_id VARCHAR(100),
    signature_hash VARCHAR(64),
    signed_at TIMESTAMPTZ,
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_soap_patient ON clinical_soap_notes(patient_hash);
CREATE INDEX idx_soap_signature ON clinical_soap_notes(signed_by_clinician_id, locked);

-- -----------------------------------------------------------------------------
-- 8. Community Health Promoter (CHP) Tasks & Dispatches
-- -----------------------------------------------------------------------------
CREATE TABLE chp_tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chp_id VARCHAR(100) NOT NULL,
    household_hash VARCHAR(64) NOT NULL,
    village_name VARCHAR(100) NOT NULL,
    sub_county VARCHAR(100) NOT NULL,
    priority VARCHAR(30) CHECK (priority IN ('ROUTINE', 'URGENT', 'CRITICAL_RED_FLAG')),
    reason TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    guidance_protocol TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED')),
    offline_cached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    resolution_notes TEXT
);

CREATE INDEX idx_chp_tasks_status ON chp_tasks(chp_id, status, priority);

-- -----------------------------------------------------------------------------
-- 9. Outbreak Signals & Public Health Surveillance
-- -----------------------------------------------------------------------------
CREATE TABLE outbreak_signals (
    signal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    county_code VARCHAR(10) NOT NULL,
    county_name VARCHAR(50) NOT NULL,
    sub_county VARCHAR(50) NOT NULL,
    syndrome VARCHAR(50) NOT NULL,
    case_count_7days INT NOT NULL,
    baseline_expected INT NOT NULL,
    anomaly_ratio NUMERIC(5,2) NOT NULL,
    alert_level VARCHAR(30) CHECK (alert_level IN ('MONITOR', 'WARNING', 'OUTBREAK_CONFIRMED')),
    source_streams JSONB NOT NULL,
    moh_protocol_ref VARCHAR(100) NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outbreak_county ON outbreak_signals(county_code, alert_level);

-- -----------------------------------------------------------------------------
-- 10. Knowledge Base & Document Chunks (pgvector for RAG)
-- -----------------------------------------------------------------------------
CREATE TABLE knowledge_base_versions (
    version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    issuing_body VARCHAR(100) NOT NULL, -- MoH Kenya, WHO, IMCI, etc.
    version_number VARCHAR(50) NOT NULL,
    publication_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_by VARCHAR(100) NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID REFERENCES knowledge_base_versions(version_id) ON DELETE CASCADE,
    domain VARCHAR(40) NOT NULL,
    section_title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768), -- pgvector embeddings
    icd11_associations JSONB,
    confidence_rating NUMERIC(3,2) DEFAULT 0.95,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chunks_domain ON document_chunks(domain);
CREATE INDEX idx_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- -----------------------------------------------------------------------------
-- 11. Monetisation, Subscriptions & Metered Usage
-- -----------------------------------------------------------------------------
CREATE TABLE usage_events (
    event_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tenant_id VARCHAR(100) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    plan_tier VARCHAR(30) NOT NULL, -- FREE, PREMIUM_PATIENT, CLINIC_SEAT, GOV_POPULATION, PAYER_API
    units_consumed INT DEFAULT 1,
    cost_kes NUMERIC(10,2) DEFAULT 0.00
);

CREATE INDEX idx_usage_tenant ON usage_events(tenant_id, timestamp);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enforced per Kenya Data Protection Act 2019
-- -----------------------------------------------------------------------------
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_inference_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chp_tasks ENABLE ROW LEVEL SECURITY;

-- Default Policy: Read-only access by verified role and household match
CREATE POLICY rls_households_tenant ON households
    FOR ALL
    USING (current_setting('app.current_user_role', true) IN ('super_admin', 'admin', 'regional_admin')
        OR anonymized_hash = current_setting('app.current_household_hash', true));

CREATE POLICY rls_triage_sessions ON triage_sessions
    FOR ALL
    USING (current_setting('app.current_user_role', true) IN ('super_admin', 'clinician')
        OR anonymized_hash = current_setting('app.current_user_hash', true));

CREATE POLICY rls_audit_logs_append_only ON audit_logs
    FOR INSERT
    WITH CHECK (true); -- Audit records can only be inserted, never updated or deleted

CREATE POLICY rls_audit_logs_view ON audit_logs
    FOR SELECT
    USING (current_setting('app.current_user_role', true) IN ('super_admin', 'admin'));
