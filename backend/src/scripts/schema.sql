-- CM Kerala Grievance Portal — Idempotent Schema
-- Run with: psql -d <db> -f schema.sql

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(150) UNIQUE NOT NULL,
  mobile          VARCHAR(15) UNIQUE,
  password_hash   TEXT NOT NULL,
  role            VARCHAR(30) NOT NULL CHECK (role IN ('citizen','cmo_admin','department_officer')),
  department_id   UUID,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 2. departments
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(150) UNIQUE NOT NULL,
  description     TEXT,
  contact_email   VARCHAR(150),
  contact_phone   VARCHAR(20),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO departments (name, description) VALUES
  ('Administrative Reforms Department', 'Handles administrative reforms and public administration.'),
  ('Agriculture Development and Farmers'' Welfare Department', 'Supports agriculture development and farmers'' welfare.'),
  ('Animal Husbandry and Dairy Development Department', 'Supports animal husbandry and dairy development.'),
  ('Archaeology, Archives and Museums Department', 'Preserves archaeology, archives and museums.'),
  ('AYUSH Department', 'Oversees AYUSH healthcare services.'),
  ('Backward Classes Development Department', 'Supports the development of backward classes.'),
  ('Coastal Shipping and Inland Navigation Department', 'Manages coastal shipping and inland navigation.'),
  ('Consumer Affairs Department', 'Protects consumer interests and rights.'),
  ('Co-operation Department', 'Supports co-operative institutions and services.'),
  ('Cultural Affairs Department', 'Promotes cultural affairs and heritage.'),
  ('Disaster Management Department', 'Coordinates disaster preparedness and response.'),
  ('Election Department', 'Administers election-related services.'),
  ('Electronics and Information Technology Department', 'Oversees electronics and information technology.'),
  ('Environment Department', 'Protects the environment and supports sustainability.'),
  ('Excise Department', 'Administers excise-related services and regulation.'),
  ('Finance Department', 'Manages public finance and budgeting.'),
  ('Fisheries and Ports Department', 'Manages fisheries and ports.'),
  ('Food and Civil Supplies Department', 'Manages food distribution and civil supplies.'),
  ('Forest and Wildlife Department', 'Protects forests and wildlife.'),
  ('General Administration Department', 'Coordinates general administration.'),
  ('General Education Department', 'Oversees general education services.'),
  ('Health and Family Welfare Department', 'Provides health and family welfare services.'),
  ('Higher Education Department', 'Oversees higher education services.'),
  ('Home Department', 'Manages internal security and home affairs.'),
  ('Housing Department', 'Supports housing policy and services.'),
  ('Industries and Commerce Department', 'Promotes industries and commerce.'),
  ('Information and Public Relations Department', 'Manages public information and relations.'),
  ('Labour and Skills Department', 'Supports labour welfare and skills development.'),
  ('Law Department', 'Provides legal administration and advice.'),
  ('Local Self Government Department', 'Supports local self-government institutions.'),
  ('Minority Welfare Department', 'Supports minority welfare programmes.'),
  ('Non-Resident Keralites Affairs Department (NORKA)', 'Supports the welfare of non-resident Keralites.'),
  ('Parliamentary Affairs Department', 'Coordinates parliamentary affairs.'),
  ('Personnel and Administrative Reforms Department', 'Manages personnel and administrative reforms.'),
  ('Planning and Economic Affairs Department', 'Coordinates planning and economic affairs.'),
  ('Power Department', 'Oversees power and electricity services.'),
  ('Public Works Department', 'Manages public works and infrastructure.'),
  ('Registration Department', 'Administers registration services.'),
  ('Revenue Department', 'Administers revenue and land-related services.'),
  ('Sainik Welfare Department', 'Supports ex-servicemen and their families.'),
  ('Scheduled Castes Development Department', 'Supports the development of scheduled castes.'),
  ('Scheduled Tribes Development Department', 'Supports the development of scheduled tribes.'),
  ('Science and Technology Department', 'Promotes science and technology.'),
  ('Social Justice Department', 'Supports social justice and welfare services.'),
  ('Sports and Youth Affairs Department', 'Promotes sports and youth affairs.'),
  ('Store Purchase Department', 'Manages government store purchases.'),
  ('Taxes Department', 'Administers state taxes.'),
  ('Tourism Department', 'Promotes tourism and related services.'),
  ('Transport Department', 'Oversees transport services.'),
  ('Vigilance Department', 'Coordinates vigilance and anti-corruption services.'),
  ('Water Resources Department', 'Manages water resources.'),
  ('Women and Child Development Department', 'Supports women and child development.')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 3. districts  (seed all 14 Kerala districts)
-- ============================================================
CREATE TABLE IF NOT EXISTS districts (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO districts (name) VALUES
  ('Alappuzha'),
  ('Ernakulam'),
  ('Idukki'),
  ('Kannur'),
  ('Kasaragod'),
  ('Kollam'),
  ('Kottayam'),
  ('Kozhikode'),
  ('Malappuram'),
  ('Palakkad'),
  ('Pathanamthitta'),
  ('Thiruvananthapuram'),
  ('Thrissur'),
  ('Wayanad')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 4. grievances
-- ============================================================
CREATE TABLE IF NOT EXISTS grievances (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number          VARCHAR(30) UNIQUE NOT NULL,
  citizen_id                UUID NOT NULL REFERENCES users(id),
  district                  VARCHAR(100) NOT NULL,
  category                  VARCHAR(100) NOT NULL,
  subject                   VARCHAR(255) NOT NULL,
  description               TEXT NOT NULL,
  priority                  VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High')),
  status                    VARCHAR(30) DEFAULT 'Submitted' CHECK (status IN ('Submitted','Under Review','In Progress','Resolved','Reopened')),
  current_department_id     UUID REFERENCES departments(id),
  assigned_officer_id       UUID REFERENCES users(id),
  ai_summary                TEXT,
  ai_suggested_department   VARCHAR(150),
  ai_suggested_category     VARCHAR(100),
  ai_suggested_priority     VARCHAR(20),
  created_at                TIMESTAMP DEFAULT NOW(),
  updated_at                TIMESTAMP DEFAULT NOW(),
  resolved_at               TIMESTAMP
);

-- ============================================================
-- 5. grievance_history
-- ============================================================
CREATE TABLE IF NOT EXISTS grievance_history (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id     UUID NOT NULL REFERENCES grievances(id),
  previous_status  VARCHAR(30),
  new_status       VARCHAR(30) NOT NULL,
  remarks          TEXT,
  changed_by       UUID NOT NULL REFERENCES users(id),
  visibility       VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public','internal')),
  created_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 6. department_assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS department_assignments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id         UUID NOT NULL REFERENCES grievances(id),
  department_id        UUID NOT NULL REFERENCES departments(id),
  assigned_officer_id  UUID REFERENCES users(id),
  assigned_by          UUID NOT NULL REFERENCES users(id),
  assignment_remarks   TEXT,
  assigned_at          TIMESTAMP DEFAULT NOW(),
  is_current           BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 7. attachments
-- ============================================================
CREATE TABLE IF NOT EXISTS attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES grievances(id),
  uploaded_by  UUID NOT NULL REFERENCES users(id),
  file_name    VARCHAR(255) NOT NULL,
  file_url     TEXT NOT NULL,
  file_type    VARCHAR(100),
  file_size    BIGINT,
  uploaded_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 8. action_taken_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS action_taken_reports (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id           UUID NOT NULL REFERENCES grievances(id),
  officer_id             UUID NOT NULL REFERENCES users(id),
  investigation_remarks  TEXT NOT NULL,
  action_taken           TEXT NOT NULL,
  resolution_details     TEXT,
  submitted_at           TIMESTAMP DEFAULT NOW(),
  reviewed_by            UUID REFERENCES users(id),
  reviewed_at            TIMESTAMP,
  review_status          VARCHAR(30) DEFAULT 'Pending' CHECK (review_status IN ('Pending','Accepted','Rejected')),
  cmo_remarks            TEXT
);

-- ============================================================
-- 9. citizen_feedback
-- ============================================================
CREATE TABLE IF NOT EXISTS citizen_feedback (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID UNIQUE REFERENCES grievances(id),
  citizen_id   UUID REFERENCES users(id),
  rating       INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback     TEXT,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 10. contact_enquiries
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  subject    VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  status     VARCHAR(30) DEFAULT 'New',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_grievances_citizen_id        ON grievances(citizen_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status            ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_district          ON grievances(district);
CREATE INDEX IF NOT EXISTS idx_grievances_department        ON grievances(current_department_id);
CREATE INDEX IF NOT EXISTS idx_grievances_priority          ON grievances(priority);
CREATE INDEX IF NOT EXISTS idx_grievance_history_grievance  ON grievance_history(grievance_id);
CREATE INDEX IF NOT EXISTS idx_dept_assignments_grievance   ON department_assignments(grievance_id);
