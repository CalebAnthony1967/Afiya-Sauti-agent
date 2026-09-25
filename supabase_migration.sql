-- ═══════════════════════════════════════════════════════════════════
-- AfiyaSauti — Supabase Migration Script (PostgreSQL / TimescaleDB)
-- Complete schema with Row-Level Security (RLS) for Kenya DPA 2019
-- Migration target: Supabase (Postgres 15 + TimescaleDB + pgcrypto)
-- ═══════════════════════════════════════════════════════════════════
--
-- Run order:
--   1. Extensions & schemas
--   2. Enums
--   3. Tables (with FKs)
--   4. Hypertables (TimescaleDB)
--   5. Indexes
--   6. RLS policies
--   7. Audit-chain trigger
--   8. Views & functions
--
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. EXTENSIONS ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "timescaledb"; (Not required on Supabase)

-- ─── 2. ENUMS ───────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'patient', 'family', 'chp', 'clinician', 'ngo_admin', 'regional_admin',
  'moh_admin', 'researcher', 'insurance', 'admin', 'super_admin', 'developer'
);

CREATE TYPE consent_state AS ENUM ('ACTIVE', 'REVOKED', 'PENDING');

CREATE TYPE consent_purpose AS ENUM (
  'triage', 'ambient_monitoring', 'research', 'data_sharing',
  'caregiver_access', 'insurance_verification'
);

CREATE TYPE urgency_level AS ENUM ('GREEN', 'YELLOW', 'RED');

CREATE TYPE triage_status AS ENUM ('active', 'completed', 'escalated', 'red_flag');

CREATE TYPE channel_type AS ENUM ('whatsapp', 'ivr', 'ussd', 'web', 'mobile', 'edge');

CREATE TYPE domain_module AS ENUM (
  'maternal_child', 'ncd', 'infectious', 'mental_health', 'emergency', 'general'
);

CREATE TYPE facility_type AS ENUM (
  'dispensary', 'health_center', 'county_hospital', 'referral_hospital', 'clinic', 'ngo_site'
);

CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');

CREATE TYPE system_state AS ENUM ('PASSIVE_MONITORING', 'VOICE_ACTIVE', 'MUTED', 'ALERT');

CREATE TYPE audit_action AS ENUM (
  'login', 'login_failed', 'logout', 'data_access', 'data_create',
  'data_update', 'data_delete', 'ai_invoke', 'guardrail_trigger',
  'admin_action', 'consent_change', 'export', 'vault_access', 'emergency_action'
);

CREATE TYPE agent_name AS ENUM (
  'triage_agent', 'scribe_agent', 'chp_guide_agent', 'moh_protocol_agent',
  'research_agent', 'insurance_agent', 'training_agent', 'community_intel_agent',
  'admin_assist_agent', 'super_admin_agent', 'developer_agent'
);

-- ─── 3. TABLES ──────────────────────────────────────────────────────

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone_hash TEXT UNIQUE,  -- Salted SHA-256; never store raw phone
  phone_last4 TEXT,
  role user_role DEFAULT 'patient',
  preferred_language TEXT DEFAULT 'sw',
  county_code TEXT,
  sub_county TEXT,
  community_unit_id TEXT,
  facility_id TEXT,
  ngo_id TEXT,
  consent_state consent_state DEFAULT 'PENDING',
  is_active BOOLEAN DEFAULT true,
  vault_authenticated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Households
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id TEXT UNIQUE NOT NULL,
  county_code TEXT NOT NULL,
  sub_county TEXT NOT NULL,
  community_unit_id TEXT NOT NULL,
  anonymized_hash TEXT UNIQUE NOT NULL,  -- HMAC-SHA-256 with dynamic salt
  chp_id UUID REFERENCES profiles(id),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  household_size INT DEFAULT 1,
  has_ambient_node BOOLEAN DEFAULT false,
  node_device_id TEXT,
  node_subscription_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Facilities
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id TEXT UNIQUE,
  name TEXT NOT NULL,
  facility_type facility_type NOT NULL,
  county_code TEXT NOT NULL,
  sub_county TEXT,
  ward TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  bed_capacity INT DEFAULT 0,
  beds_occupied INT DEFAULT 0,
  accredited BOOLEAN DEFAULT false,
  accreditation_date DATE,
  contact_phone TEXT,
  admin_id UUID REFERENCES profiles(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Patient Consent (Kenya DPA 2019)
CREATE TABLE IF NOT EXISTS patient_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_id TEXT UNIQUE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  household_id TEXT REFERENCES households(household_id),
  consent_state consent_state DEFAULT 'PENDING',
  purpose_code consent_purpose NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  fhir_consent_resource JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Triage Sessions
CREATE TABLE IF NOT EXISTS triage_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  household_id TEXT REFERENCES households(household_id),
  channel channel_type NOT NULL,
  language TEXT DEFAULT 'sw',
  domain_module domain_module NOT NULL,
  symptoms_text TEXT,
  deidentified_input TEXT,  -- PII removed before model call
  urgency_level urgency_level DEFAULT 'GREEN',
  red_flag_detected BOOLEAN DEFAULT false,
  red_flag_details TEXT,
  icd11_codes TEXT[],
  citations JSONB DEFAULT '[]',
  ai_response TEXT,
  first_aid_given BOOLEAN DEFAULT false,
  chp_dispatched BOOLEAN DEFAULT false,
  confidence_score DOUBLE PRECISION,
  input_entropy DOUBLE PRECISION,
  feature_weights JSONB DEFAULT '{}',
  human_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  clinician_mode BOOLEAN DEFAULT false,
  soap_note_id UUID,
  status triage_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Vital Telemetry (Ambient Edge Node) — TimescaleDB hypertable
CREATE TABLE IF NOT EXISTS vital_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telemetry_id TEXT UNIQUE,
  household_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  respiratory_rate DOUBLE PRECISION,
  heart_rate DOUBLE PRECISION,
  cough_count_1min INT DEFAULT 0,
  ambient_temp_c DOUBLE PRECISION,
  confidence_score DOUBLE PRECISION,
  input_entropy DOUBLE PRECISION,
  flagged_anomaly BOOLEAN DEFAULT false,
  anomaly_type TEXT,
  system_state system_state DEFAULT 'PASSIVE_MONITORING',
  fhir_payload JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clinical SOAP Notes
CREATE TABLE IF NOT EXISTS clinical_soap_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id TEXT UNIQUE,
  session_id UUID REFERENCES triage_sessions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id),
  clinician_id UUID NOT NULL REFERENCES profiles(id),
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  icd11_codes TEXT[],
  citations JSONB DEFAULT '[]',
  feature_attribution_weights JSONB DEFAULT '{}',
  ai_draft BOOLEAN DEFAULT true,
  signed BOOLEAN DEFAULT false,
  signed_by UUID REFERENCES profiles(id),
  signed_at TIMESTAMPTZ,
  signature_hash TEXT,  -- Cryptographic signature
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id TEXT UNIQUE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clinician_id UUID REFERENCES profiles(id),
  facility_id UUID REFERENCES facilities(id),
  appointment_date TIMESTAMPTZ NOT NULL,
  reason TEXT,
  status appointment_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Medication Regimens
CREATE TABLE IF NOT EXISTS medication_regimens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  regimen_id TEXT UNIQUE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  route TEXT DEFAULT 'oral',
  start_date DATE,
  end_date DATE,
  prescribed_by TEXT,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adherence Events (TimescaleDB hypertable)
CREATE TABLE IF NOT EXISTS adherence_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  regimen_id UUID NOT NULL REFERENCES medication_regimens(id) ON DELETE CASCADE,
  taken BOOLEAN DEFAULT false,
  scheduled_time TIMESTAMPTZ,
  recorded_time TIMESTAMPTZ DEFAULT now(),
  channel TEXT DEFAULT 'app',
  notes TEXT
);

-- Secure Messages
CREATE TABLE IF NOT EXISTS secure_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT UNIQUE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  subject TEXT,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  sender_role TEXT,
  recipient_role TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CHP Dispatches
CREATE TABLE IF NOT EXISTS chp_dispatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispatch_id TEXT UNIQUE,
  session_id UUID REFERENCES triage_sessions(id),
  chp_id UUID NOT NULL REFERENCES profiles(id),
  household_id TEXT REFERENCES households(household_id),
  reason TEXT NOT NULL,
  red_flag BOOLEAN DEFAULT false,
  first_aid_instructions TEXT,
  dispatch_status TEXT DEFAULT 'sent',
  dispatched_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ
);

-- CHP Tasks
CREATE TABLE IF NOT EXISTS chp_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id TEXT UNIQUE,
  chp_id UUID NOT NULL REFERENCES profiles(id),
  household_id TEXT REFERENCES households(household_id),
  task_type TEXT,
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Inference Metrics
CREATE TABLE IF NOT EXISTS ai_inference_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inference_id TEXT UNIQUE,
  household_id TEXT,
  session_id UUID REFERENCES triage_sessions(id),
  model_version TEXT NOT NULL,
  input_entropy DOUBLE PRECISION,
  confidence_score DOUBLE PRECISION NOT NULL,
  triage_assigned TEXT,
  feature_weights JSONB DEFAULT '{}',
  human_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  guardrail_triggered BOOLEAN DEFAULT false,
  guardrail_details TEXT,
  agent_name TEXT,
  agent_action TEXT,
  latency_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent Activity Logs
CREATE TABLE IF NOT EXISTS agent_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id TEXT UNIQUE,
  agent_name agent_name NOT NULL,
  agent_action TEXT NOT NULL,
  input_summary TEXT,  -- De-identified
  output_summary TEXT,
  citations JSONB DEFAULT '[]',
  confidence_score DOUBLE PRECISION,
  grounded BOOLEAN DEFAULT true,
  guardrail_triggered BOOLEAN DEFAULT false,
  human_override BOOLEAN DEFAULT false,
  session_id UUID,
  actor_id UUID REFERENCES profiles(id),
  portal TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Audit Log (chained hash — tamper-evident)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id TEXT UNIQUE,
  actor_id UUID NOT NULL,
  actor_role TEXT,
  action_type audit_action NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  signature_hash TEXT NOT NULL,  -- SHA-256 chained: hash(prev_hash + payload)
  prev_hash TEXT,
  payload_snapshot JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Protocols (MoH knowledge base)
CREATE TABLE IF NOT EXISTS protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  domain_module TEXT,
  version_number TEXT,
  content_text TEXT,
  source TEXT NOT NULL,
  published_by UUID REFERENCES profiles(id),
  target_counties TEXT[],
  target_facilities TEXT[],
  push_sent BOOLEAN DEFAULT false,
  receipt_confirmations JSONB DEFAULT '[]',
  ai_impact_summary TEXT,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Training Scenarios
CREATE TABLE IF NOT EXISTS training_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id TEXT UNIQUE,
  title TEXT NOT NULL,
  domain_module TEXT NOT NULL,
  difficulty TEXT DEFAULT 'intermediate',
  patient_persona TEXT,
  initial_complaint TEXT NOT NULL,
  correct_steps TEXT[],
  citations JSONB DEFAULT '[]',
  target_role TEXT DEFAULT 'both',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Outbreak Signals
CREATE TABLE IF NOT EXISTS outbreak_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signal_id TEXT UNIQUE,
  county_code TEXT NOT NULL,
  sub_county TEXT,
  disease TEXT NOT NULL,
  case_count INT DEFAULT 0,
  signal_type TEXT,
  confidence_score DOUBLE PRECISION,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id TEXT UNIQUE,
  key_name TEXT NOT NULL,
  key_prefix TEXT,
  key_hash TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  scopes TEXT[],
  rate_limit_per_min INT DEFAULT 60,
  webhook_url TEXT,
  active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usage Events (billing)
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE,
  profile_id UUID,
  tenant_id TEXT,
  tenant_type TEXT NOT NULL,
  feature_code TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price_kes INT DEFAULT 0,
  total_kes INT DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id TEXT UNIQUE,
  subject TEXT NOT NULL,
  description TEXT,
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  category TEXT DEFAULT 'technical',
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- ─── 4. TIME-SERIES PARTITIONING (Standard Postgres) ───────────────
-- Standard PostgreSQL index-backed tables (compatible with Supabase Cloud).
-- If running on self-hosted Postgres with TimescaleDB enabled, you may uncomment:
-- SELECT create_hypertable('vital_telemetry', 'timestamp', if_not_exists => true);
-- SELECT create_hypertable('adherence_events', 'recorded_time', if_not_exists => true);

-- ─── 5. INDEXES ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_triage_sessions_profile ON triage_sessions(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_triage_sessions_urgency ON triage_sessions(urgency_level, status);
CREATE INDEX IF NOT EXISTS idx_vital_telemetry_household ON vital_telemetry(household_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_vital_telemetry_anomaly ON vital_telemetry(flagged_anomaly) WHERE flagged_anomaly = true;
CREATE INDEX IF NOT EXISTS idx_appointments_profile_date ON appointments(profile_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_adherence_regimen ON adherence_events(regimen_id, recorded_time DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_consent_profile ON patient_consents(profile_id, consent_state);

-- ─── 6. ROW-LEVEL SECURITY ──────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_regimens ENABLE ROW LEVEL SECURITY;
ALTER TABLE adherence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_messages ENABLE ROW LEVEL SECURITY;

-- Patients see only their own data
CREATE POLICY "patient_self_select" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "patient_self_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "patient_own_triage" ON triage_sessions
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "patient_own_consent" ON patient_consents
  FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "patient_own_consent_update" ON patient_consents
  FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "patient_own_consent_insert" ON patient_consents
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "patient_own_appointments" ON appointments
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "patient_own_medications" ON medication_regimens
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "patient_own_adherence" ON adherence_events
  FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "message_sender_or_recipient" ON secure_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Clinicians see sessions for their facility
CREATE POLICY "clinician_triage_view" ON triage_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('clinician', 'admin', 'super_admin'))
  );

-- CHPs see households assigned to them
CREATE POLICY "chp_household_view" ON households
  FOR SELECT USING (
    chp_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ─── 7. AUDIT-CHAIN TRIGGER ────────────────────────────────────────
CREATE OR REPLACE FUNCTION audit_chain_hash()
RETURNS TRIGGER AS $$
DECLARE
  v_prev_hash TEXT;
BEGIN
  SELECT signature_hash INTO v_prev_hash
  FROM audit_logs ORDER BY timestamp DESC LIMIT 1;

  NEW.prev_hash := COALESCE(v_prev_hash, 'GENESIS');
  NEW.signature_hash := encode(
    digest(
      COALESCE(v_prev_hash, '') || NEW.actor_id::text || NEW.action_type::text || NEW.resource_type::text,
      'sha256'
    ),
    'hex'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_chain BEFORE INSERT ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION audit_chain_hash();

-- ─── 8. VIEWS & FUNCTIONS ───────────────────────────────────────────

-- Adherence rate per regimen
CREATE OR REPLACE VIEW adherence_rate_view AS
SELECT
  regimen_id,
  COUNT(*) AS total_events,
  COUNT(*) FILTER (WHERE taken) AS taken_events,
  ROUND(COUNT(*) FILTER (WHERE taken) * 100.0 / NULLIF(COUNT(*), 0), 1) AS adherence_pct
FROM adherence_events
GROUP BY regimen_id;

-- Daily triage summary (for analytics)
CREATE OR REPLACE VIEW daily_triage_summary AS
SELECT
  DATE(created_at) AS triage_date,
  domain_module,
  urgency_level,
  COUNT(*) AS session_count,
  COUNT(*) FILTER (WHERE red_flag_detected) AS red_flag_count
FROM triage_sessions
GROUP BY DATE(created_at), domain_module, urgency_level
ORDER BY triage_date DESC;

-- De-identification function (Kenya PII patterns)
CREATE OR REPLACE FUNCTION deidentify_input(input TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove Kenyan phone numbers (+254 / 07XX / 01XX)
  input := regexp_replace(input, '\+254[0-9]{9}', '[PHONE]', 'g');
  input := regexp_replace(input, '\b07[0-9]{8}\b', '[PHONE]', 'g');
  input := regexp_replace(input, '\b01[0-9]{8}\b', '[PHONE]', 'g');
  -- Remove national ID numbers (8 digits)
  input := regexp_replace(input, '\b[0-9]{8}\b', '[ID]', 'g');
  -- Remove email addresses
  input := regexp_replace(input, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[EMAIL]', 'g');
  RETURN input;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── 9. TRANSLATIONS TABLE (Multi-language support) ─────────────────
CREATE TABLE IF NOT EXISTS translations (
  key TEXT NOT NULL,
  language TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (key, language)
);

-- RLS: anyone can read translations, only admins can write
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "translations_read_all" ON translations FOR SELECT USING (true);
CREATE POLICY "translations_write_admin" ON translations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ═══════════════════════════════════════════════════════════════════
-- END MIGRATION
-- ═══════════════════════════════════════════════════════════════════